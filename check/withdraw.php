<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // 获取默认代理商ID
        $stmt = $pdo->query("SELECT id FROM agents WHERE code = 'DEFAULT' LIMIT 1");
        $agent = $stmt->fetch();
        $agent_id = $agent['id'];

        // 获取提现列表
        $stmt = $pdo->prepare("
            SELECT w.*, a.name as agent_name 
            FROM withdrawals w
            JOIN agents a ON w.agent_id = a.id
            WHERE w.agent_id = ?
            ORDER BY w.created_at DESC
        ");
        $stmt->execute([$agent_id]);
        echo json_encode($stmt->fetchAll());
    } else {
        // 处理新的提现请求
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['user_address']) || !isset($data['amount']) || !isset($data['network'])) {
            throw new Exception('Missing required fields');
        }

        // 获取默认代理商ID
        $stmt = $pdo->query("SELECT id FROM agents WHERE code = 'DEFAULT' LIMIT 1");
        $agent = $stmt->fetch();
        $agent_id = $agent['id'];

        $stmt = $pdo->prepare("
            INSERT INTO withdrawals (
                agent_id,
                user_address, 
                amount, 
                network, 
                status, 
                created_at
            ) VALUES (
                :agent_id,
                :user_address,
                :amount,
                :network,
                'pending',
                NOW()
            )
        ");

        $stmt->execute([
            'agent_id' => $agent_id,
            'user_address' => $data['user_address'],
            'amount' => $data['amount'],
            'network' => $data['network']
        ]);

        // 记录管理员日志
        $stmt = $pdo->prepare("
            INSERT INTO admin_logs (agent_id, action, details, ip_address)
            VALUES (:agent_id, 'new_withdrawal', :details, :ip)
        ");
        $stmt->execute([
            'agent_id' => $agent_id,
            'details' => json_encode($data),
            'ip' => $_SERVER['REMOTE_ADDR']
        ]);

        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?>