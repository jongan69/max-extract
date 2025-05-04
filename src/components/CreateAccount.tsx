import { useWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Lock, Loader2, XCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

// Add prop types
interface CreateAccountModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateAccountModal({ open, onClose }: CreateAccountModalProps) {
  const wallet = useWallet();
  const { authenticateWithWallet } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateAccount = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await authenticateWithWallet(wallet);
      console.log('Authentication result:', result);
      // JWT and user info already handled in hook)
      setLoading(false);
      onClose();
    } catch (err) {
      setError('Error signing in: ' + (err as Error).message);
      setLoading(false);
    }
  };

  if (!open) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay transition-opacity duration-200">
      <div className="modal relative bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 shadow-xl rounded-lg p-6 max-w-xs w-full flex flex-col items-center">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
          aria-label="Close modal"
        >
          <XCircle className="h-6 w-6 text-gray-400 hover:text-red-500 transition-colors" />
        </button>
        <div className="flex flex-col items-center mb-5">
          <span className="bg-blue-100 dark:bg-blue-900 p-2 rounded-md mb-2">
            <Lock className="h-7 w-7 text-blue-500 dark:text-blue-400" />
          </span>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">Create Account</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center max-w-xs">
            Securely create your account by signing a message with your wallet.
          </p>
        </div>
        {error && (
          <div className="w-full flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded-md mb-4 border border-red-200 dark:border-red-700">
            <XCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        <button
          onClick={handleCreateAccount}
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 mb-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Creating...
            </>
          ) : (
            <>Create Account</>
          )}
        </button>
        <button
          onClick={onClose}
          className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>,
    document.body
  );
}

// Example parent component
export function ParentComponent() {
  const wallet = useWallet();
  const [modalOpen, setModalOpen] = useState(false);
  const hasOpened = useRef(false);

  // Auto-open modal on wallet connect, but only once per session
  useEffect(() => {
    if (wallet.connected && !hasOpened.current) {
      setModalOpen(true);
      hasOpened.current = true;
    }
    // Optionally, reset hasOpened if wallet disconnects
    if (!wallet.connected) {
      hasOpened.current = false;
    }
  }, [wallet.connected]);

  return (
    <>
      {/* You can remove the manual button if you only want auto-open */}
      {/* <button onClick={() => setModalOpen(true)}>Create Account</button> */}
      <CreateAccountModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
