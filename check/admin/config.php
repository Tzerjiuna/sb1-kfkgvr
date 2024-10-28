<?php
// Database configuration
$config = [
    'db_host' => 'localhost',
    'db_name' => '43.247.134.122',
    'db_user' => '123',
    'db_pass' => '123',
    
    // JWT configuration
    'jwt_secret' => 'oneboat',
    'jwt_expiration' => 604800, // 7 days
    
    // Admin credentials
    'admin_username' => 'goukun',
    'admin_password' => 'oneboat',
    
    // API configuration
    'api_domain' => 'https://moda.boutique',
    
    // Telegram configuration
    'telegram_bot_token' => '',
    'telegram_chat_id' => '',
    
    // Blockchain configuration
    'infura_api_key' => 'ed20ce37eca04afe85d62bd1e3c54b6d',
];

// Initialize database connection
try {
    $pdo = new PDO(
        "mysql:host={$config['db_host']};dbname={$config['db_name']};charset=utf8mb4",
        $config['db_user'],
        $config['db_pass'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    error_log("Database connection failed: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}
?>