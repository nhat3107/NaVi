import React from "react";

const SearchResults = ({ users, loading, onUserClick }) => {
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
        <p className="text-gray-500 dark:text-gray-400 mt-4">Searching...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        <svg
          className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <p>No users found</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {users.map((user) => (
        <button
          key={user._id}
          onClick={() => onUserClick(user)}
          className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
        >
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {user.username}
            </p>
            {user.bio && (
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {user.bio}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

export default SearchResults;

