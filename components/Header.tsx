import React from 'react';
import { UserIcon } from './icons/UserIcon';

interface HeaderProps {
  title: string;
  onProfileClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onProfileClick }) => {
  return (
    <header className="bg-black/80 backdrop-blur-sm sticky top-0 z-10 border-b border-green-500/30">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="w-8"></div>
        <h1 className="text-2xl font-bold text-white text-center">
          {title}
        </h1>
        {onProfileClick ? (
          <button 
            onClick={onProfileClick} 
            className="text-gray-200 hover:text-green-400 transition-colors duration-200 p-1 rounded-full"
            aria-label="Open Profile"
          >
            <UserIcon />
          </button>
        ) : (
          <div className="w-8"></div>
        )}
      </div>
    </header>
  );
};
