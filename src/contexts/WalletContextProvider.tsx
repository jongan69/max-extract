import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import * as walletAdapterWallets from '@solana/wallet-adapter-wallets';
import * as web3 from '@solana/web3.js';
import React from 'react';
import '../styles/custom-wallet-styles.css';

const endpoint = import.meta.env.VITE_HELIUS_SECURE_RPC_URL || web3.clusterApiUrl('mainnet-beta');

const wallets = [
    // new walletAdapterWallets.PhantomWalletAdapter(),
    new walletAdapterWallets.TorusWalletAdapter(),
    new walletAdapterWallets.SolflareWalletAdapter(),
    // new walletAdapterWallets.SolletWalletAdapter(),
    new walletAdapterWallets.LedgerWalletAdapter(),
    // new walletAdapterWallets.ExodusWalletAdapter(),
    new walletAdapterWallets.CoinbaseWalletAdapter(),
];

const WalletContextProvider = ({ children }: { children: React.ReactNode }) => (
    <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
                {children}
            </WalletModalProvider>
        </WalletProvider>
    </ConnectionProvider>
);

export default WalletContextProvider;