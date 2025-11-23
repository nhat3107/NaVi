import React, { useState } from "react";

const GenderSelector = ({ value, onChange }) => {
  const [showModal, setShowModal] = useState(false);

  const genderOptions = [
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  ];

  const getGenderLabel = () => {
    const option = genderOptions.find(opt => opt.value === value);
    return option ? option.label : "Select gender";
  };

  const handleSelect = (selectedValue) => {
    onChange({ target: { name: 'gender', value: selectedValue } });
    setShowModal(false);
  };

  return (
    <>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gender
        </label>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-gray-900 dark:text-gray-100"
        >
          <span className={value ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"}>
            {getGenderLabel()}
          </span>
          <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This won't be part of your public profile.</p>
      </div>

      {/* Gender Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Gender</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="py-2">
              {genderOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{option.label}</span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    value === option.value
                      ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-600 dark:bg-indigo-400'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {value === option.value && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GenderSelector;

