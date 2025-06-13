<?php
header('Content-Type: application/json');

// Database credentials
$host = 'localhost';
$db = 'property';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

// Connect to database using PDO
try {
    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'error' => 'Database connection failed.']);
    exit;
}

// Get POST data safely
$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$message = trim($_POST['message'] ?? '');

// Basic validation
if ($name === '' || $email === '' || $message === '') {
    echo json_encode(['status' => 'error', 'error' => 'Please fill all required fields.']);
    exit;
}

// Save to DB
try {
    $stmt = $pdo->prepare("INSERT INTO inquiries (name, email, phone, message) VALUES (?, ?, ?, ?)");
    $stmt->execute([$name, $email, $phone, $message]);

    echo json_encode(['status' => 'success', 'id' => $pdo->lastInsertId()]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'error' => 'Failed to save inquiry.']);
}
?>
