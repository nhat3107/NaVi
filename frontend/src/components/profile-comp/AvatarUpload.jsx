import React from "react";

const AvatarUpload = ({ avatarPreview, username, onAvatarChange }) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Profile Picture
      </label>
      <div className="flex items-center space-x-4">
        <div className="relative">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Avatar preview"
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-semibold border-4 border-gray-100">
              {username?.[0]?.toUpperCase() || "U"}
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Change Photo
            <input
              type="file"
              accept="image/*"
              onChange={onAvatarChange}
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 5MB</p>
        </div>
      </div>
    </div>
  );
};

export default AvatarUpload;

