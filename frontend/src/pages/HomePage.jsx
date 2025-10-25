import React from 'react';
import Navbar from '../components/Navbar';
import FeedContainer from '../components/feed-comp/FeedContainer';
import useAuthUser from '../hooks/useAuthUser';

const HomePage = () => {
  const { authUser } = useAuthUser();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navbar />
      <div className="flex-1 ml-20">
        <FeedContainer currentUser={authUser} feedType="feed" />
      </div>
    </div>
  );
};

export default HomePage;
