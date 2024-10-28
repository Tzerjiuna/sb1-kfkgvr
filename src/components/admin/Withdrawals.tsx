import React, { useState, useEffect } from 'react';
import { Send, ExternalLink, RefreshCw } from 'lucide-react';
import { NetworkType } from '../../types';

interface Withdrawal {
  id: string;
  user_address: string;
  amount: string;
  network: NetworkType;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  hash?: string;
  created_at: string;
}

const Withdrawals: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const response = await fetch('https://moda.boutique/check/withdraw.php');
      if (!response.ok) throw new Error('Failed to fetch withdrawals');
      const data = await response.json();
      setWithdrawals(data);
    } catch (err) {
      setError('Failed to load withdrawals');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (id: string) => {
    try {
      setProcessing(id);
      const response = await fetch('https://moda.boutique/check/process_withdraw.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (!response.ok) throw new Error('Failed to process withdrawal');
      await fetchWithdrawals();
    } catch (err) {
      setError('Failed to process withdrawal');
    } finally {
      setProcessing(null);
    }
  };

  const getExplorerUrl = (hash: string, network: NetworkType) => {
    return network === 'ERC20'
      ? `https://etherscan.io/tx/${hash}`
      : `https://tronscan.org/#/transaction/${hash}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      case 'processing':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Withdrawals</h1>
        <button
          onClick={fetchWithdrawals}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700">
              <th className="px-6 py-3 text-left">Address</th>
              <th className="px-6 py-3 text-left">Amount</th>
              <th className="px-6 py-3 text-left">Network</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Hash</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((withdrawal) => (
              <tr key={withdrawal.id} className="border-t border-gray-700">
                <td className="px-6 py-4 font-mono">
                  {withdrawal.user_address.slice(0, 8)}...{withdrawal.user_address.slice(-6)}
                </td>
                <td className="px-6 py-4">{withdrawal.amount} USDT</td>
                <td className="px-6 py-4">{withdrawal.network}</td>
                <td className="px-6 py-4">
                  <span className={`capitalize ${getStatusColor(withdrawal.status)}`}>
                    {withdrawal.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {withdrawal.hash ? (
                    <div className="flex items-center gap-2">
                      <span className="font-mono">
                        {withdrawal.hash.slice(0, 8)}...{withdrawal.hash.slice(-6)}
                      </span>
                      <a
                        href={getExplorerUrl(withdrawal.hash, withdrawal.network)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-6 py-4">
                  {new Date(withdrawal.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right">
                  {withdrawal.status === 'pending' && (
                    <button
                      onClick={() => handleWithdraw(withdrawal.id)}
                      disabled={!!processing}
                      className={`text-blue-400 hover:text-blue-300 ${
                        processing === withdrawal.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Withdrawals;