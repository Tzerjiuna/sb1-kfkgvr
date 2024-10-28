import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PaymentSubmissionFormProps {
  network: string;
}

const PaymentSubmissionForm: React.FC<PaymentSubmissionFormProps> = ({ network }) => {
  const { t } = useTranslation();
  const [hash, setHash] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ hash?: string; screenshot?: string }>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, screenshot: t('maxFileSize') }));
        return;
      }
      setFile(selectedFile);
      setErrors(prev => ({ ...prev, screenshot: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { hash?: string; screenshot?: string } = {};

    if (!hash.trim()) {
      newErrors.hash = t('hashRequired');
    }
    if (!file) {
      newErrors.screenshot = t('screenshotRequired');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('hash', hash);
      formData.append('screenshot', file);
      formData.append('network', network);

      const response = await fetch('https://moda.boutique/check/payment.php', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit payment details');
      }

      window.location.href = 'https://moda.boutique/';
    } catch (error) {
      console.error('Error submitting payment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('transactionHash')}
        </label>
        <input
          type="text"
          value={hash}
          onChange={(e) => {
            setHash(e.target.value);
            setErrors(prev => ({ ...prev, hash: undefined }));
          }}
          className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="0x..."
        />
        {errors.hash && (
          <p className="mt-1 text-sm text-red-500">{errors.hash}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t('uploadScreenshot')}
        </label>
        <div className="relative">
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            id="screenshot-upload"
          />
          <label
            htmlFor="screenshot-upload"
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              file ? 'border-green-500 bg-green-500/10' : 'border-gray-600 hover:border-gray-500 bg-gray-700'
            }`}
          >
            <Upload className="w-8 h-8 mb-2" />
            <span className="text-sm text-center">
              {file ? file.name : t('dragDrop')}
            </span>
          </label>
          {errors.screenshot && (
            <p className="mt-1 text-sm text-red-500">{errors.screenshot}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-3 rounded-lg font-medium transition-colors ${
          isSubmitting
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isSubmitting ? t('uploading') : t('submit')}
      </button>
    </form>
  );
};

export default PaymentSubmissionForm;