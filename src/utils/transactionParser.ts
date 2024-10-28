import { NetworkType } from '../types';
const infuraApiKey = import.meta.env.VITE_INFURA_API_KEY;

interface ERC20Transaction {
  status: string;
  value: string;
  to: string;
  from: string;
}

interface TRC20Transaction {
  confirmed: boolean;
  contractRet: string;
  contract_address: string;
  to_address: string;
  owner_address: string;
  trigger_info: {
    parameter: {
      value: {
        amount: string;
      };
    };
  };
}

export const parseTransaction = async (
  network: NetworkType,
  hash: string
): Promise<{
  isValid: boolean;
  amount?: string;
  from?: string;
  to?: string;
}> => {
  try {
    if (network === 'ERC20') {
      const response = await fetch(
        `https://mainnet.infura.io/v3/${infuraApiKey}`, // 使用模板字符串插入 API 密钥
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getTransactionReceipt',
            params: [hash],
            id: 1,
          }),
        }
      );

      const data = await response.json();
      const tx = data.result as ERC20Transaction;

      if (!tx) {
        return { isValid: false };
      }

      return {
        isValid: tx.status === '0x1',
        amount: tx.value ? (parseInt(tx.value, 16) / 1e6).toString() : '0', // Convert from wei to USDT (6 decimals)
        from: tx.from,
        to: tx.to,
      };
    } else {
      const response = await fetch(
        `https://apilist.tronscan.org/api/transaction-info?hash=${hash}`
      );
      const tx = (await response.json()) as TRC20Transaction;

      if (!tx) {
        return { isValid: false };
      }

      return {
        isValid: tx.confirmed && tx.contractRet === 'SUCCESS',
        amount: tx.trigger_info?.parameter?.value?.amount
          ? (parseInt(tx.trigger_info.parameter.value.amount) / 1e6).toString()
          : '0',
        from: tx.owner_address,
        to: tx.to_address,
      };
    }
  } catch (error) {
    console.error(`Error parsing ${network} transaction:`, error);
    return { isValid: false };
  }
};

export const validateTransaction = (
  parsedTx: { isValid: boolean; amount?: string; from?: string; to?: string },
  expectedAddress: string,
  expectedAmount: string
): { isValid: boolean; error?: string } => {
  if (!parsedTx.isValid) {
    return { isValid: false, error: 'Transaction is invalid or pending' };
  }

  if (
    !parsedTx.to ||
    parsedTx.to.toLowerCase() !== expectedAddress.toLowerCase()
  ) {
    return { isValid: false, error: 'Receiving address does not match' };
  }

  if (
    parsedTx.amount &&
    Math.abs(parseFloat(parsedTx.amount) - parseFloat(expectedAmount)) > 0.01
  ) {
    return { isValid: false, error: 'Transaction amount does not match' };
  }

  return { isValid: true };
};
