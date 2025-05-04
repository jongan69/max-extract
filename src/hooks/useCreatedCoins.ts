import useSWR from 'swr';
import type { CreatedCoin } from '../types';

interface ApiResponse {
  coins: CreatedCoin[];
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useCreatedCoins(walletAddress: string) {
  const { data, error, isLoading } = useSWR<ApiResponse>(
    `https://frontend-api-v3.pump.fun/coins/user-created-coins/${walletAddress}?offset=0&limit=10000&includeNsfw=true`,
    fetcher
  );

  return {
    coins: data?.coins || [],
    isLoading,
    error
  };
}