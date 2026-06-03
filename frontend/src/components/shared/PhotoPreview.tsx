import React from 'react';

interface PhotoPreviewProps { src: string; onRemove?: () => void; className?: string; }

export const PhotoPreview: React.FC<PhotoPreviewProps> = ({ src, onRemove, className = '' }) => (
  <div className={`relative inline-block ${className}`}>
    <img src={src} alt="WFH proof" className="h-40 w-full rounded-lg object-cover" />
    {onRemove ? (
      <button type="button" onClick={onRemove}
        className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white hover:bg-red-700">✕</button>
    ) : null}
  </div>
);
