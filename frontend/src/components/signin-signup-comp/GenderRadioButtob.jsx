import React from 'react'

const GenderRadioButton = ({ 
  value, 
  onChange, 
  name = "gender",
  className = "",
  options = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ],
  ...props 
}) => {
  
  return (
    <div className={`flex gap-3 ${className}`} {...props}>
      {options.map((option, index) => (
        <label 
          key={index}
          className="flex items-center justify-between cursor-pointer group flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {/* Label text */}
          <span className={`
            text-sm transition-colors duration-200
            ${value === option.value 
              ? 'text-gray-900 font-medium' 
              : 'text-gray-600'
            }
          `}>
            {option.label}
          </span>
          
          <div className="relative ml-2">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className="sr-only" // Hide default radio button
            />
            
            {/* Custom radio button */}
            <div className={`
              w-4 h-4 rounded-full border transition-all duration-200 bg-white
              ${value === option.value 
                ? 'border-gray-800' 
                : 'border-gray-300 group-hover:border-gray-400'
              }
            `}>
              {/* Inner dot when selected - outline style */}
              {value === option.value && (
                <div className="w-2 h-2 rounded-full bg-gray-800 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              )}
            </div>
          </div>
        </label>
      ))}
    </div>
  )
}

export default GenderRadioButton;
