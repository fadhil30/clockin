import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leadingIcon?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', leadingIcon, suffix, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label ? (
        <label htmlFor={id} className="text-[13px] font-semibold text-foreground">{label}</label>
      ) : null}
      <div className="relative flex items-center">
        {leadingIcon ? (
          <span className="pointer-events-none absolute left-3 text-muted-foreground">{leadingIcon}</span>
        ) : null}
        <input
          id={id}
          ref={ref}
          {...props}
          className={`h-[46px] w-full rounded-sm border bg-white px-3 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-[3.5px] focus:ring-primary/25 focus:border-primary ${
            error ? 'border-destructive bg-red-50' : 'border-border'
          } ${leadingIcon ? 'pl-10' : ''} ${suffix ? 'pr-10' : ''} ${className}`}
        />
        {suffix ? (
          <span className="absolute right-3">{suffix}</span>
        ) : null}
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  ),
);
Input.displayName = 'Input';
