<?php
declare(strict_types=1);

require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=UTF-8');

function requireAuthToken(): array {
    $token = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
    if (empty($token)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorised.']);
        exit;
    }
    $stmt = getDB()->prepare(
        'SELECT s.user_id FROM admin_sessions s WHERE s.token = ? AND s.expires_at > NOW()'
    );
    $stmt->execute([$token]);
    $row = $stmt->fetch();
    if (!$row) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Session expired.']);
        exit;
    }
    $user = getDB()->prepare('SELECT * FROM admin_users WHERE id = ?');
    $user->execute([$row['user_id']]);
    return $user->fetch();
}

function validatePassword(string $password): ?string {
    if (strlen($password) < 8)               return 'Password must be at least 8 characters.';
    if (!preg_match('/[A-Z]/', $password))   return 'Password must contain at least one uppercase letter.';
    if (!preg_match('/[a-z]/', $password))   return 'Password must contain at least one lowercase letter.';
    if (!preg_match('/[0-9]/', $password))   return 'Password must contain at least one number.';
    if (!preg_match('/[\W_]/', $password))   return 'Password must contain at least one special character.';
    return null;
}

function sendOtpEmail(string $toEmail, string $toName, string $otp): bool {
    $mailerPath = __DIR__ . '/mail-config.php';
    if (!file_exists($mailerPath)) {
        error_log('[TAG AUTH] mail-config.php not found.');
        return false;
    }
    require_once $mailerPath;

    $body = '
        <p style="margin:0 0 16px;font-size:15px;color:#D3D3D3;line-height:1.7;">
            You requested a password reset for the <strong style="color:#FFFFFF;">TAG Admin Portal</strong>.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
          <tr>
            <td style="background:#0D0D0D;border-left:5px solid #FF4500;padding:28px 32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:10px;font-weight:900;letter-spacing:0.3em;text-transform:uppercase;color:#A9A9A9;">Your one-time code</p>
              <p style="margin:0;font-size:48px;font-weight:900;letter-spacing:0.4em;color:#FF4500;font-family:monospace;">' . $otp . '</p>
              <p style="margin:8px 0 0;font-size:12px;color:#696969;">Valid for 10 minutes only</p>
            </td>
          </tr>
        </table>
        <p style="margin:0;font-size:13px;color:#696969;line-height:1.65;">
            If you did not request this reset, ignore this email. Your password will not change.
        </p>';

    $result = sendTagEmail($toEmail, 'TAG Admin — Password Reset OTP', $body, 'contact_admin');
    return $result === true;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $action = $_GET['action'] ?? '';

    if ($action === 'security_questions') {
        $username = trim($_GET['username'] ?? '');
        if (empty($username)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Username required.']);
            exit;
        }
        $stmt = getDB()->prepare('SELECT security_q1, security_q2, security_q3 FROM admin_users WHERE username = ?');
        $stmt->execute([$username]);
        $row = $stmt->fetch();
        if (!$row || empty($row['security_q1'])) {
            echo json_encode(['success' => false, 'message' => 'No security questions set for this account.']);
            exit;
        }
        echo json_encode(['success' => true, 'questions' => [
            $row['security_q1'],
            $row['security_q2'],
            $row['security_q3'],
        ]]);
        exit;
    }

    if ($action === 'profile') {
        $user = requireAuthToken();
        echo json_encode(['success' => true, 'data' => [
            'username'       => $user['username'],
            'full_name'      => $user['full_name']      ?? '',
            'email'          => $user['email']          ?? '',
            'profile_photo'  => $user['profile_photo']  ?? '',
            'security_q1'    => $user['security_q1']    ?? '',
            'security_q2'    => $user['security_q2']    ?? '',
            'security_q3'    => $user['security_q3']    ?? '',
            'has_security'   => !empty($user['security_q1']),
            'last_login'     => $user['last_login']     ?? '',
        ]]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Unknown action.']);
    exit;
}

if ($method === 'POST') {
    $raw    = file_get_contents('php://input');
    $data   = json_decode($raw, true) ?? [];
    $action = $data['action'] ?? $_GET['action'] ?? $_POST['action'] ?? '';

    if ($action === 'auth') {
        $username = trim((string)($data['username'] ?? ''));
        $password = (string)($data['password'] ?? '');

        if (empty($username) || empty($password)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Username and password are required.']);
            exit;
        }

        $stmt = getDB()->prepare('SELECT id, password_hash FROM admin_users WHERE username = ?');
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);
            exit;
        }

        $token  = bin2hex(random_bytes(32));
        $expiry = date('Y-m-d H:i:s', strtotime('+8 hours'));

        getDB()->prepare('DELETE FROM admin_sessions WHERE expires_at < NOW()')->execute();
        getDB()->prepare(
            'INSERT INTO admin_sessions (user_id, token, expires_at) VALUES (?, ?, ?)'
        )->execute([$user['id'], $token, $expiry]);

        getDB()->prepare('UPDATE admin_users SET last_login = NOW() WHERE id = ?')->execute([$user['id']]);

        echo json_encode(['success' => true, 'token' => $token]);
        exit;
    }

    if ($action === 'send_otp') {
        $username = trim($data['username'] ?? '');
        if (empty($username)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Username required.']);
            exit;
        }
        $stmt = getDB()->prepare('SELECT id, email, full_name FROM admin_users WHERE username = ?');
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        if (!$user || empty($user['email'])) {
            echo json_encode(['success' => false, 'message' => 'No email address associated with this account.']);
            exit;
        }
        $otp     = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expires = date('Y-m-d H:i:s', strtotime('+10 minutes'));
        getDB()->prepare('UPDATE admin_users SET otp_code = ?, otp_expires_at = ? WHERE id = ?')
               ->execute([$otp, $expires, $user['id']]);
        $sent = sendOtpEmail($user['email'], $user['full_name'] ?? 'Admin', $otp);
        if (!$sent) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to send OTP email. Check mail configuration.']);
            exit;
        }
        $masked = preg_replace('/(?<=.).(?=[^@]*?.@)/u', '*', $user['email']);
        echo json_encode(['success' => true, 'message' => 'OTP sent to ' . $masked]);
        exit;
    }

    if ($action === 'verify_otp') {
        $username = trim($data['username'] ?? '');
        $otp      = trim($data['otp']      ?? '');
        $stmt = getDB()->prepare(
            'SELECT id FROM admin_users WHERE username = ? AND otp_code = ? AND otp_expires_at > NOW()'
        );
        $stmt->execute([$username, $otp]);
        $user = $stmt->fetch();
        if (!$user) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid or expired OTP.']);
            exit;
        }
        $resetToken = bin2hex(random_bytes(32));
        $expires    = date('Y-m-d H:i:s', strtotime('+15 minutes'));
        getDB()->prepare('UPDATE admin_users SET otp_code=NULL, otp_expires_at=NULL, reset_token=?, reset_token_expires=? WHERE id=?')
               ->execute([$resetToken, $expires, $user['id']]);
        echo json_encode(['success' => true, 'reset_token' => $resetToken]);
        exit;
    }

    if ($action === 'verify_security') {
        $username = trim($data['username'] ?? '');
        $answers  = $data['answers'] ?? [];
        if (count($answers) < 3) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'All three answers required.']);
            exit;
        }
        $stmt = getDB()->prepare(
            'SELECT id, security_a1_hash, security_a2_hash, security_a3_hash FROM admin_users WHERE username = ?'
        );
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        if (!$user || empty($user['security_a1_hash'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Security questions not configured for this account.']);
            exit;
        }
        $a1 = strtolower(trim($answers[0]));
        $a2 = strtolower(trim($answers[1]));
        $a3 = strtolower(trim($answers[2]));
        if (!password_verify($a1, $user['security_a1_hash']) ||
            !password_verify($a2, $user['security_a2_hash']) ||
            !password_verify($a3, $user['security_a3_hash'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'One or more answers are incorrect.']);
            exit;
        }
        $resetToken = bin2hex(random_bytes(32));
        $expires    = date('Y-m-d H:i:s', strtotime('+15 minutes'));
        getDB()->prepare('UPDATE admin_users SET reset_token=?, reset_token_expires=? WHERE id=?')
               ->execute([$resetToken, $expires, $user['id']]);
        echo json_encode(['success' => true, 'reset_token' => $resetToken]);
        exit;
    }

    if ($action === 'reset_password') {
        $username    = trim($data['username']     ?? '');
        $resetToken  = trim($data['reset_token']  ?? '');
        $newPassword = trim($data['new_password'] ?? '');
        $stmt = getDB()->prepare(
            'SELECT id FROM admin_users WHERE username = ? AND reset_token = ? AND reset_token_expires > NOW()'
        );
        $stmt->execute([$username, $resetToken]);
        $user = $stmt->fetch();
        if (!$user) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid or expired reset token.']);
            exit;
        }
        $err = validatePassword($newPassword);
        if ($err) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => $err]);
            exit;
        }
        $hash = password_hash($newPassword, PASSWORD_BCRYPT);
        getDB()->prepare(
            'UPDATE admin_users SET password_hash=?, reset_token=NULL, reset_token_expires=NULL WHERE id=?'
        )->execute([$hash, $user['id']]);
        echo json_encode(['success' => true, 'message' => 'Password reset successfully.']);
        exit;
    }

    if ($action === 'update_profile') {
        $user     = requireAuthToken();
        $fullName = trim($data['full_name'] ?? '');
        $email    = filter_var(trim($data['email'] ?? ''), FILTER_VALIDATE_EMAIL);
        if (!$email) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Valid email address required.']);
            exit;
        }
        $existing = getDB()->prepare('SELECT id FROM admin_users WHERE email = ? AND id != ?');
        $existing->execute([$email, $user['id']]);
        if ($existing->fetch()) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Email already in use.']);
            exit;
        }
        getDB()->prepare('UPDATE admin_users SET full_name=?, email=? WHERE id=?')
               ->execute([$fullName, $email, $user['id']]);
        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'update_security_questions') {
        $user = requireAuthToken();
        $q1   = trim($data['q1'] ?? '');
        $a1   = strtolower(trim($data['a1'] ?? ''));
        $q2   = trim($data['q2'] ?? '');
        $a2   = strtolower(trim($data['a2'] ?? ''));
        $q3   = trim($data['q3'] ?? '');
        $a3   = strtolower(trim($data['a3'] ?? ''));
        if (!$q1 || !$a1 || !$q2 || !$a2 || !$q3 || !$a3) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'All questions and answers are required.']);
            exit;
        }
        getDB()->prepare(
            'UPDATE admin_users SET
               security_q1=?, security_a1_hash=?,
               security_q2=?, security_a2_hash=?,
               security_q3=?, security_a3_hash=?
             WHERE id=?'
        )->execute([
            $q1, password_hash($a1, PASSWORD_BCRYPT),
            $q2, password_hash($a2, PASSWORD_BCRYPT),
            $q3, password_hash($a3, PASSWORD_BCRYPT),
            $user['id'],
        ]);
        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'change_password') {
        $user        = requireAuthToken();
        $current     = trim($data['current_password'] ?? '');
        $newPassword = trim($data['new_password']     ?? '');
        if (!password_verify($current, $user['password_hash'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Current password is incorrect.']);
            exit;
        }
        $err = validatePassword($newPassword);
        if ($err) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => $err]);
            exit;
        }
        if (password_verify($newPassword, $user['password_hash'])) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'New password cannot be the same as your current password.']);
            exit;
        }
        $hash = password_hash($newPassword, PASSWORD_BCRYPT);
        getDB()->prepare('UPDATE admin_users SET password_hash=? WHERE id=?')->execute([$hash, $user['id']]);
        echo json_encode(['success' => true, 'message' => 'Password changed successfully.']);
        exit;
    }

    if ($action === 'upload_photo') {
        $user = requireAuthToken();
        if (empty($_FILES['photo'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'No file uploaded.']);
            exit;
        }
        $file     = $_FILES['photo'];
        $allowed  = ['image/jpeg', 'image/png', 'image/webp'];
        $mime     = mime_content_type($file['tmp_name']);
        if (!in_array($mime, $allowed)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Only JPEG, PNG, or WebP images are allowed.']);
            exit;
        }
        if ($file['size'] > 2 * 1024 * 1024) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'File size must be under 2MB.']);
            exit;
        }
        $ext      = $mime === 'image/jpeg' ? 'jpg' : ($mime === 'image/png' ? 'png' : 'webp');
        $filename = 'admin_photo_' . $user['id'] . '_' . time() . '.' . $ext;
        $dir      = __DIR__ . '/images/';
        if (!is_dir($dir)) mkdir($dir, 0755, true);
        $old = $user['profile_photo'] ?? '';
        if ($old && file_exists(__DIR__ . $old)) unlink(__DIR__ . $old);
        $path = '/images/' . $filename;
        move_uploaded_file($file['tmp_name'], $dir . $filename);
        getDB()->prepare('UPDATE admin_users SET profile_photo=? WHERE id=?')->execute([$path, $user['id']]);
        echo json_encode(['success' => true, 'path' => $path]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Unknown action.']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);