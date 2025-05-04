import { fetchEthereumBalance, fetchSolanaBalance } from '../utils/fetchBalance';
import { useState, useEffect } from 'react';
import { validateWalletAddress } from '../utils/validation';

interface SolanaBalance {
  usdcBalance: number;
  solBalance: number;
  solBalanceUsd: number;
}

interface EthereumBalance {
  balanceWei: number;
  balanceEther: number;
  price: number;
  balanceUsd: number;
}


export function useBalance(walletAddress: string) {
  const [balance, setBalance] = useState<SolanaBalance | EthereumBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBalanceData = async () => {
      try {
        const validation = validateWalletAddress(walletAddress);
        if (!validation.isValid) {
          setError(new Error('Invalid wallet address'));
          setIsLoading(false);
          return;
        }
        const walletType = validation.chain;

        switch (walletType) {
          case 'solana':
            const solanaWalletBalance = await fetchSolanaBalance(walletAddress);
            setBalance(solanaWalletBalance);
            setIsLoading(false);
            break;
          case 'ethereum':
            const ethereumWalletBalance = await fetchEthereumBalance(walletAddress);
            setBalance(ethereumWalletBalance);
            setIsLoading(false);
            break;
        }
      } catch (error) {
        setError(error as Error);
        setIsLoading(false);
      }
    };
    if (walletAddress) {
      fetchBalanceData();
    }
  }, [walletAddress]);

  return {
    balance,
    isLoading,
    error
  };
}