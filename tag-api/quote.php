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
$data = json_decode($raw, true) ?? [];

$fullName          = trim($data['fullName']          ?? '');
$email             = trim($data['email']             ?? '');
$phone             = trim($data['phone']             ?? '');
$servicesRequested = trim($data['servicesRequested'] ?? '');
$vehicleMake       = trim($data['vehicleMake']       ?? '');
$vehicleModel      = trim($data['vehicleModel']      ?? '');
$vehicleYear       = trim($data['vehicleYear']       ?? '');
$budgetRange       = trim($data['budgetRange']       ?? '');
$notes             = trim($data['notes']             ?? '');
$deliveryRequired  = !empty($data['deliveryRequired']) ? 1 : 0;
$deliveryDistance  = $deliveryRequired ? (int)($data['deliveryDistance'] ?? 0) : null;
$deliveryEstimate  = $deliveryRequired && isset($data['deliveryEstimate']) ? (float)$data['deliveryEstimate'] : null;

if (!$fullName || !$email || !$servicesRequested) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Name, email, and at least one service are required.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Invalid email address.']);
    exit;
}

$reference  = 'TAG-QT-' . strtoupper(substr(uniqid(), -6));
$vehicleStr = trim("{$vehicleYear} {$vehicleMake} {$vehicleModel}") ?: 'Not specified';
$delivStr   = $deliveryRequired
    ? "Yes — {$deliveryDistance} km (Est. R" . number_format((float)($deliveryEstimate ?? 0), 0) . ')'
    : 'Not required';

$safeName     = htmlspecialchars($fullName,                    ENT_QUOTES, 'UTF-8');
$safeEmail    = htmlspecialchars($email,                       ENT_QUOTES, 'UTF-8');
$safeRef      = htmlspecialchars($reference,                   ENT_QUOTES, 'UTF-8');
$safeServices = htmlspecialchars($servicesRequested,           ENT_QUOTES, 'UTF-8');
$safeVehicle  = htmlspecialchars($vehicleStr,                  ENT_QUOTES, 'UTF-8');
$safeBudget   = htmlspecialchars($budgetRange ?: 'Not specified', ENT_QUOTES, 'UTF-8');
$safeDelivery = htmlspecialchars($delivStr,                    ENT_QUOTES, 'UTF-8');
$safePhone    = htmlspecialchars($phone ?: 'Not provided',     ENT_QUOTES, 'UTF-8');
$safeNotes    = nl2br(htmlspecialchars($notes ?: 'None',       ENT_QUOTES, 'UTF-8'));

function qRow(string $label, string $value): string {
    return <<<HTML
<tr>
  <td style="padding:10px 14px;background:#111111;border-left:4px solid #FF4500;width:90px;vertical-align:top;">
    <span style="font-size:10px;font-weight:900;letter-spacing:0.2em;text-transform:uppercase;color:#696969;">{$label}</span>
  </td>
  <td style="padding:10px 14px;background:#222222;vertical-align:top;">
    <span style="font-size:14px;font-weight:600;color:#D3D3D3;line-height:1.6;">{$value}</span>
  </td>
</tr>
HTML;
}

$rows  = qRow('Reference', "<strong style='color:#FF4500;'>{$safeRef}</strong>");
$rows .= qRow('Client',    "<strong style='color:#FFFFFF;'>{$safeName}</strong>");
$rows .= qRow('Email',     "<a href='mailto:{$safeEmail}' style='color:#FF4500;'>{$safeEmail}</a>");
$rows .= qRow('Phone',     $safePhone);
$rows .= qRow('Services',  $safeServices);
$rows .= qRow('Vehicle',   $safeVehicle);
$rows .= qRow('Budget',    $safeBudget);
$rows .= qRow('Delivery',  $safeDelivery);
if ($notes) $rows .= qRow('Notes', $safeNotes);

$adminBody = <<<HTML
<p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#FFFFFF;">New quote request from the TAG website.</p>
<table cellpadding="0" cellspacing="0" border="0" width="100%">{$rows}</table>
HTML;

$clientBody = <<<HTML
<p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#FFFFFF;">Hi {$safeName},</p>
<p style="margin:0 0 20px;font-size:15px;font-weight:600;color:#A9A9A9;line-height:1.8;">
  Your quote request <strong style="color:#FF4500;">{$safeRef}</strong> has been received.
  Ventnor will prepare a tailored quote and respond within <strong style="color:#FFFFFF;">24 hours</strong>.
</p>
<p style="margin:0;font-size:14px;color:#A9A9A9;">
  Questions in the meantime?<br>
  📞 <a href="tel:+27711696716" style="color:#FF4500;text-decoration:none;">071 169 6716</a>
  &nbsp;·&nbsp;
  ✉ <a href="mailto:info@theauctionguyza.co.za" style="color:#FF4500;text-decoration:none;">info@theauctionguyza.co.za</a>
</p>
HTML;

try {
    getDB()->prepare(
        "INSERT INTO quote_requests
         (reference, full_name, email, phone, services_requested,
          vehicle_make, vehicle_model, vehicle_year, budget_range,
          delivery_required, delivery_distance, delivery_estimate, notes, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')"
    )->execute([
        $reference, $fullName, $email, $phone, $servicesRequested,
        $vehicleMake, $vehicleModel, $vehicleYear, $budgetRange,
        $deliveryRequired, $deliveryDistance, $deliveryEstimate, $notes,
    ]);
} catch (\PDOException $e) {
    error_log('[TAG DB] quote insert failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error. Please try again.']);
    exit;
}

sendTagEmail(TAG_ADMIN_EMAIL, "New Quote Request — {$fullName} · {$reference}", $adminBody, 'quote_admin');
sendTagEmail($email, "Quote Request Received — {$reference} · The Auction Guy", $clientBody, 'quote_client');

echo json_encode([
    'success'   => true,
    'reference' => $reference,
    'message'   => 'Quote request received. Ventnor will respond within 24 hours.',
]);