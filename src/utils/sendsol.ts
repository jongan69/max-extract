import { Connection, TransactionSignature, VersionedTransaction } from "@solana/web3.js";
// import { SendTransactionOptions} from '@solana/wallet-adapter-react'
import { SystemProgram } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { Transaction } from "@solana/web3.js";
import { DEFAULT_WALLET } from "./constants";

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

export const processSolTransfer = async (amountUsd: number, connection: Connection, publicKey: PublicKey, sendTransaction: (transaction: Transaction | VersionedTransaction, connection: Connection, options?: any) => Promise<TransactionSignature>) => {
    const price = await fetchPrice();

    if (!publicKey || price === 0) {
        throw new Error('Wallet not connected or price not found');
    }

    const amountInSol = amountUsd / price;
    const amountInLamports = amountInSol * 10 ** 9;
    let transaction = new Transaction();

    console.log(`Attempting to send ${amountInSol} SOL to ${DEFAULT_WALLET} @ ${price} USD perSOL`);

    transaction.add(
        SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey(DEFAULT_WALLET),
            lamports: Math.round(amountInLamports)
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