<?php
declare(strict_types=1);
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=UTF-8');

function requireAuth(): void {
    $token = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
    if (empty($token)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorised. No token provided.']);
        exit;
    }
    $stmt = getDB()->prepare(
        'SELECT s.id FROM admin_sessions s WHERE s.token = ? AND s.expires_at > NOW()'
    );
    $stmt->execute([$token]);
    if (!$stmt->fetch()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Session expired. Please log in again.']);
        exit;
    }
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'POST') {
    $raw  = file_get_contents('php://input');
    $data = json_decode($raw, true) ?? [];
    $action = $data['action'] ?? $action;

    requireAuth();

    if ($action === 'update_appointment') {
        $id         = (int)($data['id'] ?? 0);
        $status     = $data['status']         ?? null;
        $payStatus  = $data['payment_status'] ?? null;
        $adminNotes = $data['admin_notes']    ?? null;

        $validStatuses = ['pending','confirmed','completed','cancelled','no_show'];
        $validPay      = ['unpaid','paid','refunded'];
        $sets = []; $vals = [];

        if ($status && in_array($status, $validStatuses))  { $sets[] = 'status = ?';         $vals[] = $status;     }
        if ($payStatus && in_array($payStatus, $validPay)) { $sets[] = 'payment_status = ?'; $vals[] = $payStatus;  }
        if ($adminNotes !== null)                           { $sets[] = 'admin_notes = ?';    $vals[] = $adminNotes; }

        if (empty($sets)) { echo json_encode(['success' => false, 'message' => 'Nothing to update.']); exit; }
        $vals[] = $id;
        getDB()->prepare('UPDATE appointments SET ' . implode(', ', $sets) . ' WHERE id = ?')->execute($vals);

        if ($status === 'cancelled') {
            $apptRow = getDB()->prepare("SELECT appt_date FROM appointments WHERE id = ?");
            $apptRow->execute([$id]);
            $apptData = $apptRow->fetch();

            getDB()->prepare(
                "UPDATE appointment_slots SET status='available', appointment_id=NULL WHERE appointment_id=?"
            )->execute([$id]);

            if ($apptData) {
                $apptDate    = $apptData['appt_date'];
                $stillBooked = getDB()->prepare(
                    "SELECT appointment_id, slot_time, duration_mins FROM appointment_slots
                     WHERE slot_date = ? AND status = 'booked' AND appointment_id IS NOT NULL"
                );
                $stillBooked->execute([$apptDate]);
                foreach ($stillBooked->fetchAll() as $bs) {
                    getDB()->prepare(
                        "UPDATE appointment_slots
                         SET status = 'blocked', appointment_id = ?
                         WHERE slot_date = ?
                         AND status = 'available'
                         AND NOT (slot_time = ? AND duration_mins = ?)
                         AND TIME_TO_SEC(slot_time) < TIME_TO_SEC(?) + ? * 60
                         AND TIME_TO_SEC(slot_time) + duration_mins * 60 > TIME_TO_SEC(?)"
                    )->execute([
                        $bs['appointment_id'],
                        $apptDate,
                        $bs['slot_time'], $bs['duration_mins'],
                        $bs['slot_time'], $bs['duration_mins'],
                        $bs['slot_time'],
                    ]);
                }
            }
        }

        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'update_quote') {
        $id         = (int)($data['id'] ?? 0);
        $status     = $data['status']        ?? null;
        $adminNotes = $data['admin_notes']   ?? null;
        $quoted     = isset($data['quoted_amount']) ? (float)$data['quoted_amount'] : null;

        $validStatuses = ['pending','in_progress','quoted','accepted','declined'];
        $sets = []; $vals = [];

        if ($status && in_array($status, $validStatuses)) { $sets[] = 'status = ?';        $vals[] = $status;     }
        if ($adminNotes !== null)                          { $sets[] = 'admin_notes = ?';   $vals[] = $adminNotes; }
        if ($quoted !== null)                              { $sets[] = 'quoted_amount = ?'; $vals[] = $quoted;     }

        if (empty($sets)) { echo json_encode(['success' => false, 'message' => 'Nothing to update.']); exit; }
        $vals[] = $id;
        getDB()->prepare('UPDATE quote_requests SET ' . implode(', ', $sets) . ' WHERE id = ?')->execute($vals);
        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'update_enquiry') {
        $id     = (int)($data['id'] ?? 0);
        $status = $data['status'] ?? '';
        if (!in_array($status, ['new','read','replied','archived'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid status.']);
            exit;
        }
        getDB()->prepare('UPDATE enquiries SET status = ? WHERE id = ?')->execute([$status, $id]);
        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'block_date') {
        $date   = trim($data['date']   ?? '');
        $reason = trim($data['reason'] ?? '');
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid date format (YYYY-MM-DD required).']);
            exit;
        }
        getDB()->prepare('INSERT IGNORE INTO blocked_dates (blocked_date, reason) VALUES (?, ?)')->execute([$date, $reason]);
        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'unblock_date') {
        $date = trim($data['date'] ?? '');
        getDB()->prepare('DELETE FROM blocked_dates WHERE blocked_date = ?')->execute([$date]);
        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'block_slot') {
        $date = trim($data['date'] ?? '');
        $time = trim($data['time'] ?? '');
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) || !preg_match('/^\d{2}:\d{2}$/', $time)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid date or time format.']);
            exit;
        }
        getDB()->prepare(
            "INSERT INTO appointment_slots (slot_date, slot_time, status)
             VALUES (?, ?, 'blocked')
             ON DUPLICATE KEY UPDATE status='blocked', appointment_id=NULL"
        )->execute([$date, $time . ':00']);
        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'unblock_slot') {
        $date = trim($data['date'] ?? '');
        $time = trim($data['time'] ?? '');
        getDB()->prepare(
            "DELETE FROM appointment_slots WHERE slot_date=? AND slot_time=? AND status='blocked'"
        )->execute([$date, $time . ':00']);
        echo json_encode(['success' => true]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Unknown POST action.']);
    exit;
}

if ($method === 'GET') {
    requireAuth();

    if ($action === 'dashboard') {
        $db    = getDB();
        $today = date('Y-m-d');
        $stats = [
            'appointmentsToday'   => (int)  $db->query("SELECT COUNT(*) FROM appointments WHERE appt_date = '{$today}' AND status NOT IN ('cancelled')")->fetchColumn(),
            'appointmentsPending' => (int)  $db->query("SELECT COUNT(*) FROM appointments WHERE status = 'pending'")->fetchColumn(),
            'appointmentsTotal'   => (int)  $db->query("SELECT COUNT(*) FROM appointments")->fetchColumn(),
            'quotesPending'       => (int)  $db->query("SELECT COUNT(*) FROM quote_requests WHERE status = 'pending'")->fetchColumn(),
            'enquiriesNew'        => (int)  $db->query("SELECT COUNT(*) FROM enquiries WHERE status = 'new'")->fetchColumn(),
            'revenueUnpaid'       => (float)($db->query("SELECT COALESCE(SUM(fee),0) FROM appointments WHERE status = 'confirmed' AND payment_status = 'unpaid'")->fetchColumn()),
        ];
        $upcoming = $db->query(
            "SELECT id,reference,full_name,appt_date,appt_time,duration_mins,fee,status
             FROM appointments
             WHERE appt_date BETWEEN '{$today}' AND DATE_ADD('{$today}', INTERVAL 7 DAY)
               AND status NOT IN ('cancelled')
             ORDER BY appt_date, appt_time
             LIMIT 15"
        )->fetchAll();
        echo json_encode(['success' => true, 'stats' => $stats, 'upcoming' => $upcoming]);
        exit;
    }

    if ($action === 'appointments') {
        $status = $_GET['status'] ?? '';
        $where  = $status ? 'WHERE status = ' . getDB()->quote($status) : '';
        $rows   = getDB()->query("SELECT * FROM appointments {$where} ORDER BY appt_date DESC, appt_time DESC")->fetchAll();
        echo json_encode(['success' => true, 'data' => $rows]);
        exit;
    }

    if ($action === 'appointment') {
        $id   = (int)($_GET['id'] ?? 0);
        $stmt = getDB()->prepare('SELECT * FROM appointments WHERE id = ?');
        $stmt->execute([$id]);
        $row  = $stmt->fetch();
        if (!$row) { http_response_code(404); echo json_encode(['success' => false, 'message' => 'Not found.']); exit; }
        echo json_encode(['success' => true, 'data' => $row]);
        exit;
    }

    if ($action === 'quotes') {
        $status = $_GET['status'] ?? '';
        $where  = $status ? 'WHERE status = ' . getDB()->quote($status) : '';
        $rows   = getDB()->query("SELECT * FROM quote_requests {$where} ORDER BY created_at DESC")->fetchAll();
        echo json_encode(['success' => true, 'data' => $rows]);
        exit;
    }

    if ($action === 'quote') {
        $id   = (int)($_GET['id'] ?? 0);
        $stmt = getDB()->prepare('SELECT * FROM quote_requests WHERE id = ?');
        $stmt->execute([$id]);
        $row  = $stmt->fetch();
        if (!$row) { http_response_code(404); echo json_encode(['success' => false, 'message' => 'Not found.']); exit; }
        echo json_encode(['success' => true, 'data' => $row]);
        exit;
    }

    if ($action === 'enquiries') {
        $rows = getDB()->query("SELECT * FROM enquiries ORDER BY created_at DESC")->fetchAll();
        echo json_encode(['success' => true, 'data' => $rows]);
        exit;
    }

    if ($action === 'blocked_dates') {
        $rows = getDB()->query("SELECT * FROM blocked_dates ORDER BY blocked_date")->fetchAll();
        echo json_encode(['success' => true, 'data' => $rows]);
        exit;
    }

    if ($action === 'slots') {
        $date = trim($_GET['date'] ?? '');
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid date format.']);
            exit;
        }
        $stmt = getDB()->prepare(
            "SELECT s.id, TIME_FORMAT(s.slot_time, '%H:%i') AS slot_time, s.duration_mins, s.status,
                    a.full_name, a.reference
             FROM appointment_slots s
             LEFT JOIN appointments a ON s.appointment_id = a.id
             WHERE s.slot_date = ?
             ORDER BY s.slot_time, s.duration_mins"
        );
        $stmt->execute([$date]);
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Unknown GET action.']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);