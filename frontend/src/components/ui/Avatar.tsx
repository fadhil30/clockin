import React from 'react';

const PALETTE = [
  'bg-primary text-white',
  'bg-primary-500 text-white',
  'bg-primary-400 text-white',
  'bg-accent text-white',
  'bg-accent-strong text-white',
  'bg-success text-white',
  'bg-info text-white',
];

function pickColor(name: string) {
  const idx = name.split('').reduce((s, c) => s + c.charCodeAt(0), 0) % PALETTE.length;
  return PALETTE[idx];
}

function getInitials(name: string) {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

interface AvatarProps {
  name: string;
  size?: number;
  ring?: boolean;
  src?: string | null;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 40, ring = false, src, className = '' }) => {
  const ringClass = ring ? 'ring-2 ring-white ring-offset-2' : '';
  const color = pickColor(name);

  const base = `flex shrink-0 items-center justify-center rounded-full font-bold text-sm ${color} ${ringClass} ${className}`;

  if (src) {
    return <img src={src} alt={name} className={`${base} object-cover`} style={{ width: size, height: size }} />;
  }

  return (
    <div className={base} style={{ width: size, height: size }}>
      <span style={{ fontSize: Math.max(10, size * 0.35) }}>{getInitials(name)}</span>
    </div>
  );
};
