import { isAddress } from 'ethers';

const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export const validateWalletAddress = (address: string): { isValid: boolean; chain: 'ethereum' | 'solana' | null } => {
  // Check Ethereum
  if (isAddress(address)) {
    return { isValid: true, chain: 'ethereum' };
  }
  
  // Check Solana
  if (SOLANA_ADDRESS_REGEX.test(address)) {
    return { isValid: true, chain: 'solana' };
  }
  
  return { isValid: false, chain: null };
};