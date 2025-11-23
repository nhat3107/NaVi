import React from "react";

const PrivateProfileMessage = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">This Account is Private</h3>
      <p className="text-gray-600">Follow this account to see their posts and profile information.</p>
    </div>
  );
};

export default PrivateProfileMessage;

