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
      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400 bg-white ${className}`}
      {...props}
    />
  )
}

export default InputField;