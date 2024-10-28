import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { verifyTransaction, submitPayment } from '../services/api';
import { NetworkType } from '../types';

interface PaymentVerificationProps {
  network: NetworkType;
  receivingAddress: string;
}

const COOLDOWN_PERIOD = 10000; // 10 seconds

const PaymentVerification: React.FC<PaymentVerificationProps> = ({ 
  network, 
  receivingAddress 
}) => {
  const { t } = useTranslation();
  const [hash, setHash] = useState('');
  const [platformAccount, setPlatformAccount] = useState('');
  const [payerAccount, setPayerAccount] = useState(''); // Added payer account
  const [amount, setAmount] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [lastVerification, setLastVerification] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(c => Math.max(0, c - 1000)), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerification = async () => {
    if (!hash || !platformAccount || !amount || !payerAccount) {
      setError(t('Please fill in all fields'));
      return;
    }

    const now = Date.now();
    if (now - lastVerification < COOLDOWN_PERIOD) {
      return;
    }

    setIsVerifying(true);
    setError('');
    setLastVerification(now);
    setCooldown(COOLDOWN_PERIOD);

    try {
      const orderNumber = Date.now().toString();
      const payment = {
        amount,
        platform_account: platformAccount,
        payer_account: payerAccount, // Added payer account
        hash,
        order_number: orderNumber,
        timestamp: Date.now()
      };

      await submitPayment(payment);
      window.location.href = 'https://moda.boutique/';
    } catch (err) {
      setError(t('verificationFailed'));
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">{t('amount')}</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-gray-700 rounded-lg px-4 py-2"
          placeholder="0.00"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">{t('platformAccount')}</label>
        <input
          type="text"
          value={platformAccount}
          onChange={(e) => setPlatformAccount(e.target.value)}
          className="w-full bg-gray-700 rounded-lg px-4 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">{t('payerAccount')}</label>
        <input
          type="text"
          value={payerAccount}
          onChange={(e) => setPayerAccount(e.target.value)}
          className="w-full bg-gray-700 rounded-lg px-4 py-2"
          placeholder={network === 'ERC20' ? '0x...' : 'T...'}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">{t('transactionHash')}</label>
        <input
          type="text"
          value={hash}
          onChange={(e) => setHash(e.target.value)}
          className="w-full bg-gray-700 rounded-lg px-4 py-2"
          placeholder={network === 'ERC20' ? '0x...' : ''}
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <button
        onClick={handleVerification}
        disabled={isVerifying || cooldown > 0}
        className={`w-full py-3 rounded-lg font-medium transition-colors ${
          isVerifying || cooldown > 0
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isVerifying 
          ? t('verifying')
          : cooldown > 0 
            ? `${Math.ceil(cooldown / 1000)}s`
            : t('verifyPayment')}
      </button>
    </div>
  );
};

export default PaymentVerification;