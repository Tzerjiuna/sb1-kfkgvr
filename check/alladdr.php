<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

try {
    // Get default agent
    $stmt = $pdo->query("SELECT id FROM agents WHERE code = 'DEFAULT' LIMIT 1");
    $agent = $stmt->fetch();
    $agent_id = $agent['id'];

    // Get active addresses
    $stmt = $pdo->prepare("
        SELECT address, network 
        FROM addresses 
        WHERE agent_id = ? AND is_active = TRUE
    ");
    $stmt->execute([$agent_id]);
    
    $addresses = [
        'TRC20' => [],
        'ERC20' => []
    ];

    while ($row = $stmt->fetch()) {
        $addresses[$row['network']][] = $row['address'];
    }

    echo json_encode($addresses);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}