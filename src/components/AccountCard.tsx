import React from 'react';
import { ThumbsUp, ThumbsDown, Twitter, ExternalLink, Wallet, Coins, Trash2 } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { RuggerAccount } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { validateWalletAddress } from '../utils/validation';
import { useCreatedCoins } from '../hooks/useCreatedCoins';
import { useStripe } from '../hooks/useStripe';
import { STRIPE_PRODUCTS } from '../stripe-config';
import { processSolTransfer } from '../utils/sendsol';
import { useBalance } from '../hooks/useBalance';

interface AccountCardProps {
  account: RuggerAccount;
}

const AccountCard: React.FC<AccountCardProps> = ({ account }) => {
  const wallet = useWallet();
  const { upvoteAccount, downvoteAccount, deleteAccount } = useAppContext();
  const { createCheckoutSession, loading: checkoutLoading } = useStripe({
    onError: (error) => {
      console.error('Checkout error:', error);
      alert(error instanceof Error ? error.message : 'An error occurred during checkout');
    }
  });
  
  const { id, handle, walletAddress, description, upvotes, downvotes } = account;
  const { coins, isLoading } = useCreatedCoins(walletAddress);
  const { balance, isLoading: balanceLoading } = useBalance(walletAddress);
  console.log('balance', balance);
  const score = upvotes - downvotes;
  const formattedHandle = handle.startsWith('@') ? handle : `@${handle}`;
  const cleanHandle = formattedHandle.replace('@', '');
  const shortWallet = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
  const walletType = validateWalletAddress(walletAddress).chain;

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getExplorerUrl = () => {
    if (walletType === 'ethereum') {
      return `https://etherscan.io/address/${walletAddress}`;
    }
    return `https://solscan.io/account/${walletAddress}`;
  };

  const handleDeleteAccount = async () => {
    if (window.confirm(`Are you sure you want to remove this account? This will cost ${formatUSD(STRIPE_PRODUCTS.REMOVE_ACCOUNT.price)}.`)) {
      if (walletType === 'solana' && wallet.connected) {
        try {
          const confirmation = await processSolTransfer(STRIPE_PRODUCTS.REMOVE_ACCOUNT.price);
          // TODO: Actually delete the account after payment (add your logic here)
          if (confirmation) {
            await deleteAccount(id);
          }
        } catch (err) {
          console.error('SOL payment failed:', err);
          alert(err instanceof Error ? err.message : 'SOL payment failed.');
        }
      } else {
        await createCheckoutSession('REMOVE_ACCOUNT', id);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md h-full flex flex-col">
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2">
              <Twitter className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            </div>
          </div>

          <div className="flex-grow min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 break-keep">
                {formattedHandle}
              </h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleDeleteAccount}
                  disabled={checkoutLoading}
                  className="p-2 rounded-full bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Delete account"
                  title={`Delete account (${formatUSD(STRIPE_PRODUCTS.REMOVE_ACCOUNT.price)})`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <a 
                  href={`https://twitter.com/${cleanHandle}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-full text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                  aria-label={`Visit ${formattedHandle} on Twitter`}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Added on {new Date(account.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg overflow-hidden">
          <Wallet className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <a
            href={getExplorerUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-mono text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
          >
            {shortWallet}
            <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
              ({walletType === 'ethereum' ? 'ETH' : 'SOL'})
            </span>
          </a>
        </div>

        {balanceLoading ? (
          <div className="mb-3 text-sm text-gray-500 dark:text-gray-400">Loading balance...</div>
        ) : (
          <div className="mb-3 flex flex-col gap-1 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-200">SOL:</span>
              <span className="ml-2">{balance?.solBalance?.toFixed(4) ?? '0.0000'} SOL</span>
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                ({formatUSD(balance?.solBalanceUsd ?? 0)})
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-200">USDC:</span>
              <span className="ml-2">{balance?.usdcBalance?.toFixed(4) ?? '0.0000'} USDC</span>
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                ({formatUSD(balance?.usdcBalance ?? 0)})
              </span>
            </div>
          </div>
        )}

        {description && (
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 text-sm">
            {description}
          </p>
        )}

        {coins && coins.length > 0 && (
          <div className="mb-4 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="h-4 w-4 text-orange-500 flex-shrink-0" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                Created Coins
              </span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {coins.map((coin) => (
                <div key={coin.mint} className="text-sm border-b border-orange-100 dark:border-orange-800 last:border-0 pb-2 last:pb-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-700 dark:text-gray-200 truncate">
                          {coin.name}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 truncate">
                          ({coin.symbol})
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Created {new Date(coin.created_timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="text-xs font-medium text-green-600 dark:text-green-400 flex-shrink-0">
                      {formatUSD(coin.usd_market_cap)}
                    </span>
                  </div>
                  {coin.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {coin.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Loading coins data...
          </div>
        )}
        
        <div className="flex items-center justify-between pt-3 mt-auto border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${score > 0 ? 'text-green-600 dark:text-green-400' : score < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
              {score > 0 ? `+${score}` : score}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({upvotes + downvotes} votes)
            </span>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => upvoteAccount(id)}
              className="flex items-center justify-center p-2 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
              aria-label="Upvote"
            >
              <ThumbsUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </button>
            
            <button 
              onClick={() => downvoteAccount(id)}
              className="flex items-center justify-center p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              aria-label="Downvote"
            >
              <ThumbsDown className="h-5 w-5 text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountCard;