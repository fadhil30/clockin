import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'dangerGhost' | 'soft';
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const variantClasses = {
  primary: 'bg-primary text-white hover:bg-primary-600 disabled:bg-primary-300 focus:ring-primary',
  secondary: 'bg-muted text-foreground hover:bg-primary-100 disabled:bg-muted focus:ring-primary',
  accent: 'bg-accent text-white hover:bg-accent-strong disabled:opacity-60 focus:ring-accent',
  outline: 'border border-primary text-primary bg-transparent hover:bg-primary-50 disabled:opacity-50 focus:ring-primary',
  ghost: 'bg-transparent text-foreground hover:bg-muted disabled:opacity-50 focus:ring-primary',
  danger: 'bg-destructive text-white hover:opacity-90 disabled:opacity-50 focus:ring-destructive',
  dangerGhost: 'bg-transparent text-destructive hover:bg-red-50 disabled:opacity-50 focus:ring-destructive',
  soft: 'bg-primary-50 text-primary hover:bg-primary-100 disabled:opacity-50 focus:ring-primary',
};

const sizeClasses = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-[54px] px-6 text-base',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary', size = 'md', loading = false, disabled, children, className = '', ...props
}) => (
  <button
    {...props}
    disabled={disabled || loading}
    className={`inline-flex items-center justify-center gap-2 rounded-sm font-semibold transition-all active:translate-y-px active:scale-[.99] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
  >
    {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
    {children}
  </button>
);
