import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { processSolTransfer } from '../utils/sendsol';

export function useSendSol() {
  const { connected, publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Use the same endpoint as WalletContextProvider
  const connection = new Connection(import.meta.env.VITE_HELIUS_SECURE_RPC_URL!);

  const sendSol = useCallback(
    async (amountUsd: number) => {
      setLoading(true);
      setError(null);
      try {
        if (!connected || !publicKey || !sendTransaction) {
          throw new Error('Wallet not connected');
        }
        const confirmation = await processSolTransfer(amountUsd, connection, publicKey, sendTransaction);
        setLoading(false);
        return confirmation;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
        throw err;
      }
    },
    [connected, publicKey, sendTransaction, connection]
  );

  return { sendSol, loading, error };
} 