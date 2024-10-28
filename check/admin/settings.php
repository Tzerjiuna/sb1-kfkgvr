<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config.php';
require_once 'auth.php';

// Verify JWT token
$token = getBearerToken();
if (!$token || !verifyToken($token)) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Return current settings
    $settings = [
        'telegramBotToken' => $config['telegram_bot_token'],
        'telegramChatId' => $config['telegram_chat_id'],
        'infuraApiKey' => $config['infura_api_key'],
        'encryptionKey' => $config['encryption_key'],
        'apiDomain' => $config['api_domain']
    ];
    
    echo json_encode($settings);
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Update settings in database
    try {
        $stmt = $pdo->prepare("
            UPDATE settings 
            SET value = :value 
            WHERE name = :name
        ");
        
        foreach ($data as $key => $value) {
            $stmt->execute([
                'name' => $key,
                'value' => $value
            ]);
        }
        
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update settings']);
    }
}
?>