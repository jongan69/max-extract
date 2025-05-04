import { fetchBalance } from '../utils/fetchBalance';
import { useState } from 'react';
import { useEffect } from 'react';

interface Balance {
  usdcBalance: number;
  solBalance: number;
  solBalanceUsd: number;
}


export function useBalance(walletAddress: string) {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBalanceData = async () => {
      try {
        const balance = await fetchBalance(walletAddress);
        setBalance(balance);
        setIsLoading(false);
      } catch (error) {
        setError(error as Error);
        setIsLoading(false);
      }
    };
    fetchBalanceData();
  }, []);

  return {
    balance,
    isLoading,
    error
  };
}