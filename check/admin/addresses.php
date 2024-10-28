<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Fetch all addresses
        $stmt = $pdo->prepare("
            SELECT a.*, ag.name as agent_name 
            FROM addresses a
            JOIN agents ag ON a.agent_id = ag.id
            WHERE a.is_active = TRUE
            ORDER BY a.created_at DESC
        ");
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } 
    elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            throw new Exception('Missing address ID');
        }

        $stmt = $pdo->prepare("
            UPDATE addresses 
            SET is_active = FALSE 
            WHERE id = ?
        ");
        $stmt->execute([$id]);

        echo json_encode(['success' => true]);
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?>