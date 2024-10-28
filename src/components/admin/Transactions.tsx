import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { NetworkType } from '../../types';

interface Transaction {
  id: string;
  hash: string;
  amount: string;
  network: NetworkType;
  platform_account: string;
  payer_account: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/admin/transactions');
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      setError('Failed to load transactions');
    } finally {
      setIsLoading(false);
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
      default:
        return 'text-yellow-400';
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
        <h1 className="text-2xl font-bold">Transactions</h1>
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
              <th className="px-6 py-3 text-left">Hash</th>
              <th className="px-6 py-3 text-left">Amount</th>
              <th className="px-6 py-3 text-left">Network</th>
              <th className="px-6 py-3 text-left">Platform Account</th>
              <th className="px-6 py-3 text-left">Payer Account</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-t border-gray-700">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}</span>
                    <a
                      href={getExplorerUrl(tx.hash, tx.network)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </td>
                <td className="px-6 py-4">{tx.amount} USDT</td>
                <td className="px-6 py-4">{tx.network}</td>
                <td className="px-6 py-4 font-mono">{tx.platform_account}</td>
                <td className="px-6 py-4 font-mono">{tx.payer_account}</td>
                <td className="px-6 py-4">
                  <span className={`capitalize ${getStatusColor(tx.status)}`}>
                    {tx.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {new Date(tx.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;