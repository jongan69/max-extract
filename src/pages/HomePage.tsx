import React from 'react';
import SubmissionForm from '../components/SubmissionForm';
import AccountsList from '../components/AccountsList';
import LeaderboardSummary from '../components/LeaderboardSummary';

const HomePage: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1">
        <div className="lg:sticky lg:top-24">
          <SubmissionForm />
        </div>
      </div>
      
      <div className="lg:col-span-3">
        <LeaderboardSummary />
        <AccountsList />
      </div>
    </div>
  );
};

export default HomePage;