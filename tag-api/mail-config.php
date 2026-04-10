<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/PHPMailer/src/Exception.php';
require __DIR__ . '/PHPMailer/src/PHPMailer.php';
require __DIR__ . '/PHPMailer/src/SMTP.php';

//configuration removed 
function sendTagEmail(
    string $to,
    string $subject,
    string $bodyContent,
    string $template = 'generic'
): bool|string {
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
        return 'Invalid recipient email address.';
    }

    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = MAIL_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = MAIL_USERNAME;
        $mail->Password   = MAIL_PASSWORD;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = MAIL_PORT;

        $mail->setFrom(MAIL_FROM, MAIL_FROM_NAME);
        $mail->addReplyTo(MAIL_REPLY_TO, MAIL_FROM_NAME);
        $mail->addAddress($to);

        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = buildTagEmailTemplate($bodyContent, $template);
        $mail->AltBody = wordwrap(strip_tags($bodyContent), 80);

        $mail->send();
        return true;

    } catch (Exception $e) {
        error_log('[' . date('Y-m-d H:i:s') . '] TAG email failed to ' . $to . ': ' . $mail->ErrorInfo);
        return 'Email could not be sent: ' . $mail->ErrorInfo;
    }
}

function sendTagEmailWithAttachment(
    string $to,
    string $toName,
    string $subject,
    string $bodyContent,
    string $pdfBytes,
    string $filename,
    string $template = 'quote_client'
): bool|string {
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
        return 'Invalid recipient email address.';
    }

    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = MAIL_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = MAIL_USERNAME;
        $mail->Password   = MAIL_PASSWORD;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = MAIL_PORT;

        $mail->setFrom(MAIL_FROM, MAIL_FROM_NAME);
        $mail->addReplyTo(MAIL_REPLY_TO, MAIL_FROM_NAME);
        $mail->addAddress($to, $toName);
        $mail->addCC(TAG_ADMIN_EMAIL, MAIL_FROM_NAME);

        $mail->addStringAttachment($pdfBytes, $filename, 'base64', 'application/pdf');

        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = buildTagEmailTemplate($bodyContent, $template);
        $mail->AltBody = wordwrap(strip_tags($bodyContent), 80);

        $mail->send();
        return true;

    } catch (Exception $e) {
        error_log('[' . date('Y-m-d H:i:s') . '] TAG PDF email failed to ' . $to . ': ' . $mail->ErrorInfo);
        return 'Email could not be sent: ' . $mail->ErrorInfo;
    }
}

function buildTagEmailTemplate(string $bodyContent, string $template): string {
    $year   = date('Y');
    $orange = '#FF4500';
    $black  = '#111111';

    $heroTitle = match($template) {
        'contact_admin'      => 'New Enquiry Received',
        'contact_client'     => 'Message Received',
        'quote_admin'        => 'New Quote Request',
        'quote_client'       => 'Your Quote Request',
        'appointment_admin'  => 'New Appointment Booked',
        'appointment_client' => 'Booking Confirmed',
        default              => 'Notification from TAG',
    };

    return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>{$heroTitle}</title>
</head>
<body style="margin:0;padding:0;background:#F2F2F2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F2F2F2;">
  <tr><td align="center" style="padding:32px 16px;">
    <table width="620" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;width:100%;background:#1a1a1a;">

      <tr><td style="height:6px;background:{$orange};font-size:1px;line-height:1px;">&nbsp;</td></tr>

      <tr>
        <td style="background:{$black};padding:28px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td>
              <p style="margin:0 0 2px;font-size:10px;font-weight:900;letter-spacing:0.35em;text-transform:uppercase;color:{$orange};">STEER YOUR FUTURE, DRIVE YOUR DREAMS.</p>
              <p style="margin:0;font-size:24px;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;color:#FFFFFF;">THE AUCTION GUY</p>
            </td>
            <td align="right" valign="middle">
              <div style="width:44px;height:44px;background:{$orange};text-align:center;line-height:44px;display:inline-block;">
                <span style="font-size:24px;font-weight:900;color:#FFFFFF;font-family:serif;">A</span>
              </div>
            </td>
          </tr></table>
        </td>
      </tr>

      <tr>
        <td style="background:#1a1a1a;border-bottom:3px solid {$orange};padding:24px 40px 20px;">
          <p style="margin:0 0 4px;font-size:10px;font-weight:900;letter-spacing:0.3em;text-transform:uppercase;color:{$orange};">The Auction Guy · Johannesburg, South Africa</p>
          <h1 style="margin:0;font-size:22px;font-weight:900;color:#FFFFFF;letter-spacing:0.06em;text-transform:uppercase;">{$heroTitle}</h1>
        </td>
      </tr>

      <tr>
        <td style="background:#1a1a1a;padding:32px 40px 28px;">
          {$bodyContent}
        </td>
      </tr>

      <tr>
        <td style="background:{$black};padding:24px 40px;border-top:1px solid #2a2a2a;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td>
              <p style="margin:0 0 3px;font-size:13px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:#FFFFFF;">Ventnor Goosen</p>
              <p style="margin:0 0 2px;font-size:12px;">
                <a href="tel:+27711696716" style="color:#A9A9A9;text-decoration:none;">071 169 6716</a>
              </p>
              <p style="margin:0;font-size:12px;">
                <a href="mailto:info@theauctionguyza.co.za" style="color:{$orange};text-decoration:none;">info@theauctionguyza.co.za</a>
              </p>
            </td>
            <td align="right" valign="top">
              <p style="margin:0 0 4px;font-size:10px;font-weight:900;letter-spacing:0.2em;text-transform:uppercase;color:#696969;">Active At</p>
              <p style="margin:0;font-size:11px;color:#808080;line-height:1.9;">Burchmores · WeBuyCars<br>Aucor · SMA</p>
            </td>
          </tr></table>
        </td>
      </tr>

      <tr>
        <td style="background:#0D0D0D;padding:16px 40px;text-align:center;">
          <p style="margin:0 0 4px;font-size:11px;color:#696969;line-height:1.6;">Automated message from the TAG system. Do not reply — use the contact details above.</p>
          <p style="margin:0;font-size:10px;font-weight:700;color:#444;letter-spacing:0.12em;text-transform:uppercase;">&copy; {$year} The Auction Guy &nbsp;|&nbsp; Johannesburg, South Africa</p>
        </td>
      </tr>

      <tr><td style="height:4px;background:{$orange};font-size:1px;line-height:1px;">&nbsp;</td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>
HTML;
}