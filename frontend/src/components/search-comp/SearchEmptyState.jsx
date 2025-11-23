import React from "react";

const SearchEmptyState = () => {
  return (
    <div className="p-12 text-center">
      <svg
        className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-gray-600"
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
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        Search for users
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        Start typing to find people
      </p>
    </div>
  );
};

export default SearchEmptyState;

