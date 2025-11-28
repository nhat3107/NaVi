import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchUsers } from "../hooks/useSearchUsers";
import useAuthUser from "../hooks/useAuthUser";
import SearchInput from "./search-comp/SearchInput";
import SearchResults from "./search-comp/SearchResults";
import RecentSearches from "./search-comp/RecentSearches";
import SearchEmptyState from "./search-comp/SearchEmptyState";

const SearchPanel = ({ onClose }) => {
  const navigate = useNavigate();
  const { authUser } = useAuthUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const { users, loading } = useSearchUsers(searchTerm);
  const panelRef = useRef(null);

  // Get user-specific localStorage key
  const getStorageKey = () => {
    return authUser?._id ? `recentSearches_${authUser._id}` : "recentSearches";
  };

  // Load recent searches from localStorage on mount or when user changes
  useEffect(() => {
    const storageKey = getStorageKey();
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (error) {
        console.error("Error parsing recent searches:", error);
        setRecentSearches([]);
      }
    } else {
      setRecentSearches([]);
    }
  }, [authUser?._id]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Save recent search when user clicks on a result
  const handleUserClick = (user) => {
    // Add to recent searches (avoid duplicates)
    const newRecentSearches = [
      user,
      ...recentSearches.filter((u) => u._id !== user._id),
    ].slice(0, 10); // Keep only last 10 searches

    setRecentSearches(newRecentSearches);
    const storageKey = getStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(newRecentSearches));

    // Navigate to user profile
    navigate(`/profile/${user._id}`);
    onClose();
  };

  // Clear all recent searches
  const handleClearAll = () => {
    setRecentSearches([]);
    const storageKey = getStorageKey();
    localStorage.removeItem(storageKey);
  };

  // Remove individual recent search
  const handleRemoveRecent = (userId, e) => {
    e.stopPropagation();
    const newRecentSearches = recentSearches.filter((u) => u._id !== userId);
    setRecentSearches(newRecentSearches);
    const storageKey = getStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(newRecentSearches));
  };

  // Clear search input
  const handleClearInput = () => {
    setSearchTerm("");
  };

  return (
    <div className="fixed inset-0 z-40 flex pointer-events-none">
      {/* Search Panel */}
      <div
        ref={panelRef}
        className="w-full md:max-w-md bg-white dark:bg-gray-800 h-full md:h-full md:ml-20 pb-16 md:pb-0 shadow-2xl flex flex-col pointer-events-auto border-r border-gray-200 dark:border-gray-700"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Search</h2>
          <SearchInput
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onClear={handleClearInput}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Search Results */}
          {searchTerm.trim().length >= 2 && (
            <SearchResults
              users={users}
              loading={loading}
              onUserClick={handleUserClick}
            />
          )}

          {/* Recent Searches */}
          {!searchTerm && (
            <RecentSearches
              recentSearches={recentSearches}
              onUserClick={handleUserClick}
              onRemoveRecent={handleRemoveRecent}
              onClearAll={handleClearAll}
            />
          )}

          {/* Empty State */}
          {!searchTerm && recentSearches.length === 0 && <SearchEmptyState />}
        </div>
      </div>
    </div>
  );
};

export default SearchPanel;

