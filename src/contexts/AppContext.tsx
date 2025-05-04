import React, { createContext, useContext, useState, useEffect } from 'react';
import { RuggerAccount, SortOption } from '../types';
import { supabase } from '../lib/supabase';

interface AppContextType {
  accounts: RuggerAccount[];
  addAccount: (handle: string, walletAddress: string, description: string) => Promise<void>;
  upvoteAccount: (id: string) => Promise<void>;
  downvoteAccount: (id: string) => Promise<void>;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  loading: boolean;
  error: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<RuggerAccount[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const { data: ruggers, error } = await supabase
        .from('ruggers')
        .select(`
          *,
          votes (
            vote_type
          )
        `);

      if (error) throw error;

      const formattedAccounts: RuggerAccount[] = ruggers.map(rugger => ({
        id: rugger.id,
        handle: rugger.handle,
        walletAddress: rugger.wallet_address,
        description: rugger.description || '',
        createdAt: new Date(rugger.created_at).getTime(),
        upvotes: rugger.votes?.filter((v: { vote_type: string; }) => v.vote_type === 'up').length || 0,
        downvotes: rugger.votes?.filter((v: { vote_type: string; }) => v.vote_type === 'down').length || 0
      }));

      setAccounts(formattedAccounts);
    } catch (err) {
      setError('Failed to fetch accounts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (handle: string, walletAddress: string, description: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('ruggers')
        .insert({
          handle: handle.startsWith('@') ? handle : `@${handle}`,
          wallet_address: walletAddress,
          description,
          created_by: user?.id || null
        });

      if (error) throw error;
      await fetchAccounts();
    } catch (err) {
      setError('Failed to add account');
      console.error(err);
      throw err;
    }
  };

  const vote = async (id: string, voteType: 'up' | 'down') => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('You must be logged in to vote');
      }

      const { data: existingVote } = await supabase
        .from('votes')
        .select()
        .eq('rugger_id', id)
        .eq('user_id', user.id)
        .single();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          return; // Already voted this way
        }
        
        const { error } = await supabase
          .from('votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('votes')
          .insert({
            rugger_id: id,
            vote_type: voteType,
            user_id: user.id
          });

        if (error) throw error;
      }

      await fetchAccounts();
    } catch (err) {
      setError('Failed to vote');
      console.error(err);
    }
  };

  const upvoteAccount = async (id: string) => {
    await vote(id, 'up');
  };

  const downvoteAccount = async (id: string) => {
    await vote(id, 'down');
  };

  return (
    <AppContext.Provider
      value={{
        accounts,
        addAccount,
        upvoteAccount,
        downvoteAccount,
        sortOption,
        setSortOption,
        searchTerm,
        setSearchTerm,
        loading,
        error
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};