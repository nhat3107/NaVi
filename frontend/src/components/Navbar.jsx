import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import toast from "react-hot-toast";
import NaviIcon from "../assets/navi_icon_white.svg";
import SearchPanel from "./SearchPanel";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const moreMenuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (error) {
      // Silently handle error
    }
  };

  const navItems = [
    {
      name: "Home",
      path: "/",
      active: location.pathname === "/" && !showSearchPanel,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: "Search",
      path: null, // Not a navigation item, triggers panel
      active: showSearchPanel,
      onClick: () => setShowSearchPanel(true),
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      name: "Network",
      path: "/network",
      active: location.pathname === "/network",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      name: "Messages",
      path: "/chat",
      active: location.pathname === "/chat",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      name: "Notifications",
      path: "/notifications",
      active: location.pathname === "/notifications",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
  ];

  return (
    <>
    {/* Desktop Sidebar */}
    <nav className="hidden md:flex fixed left-0 top-0 h-screen w-20 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col items-center py-3 z-50">
      {/* Logo */}
      <div 
        className="mb-4 mt-3 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate("/")}
      >
        <img src={NaviIcon} alt="NaVi" className="w-7 h-7" />
      </div>

      {/* Navigation Items */}
      <div className="flex-1 flex flex-col space-y-2 w-full px-2">
        {navItems.map((item, index) => (
          <button
            key={item.path || item.name}
            onClick={() => item.onClick ? item.onClick() : navigate(item.path)}
            className={`relative flex items-center justify-center p-2.5 sm:p-3 rounded-xl transition-all duration-200 ${
              item.active
                ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"
                : "text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
            title={item.name}
          >
            {item.icon}
            
            {/* Active indicator */}
            {item.active && (
              <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-indigo-600 dark:bg-indigo-400 rounded-r-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* User Profile */}
      <div className="w-full px-2 mb-2">
        <button 
          onClick={() => navigate(`/profile/${user?._id}`)}
          className="flex flex-col items-center w-full hover:opacity-80 transition-opacity"
          title="View Profile"
        >
          <div className="relative">
            {user?.avatarUrl ? (
              <div className="relative">
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              </div>
            ) : (
              <div className="relative">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 flex items-center justify-center text-white font-semibold">
                  <span className="text-base sm:text-lg">{user?.username?.[0]?.toUpperCase() || "U"}</span>
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              </div>
            )}
          </div>
        </button>
      </div>

      {/* More Button */}
      <div className="relative w-full px-2" ref={moreMenuRef}>
        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className={`w-full flex items-center justify-center p-2.5 sm:p-3 rounded-xl transition-all duration-200 ${
            showMoreMenu 
              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30' 
              : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          title="More"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* More Menu */}
        {showMoreMenu && (
          <div className="absolute bottom-0 left-full ml-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1.5 z-50">
            <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 flex items-center justify-center text-white font-semibold">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm">{user?.username?.[0]?.toUpperCase() || "U"}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                    {user?.fullName || user?.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{user?.username}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                navigate("/settings");
                setShowMoreMenu(false);
              }}
              className="w-full flex items-center space-x-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium text-sm">Settings</span>
            </button>

            <button
              onClick={() => {
                handleLogout();
                setShowMoreMenu(false);
              }}
              className="w-full flex items-center space-x-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-gray-100 dark:border-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>

    {/* Mobile Bottom Navigation */}
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-around z-50 safe-area-inset-bottom">
      {navItems.slice(0, 4).map((item) => (
        <button
          key={item.path || item.name}
          onClick={() => item.onClick ? item.onClick() : navigate(item.path)}
          className={`relative flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            item.active
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-gray-600 dark:text-gray-400"
          }`}
          title={item.name}
        >
          <div className="w-5 h-5 mb-0.5 flex items-center justify-center">
            {React.cloneElement(item.icon, { className: "w-5 h-5" })}
          </div>
          <span className="text-[10px] font-medium leading-tight">{item.name}</span>
          {item.active && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-b-full"></div>
          )}
        </button>
      ))}
      <button
        onClick={() => navigate(`/profile/${user?._id}`)}
        className={`relative flex flex-col items-center justify-center flex-1 h-full transition-colors ${
          location.pathname === `/profile/${user?._id}` 
            ? "text-indigo-600 dark:text-indigo-400" 
            : "text-gray-600 dark:text-gray-400"
        }`}
        title="Profile"
      >
        <div className="w-5 h-5 mb-1">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-5 h-5 rounded-full object-cover"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 flex items-center justify-center text-white text-xs font-semibold">
              {user?.username?.[0]?.toUpperCase() || "U"}
            </div>
          )}
        </div>
        <span className="text-xs font-medium">Profile</span>
        {location.pathname === `/profile/${user?._id}` && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-b-full"></div>
        )}
      </button>
    </nav>

    {/* Search Panel */}
    {showSearchPanel && <SearchPanel onClose={() => setShowSearchPanel(false)} />}
  </>
  );
};

export default Navbar;

