<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['wallets']) || !isset($data['network'])) {
        throw new Exception('Missing required fields');
    }

    // 获取默认代理商ID
    $stmt = $pdo->query("SELECT id FROM agents WHERE code = 'DEFAULT' LIMIT 1");
    $agent = $stmt->fetch();
    $agent_id = $agent['id'];

    $pdo->beginTransaction();

    $stmt = $pdo->prepare("
        INSERT INTO addresses (
            agent_id,
            address,
            private_key,
            network,
            created_at
        ) VALUES (
            :agent_id,
            :address,
            :private_key,
            :network,
            NOW()
        )
    ");

    foreach ($data['wallets'] as $wallet) {
        $stmt->execute([
            'agent_id' => $agent_id,
            'address' => $wallet['address'],
            'private_key' => $wallet['privateKey'],
            'network' => $data['network']
        ]);
    }

    // 记录管理员日志
    $stmt = $pdo->prepare("
        INSERT INTO admin_logs (agent_id, action, details, ip_address)
        VALUES (:agent_id, 'bulk_add_addresses', :details, :ip)
    ");
    $stmt->execute([
        'agent_id' => $agent_id,
        'details' => json_encode([
            'network' => $data['network'],
            'count' => count($data['wallets'])
        ]),
        'ip' => $_SERVER['REMOTE_ADDR']
    ]);

    $pdo->commit();
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?>