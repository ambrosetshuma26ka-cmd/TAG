<?php
declare(strict_types=1);

require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=UTF-8');
ob_start();
set_exception_handler(function(Throwable $e) {
    while (ob_get_level()) ob_end_clean();
    header('Content-Type: application/json; charset=UTF-8');
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    exit;
});
set_error_handler(function(int $errno, string $errstr) {
    throw new \ErrorException($errstr, $errno);
});

function requireAuth(): void {
    $token = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
    if (empty($token)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorised.']);
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

if ($method === 'GET') {
    requireAuth();

    if ($action === 'slots_for_date') {
        $date = trim($_GET['date'] ?? '');
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid date format.']);
            exit;
        }
        $stmt = getDB()->prepare(
            "SELECT s.id,
                    TIME_FORMAT(s.slot_time, '%H:%i') AS slot_time,
                    s.duration_mins,
                    s.status,
                    a.full_name,
                    a.reference,
                    a.email,
                    a.phone
             FROM appointment_slots s
             LEFT JOIN appointments a ON s.appointment_id = a.id
             WHERE s.slot_date = ?
             ORDER BY s.slot_time, s.duration_mins"
        );
        $stmt->execute([$date]);
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
        exit;
    }

    if ($action === 'slots_summary') {
        $year  = (int)($_GET['year']  ?? date('Y'));
        $month = (int)($_GET['month'] ?? date('n'));
        $from  = sprintf('%04d-%02d-01', $year, $month);
        $to    = sprintf('%04d-%02d-%02d', $year, $month, cal_days_in_month(CAL_GREGORIAN, $month, $year));
        $stmt  = getDB()->prepare(
            "SELECT slot_date,
                    SUM(CASE WHEN status='available' THEN 1 ELSE 0 END) AS available,
                    SUM(CASE WHEN status='booked'    THEN 1 ELSE 0 END) AS booked,
                    COUNT(*) AS total
             FROM appointment_slots
             WHERE slot_date BETWEEN ? AND ?
             GROUP BY slot_date"
        );
        $stmt->execute([$from, $to]);
        $rows = [];
        foreach ($stmt->fetchAll() as $r) {
            $rows[$r['slot_date']] = [
                'available' => (int)$r['available'],
                'booked'    => (int)$r['booked'],
                'total'     => (int)$r['total'],
            ];
        }
        echo json_encode(['success' => true, 'data' => $rows]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Unknown GET action.']);
    exit;
}

if ($method === 'POST') {
    requireAuth();
    $raw  = file_get_contents('php://input');
    $data = json_decode($raw, true) ?? [];
    $action = $data['action'] ?? '';

    if ($action === 'add_slot') {
        $date = trim($data['date']     ?? '');
        $time = trim($data['time']     ?? '');
        $dur  = (int)($data['duration'] ?? 0);

        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) || !preg_match('/^\d{2}:\d{2}$/', $time)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid date or time format.']);
            exit;
        }
        if (!in_array($dur, [30, 60], true)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Duration must be 30 or 60.']);
            exit;
        }

        $exists = getDB()->prepare(
            "SELECT id FROM appointment_slots WHERE slot_date=? AND slot_time=? AND duration_mins=?"
        );
        $exists->execute([$date, $time.':00', $dur]);
        if ($exists->fetch()) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'This slot already exists.']);
            exit;
        }

        $overlap = getDB()->prepare(
            "SELECT id FROM appointment_slots
             WHERE slot_date = ?
             AND status != 'available'
             AND TIME_TO_SEC(slot_time) < TIME_TO_SEC(?) + ? * 60
             AND TIME_TO_SEC(slot_time) + duration_mins * 60 > TIME_TO_SEC(?)"
        );
        $overlap->execute([$date, $time.':00', $dur, $time.':00']);
        if ($overlap->fetch()) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'This slot overlaps with a booked slot.']);
            exit;
        }

        getDB()->prepare(
            "INSERT INTO appointment_slots (slot_date, slot_time, duration_mins, status)
             VALUES (?, ?, ?, 'available')"
        )->execute([$date, $time.':00', $dur]);

        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'add_bulk') {
        $date  = trim($data['date']      ?? '');
        $dur   = (int)($data['duration'] ?? 0);
        $times = $data['times']          ?? [];

        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) || !in_array($dur, [30, 60], true) || !is_array($times)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid input.']);
            exit;
        }

        $added = 0;
        $skipped = 0;
        foreach ($times as $time) {
            $time = trim($time);
            if (!preg_match('/^\d{2}:\d{2}$/', $time)) { $skipped++; continue; }

            $exists = getDB()->prepare(
                "SELECT id FROM appointment_slots WHERE slot_date=? AND slot_time=? AND duration_mins=?"
            );
            $exists->execute([$date, $time.':00', $dur]);
            if ($exists->fetch()) { $skipped++; continue; }

            $overlap = getDB()->prepare(
                "SELECT id FROM appointment_slots
                 WHERE slot_date = ?
                 AND status != 'available'
                 AND TIME_TO_SEC(slot_time) < TIME_TO_SEC(?) + ? * 60
                 AND TIME_TO_SEC(slot_time) + duration_mins * 60 > TIME_TO_SEC(?)"
            );
            $overlap->execute([$date, $time.':00', $dur, $time.':00']);
            if ($overlap->fetch()) { $skipped++; continue; }

            getDB()->prepare(
                "INSERT INTO appointment_slots (slot_date, slot_time, duration_mins, status)
                 VALUES (?, ?, ?, 'available')"
            )->execute([$date, $time.':00', $dur]);
            $added++;
        }

        echo json_encode(['success' => true, 'added' => $added, 'skipped' => $skipped]);
        exit;
    }

    if ($action === 'remove_slot') {
        $id = (int)($data['id'] ?? 0);
        $check = getDB()->prepare("SELECT status FROM appointment_slots WHERE id = ?");
        $check->execute([$id]);
        $slot = $check->fetch();
        if (!$slot) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Slot not found.']);
            exit;
        }
        if ($slot['status'] !== 'available') {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Cannot remove a booked or blocked slot.']);
            exit;
        }
        getDB()->prepare("DELETE FROM appointment_slots WHERE id = ?")->execute([$id]);
        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'clear_day') {
        $date = trim($data['date'] ?? '');
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid date format.']);
            exit;
        }
        $stmt = getDB()->prepare(
            "DELETE FROM appointment_slots WHERE slot_date = ? AND status = 'available'"
        );
        $stmt->execute([$date]);
        echo json_encode(['success' => true, 'removed' => $stmt->rowCount()]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Unknown action.']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);