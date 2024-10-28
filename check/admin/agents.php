<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config.php';

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // 获取代理商列表
            $stmt = $pdo->prepare("
                SELECT a.*, 
                       s.total_transactions,
                       s.total_amount,
                       s.total_withdrawals,
                       s.withdrawal_amount,
                       s.last_transaction_at,
                       s.last_withdrawal_at
                FROM agents a
                LEFT JOIN agent_stats s ON a.id = s.agent_id
                ORDER BY a.created_at DESC
            ");
            $stmt->execute();
            $agents = $stmt->fetchAll();

            // 获取每个代理商的设置
            foreach ($agents as &$agent) {
                $stmt = $pdo->prepare("
                    SELECT name, value 
                    FROM agent_settings 
                    WHERE agent_id = ?
                ");
                $stmt->execute([$agent['id']]);
                $agent['settings'] = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
            }

            echo json_encode($agents);
            break;

        case 'POST':
            // 创建新代理商
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['name']) || !isset($data['code']) || 
                !isset($data['username']) || !isset($data['password'])) {
                throw new Exception('Missing required fields');
            }

            $pdo->beginTransaction();

            try {
                // 插入代理商
                $stmt = $pdo->prepare("
                    INSERT INTO agents (name, code, username, password)
                    VALUES (?, ?, ?, ?)
                ");
                $stmt->execute([
                    $data['name'],
                    $data['code'],
                    $data['username'],
                    password_hash($data['password'], PASSWORD_DEFAULT)
                ]);

                $agent_id = $pdo->lastInsertId();

                // 插入默认设置
                $stmt = $pdo->prepare("
                    INSERT INTO agent_settings (agent_id, name, value)
                    VALUES (?, ?, ?)
                ");

                $default_settings = [
                    'telegram_bot_token' => '',
                    'telegram_chat_id' => '',
                    'telegram_channel' => '',
                    'telegram_slogan' => '',
                    'infura_api_key' => '',
                    'encryption_key' => '',
                    'trc20_private_key' => '',
                    'erc20_private_key' => '',
                    'trc20_from_address' => '',
                    'erc20_from_address' => ''
                ];

                foreach ($default_settings as $name => $value) {
                    $stmt->execute([$agent_id, $name, $value]);
                }

                $pdo->commit();
                echo json_encode(['success' => true, 'id' => $agent_id]);
            } catch (Exception $e) {
                $pdo->rollBack();
                throw $e;
            }
            break;

        case 'PUT':
            // 更新代理商
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id'])) {
                throw new Exception('Missing agent ID');
            }

            $pdo->beginTransaction();

            try {
                // 更新代理商基本信息
                $updates = [];
                $params = [];

                if (isset($data['name'])) {
                    $updates[] = 'name = ?';
                    $params[] = $data['name'];
                }
                if (isset($data['status'])) {
                    $updates[] = 'status = ?';
                    $params[] = $data['status'];
                }
                if (isset($data['password'])) {
                    $updates[] = 'password = ?';
                    $params[] = password_hash($data['password'], PASSWORD_DEFAULT);
                }

                if (!empty($updates)) {
                    $params[] = $data['id'];
                    $stmt = $pdo->prepare("
                        UPDATE agents 
                        SET " . implode(', ', $updates) . "
                        WHERE id = ?
                    ");
                    $stmt->execute($params);
                }

                // 更新代理商设置
                if (isset($data['settings']) && is_array($data['settings'])) {
                    $stmt = $pdo->prepare("
                        INSERT INTO agent_settings (agent_id, name, value)
                        VALUES (?, ?, ?)
                        ON DUPLICATE KEY UPDATE value = VALUES(value)
                    ");

                    foreach ($data['settings'] as $name => $value) {
                        $stmt->execute([$data['id'], $name, $value]);
                    }
                }

                $pdo->commit();
                echo json_encode(['success' => true]);
            } catch (Exception $e) {
                $pdo->rollBack();
                throw $e;
            }
            break;

        case 'DELETE':
            // 删除代理商
            $id = $_GET['id'] ?? null;
            if (!$id) {
                throw new Exception('Missing agent ID');
            }

            $stmt = $pdo->prepare("DELETE FROM agents WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode(['success' => true]);
            break;
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}