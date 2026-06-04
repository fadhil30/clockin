import React from 'react';

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeMap = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return <div className={`animate-spin rounded-full border-4 border-primary-200 border-t-primary ${sizeMap[size]}`} />;
};
