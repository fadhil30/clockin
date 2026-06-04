import React from 'react';

const variantClasses = {
  success: 'bg-[#E7F6EC] text-[#0A7A3C] border border-[#BFE6CC]',
  info: 'bg-[#E8F0FF] text-[#1D5FD0] border border-[#C5DBFB]',
  warning: 'bg-[#FEF3DD] text-[#9A6700] border border-[#FBE3AE]',
  danger: 'bg-[#FCE9EA] text-[#B81722] border border-[#F5C5C8]',
  neutral: 'bg-[#F1EEF6] text-[#6B6480] border border-[#E4DCEF]',
  brand: 'bg-primary-50 text-primary border border-primary-100',
  accent: 'bg-accent-soft text-accent-foreground border border-accent/20',
  green: 'bg-[#E7F6EC] text-[#0A7A3C] border border-[#BFE6CC]',
  gray: 'bg-[#F1EEF6] text-[#6B6480] border border-[#E4DCEF]',
  blue: 'bg-[#E8F0FF] text-[#1D5FD0] border border-[#C5DBFB]',
  red: 'bg-[#FCE9EA] text-[#B81722] border border-[#F5C5C8]',
  amber: 'bg-[#FEF3DD] text-[#9A6700] border border-[#FBE3AE]',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof variantClasses;
  dot?: boolean;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', dot = false, size = 'sm' }) => (
  <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'} ${variantClasses[variant]}`}>
    {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
    {children}
  </span>
);
