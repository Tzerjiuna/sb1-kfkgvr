<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config.php';

try {
    $agent_id = $_GET['agent_id'] ?? null;
    $period = $_GET['period'] ?? 'today'; // today, week, month, all

    $where_clause = '';
    $params = [];

    if ($agent_id) {
        $where_clause = 'WHERE agent_id = ?';
        $params[] = $agent_id;
    }

    switch ($period) {
        case 'today':
            $where_clause .= ($where_clause ? ' AND' : 'WHERE') . ' DATE(created_at) = CURDATE()';
            break;
        case 'week':
            $where_clause .= ($where_clause ? ' AND' : 'WHERE') . ' created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
            break;
        case 'month':
            $where_clause .= ($where_clause ? ' AND' : 'WHERE') . ' created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
            break;
    }

    // 获取交易统计
    $stmt = $pdo->prepare("
        SELECT 
            COUNT(*) as total_count,
            SUM(amount) as total_amount,
            network,
            status,
            DATE(created_at) as date
        FROM transactions
        $where_clause
        GROUP BY network, status, DATE(created_at)
        ORDER BY date DESC
    ");
    $stmt->execute($params);
    $transactions = $stmt->fetchAll();

    // 获取提现统计
    $stmt = $pdo->prepare("
        SELECT 
            COUNT(*) as total_count,
            SUM(amount) as total_amount,
            network,
            status,
            DATE(created_at) as date
        FROM withdrawals
        $where_clause
        GROUP BY network, status, DATE(created_at)
        ORDER BY date DESC
    ");
    $stmt->execute($params);
    $withdrawals = $stmt->fetchAll();

    echo json_encode([
        'transactions' => $transactions,
        'withdrawals' => $withdrawals
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}