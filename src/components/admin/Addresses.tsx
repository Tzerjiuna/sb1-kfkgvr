import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Save, Loader } from 'lucide-react';
import { NetworkType } from '../../types';
import { generateWallets } from '../../utils/walletGenerator';

interface Address {
  id: string;
  address: string;
  network: NetworkType;
  private_key: string;
}

const Addresses: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddress, setNewAddress] = useState({ address: '', network: 'TRC20' as NetworkType });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationCount, setGenerationCount] = useState(5);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await fetch('https://moda.boutique/check/admin/addresses.php');
      if (!response.ok) throw new Error('Failed to fetch addresses');
      const data = await response.json();
      setAddresses(data);
    } catch (err) {
      setError('Failed to load addresses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateWallets = async () => {
    try {
      setIsGenerating(true);
      const network = newAddress.network;
      const wallets = await generateWallets(network, generationCount);
      
      // Save generated wallets
      const response = await fetch('https://moda.boutique/check/admin/bulk_add_addresses.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallets, network })
      });

      if (!response.ok) throw new Error('Failed to save addresses');
      
      await fetchAddresses();
      setGenerationCount(5);
    } catch (err) {
      setError('Failed to generate addresses');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const response = await fetch(`https://moda.boutique/check/admin/addresses.php?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete address');
      
      await fetchAddresses();
    } catch (err) {
      setError('Failed to delete address');
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
        <h1 className="text-2xl font-bold">Payment Addresses</h1>
        <button
          onClick={() => document.getElementById('generateAddressForm')?.classList.remove('hidden')}
          className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Generate Addresses
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div id="generateAddressForm" className="hidden bg-gray-800 p-6 rounded-lg space-y-4">
        <h2 className="text-lg font-semibold">Generate Multiple Addresses</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Network</label>
            <select
              value={newAddress.network}
              onChange={(e) => setNewAddress({ ...newAddress, network: e.target.value as NetworkType })}
              className="w-full bg-gray-700 rounded-lg px-4 py-2"
            >
              <option value="TRC20">TRC20</option>
              <option value="ERC20">ERC20</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Number of Addresses</label>
            <input
              type="number"
              min="1"
              max="50"
              value={generationCount}
              onChange={(e) => setGenerationCount(parseInt(e.target.value))}
              className="w-full bg-gray-700 rounded-lg px-4 py-2"
            />
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => document.getElementById('generateAddressForm')?.classList.add('hidden')}
            className="px-4 py-2 rounded-lg border border-gray-600 hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerateWallets}
            disabled={isGenerating}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Generate
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700">
              <th className="px-6 py-3 text-left">Address</th>
              <th className="px-6 py-3 text-left">Network</th>
              <th className="px-6 py-3 text-left">Private Key</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {addresses.map((address) => (
              <tr key={address.id} className="border-t border-gray-700">
                <td className="px-6 py-4 font-mono">{address.address}</td>
                <td className="px-6 py-4">{address.network}</td>
                <td className="px-6 py-4 font-mono">
                  <span className="text-gray-400">
                    {address.private_key.slice(0, 6)}...{address.private_key.slice(-4)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDeleteAddress(address.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Addresses;