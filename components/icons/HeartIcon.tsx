import React from 'react';

interface HeartIconProps {
  isFilled?: boolean;
}

export const HeartIcon: React.FC<HeartIconProps> = ({ isFilled }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className="h-6 w-6" 
    fill={isFilled ? 'currentColor' : 'none'} 
    viewBox="0 0 24 24" 
    stroke="currentColor"
    strokeWidth={isFilled ? 0 : 2}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 21l-7.682-7.682a4.5 4.5 0 010-6.364z" 
    />
  </svg>
);