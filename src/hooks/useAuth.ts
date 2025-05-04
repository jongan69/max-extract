import { useEffect, useState } from 'react';
import bs58 from 'bs58';
import { SigninMessage } from '../utils/signinmessage';
import { jwtDecode } from 'jwt-decode';

type WalletJwtPayload = {
  sub: string;
  iat: number;
  exp: number;
  user_id?: string;
  email?: string;
  // add any other fields you include in your JWT
};

type AuthState = {
  jwtPayload: WalletJwtPayload | null;
  user: any | null; // Supabase user object
};

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({ jwtPayload: null, user: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    const userStr = localStorage.getItem('user');
    let jwtPayload = null;
    let user = null;
    if (token) {
      try {
        jwtPayload = jwtDecode<WalletJwtPayload>(token);
      } catch {
        jwtPayload = null;
      }
    }
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch {
        user = null;
      }
    }
    setAuth({ jwtPayload, user });
    setLoading(false);
  }, []);

  // Function to authenticate with wallet
  const authenticateWithWallet = async (wallet: any) => {
    if (!wallet.connected) {
      throw new Error('Wallet not connected');
    }
    if (!wallet.publicKey || !wallet.signMessage) {
      throw new Error('Wallet not ready');
    }
    const generateNonce = () => window.crypto.randomUUID();
    const nonce = generateNonce();
    const message = new SigninMessage({
      domain: window.location.host,
      publicKey: wallet.publicKey.toBase58(),
      statement: 'Sign this message to create your account.',
      nonce,
    });
    const data = new TextEncoder().encode(message.prepare());
    const signature = await wallet.signMessage(data);
    const serializedSignature = bs58.encode(signature);
    const body = JSON.stringify({
      message: JSON.stringify(message),
      signature: serializedSignature,
    });
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wallet-authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body,
    });
    if (!res.ok) {
      throw new Error('Authentication failed');
    }
    const result = await res.json();
    // Store JWT or user info as needed
    // console.log('Authentication result:', result);
    const parsedResult = JSON.parse(result);
    if (parsedResult.token && typeof parsedResult.token === 'string') {
      localStorage.setItem('jwt', parsedResult.token);
      localStorage.setItem('user', JSON.stringify(parsedResult.user));
      setAuth({ jwtPayload: jwtDecode<WalletJwtPayload>(parsedResult.token), user: parsedResult.user });
    } else {
      throw new Error(`Invalid token type received from backend: ${typeof parsedResult.token}`);
    }
    return result;
  };

  return {
    user: auth.user,
    jwtPayload: auth.jwtPayload,
    loading,
    authenticateWithWallet,
  };
}