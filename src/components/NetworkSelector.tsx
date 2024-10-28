import React from 'react';
import { useTranslation } from 'react-i18next';

type NetworkType = 'TRC20' | 'ERC20';

interface NetworkSelectorProps {
  selectedNetwork: NetworkType;
  onNetworkChange: (network: NetworkType) => void;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({ 
  selectedNetwork, 
  onNetworkChange 
}) => {
  const { t } = useTranslation();

  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        {t('selectNetwork')}
      </label>
      <div className="grid grid-cols-2 gap-4">
        {(['TRC20', 'ERC20'] as NetworkType[]).map((net) => (
          <button
            key={net}
            onClick={() => onNetworkChange(net)}
            className={`p-3 rounded-lg text-center transition-all ${
              selectedNetwork === net
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {t(net.toLowerCase())}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NetworkSelector;