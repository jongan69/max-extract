import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} Max Extract. All rights reserved.
            </p>
          </div>
          
          <div className="flex items-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center">
              Made with <Heart className="h-4 w-4 text-red-500 mx-1" /> using React & Tailwind
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;