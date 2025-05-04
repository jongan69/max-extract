import React, { useState } from 'react';
import { AtSign, Send, Wallet, Loader2 } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { validateWalletAddress } from '../utils/validation';
// import { usePfp } from '../hooks/usePfp';
import { fetchPfp } from '../utils/fetchPfp';

const SubmissionForm: React.FC = () => {
  const [handle, setHandle] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addAccount, accounts } = useAppContext();
  // const { profileImage } = usePfp(handle);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!handle.trim()) {
      setError('Twitter handle is required');
      return;
    }

    if (!walletAddress.trim()) {
      setError('Wallet address is required');
      return;
    }

    const validation = validateWalletAddress(walletAddress.trim());
    if (!validation.isValid) {
      setError('Invalid wallet address. Please enter a valid Ethereum or Solana address.');
      return;
    }
    
    const cleanHandle = handle.trim().replace(/^@/, '');
    
    const exists = accounts.some(account => 
      account.handle.replace(/^@/, '').toLowerCase() === cleanHandle.toLowerCase() ||
      account.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    );
    
    if (exists) {
      setError('This account or wallet has already been submitted');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    // Look up handle on twitter for profile image
    const profile = await fetchPfp(cleanHandle);

    if (!profile || !profile.avatar) {
      setError('Twitter account not found. Please enter a valid Twitter handle or try again.');
      setIsSubmitting(false);
      return;
    }

    try {
      await addAccount(cleanHandle, walletAddress.trim(), description, profile.avatar);
      setHandle('');
      setWalletAddress('');
      setDescription('');
    } catch (err) {
      setError('Failed to submit account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-all hover:shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Submit a Rugger</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="handle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Twitter Handle
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <AtSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="handle"
              placeholder="elonmusk"
              className="pl-10 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="wallet" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Wallet Address (Ethereum or Solana)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Wallet className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="wallet"
              placeholder="0x... or Solana address"
              className="pl-10 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description (optional)
          </label>
          <textarea
            id="description"
            placeholder="What did they do? Any evidence?"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        
        {error && (
          <div className="mb-4 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Rugger
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SubmissionForm;