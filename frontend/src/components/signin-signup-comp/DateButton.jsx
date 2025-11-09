import React, { useState, useRef, useEffect } from 'react'

// ===== DATE VALIDATION UTILITIES =====

/**
 * Check if a year is a leap year
 */
const isLeapYear = (year) => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

/**
 * Get the number of days in a specific month of a year
 */
const getDaysInMonth = (month, year) => {
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  
  return daysInMonth[month - 1];
};

/**
 * Check if a date is valid (day exists in the given month/year)
 */
const isValidDate = (day, month, year) => {
  if (!day || !month || !year) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1) return false;
  
  const maxDays = getDaysInMonth(month, year);
  return day <= maxDays;
};

/**
 * Calculate age from a birth date
 */
const calculateAge = (day, month, year) => {
  const today = new Date();
  const birthDate = new Date(year, month - 1, day);
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Check if user meets minimum age requirement
 */
const isMinimumAge = (day, month, year, minAge = 13) => {
  if (!isValidDate(day, month, year)) return false;
  
  const age = calculateAge(day, month, year);
  return age >= minAge;
};

/**
 * Get available days for a given month and year
 */
const getValidDaysForMonth = (month, year) => {
  if (!month || !year) {
    // Return all days if month/year not selected
    return Array.from({length: 31}, (_, i) => ({
      value: i + 1,
      label: i + 1
    }));
  }
  
  const maxDays = getDaysInMonth(month, year);
  return Array.from({length: maxDays}, (_, i) => ({
    value: i + 1,
    label: i + 1
  }));
};

/**
 * Validate complete birth date
 */
const validateBirthDate = (day, month, year) => {
  // Check if all fields are provided
  if (!day || !month || !year) {
    return {
      success: false,
      message: 'Please select your complete date of birth'
    };
  }
  
  // Check if date is valid
  if (!isValidDate(day, month, year)) {
    return {
      success: false,
      message: 'Please select a valid date'
    };
  }
  
  // Check if user meets minimum age
  if (!isMinimumAge(day, month, year)) {
    return {
      success: false,
      message: 'You must be at least 13 years old'
    };
  }
  
  // Check if date is not in the future
  const selectedDate = new Date(year, month - 1, day);
  const today = new Date();
  if (selectedDate > today) {
    return {
      success: false,
      message: 'Birth date cannot be in the future'
    };
  }
  
  return {
    success: true,
    message: 'Valid birth date'
  };
};

// ===== HELPER FUNCTIONS FOR OPTIONS =====

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

// Export validation function for use in other components
export { validateBirthDate };

const DateButton = ({ 
  placeholder = "Select", 
  value, 
  onChange, 
  options = [], 
  name,
  className = "",
  selectedMonth = null,
  selectedYear = null,
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

  // For day selection, filter options based on selected month and year
  const filteredOptions = name === 'day' && selectedMonth && selectedYear 
    ? getValidDaysForMonth(selectedMonth, selectedYear)
    : options;
  
  const selectedOption = filteredOptions.find(option => option.value == value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;
  
  // Auto-adjust selected day if it's invalid for the current month/year
  useEffect(() => {
    if (name === 'day' && value && selectedMonth && selectedYear) {
      const validDays = getValidDaysForMonth(selectedMonth, selectedYear);
      const isValidDay = validDays.some(day => day.value == value);
      
      if (!isValidDay) {
        // Reset day if it's invalid for the selected month/year
        const syntheticEvent = {
          target: { name, value: '' }
        };
        onChange(syntheticEvent);
      }
    }
  }, [selectedMonth, selectedYear, value, name, onChange]);
  
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
          {filteredOptions.map((option, index) => (
            <div
              key={index}
              onClick={() => handleSelect(option.value)}
              className={`px-4 py-2 cursor-pointer transition-colors hover:bg-gray-50 text-gray-700 ${
                option.value == value ? 'bg-blue-50 text-blue-600' : ''
              } ${index === 0 ? 'rounded-t-lg' : ''} ${index === filteredOptions.length - 1 ? 'rounded-b-lg' : ''}`}
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
