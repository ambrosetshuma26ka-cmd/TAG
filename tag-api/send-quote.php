<?php
declare(strict_types=1);
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/mail-config.php';
header('Content-Type: application/json; charset=UTF-8');

$token = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
if (empty($token)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorised.']);
    exit;
}
$stmt = getDB()->prepare('SELECT id FROM admin_sessions WHERE token = ? AND expires_at > NOW()');
$stmt->execute([$token]);
if (!$stmt->fetch()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Session expired. Please log in again.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true) ?? [];

$quoteId        = (int)($data['quoteId']       ?? 0);
$quoteRef       = trim($data['quoteRef']       ?? '');
$recipientEmail = trim($data['recipientEmail'] ?? '');
$recipientName  = trim($data['recipientName']  ?? 'Client');
$subject        = trim($data['subject']        ?? "Quotation {$quoteRef} — The Auction Guy");
$pdfBase64      = trim($data['pdfBase64']      ?? '');

if (!$recipientEmail || !filter_var($recipientEmail, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Invalid recipient email address.']);
    exit;
}

if (empty($pdfBase64)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'No PDF data received.']);
    exit;
}

$pdfBase64 = preg_replace('/^data:[^;]+;base64,/', '', $pdfBase64);
$pdfBytes  = base64_decode($pdfBase64, true);

if ($pdfBytes === false || strlen($pdfBytes) < 100) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'PDF decoding failed.']);
    exit;
}

if (substr($pdfBytes, 0, 4) !== '%PDF') {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'File does not appear to be a valid PDF.']);
    exit;
}

$safeName = htmlspecialchars($recipientName, ENT_QUOTES, 'UTF-8');
$safeRef  = htmlspecialchars($quoteRef,      ENT_QUOTES, 'UTF-8');

$bodyHtml = <<<HTML
<p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#FFFFFF;">Hi {$safeName},</p>
<p style="margin:0 0 20px;font-size:15px;font-weight:600;color:#A9A9A9;line-height:1.8;">
  Please find your personalised quotation from <strong style="color:#FFFFFF;">The Auction Guy</strong> attached to this email.
</p>
<p style="margin:0 0 8px;font-size:10px;font-weight:900;letter-spacing:0.3em;text-transform:uppercase;color:#FF4500;">Reference</p>
<p style="margin:0 0 24px;font-size:20px;font-weight:900;color:#FFFFFF;">{$safeRef}</p>
<p style="margin:0 0 20px;font-size:14px;font-weight:600;color:#A9A9A9;line-height:1.8;">
  To accept this quotation, reply to this email or contact Ventnor directly:
</p>
<p style="margin:16px 0 0;font-size:14px;color:#A9A9A9;border-top:1px solid #2A2A2A;padding-top:16px;">
  📞 <a href="tel:+27711696716" style="color:#FF4500;text-decoration:none;">071 169 6716</a>
  &nbsp;·&nbsp;
  ✉ <a href="mailto:info@theauctionguyza.co.za" style="color:#FF4500;text-decoration:none;">info@theauctionguyza.co.za</a>
</p>
HTML;

$filename = ($quoteRef ?: 'TAG-Quote') . '.pdf';
$result   = sendTagEmailWithAttachment($recipientEmail, $recipientName, $subject, $bodyHtml, $pdfBytes, $filename);

if ($result !== true) {
    error_log('[TAG] send-quote failed: ' . $result);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Email send failed: ' . $result]);
    exit;
}

if ($quoteId > 0) {
    try {
        getDB()->prepare(
            "UPDATE quote_requests SET status = 'quoted', updated_at = NOW() WHERE id = ? AND status NOT IN ('accepted','declined')"
        )->execute([$quoteId]);
    } catch (\PDOException $e) {
        error_log('[TAG DB] send-quote status update failed: ' . $e->getMessage());
    }
}

echo json_encode([
    'success' => true,
    'message' => "Quote sent to {$recipientEmail}.",
]);