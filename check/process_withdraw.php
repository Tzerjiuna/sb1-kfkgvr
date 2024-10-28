<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id'])) {
        throw new Exception('Missing withdrawal ID');
    }

    // 获取默认代理商ID
    $stmt = $pdo->query("SELECT id FROM agents WHERE code = 'DEFAULT' LIMIT 1");
    $agent = $stmt->fetch();
    $agent_id = $agent['id'];

    // 获取代理商设置
    $stmt = $pdo->prepare("
        SELECT name, value FROM agent_settings 
        WHERE agent_id = ? AND name IN (
            'trc20_private_key', 'erc20_private_key',
            'trc20_from_address', 'erc20_from_address'
        )
    ");
    $stmt->execute([$agent_id]);
    $settings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

    // 获取提现详情
    $stmt = $pdo->prepare("
        SELECT * FROM withdrawals 
        WHERE id = ? AND agent_id = ? AND status = 'pending'
    ");
    $stmt->execute([$data['id'], $agent_id]);
    $withdrawal = $stmt->fetch();

    if (!$withdrawal) {
        throw new Exception('Invalid withdrawal or already processed');
    }

    // 更新状态为处理中
    $stmt = $pdo->prepare("
        UPDATE withdrawals 
        SET status = 'processing' 
        WHERE id = ? AND agent_id = ?
    ");
    $stmt->execute([$data['id'], $agent_id]);

    // 根据网络处理转账
    $privateKey = $withdrawal['network'] === 'TRC20' 
        ? $settings['trc20_private_key']
        : $settings['erc20_private_key'];

    $fromAddress = $withdrawal['network'] === 'TRC20'
        ? $settings['trc20_from_address']
        : $settings['erc20_from_address'];

    if (!$privateKey || !$fromAddress) {
        throw new Exception('Wallet configuration missing');
    }

    // 这里添加实际的转账逻辑
    $hash = ''; // 实际转账后获取的哈希值

    // 更新提现状态
    $stmt = $pdo->prepare("
        UPDATE withdrawals 
        SET status = 'completed',
            hash = ?,
            processed_at = NOW()
        WHERE id = ? AND agent_id = ?
    ");
    $stmt->execute([$hash, $data['id'], $agent_id]);

    // 记录管理员日志
    $stmt = $pdo->prepare("
        INSERT INTO admin_logs (agent_id, action, details, ip_address)
        VALUES (:agent_id, 'process_withdrawal', :details, :ip)
    ");
    $stmt->execute([
        'agent_id' => $agent_id,
        'details' => json_encode([
            'withdrawal_id' => $data['id'],
            'hash' => $hash
        ]),
        'ip' => $_SERVER['REMOTE_ADDR']
    ]);

    echo json_encode(['success' => true, 'hash' => $hash]);

} catch (Exception $e) {
    // 更新失败状态
    if (isset($data['id']) && isset($agent_id)) {
        $stmt = $pdo->prepare("
            UPDATE withdrawals 
            SET status = 'failed',
                error = ?
            WHERE id = ? AND agent_id = ?
        ");
        $stmt->execute([$e->getMessage(), $data['id'], $agent_id]);

        // 记录错误日志
        $stmt = $pdo->prepare("
            INSERT INTO admin_logs (agent_id, action, details, ip_address)
            VALUES (:agent_id, 'withdrawal_failed', :details, :ip)
        ");
        $stmt->execute([
            'agent_id' => $agent_id,
            'details' => json_encode([
                'withdrawal_id' => $data['id'],
                'error' => $e->getMessage()
            ]),
            'ip' => $_SERVER['REMOTE_ADDR']
        ]);
    }

    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?>