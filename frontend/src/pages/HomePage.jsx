import React from 'react';
import Navbar from '../components/Navbar';
import FeedContainer from '../components/feed-comp/FeedContainer';
import useAuthUser from '../hooks/useAuthUser';

const HomePage = () => {
  const { authUser } = useAuthUser();

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
      <Navbar />
      <div className="flex-1 md:ml-20 pb-16 md:pb-0 overflow-y-auto">
        <FeedContainer currentUser={authUser} feedType="feed" />
      </div>
    </div>
  );
};

export default HomePage;
