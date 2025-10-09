import React from 'react'

const Button = ({children, onClick, disabled, loading, type}) => {
  return (
    <button 
      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      type={type}
      >
          {children}
    </button>
    
  )
}

export default Button;