import React, { useState, useRef, useEffect } from 'react'

// Helper function to generate day options (1-31)
const generateDayOptions = () => {
  return Array.from({length: 31}, (_, i) => ({
    value: i + 1,
    label: i + 1
  }));
};

// Helper function to generate month options
const generateMonthOptions = () => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  return months.map((month, index) => ({
    value: index + 1,
    label: month
  }));
};

// Helper function to generate year options (from current year back to 100 years ago)
const generateYearOptions = (startYear = new Date().getFullYear(), yearsBack = 100) => {
  return Array.from({length: yearsBack}, (_, i) => ({
    value: startYear - i,
    label: startYear - i
  }));
};

// Pre-generated data for convenience
export const dayOptions = generateDayOptions();
export const monthOptions = generateMonthOptions();
export const yearOptions = generateYearOptions();

const DateButton = ({ 
  placeholder = "Select", 
  value, 
  onChange, 
  options = [], 
  name,
  className = "",
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (selectedValue) => {
    const syntheticEvent = {
      target: { name, value: selectedValue }
    };
    onChange(syntheticEvent);
    setIsOpen(false);
  };

  const selectedOption = options.find(option => option.value == value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;
  
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 bg-white cursor-pointer flex items-center justify-between ${className}`}
        {...props}
      >
        <span className={`${!selectedOption ? 'text-gray-400' : 'text-gray-700'}`}>
          {displayValue}
        </span>
        
        {/* Custom dropdown arrow */}
        <svg 
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Custom dropdown list */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
          {options.map((option, index) => (
            <div
              key={index}
              onClick={() => handleSelect(option.value)}
              className={`px-4 py-2 cursor-pointer transition-colors hover:bg-gray-50 text-gray-700 ${
                option.value == value ? 'bg-blue-50 text-blue-600' : ''
              } ${index === 0 ? 'rounded-t-lg' : ''} ${index === options.length - 1 ? 'rounded-b-lg' : ''}`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DateButton;
