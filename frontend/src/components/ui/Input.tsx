import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
      ) : null}
      <input
        id={id}
        ref={ref}
        {...props}
        className={`rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
        } ${className}`}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  ),
);
Input.displayName = 'Input';
