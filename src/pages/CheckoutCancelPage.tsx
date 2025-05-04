import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const CheckoutCancelPage: React.FC = () => {
  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
        <div className="flex justify-center mb-4">
          <XCircle className="h-16 w-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Payment Cancelled</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Your payment was cancelled. No charges have been made.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default CheckoutCancelPage;