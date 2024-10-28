-- 创建数据库
CREATE DATABASE IF NOT EXISTS payment_gateway DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE payment_gateway;

-- 代理商表
CREATE TABLE IF NOT EXISTS agents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 代理商配置表
CREATE TABLE IF NOT EXISTS agent_settings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    agent_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    value TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_agent_setting (agent_id, name),
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 地址池表
CREATE TABLE IF NOT EXISTS addresses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    agent_id BIGINT NOT NULL,
    address VARCHAR(255) NOT NULL,
    private_key VARCHAR(255) NOT NULL,
    network ENUM('TRC20', 'ERC20') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_address (address),
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 交易记录表
CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    agent_id BIGINT NOT NULL,
    hash VARCHAR(255) NOT NULL,
    amount DECIMAL(20,6) NOT NULL,
    network ENUM('TRC20', 'ERC20') NOT NULL,
    platform_account VARCHAR(255) NOT NULL,
    payer_account VARCHAR(255) NOT NULL,
    receiving_address VARCHAR(255) NOT NULL,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_hash (hash),
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
    INDEX idx_agent_status (agent_id, status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 提现请求表
CREATE TABLE IF NOT EXISTS withdrawals (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    agent_id BIGINT NOT NULL,
    user_address VARCHAR(255) NOT NULL,
    amount DECIMAL(20,6) NOT NULL,
    network ENUM('TRC20', 'ERC20') NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    hash VARCHAR(255) NULL,
    error TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
    INDEX idx_agent_status (agent_id, status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 管理员日志表
CREATE TABLE IF NOT EXISTS admin_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    agent_id BIGINT NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
    INDEX idx_agent_action (agent_id, action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 代理商统计表
CREATE TABLE IF NOT EXISTS agent_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    agent_id BIGINT NOT NULL,
    total_transactions INT DEFAULT 0,
    total_amount DECIMAL(20,6) DEFAULT 0,
    total_withdrawals INT DEFAULT 0,
    withdrawal_amount DECIMAL(20,6) DEFAULT 0,
    last_transaction_at TIMESTAMP NULL,
    last_withdrawal_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
    UNIQUE KEY unique_agent_stats (agent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 初始化默认代理商
INSERT INTO agents (name, code, username, password) VALUES 
('Default Agent', 'DEFAULT', 'goukun', '$2y$10$YourHashedPasswordHere');

-- 初始化代理商设置
INSERT INTO agent_settings (agent_id, name, value) 
SELECT 
    (SELECT id FROM agents WHERE code = 'DEFAULT'),
    name,
    value
FROM (
    SELECT 'telegram_bot_token' as name, '' as value
    UNION SELECT 'telegram_chat_id', ''
    UNION SELECT 'infura_api_key', 'ed20ce37eca04afe85d62bd1e3c54b6d'
    UNION SELECT 'encryption_key', 'oneboat'
    UNION SELECT 'api_domain', 'https://moapay.moda.boutique'
    UNION SELECT 'trc20_private_key', ''
    UNION SELECT 'erc20_private_key', ''
    UNION SELECT 'trc20_from_address', ''
    UNION SELECT 'erc20_from_address', ''
    UNION SELECT 'telegram_channel', '@oneboat'
    UNION SELECT 'telegram_slogan', '同舟没品，残次出品'
) as settings;

-- 插入示例地址
INSERT INTO addresses (agent_id, address, private_key, network) VALUES
((SELECT id FROM agents WHERE code = 'DEFAULT'), 'TYour_TRC20_Address1', 'Your_Private_Key1', 'TRC20'),
((SELECT id FROM agents WHERE code = 'DEFAULT'), 'TYour_TRC20_Address2', 'Your_Private_Key2', 'TRC20'),
((SELECT id FROM agents WHERE code = 'DEFAULT'), '0xYour_ERC20_Address1', 'Your_Private_Key3', 'ERC20'),
((SELECT id FROM agents WHERE code = 'DEFAULT'), '0xYour_ERC20_Address2', 'Your_Private_Key4', 'ERC20');

-- 插入示例交易记录
INSERT INTO transactions (agent_id, hash, amount, network, platform_account, payer_account, receiving_address, status) VALUES
((SELECT id FROM agents WHERE code = 'DEFAULT'), 'TxHash1', 100.00, 'TRC20', 'Platform1', 'Payer1', 'TYour_TRC20_Address1', 'completed'),
((SELECT id FROM agents WHERE code = 'DEFAULT'), 'TxHash2', 200.00, 'ERC20', 'Platform2', 'Payer2', '0xYour_ERC20_Address1', 'completed');

-- 插入示例提现记录
INSERT INTO withdrawals (agent_id, user_address, amount, network, status) VALUES
((SELECT id FROM agents WHERE code = 'DEFAULT'), 'TUser_Address1', 50.00, 'TRC20', 'completed'),
((SELECT id FROM agents WHERE code = 'DEFAULT'), '0xUser_Address1', 75.00, 'ERC20', 'pending');

-- 创建代理商统计触发器
DELIMITER //

CREATE TRIGGER after_transaction_insert
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    INSERT INTO agent_stats (agent_id, total_transactions, total_amount, last_transaction_at)
    VALUES (NEW.agent_id, 1, NEW.amount, NOW())
    ON DUPLICATE KEY UPDATE
        total_transactions = total_transactions + 1,
        total_amount = total_amount + NEW.amount,
        last_transaction_at = NOW();
END //

CREATE TRIGGER after_withdrawal_insert
AFTER INSERT ON withdrawals
FOR EACH ROW
BEGIN
    INSERT INTO agent_stats (agent_id, total_withdrawals, withdrawal_amount, last_withdrawal_at)
    VALUES (NEW.agent_id, 1, NEW.amount, NOW())
    ON DUPLICATE KEY UPDATE
        total_withdrawals = total_withdrawals + 1,
        withdrawal_amount = withdrawal_amount + NEW.amount,
        last_withdrawal_at = NOW();
END //

DELIMITER ;

-- 更新初始统计数据
INSERT INTO agent_stats (
    agent_id,
    total_transactions,
    total_amount,
    total_withdrawals,
    withdrawal_amount,
    last_transaction_at,
    last_withdrawal_at
)
SELECT 
    a.id,
    COUNT(DISTINCT t.id) as total_transactions,
    COALESCE(SUM(t.amount), 0) as total_amount,
    COUNT(DISTINCT w.id) as total_withdrawals,
    COALESCE(SUM(w.amount), 0) as withdrawal_amount,
    MAX(t.created_at) as last_transaction_at,
    MAX(w.created_at) as last_withdrawal_at
FROM agents a
LEFT JOIN transactions t ON a.id = t.agent_id
LEFT JOIN withdrawals w ON a.id = w.agent_id
GROUP BY a.id;