import React from 'react';

const variantClasses = {
  green: 'bg-green-100 text-green-800',
  gray: 'bg-gray-100 text-gray-700',
  blue: 'bg-blue-100 text-blue-800',
  red: 'bg-red-100 text-red-700',
  amber: 'bg-amber-100 text-amber-800',
};

interface BadgeProps { children: React.ReactNode; variant?: keyof typeof variantClasses; }

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'gray' }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]}`}>
    {children}
  </span>
);
