<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

function decrypt($encryptedData, $key = 'oneboat') {
    try {
        $json = base64_decode($encryptedData);
        $data = openssl_decrypt($json, 'AES-256-CBC', $key);
        return json_decode($data, true);
    } catch (Exception $e) {
        return null;
    }
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!isset($data['data'])) {
        throw new Exception('Missing encrypted data');
    }

    $decrypted = decrypt($data['data']);
    if (!$decrypted) {
        throw new Exception('Invalid encrypted data');
    }

    // Validate required fields
    $required = ['amount', 'platform_account', 'hash', 'order_number', 'timestamp'];
    foreach ($required as $field) {
        if (!isset($decrypted[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }

    // Get default agent
    $stmt = $pdo->query("SELECT id FROM agents WHERE code = 'DEFAULT' LIMIT 1");
    $agent = $stmt->fetch();
    $agent_id = $agent['id'];

    // Start transaction
    $pdo->beginTransaction();

    try {
        // Insert transaction record
        $stmt = $pdo->prepare("
            INSERT INTO transactions (
                agent_id,
                hash,
                amount,
                network,
                platform_account,
                payer_account,
                receiving_address,
                status,
                created_at
            ) VALUES (
                :agent_id,
                :hash,
                :amount,
                :network,
                :platform_account,
                :payer_account,
                :receiving_address,
                'completed',
                NOW()
            )
        ");

        $stmt->execute([
            'agent_id' => $agent_id,
            'hash' => $decrypted['hash'],
            'amount' => $decrypted['amount'],
            'network' => $decrypted['network'],
            'platform_account' => $decrypted['platform_account'],
            'payer_account' => $decrypted['payer_account'],
            'receiving_address' => $decrypted['receiving_address']
        ]);

        // Send Telegram notification if configured
        $settings = [];
        $stmt = $pdo->prepare("
            SELECT name, value FROM agent_settings 
            WHERE agent_id = ? AND name IN ('telegram_bot_token', 'telegram_chat_id')
        ");
        $stmt->execute([$agent_id]);
        while ($row = $stmt->fetch()) {
            $settings[$row['name']] = $row['value'];
        }

        if (!empty($settings['telegram_bot_token']) && !empty($settings['telegram_chat_id'])) {
            $message = "💰 New Payment Received\n\n";
            $message .= "Amount: {$decrypted['amount']} USDT\n";
            $message .= "Network: {$decrypted['network']}\n";
            $message .= "Account: {$decrypted['platform_account']}\n";
            $message .= "Hash: {$decrypted['hash']}\n";
            $message .= "Time: " . date('Y-m-d H:i:s');

            $telegram_url = "https://api.telegram.org/bot{$settings['telegram_bot_token']}/sendMessage";
            $telegram_data = [
                'chat_id' => $settings['telegram_chat_id'],
                'text' => $message,
                'parse_mode' => 'HTML'
            ];

            $ch = curl_init($telegram_url);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $telegram_data);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_exec($ch);
            curl_close($ch);
        }

        $pdo->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Payment processed successfully',
            'data' => [
                'order_number' => $decrypted['order_number'],
                'amount' => $decrypted['amount'],
                'timestamp' => date('Y-m-d H:i:s')
            ]
        ]);

    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}