<?php
/**
 * Talonex Contact Form Handler (contact.php)
 * Native PHP mailer for Truehost cPanel Hosting
 * Sends enquiries directly to danaleko3@gmail.com
 */

// 1. Destination Configuration
$recipientEmail = 'danaleko3@gmail.com';
$senderDomain   = 'talon-ex.com';

// Detect JSON request vs standard POST
$isJsonRequest = (
    (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) ||
    (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false)
);

// 2. Read incoming parameters
if ($isJsonRequest) {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true) ?: [];
    $fullname = trim($data['fullname'] ?? '');
    $email    = trim($data['email'] ?? '');
    $phone    = trim($data['phone'] ?? '');
    $message  = trim($data['message'] ?? '');
    $honey    = trim($data['_honey'] ?? '');
} else {
    $fullname = trim($_POST['fullname'] ?? '');
    $email    = trim($_POST['email'] ?? '');
    $phone    = trim($_POST['phone'] ?? '');
    $message  = trim($_POST['message'] ?? '');
    $honey    = trim($_POST['_honey'] ?? '');
}

// 3. Anti-Spam: Honeypot trap check
if (!empty($honey)) {
    // Automated bot detected: silently respond with success
    if ($isJsonRequest) {
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'message' => 'Message processed']);
    } else {
        header('Location: /contact?submitted=true');
    }
    exit;
}

// 4. Input Validation
$errors = [];
if (empty($fullname)) {
    $errors[] = 'Full name is required.';
}
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'A valid email address is required.';
}
if (empty($phone)) {
    $errors[] = 'Contact phone number is required.';
}
if (empty($message)) {
    $errors[] = 'Message is required.';
}

// Security: Prevent email header injection attacks
if (preg_match("/[\r\n]/", $fullname) || preg_match("/[\r\n]/", $email)) {
    $errors[] = 'Invalid input format.';
}

if (!empty($errors)) {
    if ($isJsonRequest) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'errors' => $errors]);
    } else {
        header('Location: /contact?error=validation');
    }
    exit;
}

// 5. Construct Email
$subject = "New Talonex Data Centre Enquiry - " . strip_tags($fullname);
$timestamp = date('d M Y, H:i T');

$safeFullname = htmlspecialchars($fullname, ENT_QUOTES, 'UTF-8');
$safeEmail    = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$safePhone    = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
$safeMessage  = nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8'));

$emailBody = "
<!DOCTYPE html>
<html lang='en'>
<head>
  <meta charset='UTF-8'>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px; color: #1E293B; }
    .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 8px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #0A192F; padding: 24px; color: #FFFFFF; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; color: #FFFFFF; }
    .header p { margin: 6px 0 0; font-size: 13px; color: #94A3B8; }
    .content { padding: 24px; }
    .table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    .table th, .table td { text-align: left; padding: 12px 14px; border-bottom: 1px solid #F1F5F9; font-size: 14px; }
    .table th { background: #F8FAFC; color: #64748B; width: 30%; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
    .table td { color: #0F172A; }
    .message-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 16px; margin-top: 16px; font-size: 14px; line-height: 1.6; color: #334155; }
    .footer { background: #F8FAFC; padding: 16px 24px; font-size: 12px; color: #94A3B8; border-top: 1px solid #E2E8F0; text-align: center; }
  </style>
</head>
<body>
  <div class='container'>
    <div class='header'>
      <h1>New Website Enquiry</h1>
      <p>Submitted via Talonex (talon-ex.com) on {$timestamp}</p>
    </div>
    <div class='content'>
      <table class='table'>
        <tr>
          <th>Full Name</th>
          <td><strong>{$safeFullname}</strong></td>
        </tr>
        <tr>
          <th>Email</th>
          <td><a href='mailto:{$safeEmail}'>{$safeEmail}</a></td>
        </tr>
        <tr>
          <th>Phone</th>
          <td><a href='tel:{$safePhone}'>{$safePhone}</a></td>
        </tr>
      </table>
      
      <div style='margin-top: 20px;'>
        <span style='font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em;'>Message / Enquiry Details:</span>
        <div class='message-box'>{$safeMessage}</div>
      </div>
    </div>
    <div class='footer'>
      Talonex Project &bull; 150 MW Green Data Centre &bull; Kenya
    </div>
  </div>
</body>
</html>
";

// Headers
$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'From: Talonex Website <no-reply@' . $senderDomain . '>',
    'Reply-To: ' . $fullname . ' <' . $email . '>',
    'X-Mailer: PHP/' . phpversion()
];

// 6. Send Email via Native Truehost mail()
$mailSent = @mail($recipientEmail, $subject, $emailBody, implode("\r\n", $headers));

// 7. Optional: Also save to local JSON log if data folder exists
$dataDir = __DIR__ . '/data';
if (is_dir($dataDir) && is_writable($dataDir)) {
    $dataFile = $dataDir . '/enquiries.json';
    $existing = [];
    if (file_exists($dataFile)) {
        $existing = json_decode(file_get_contents($dataFile), true) ?: [];
    }
    array_unshift($existing, [
        'id'        => 'enq_' . time(),
        'timestamp' => date('c'),
        'fullname'  => $fullname,
        'email'     => $email,
        'phone'     => $phone,
        'message'   => $message,
        'sent'      => $mailSent
    ]);
    @file_put_contents($dataFile, json_encode(array_slice($existing, 0, 100), JSON_PRETTY_PRINT));
}

// 8. Return Response
if ($isJsonRequest) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'message' => 'Enquiry transmitted successfully'
    ]);
} else {
    header('Location: /contact?submitted=true');
}
exit;
