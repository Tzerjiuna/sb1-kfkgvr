import { ethers } from 'ethers';
import { NetworkType } from '../types';

interface GeneratedWallet {
  address: string;
  privateKey: string;
}

export const generateWallets = async (
  network: NetworkType,
  count: number
): Promise<GeneratedWallet[]> => {
  const wallets: GeneratedWallet[] = [];

  if (network === 'ERC20') {
    // Generate Ethereum wallets
    for (let i = 0; i < count; i++) {
      const wallet = ethers.Wallet.createRandom();
      wallets.push({
        address: wallet.address,
        privateKey: wallet.privateKey
      });
    }
  } else {
    // Generate Tron wallets using TronWeb
    const TronWeb = (await import('tronweb')).default;
    const tronWeb = new TronWeb({
      fullHost: 'https://api.trongrid.io'
    });

    for (let i = 0; i < count; i++) {
      const account = await tronWeb.createAccount();
      wallets.push({
        address: account.address.base58,
        privateKey: account.privateKey
      });
    }
  }

  return wallets;
};