import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AddressDisplayProps {
  address: string;
  isLoading: boolean;
}

const AddressDisplay: React.FC<AddressDisplayProps> = ({ address, isLoading }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <label className="block text-sm font-medium mb-2">
        {t('address')}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={isLoading ? t('loading') : address}
          readOnly
          className="flex-1 bg-gray-600 rounded px-3 py-2 text-sm"
        />
        <button
          onClick={handleCopy}
          disabled={isLoading}
          className={`p-2 rounded-lg transition-colors ${
            isLoading 
              ? 'bg-gray-600 cursor-not-allowed' 
              : copied 
                ? 'bg-green-500' 
                : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default AddressDisplay;