<?php
declare(strict_types=1);
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/mail-config.php';
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid request body.']);
    exit;
}

$firstName = trim($data['firstName'] ?? '');
$lastName  = trim($data['lastName']  ?? '');
$email     = trim($data['email']     ?? '');
$phone     = trim($data['phone']     ?? '');
$subject   = trim($data['subject']   ?? '');
$message   = trim($data['message']   ?? '');

if (!$firstName || !$lastName || !$email || !$message) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'First name, last name, email and message are required.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Invalid email address.']);
    exit;
}

$fullName    = htmlspecialchars("{$firstName} {$lastName}", ENT_QUOTES, 'UTF-8');
$safeEmail   = htmlspecialchars($email,   ENT_QUOTES, 'UTF-8');
$safePhone   = htmlspecialchars($phone,   ENT_QUOTES, 'UTF-8');
$safeSubject = htmlspecialchars($subject, ENT_QUOTES, 'UTF-8');
$safeMessage = nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8'));

try {
    getDB()->prepare(
        "INSERT INTO enquiries (full_name, email, phone, subject, message, status) VALUES (?, ?, ?, ?, ?, 'new')"
    )->execute(["{$firstName} {$lastName}", $email, $phone ?: null, $subject ?: null, $message]);
} catch (\PDOException $e) {
    error_log('[TAG DB] enquiry insert failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error. Please try again.']);
    exit;
}

$phoneRow = $safePhone ? "
  <tr>
    <td style=\"padding:10px 14px;background:#111111;border-left:4px solid #FF4500;width:80px;vertical-align:top;\">
      <span style=\"font-size:10px;font-weight:900;letter-spacing:0.2em;text-transform:uppercase;color:#696969;\">Phone</span>
    </td>
    <td style=\"padding:10px 14px;background:#222222;\">
      <a href=\"tel:{$safePhone}\" style=\"font-size:14px;font-weight:700;color:#FF4500;\">{$safePhone}</a>
    </td>
  </tr>" : '';

$subjectRow = $safeSubject ? "
  <tr>
    <td style=\"padding:10px 14px;background:#111111;border-left:4px solid #FF4500;width:80px;vertical-align:top;\">
      <span style=\"font-size:10px;font-weight:900;letter-spacing:0.2em;text-transform:uppercase;color:#696969;\">Subject</span>
    </td>
    <td style=\"padding:10px 14px;background:#222222;\">
      <span style=\"font-size:14px;font-weight:700;color:#FFFFFF;\">{$safeSubject}</span>
    </td>
  </tr>" : '';

$adminBody = <<<HTML
<p style="margin:0 0 20px;font-size:15px;font-weight:700;color:#FFFFFF;">New enquiry from <span style="color:#FF4500;">{$fullName}</span></p>
<table cellpadding="0" cellspacing="0" border="0" width="100%">
  <tr>
    <td style="padding:10px 14px;background:#111111;border-left:4px solid #FF4500;width:80px;vertical-align:top;">
      <span style="font-size:10px;font-weight:900;letter-spacing:0.2em;text-transform:uppercase;color:#696969;">Name</span>
    </td>
    <td style="padding:10px 14px;background:#222222;">
      <span style="font-size:14px;font-weight:700;color:#FFFFFF;">{$fullName}</span>
    </td>
  </tr>
  <tr>
    <td style="padding:10px 14px;background:#111111;border-left:4px solid #FF4500;vertical-align:top;">
      <span style="font-size:10px;font-weight:900;letter-spacing:0.2em;text-transform:uppercase;color:#696969;">Email</span>
    </td>
    <td style="padding:10px 14px;background:#222222;">
      <a href="mailto:{$safeEmail}" style="font-size:14px;font-weight:700;color:#FF4500;">{$safeEmail}</a>
    </td>
  </tr>
  {$phoneRow}
  {$subjectRow}
  <tr>
    <td style="padding:10px 14px;background:#111111;border-left:4px solid #FF4500;vertical-align:top;">
      <span style="font-size:10px;font-weight:900;letter-spacing:0.2em;text-transform:uppercase;color:#696969;">Message</span>
    </td>
    <td style="padding:10px 14px;background:#222222;">
      <span style="font-size:14px;font-weight:600;color:#D3D3D3;line-height:1.7;">{$safeMessage}</span>
    </td>
  </tr>
</table>
HTML;

$clientBody = <<<HTML
<p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#FFFFFF;">Hi {$fullName},</p>
<p style="margin:0 0 20px;font-size:15px;font-weight:600;color:#A9A9A9;line-height:1.8;">
  Your message has been received. Ventnor will be in touch within <strong style="color:#FFFFFF;">24 hours</strong>.
</p>
<p style="margin:0;font-size:14px;color:#A9A9A9;">
  Need to reach Ventnor directly?<br>
  📞 <a href="tel:+27711696716" style="color:#FF4500;text-decoration:none;">071 169 6716</a>
  &nbsp;·&nbsp;
  ✉ <a href="mailto:info@theauctionguyza.co.za" style="color:#FF4500;text-decoration:none;">info@theauctionguyza.co.za</a>
</p>
HTML;

$emailSubject = $safeSubject ? "New Enquiry — {$fullName}: {$safeSubject}" : "New Enquiry — {$fullName}";

sendTagEmail(TAG_ADMIN_EMAIL, $emailSubject, $adminBody, 'contact_admin');
sendTagEmail($email, 'Message Received — The Auction Guy', $clientBody, 'contact_client');

echo json_encode(['success' => true, 'message' => 'Message sent. Ventnor will be in touch within 24 hours.']);