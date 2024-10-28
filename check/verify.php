<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['network']) || !isset($data['hash']) || !isset($data['address'])) {
        throw new Exception('Missing required fields');
    }

    // Get default agent
    $stmt = $pdo->query("SELECT id FROM agents WHERE code = 'DEFAULT' LIMIT 1");
    $agent = $stmt->fetch();
    $agent_id = $agent['id'];

    // Verify address belongs to agent
    $stmt = $pdo->prepare("
        SELECT COUNT(*) FROM addresses 
        WHERE agent_id = ? AND address = ? AND network = ? AND is_active = TRUE
    ");
    $stmt->execute([$agent_id, $data['address'], $data['network']]);
    
    if (!$stmt->fetchColumn()) {
        throw new Exception('Invalid receiving address');
    }

    // Check if transaction already exists
    $stmt = $pdo->prepare("
        SELECT COUNT(*) FROM transactions 
        WHERE hash = ?
    ");
    $stmt->execute([$data['hash']]);
    
    if ($stmt->fetchColumn() > 0) {
        throw new Exception('Transaction already processed');
    }

    // Verify transaction on blockchain
    $isValid = false;
    if ($data['network'] === 'ERC20') {
        // Get Infura API key
        $stmt = $pdo->prepare("
            SELECT value FROM agent_settings 
            WHERE agent_id = ? AND name = 'infura_api_key'
        ");
        $stmt->execute([$agent_id]);
        $infura_api_key = $stmt->fetchColumn();

        $infura_url = "https://mainnet.infura.io/v3/{$infura_api_key}";
        $eth_data = [
            "jsonrpc" => "2.0",
            "method" => "eth_getTransactionReceipt",
            "params" => [$data['hash']],
            "id" => 1
        ];

        $ch = curl_init($infura_url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($eth_data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);

        $result = json_decode($response, true);
        $isValid = isset($result['result']['status']) && $result['result']['status'] === '0x1';
    } else {
        // Verify TRC20 transaction
        $tron_url = "https://api.trongrid.io/v1/transactions/{$data['hash']}/info";
        
        $ch = curl_init($tron_url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);

        $result = json_decode($response, true);
        $isValid = isset($result['confirmed']) && $result['confirmed'] && 
                  isset($result['contractRet']) && $result['contractRet'] === 'SUCCESS';
    }

    echo json_encode(['success' => $isValid]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}