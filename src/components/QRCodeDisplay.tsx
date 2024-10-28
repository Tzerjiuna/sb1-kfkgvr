import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';

interface QRCodeDisplayProps {
  address: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ address }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center space-y-4">
      <p className="text-sm text-gray-400">{t('scanToPay')}</p>
      <div className="bg-white p-4 rounded-lg">
        <QRCodeSVG value={address} size={200} />
      </div>
    </div>
  );
};

export default QRCodeDisplay;