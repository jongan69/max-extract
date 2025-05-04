import React, { useMemo } from 'react';
import { TwitterAccount, SortOption } from '../types';
import AccountCard from './AccountCard';
import { useAppContext } from '../contexts/AppContext';
import { Search } from 'lucide-react';

const sortAccounts = (accounts: TwitterAccount[], sortOption: SortOption): TwitterAccount[] => {
  const sorted = [...accounts];
  
  switch (sortOption) {
    case 'newest':
      return sorted.sort((a, b) => b.createdAt - a.createdAt);
    case 'mostLiked':
      return sorted.sort((a, b) => 
        (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)
      );
    case 'leastLiked':
      return sorted.sort((a, b) => 
        (a.upvotes - a.downvotes) - (b.upvotes - b.downvotes)
      );
    default:
      return sorted;
  }
};

const AccountsList: React.FC = () => {
  const { accounts, sortOption, searchTerm } = useAppContext();
  
  const filteredAndSortedAccounts = useMemo(() => {
    let filtered = accounts;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = accounts.filter(account => 
        account.handle.toLowerCase().includes(term) ||
        account.description.toLowerCase().includes(term)
      );
    }
    
    return sortAccounts(filtered, sortOption);
  }, [accounts, sortOption, searchTerm]);

  if (accounts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">No accounts yet</h2>
        <p className="text-gray-600 mb-4">Be the first to submit a Twitter account for voting!</p>
      </div>
    );
  }

  if (filteredAndSortedAccounts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h2 className="text-xl font-semibold mb-2">No results found</h2>
        <p className="text-gray-600">Try a different search term</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredAndSortedAccounts.map((account) => (
        <AccountCard key={account.id} account={account} />
      ))}
    </div>
  );
};

export default AccountsList;