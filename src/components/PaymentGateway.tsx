import React, { useState } from 'react';
import { Wallet, Globe, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import NetworkSelector from './NetworkSelector';
import AddressDisplay from './AddressDisplay';
import QRCodeDisplay from './QRCodeDisplay';
import PaymentVerification from './PaymentVerification';
import { NetworkType } from '../types';
import { useAddresses } from '../hooks/useAddresses';
import ErrorBoundary from './ErrorBoundary';

const PaymentGateway: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [network, setNetwork] = useState<NetworkType>('TRC20');
  const [showLanguages, setShowLanguages] = useState(false);

  const {
    currentAddress,
    isLoading,
    error,
    retryFetch,
    getAddressForNetwork
  } = useAddresses(network);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文' }
  ];

  const handleNetworkChange = (newNetwork: NetworkType) => {
    setNetwork(newNetwork);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Wallet className="w-8 h-8 text-blue-400" />
              {t('title')}
            </h1>
            <div className="relative">
              <button
                onClick={() => setShowLanguages(!showLanguages)}
                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                <Globe className="w-5 h-5" />
              </button>
              {showLanguages && (
                <div className="absolute right-0 mt-2 py-2 w-48 bg-gray-700 rounded-lg shadow-xl z-10">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        i18n.changeLanguage(lang.code);
                        setShowLanguages(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-600 transition-colors ${
                        i18n.language === lang.code ? 'bg-gray-600' : ''
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error ? (
            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
                {error}
              </div>
              <button
                onClick={retryFetch}
                className="w-full py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {t('retry')}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <NetworkSelector 
                selectedNetwork={network} 
                onNetworkChange={handleNetworkChange} 
              />

              <AddressDisplay 
                address={currentAddress} 
                isLoading={isLoading} 
              />

              {!isLoading && currentAddress && (
                <>
                  <QRCodeDisplay address={currentAddress} />
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">{t('submitPayment')}</h2>
                    <PaymentVerification 
                      network={network}
                      receivingAddress={currentAddress}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default PaymentGateway;