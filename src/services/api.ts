import CryptoJS from 'crypto-js';
import toast from 'react-hot-toast';

// Use relative path for API calls
const API_BASE_URL = '/check/';
const ENCRYPTION_KEY = 'oneboat';

export interface AddressPool {
  TRC20: string[];
  ERC20: string[];
}

interface PaymentSubmission {
  amount: string;
  platform_account: string;
  hash: string;
  order_number: string;
  timestamp: number;
}

const handleResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type');
  
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      if (contentType?.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } else {
        errorMessage = await response.text();
      }
    } catch {
      errorMessage = response.statusText;
    }
    throw new Error(errorMessage);
  }

  // For empty responses or non-JSON responses, return null
  if (!contentType?.includes('application/json')) {
    return null;
  }

  return response.json();
};

const encrypt = (data: any): string => {
  const jsonStr = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(jsonStr, ENCRYPTION_KEY).toString();
  return btoa(encrypted);
};

export const fetchAddresses = async (): Promise<AddressPool> => {
  try {
    const response = await fetch(`${API_BASE_URL}alladdr.php`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      credentials: 'include'
    });

    const data = await handleResponse(response);
    
    // Return default empty pools if no data
    if (!data) {
      return { TRC20: [], ERC20: [] };
    }

    const addresses: AddressPool = {
      TRC20: Array.isArray(data.TRC20) ? data.TRC20.filter(addr => typeof addr === 'string' && addr.length > 0) : [],
      ERC20: Array.isArray(data.ERC20) ? data.ERC20.filter(addr => typeof addr === 'string' && addr.length > 0) : []
    };

    if (!addresses.TRC20.length && !addresses.ERC20.length) {
      throw new Error('No valid addresses available');
    }

    return addresses;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch addresses';
    toast.error(errorMessage);
    // Return empty pools instead of throwing
    return { TRC20: [], ERC20: [] };
  }
};

export const verifyTransaction = async (
  network: string,
  hash: string,
  receivingAddress: string,
  addressPool: AddressPool
): Promise<boolean> => {
  try {
    if (!hash || !receivingAddress) {
      throw new Error('Missing transaction details');
    }

    if (!addressPool[network as keyof AddressPool]?.includes(receivingAddress)) {
      throw new Error('Invalid receiving address');
    }

    const response = await fetch(`${API_BASE_URL}verify.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ 
        network, 
        hash, 
        address: receivingAddress 
      })
    });

    const result = await handleResponse(response);
    return result?.success === true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Verification failed';
    toast.error(errorMessage);
    return false;
  }
};

export const submitPayment = async (payment: PaymentSubmission): Promise<any> => {
  try {
    if (!payment.hash || !payment.platform_account || !payment.amount) {
      throw new Error('Missing required payment details');
    }

    const encryptedData = encrypt(payment);
    const response = await fetch(`${API_BASE_URL}call.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ data: encryptedData })
    });

    const result = await handleResponse(response);
    
    if (!result?.success) {
      throw new Error(result?.message || 'Payment submission failed');
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Payment submission failed';
    toast.error(errorMessage);
    throw error;
  }
};