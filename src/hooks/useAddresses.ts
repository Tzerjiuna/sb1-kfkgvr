import { useState, useEffect, useCallback } from 'react';
import { NetworkType } from '../types';
import { fetchAddresses, AddressPool } from '../services/api';
import toast from 'react-hot-toast';

interface UseAddressesResult {
  addresses: AddressPool | null;
  currentAddress: string;
  isLoading: boolean;
  error: string | null;
  retryFetch: () => void;
  getAddressForNetwork: (network: NetworkType) => string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

export const useAddresses = (network: NetworkType): UseAddressesResult => {
  const [addresses, setAddresses] = useState<AddressPool | null>(null);
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const getRandomAddress = useCallback((addressList: string[]): string => {
    if (!addressList?.length) return '';
    const randomIndex = Math.floor(Math.random() * addressList.length);
    return addressList[randomIndex];
  }, []);

  const getAddressForNetwork = useCallback((selectedNetwork: NetworkType): string => {
    if (!addresses) return '';
    const networkAddresses = addresses[selectedNetwork];
    return networkAddresses?.length ? getRandomAddress(networkAddresses) : '';
  }, [addresses, getRandomAddress]);

  const fetchAddressesWithRetry = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await fetchAddresses();
      
      if (!data || (!data.TRC20?.length && !data.ERC20?.length)) {
        throw new Error('No payment addresses available');
      }
      
      setAddresses(data);
      const newAddress = getRandomAddress(data[network]);
      setCurrentAddress(newAddress);
      setRetryCount(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load payment addresses';
      setError(errorMessage);
      toast.error(errorMessage);
      
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchAddressesWithRetry();
        }, RETRY_DELAY * (retryCount + 1));
      }
    } finally {
      setIsLoading(false);
    }
  }, [network, retryCount, getRandomAddress]);

  useEffect(() => {
    fetchAddressesWithRetry();
  }, [fetchAddressesWithRetry]);

  useEffect(() => {
    if (addresses) {
      const newAddress = getAddressForNetwork(network);
      setCurrentAddress(newAddress);
      if (!newAddress) {
        setError(`No addresses available for ${network}`);
      }
    }
  }, [network, addresses, getAddressForNetwork]);

  return {
    addresses,
    currentAddress,
    isLoading,
    error,
    retryFetch: () => {
      setRetryCount(0);
      fetchAddressesWithRetry();
    },
    getAddressForNetwork
  };
};