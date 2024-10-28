import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          // Admin translations
          adminDashboard: 'Admin Dashboard',
          addresses: 'Addresses',
          transactions: 'Transactions',
          withdrawals: 'Withdrawals',
          settings: 'Settings',
          logout: 'Logout',
          
          // Addresses page
          paymentAddresses: 'Payment Addresses',
          generateAddresses: 'Generate Addresses',
          network: 'Network',
          numberOfAddresses: 'Number of Addresses',
          cancel: 'Cancel',
          generate: 'Generate',
          generating: 'Generating...',
          address: 'Address',
          privateKey: 'Private Key',
          actions: 'Actions',
          
          // Transactions page
          hash: 'Hash',
          amount: 'Amount',
          platformAccount: 'Platform Account',
          payerAccount: 'Payer Account',
          status: 'Status',
          date: 'Date',
          refresh: 'Refresh',
          
          // Withdrawals page
          process: 'Process',
          processWithdrawal: 'Processing...',
          
          // Settings page
          saveChanges: 'Save Changes',
          saving: 'Saving...',
          telegramBotToken: 'Telegram Bot Token',
          telegramChatId: 'Telegram Chat ID',
          infuraApiKey: 'Infura API Key',
          encryptionKey: 'Encryption Key',
          apiDomain: 'API Domain',
          
          // Status
          statusPending: 'Pending',
          statusCompleted: 'Completed',
          statusFailed: 'Failed',
          statusProcessing: 'Processing'
        }
      },
      zh: {
        translation: {
          // Admin translations
          adminDashboard: '管理后台',
          addresses: '收款地址',
          transactions: '交易记录',
          withdrawals: '提现管理',
          settings: '系统设置',
          logout: '退出登录',
          
          // Addresses page
          paymentAddresses: '收款地址管理',
          generateAddresses: '生成地址',
          network: '网络',
          numberOfAddresses: '地址数量',
          cancel: '取消',
          generate: '生成',
          generating: '生成中...',
          address: '地址',
          privateKey: '私钥',
          actions: '操作',
          
          // Transactions page
          hash: '交易哈希',
          amount: '金额',
          platformAccount: '平台账号',
          payerAccount: '付款账号',
          status: '状态',
          date: '日期',
          refresh: '刷新',
          
          // Withdrawals page
          process: '处理',
          processWithdrawal: '处理中...',
          
          // Settings page
          saveChanges: '保存更改',
          saving: '保存中...',
          telegramBotToken: 'Telegram 机器人令牌',
          telegramChatId: 'Telegram 聊天ID',
          infuraApiKey: 'Infura API密钥',
          encryptionKey: '加密密钥',
          apiDomain: 'API域名',
          
          // Status
          statusPending: '待处理',
          statusCompleted: '已完成',
          statusFailed: '失败',
          statusProcessing: '处理中'
        }
      }
    },
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;