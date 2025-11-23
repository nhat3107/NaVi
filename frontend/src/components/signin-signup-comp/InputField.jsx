import React from 'react'

const InputField = ({ 
  type = "text", 
  placeholder = "", 
  value, 
  onChange, 
  name,
  className = "",
  ...props 
}) => {
  
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      name={name}
      className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 ${className}`}
      {...props}
    />
  )
}

export default InputField;