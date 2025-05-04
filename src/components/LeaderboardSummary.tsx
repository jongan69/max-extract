import React from 'react';
import { Trophy, Award, TrendingUp, TrendingDown } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

const LeaderboardSummary: React.FC = () => {
  const { accounts } = useAppContext();
  
  if (accounts.length === 0) {
    return null;
  }
  
  // Sort by score
  const sortedByScore = [...accounts].sort((a, b) => 
    (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)
  );
  
  // Get top and bottom accounts
  const topAccount = sortedByScore[0];
  const bottomAccount = sortedByScore[sortedByScore.length - 1];
  
  // Calculate total votes
  const totalVotes = accounts.reduce(
    (sum, account) => sum + account.upvotes + account.downvotes, 
    0
  );
  
  // Find most active (most total votes)
  const mostActive = [...accounts].sort(
    (a, b) => (b.upvotes + b.downvotes) - (a.upvotes + a.downvotes)
  )[0];

  return (
    <div className="bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 rounded-xl text-white p-6 mb-8">
      <h2 className="flex items-center text-xl font-bold mb-4">
        <Trophy className="h-6 w-6 mr-2" />
        Leaderboard Summary
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center text-sm font-medium mb-2">
            <TrendingUp className="h-4 w-4 mr-1" />
            Most Popular
          </div>
          <div className="font-bold">{topAccount.handle}</div>
          <div className="text-sm opacity-80">
            Score: {topAccount.upvotes - topAccount.downvotes}
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center text-sm font-medium mb-2">
            <TrendingDown className="h-4 w-4 mr-1" />
            Least Popular
          </div>
          <div className="font-bold">{bottomAccount.handle}</div>
          <div className="text-sm opacity-80">
            Score: {bottomAccount.upvotes - bottomAccount.downvotes}
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center text-sm font-medium mb-2">
            <Award className="h-4 w-4 mr-1" />
            Most Active
          </div>
          <div className="font-bold">{mostActive.handle}</div>
          <div className="text-sm opacity-80">
            {mostActive.upvotes + mostActive.downvotes} votes
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-center opacity-80">
        {accounts.length} accounts • {totalVotes} total votes
      </div>
    </div>
  );
};

export default LeaderboardSummary;