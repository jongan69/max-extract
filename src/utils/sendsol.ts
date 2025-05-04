import { Connection } from "@solana/web3.js";
import { SystemProgram } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { Transaction } from "@solana/web3.js";
import { DEFAULT_WALLET } from "./constants";
import { useWallet } from "@solana/wallet-adapter-react";

const fetchPrice = async () => {
    try {
        const response = await fetch('https://api.kraken.com/0/public/Ticker?pair=SOLUSD');
        const data = await response.json();
        return data.result.SOLUSD.a[0];
    } catch (error) {
        console.error(error);
        return 0;
    }
}

export const processSolTransfer = async (amountUsd: number) => {
    const { publicKey, sendTransaction } = useWallet();
    const price = await fetchPrice();

    if (!publicKey || price === 0) {
        throw new Error('Wallet not connected or price not found');
    }

    const amount = amountUsd / price * 10 ** 9;
    const connection = new Connection(import.meta.env.VITE_HELIUS_SECURE_RPC_URL!);
    let transaction = new Transaction();

    transaction.add(
        SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey(DEFAULT_WALLET),
            lamports: amount
        })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = publicKey;

    const signature = await sendTransaction(transaction, connection);
    const latestBlockhash = await connection.getLatestBlockhash();
    const confirmation = await connection.confirmTransaction({
        signature,
        ...latestBlockhash
    });

    console.log(`Payment TX: https://solscan.io/tx/${signature}`);
    return confirmation;
}