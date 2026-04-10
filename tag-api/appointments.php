<?php
declare(strict_types=1);
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=UTF-8');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $action = $_GET['action'] ?? '';

    if ($action === 'blocked_dates') {
        $rows = getDB()->query(
            "SELECT blocked_date, reason FROM blocked_dates ORDER BY blocked_date"
        )->fetchAll();
        echo json_encode(['success' => true, 'data' => $rows]);
        exit;
    }

    if ($action === 'available_slots') {
        $date     = trim($_GET['date']     ?? '');
        $duration = (int)($_GET['duration'] ?? 0);

        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid date format.']);
            exit;
        }

        if (!in_array($duration, [30, 60], true)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Duration must be 30 or 60.']);
            exit;
        }

        $stmt = getDB()->prepare(
            "SELECT TIME_FORMAT(slot_time, '%H:%i') AS slot_time
             FROM appointment_slots
             WHERE slot_date = ? AND duration_mins = ? AND status = 'available'
             ORDER BY slot_time"
        );
        $stmt->execute([$date, $duration]);
        $slots = array_column($stmt->fetchAll(), 'slot_time');

        echo json_encode(['success' => true, 'date' => $date, 'duration' => $duration, 'slots' => $slots]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Unknown GET action.']);
    exit;
}

if ($method === 'POST') {
    $raw  = file_get_contents('php://input');
    $data = json_decode($raw, true) ?? [];

    $required = ['consultType', 'date', 'time', 'fee', 'fullName', 'email'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => "Missing required field: {$field}"]);
            exit;
        }
    }

    $email = filter_var(trim($data['email']), FILTER_VALIDATE_EMAIL);
    if (!$email) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Invalid email address.']);
        exit;
    }

    $date = trim($data['date']);
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Invalid date format (YYYY-MM-DD required).']);
        exit;
    }

    $time = trim($data['time']);
    if (!preg_match('/^\d{2}:\d{2}$/', $time)) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Invalid time format (HH:MM required).']);
        exit;
    }

    $duration = (int)($data['duration'] ?? 60);
    if (!in_array($duration, [30, 60], true)) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Duration must be 30 or 60.']);
        exit;
    }

    $blockedDay = getDB()->prepare("SELECT id FROM blocked_dates WHERE blocked_date = ?");
    $blockedDay->execute([$date]);
    if ($blockedDay->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'This date is unavailable. Please choose another date.']);
        exit;
    }

    $slotCheck = getDB()->prepare(
        "SELECT id FROM appointment_slots
         WHERE slot_date = ? AND slot_time = ? AND duration_mins = ? AND status = 'available'"
    );
    $slotCheck->execute([$date, $time . ':00', $duration]);
    if (!$slotCheck->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'This slot is no longer available. Please choose another.']);
        exit;
    }

    $validTypes  = ['vehicle_acquisition','general','fleet','export','other'];
    $consultType = in_array($data['consultType'], $validTypes) ? $data['consultType'] : 'other';
    $reference   = 'TAG-APT-' . strtoupper(substr(uniqid(), -6));

    $db = getDB();
    $db->beginTransaction();

    try {
        $stmt = $db->prepare(
            "INSERT INTO appointments
             (reference, full_name, email, phone, consult_type,
              appt_date, appt_time, duration_mins, fee,
              vehicle_interest, budget_range, notes, status, payment_status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'unpaid')"
        );
        $stmt->execute([
            $reference,
            trim($data['fullName']),
            $email,
            trim($data['phone']           ?? ''),
            $consultType,
            $date,
            $time . ':00',
            $duration,
            (float)$data['fee'],
            trim($data['vehicleInterest'] ?? ''),
            trim($data['budget']          ?? ''),
            trim($data['notes']           ?? ''),
        ]);

        $appointmentId = (int)$db->lastInsertId();

        $db->prepare(
            "UPDATE appointment_slots
             SET status = 'booked', appointment_id = ?
             WHERE slot_date = ? AND slot_time = ? AND duration_mins = ?"
        )->execute([$appointmentId, $date, $time . ':00', $duration]);

        $db->prepare(
            "UPDATE appointment_slots
             SET status = 'blocked', appointment_id = ?
             WHERE slot_date = ?
             AND status = 'available'
             AND NOT (slot_time = ? AND duration_mins = ?)
             AND TIME_TO_SEC(slot_time) < TIME_TO_SEC(?) + ? * 60
             AND TIME_TO_SEC(slot_time) + duration_mins * 60 > TIME_TO_SEC(?)"
        )->execute([
            $appointmentId,
            $date,
            $time . ':00', $duration,
            $time . ':00', $duration,
            $time . ':00',
        ]);

        $db->commit();
    } catch (\Exception $e) {
        $db->rollBack();
        error_log('[TAG DB] appointment insert failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error. Please try again.']);
        exit;
    }

    echo json_encode([
        'success'   => true,
        'reference' => $reference,
        'message'   => 'Booking received. Ventnor will confirm within 24 hours.',
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);