import React from 'react';
import { Twitter, Sun, Moon } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
import { SortOption } from '../types';

const Header: React.FC = () => {
  const { sortOption, setSortOption, searchTerm, setSearchTerm } = useAppContext();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <Twitter className="h-8 w-8 text-blue-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Max Extract
            </h1>
          </div>
          
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 items-center">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search accounts..."
                className="w-full px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
            >
              <option value="newest">Newest</option>
              <option value="mostLiked">Most Liked</option>
              <option value="leastLiked">Least Liked</option>
            </select>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Sun className="h-5 w-5 text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;