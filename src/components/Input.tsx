import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Add any additional props specific to our Input component
}

export default function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`w-full border border-gray-300 h-8 rounded-md p-3 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-[--excali-purple] focus:border-[--excali-purple] hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    />
  );
} 