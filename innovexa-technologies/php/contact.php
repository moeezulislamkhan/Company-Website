<?php
/**
 * Innovexa Technologies — Contact form handler
 * ---------------------------------------------
 * Receives the contact form POST from index.html, validates the
 * fields server-side, and emails the enquiry to the company inbox.
 *
 * Update RECIPIENT_EMAIL below and configure your server's mail()
 * function (or swap in PHPMailer/SMTP) before going live.
 */

header('Content-Type: application/json');

// ---- Configuration -------------------------------------------------
const RECIPIENT_EMAIL = 'innovexa.technologies01@gmail.com';
const SITE_NAME        = 'Innovexa Technologies';

// ---- Only accept POST ----------------------------------------------
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// ---- Helpers ---------------------------------------------------------
function clean($value) {
    return htmlspecialchars(trim($value ?? ''), ENT_QUOTES, 'UTF-8');
}

function fail($message, $code = 422) {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}

// ---- Collect + sanitize input ----------------------------------------
$name    = clean($_POST['name'] ?? '');
$email   = clean($_POST['email'] ?? '');
$phone   = clean($_POST['phone'] ?? '');
$service = clean($_POST['service'] ?? 'General enquiry');
$message = clean($_POST['message'] ?? '');

// ---- Honeypot (optional bot trap, add a hidden "website" field in HTML if desired) ----
if (!empty($_POST['website'])) {
    // Silently accept but do nothing — likely a bot.
    echo json_encode(['success' => true]);
    exit;
}

// ---- Validation --------------------------------------------------------
if (strlen($name) < 2) {
    fail('Please enter your full name.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fail('Please enter a valid email address.');
}
if (strlen($message) < 10) {
    fail('Please add a few more details about your project.');
}

// ---- Build the email ----------------------------------------------------
$subject = SITE_NAME . ' — New enquiry from ' . $name;

$body  = "You have a new enquiry from the Innovexa Technologies website.\n\n";
$body .= "Name:    {$name}\n";
$body .= "Email:   {$email}\n";
$body .= "Phone:   " . ($phone !== '' ? $phone : 'Not provided') . "\n";
$body .= "Service: {$service}\n\n";
$body .= "Message:\n{$message}\n";

$headers   = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-type: text/plain; charset=UTF-8';
$headers[] = 'From: ' . SITE_NAME . ' Website <no-reply@innovexa.tech>';
$headers[] = 'Reply-To: ' . $email;

// ---- Send ------------------------------------------------------------
$sent = @mail(RECIPIENT_EMAIL, $subject, $body, implode("\r\n", $headers));

if ($sent) {
    echo json_encode([
        'success' => true,
        'message' => 'Thanks! Your message has been sent — we will be in touch shortly.'
    ]);
} else {
    // mail() often fails on local/dev servers without an MTA configured.
    fail('We could not send your message right now. Please email us directly at ' . RECIPIENT_EMAIL . '.', 500);
}
