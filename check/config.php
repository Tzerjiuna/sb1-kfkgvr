<?php
// Database configuration
$config = [
    'db_host' => 'localhost',
    'db_name' => 'payment_gateway',
    'db_user' => 'root',
    'db_pass' => '',
    
    // JWT configuration
    'jwt_secret' => 'oneboat',
    'jwt_expiration' => 604800, // 7 days
    
    // Admin credentials
    'admin_username' => 'goukun',
    'admin_password' => 'oneboat',
    
    // API configuration
    'api_domain' => 'https://moapay.moda.boutique',
    
    // Telegram configuration
    'telegram_bot_token' => '',
    'telegram_chat_id' => '',
    
    // Blockchain configuration
    'infura_api_key' => 'ed20ce37eca04afe85d62bd1e3c54b6d',
    
    // Encryption
    'encryption_key' => 'oneboat',
    
    // Wallet configuration
    'trc20_private_key' => '',
    'erc20_private_key' => '',
    'trc20_from_address' => '',
    'erc20_from_address' => ''
];

// Initialize database connection
try {
    $pdo = new PDO(
        "mysql:host={$config['db_host']};dbname={$config['db_name']};charset=utf8mb4",
        $config['db_user'],
        $config['db_pass'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    error_log("Database connection failed: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Helper functions remain the same...
?>