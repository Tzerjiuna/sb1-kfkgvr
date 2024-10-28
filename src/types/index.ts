export type NetworkType = 'TRC20' | 'ERC20';

export interface Transaction {
  hash: string;
  amount: string;
  platform_account: string;
  payer_account: string;
  network: NetworkType;
  receiving_address: string;
}