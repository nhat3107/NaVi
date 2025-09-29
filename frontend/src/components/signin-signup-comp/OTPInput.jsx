import React, { useState, useRef, useEffect } from 'react';

const OTPInput = ({ length = 6, onComplete, disabled = false }) => {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const inputRefs = useRef([]);

  useEffect(() => {
    // Auto focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    console.log(`handleChange called: index=${index}, value="${value}"`); // Debug log
    
    // Handle case where user types multiple characters (like paste)
    if (value.length > 1) {
      // Take only the last character
      value = value.slice(-1);
    }
    
    // Only allow numbers or empty string
    if (value && !/^\d$/.test(value)) {
      console.log(`Invalid value: "${value}"`); // Debug log
      return;
    }

    const newOtp = [...otp];
    const oldValue = newOtp[index];
    
    // Only update if the value is actually different
    if (oldValue !== value) {
      console.log(`Updating index ${index}: "${oldValue}" -> "${value}"`); // Debug log
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto focus next input only if we just entered a digit (not clearing)
      if (value && index < length - 1) {
        // Use setTimeout with shorter delay and more defensive programming
        setTimeout(() => {
          const nextInput = inputRefs.current[index + 1];
          if (nextInput && nextInput !== document.activeElement) {
            // Ensure next input is completely clean before focusing
            nextInput.value = '';
            nextInput.focus();
          }
        }, 0); // Use 0ms delay - just defer to next event loop tick
      }

      // Call onComplete when all fields are filled
      if (newOtp.every(digit => digit !== '') && onComplete) {
        console.log(`Calling onComplete with: "${newOtp.join('')}"`); // Debug log
        onComplete(newOtp.join(''));
      }
    } else {
      console.log(`No change needed for index ${index}: "${value}"`); // Debug log
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      e.preventDefault(); // Prevent default behavior
      const newOtp = [...otp];
      
      if (otp[index]) {
        // Clear current input if it has value
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        // Focus previous input and clear it if current is empty
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
    
    // Handle delete key
    if (e.key === 'Delete') {
      e.preventDefault();
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const pasteArray = paste.replace(/\D/g, '').split('').slice(0, length);
    
    if (pasteArray.length > 0) {
      const newOtp = Array(length).fill('');
      pasteArray.forEach((digit, index) => {
        newOtp[index] = digit;
      });
      setOtp(newOtp);
      
      // Focus next empty input or last input
      const nextEmptyIndex = newOtp.findIndex(digit => digit === '');
      const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
      inputRefs.current[focusIndex]?.focus();
      
      // Call onComplete if all filled
      if (newOtp.every(digit => digit !== '') && onComplete) {
        onComplete(newOtp.join(''));
      }
    }
  };

  // Method to clear OTP when needed
  const clearOTP = () => {
    setOtp(Array(length).fill(''));
    inputRefs.current[0]?.focus();
  };
  
  // Clear OTP when disabled prop changes (for external reset)
  useEffect(() => {
    if (disabled) {
      // Don't clear automatically when disabled
      return;
    }
  }, [disabled]);

  return (
    <div className="flex justify-center space-x-2 mb-6">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={el => inputRefs.current[index] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          className={`
            w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg
            ${disabled 
              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:outline-none hover:border-gray-400'
            }
            transition-colors duration-200
          `}
          autoComplete="off"
        />
      ))}
    </div>
  );
};

export default OTPInput;
