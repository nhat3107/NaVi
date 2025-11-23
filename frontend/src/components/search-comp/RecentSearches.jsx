import React from "react";

const RecentSearches = ({ recentSearches, onUserClick, onRemoveRecent, onClearAll }) => {
  if (recentSearches.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Recent</h3>
        <button
          onClick={onClearAll}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Clear all
        </button>
      </div>
      <div className="divide-y divide-gray-200">
        {recentSearches.map((user) => (
          <div
            key={user._id}
            className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors group"
          >
            <button
              onClick={() => onUserClick(user)}
              className="flex items-center gap-3 flex-1 min-w-0 text-left"
            >
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {user.username}
                </p>
                {user.bio && (
                  <p className="text-sm text-gray-500 truncate">
                    {user.bio}
                  </p>
                )}
              </div>
            </button>
            <button
              onClick={(e) => onRemoveRecent(user._id, e)}
              className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded-full transition-all"
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentSearches;

