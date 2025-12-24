import React from 'react';
import { HomeIcon } from './icons/HomeIcon';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';
import { InfoIcon } from './icons/InfoIcon';

type View = 'menu' | 'cart' | 'profile' | 'confirmation' | 'about' | 'orders';

interface BottomNavProps {
  activeView: View;
  cartItemCount: number;
  onMenuClick: () => void;
  onCartClick: () => void;
  onAboutClick: () => void;
}

const NavButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  badgeCount?: number;
}> = ({ label, icon, isActive, onClick, badgeCount }) => {
  const activeClass = isActive ? 'text-green-400' : 'text-gray-400';

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center w-full pt-2 pb-1 focus:outline-none transition-colors duration-200 ${activeClass} hover:text-green-300`}
      aria-label={`Go to ${label}`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
      {badgeCount !== undefined && badgeCount > 0 && (
         <span className="absolute top-1 right-1/2 translate-x-[22px] block h-5 w-5 rounded-full bg-green-500 text-black font-bold text-xs flex items-center justify-center border-2 border-black">
            {badgeCount}
         </span>
      )}
    </button>
  );
};


export const BottomNav: React.FC<BottomNavProps> = ({
  activeView,
  cartItemCount,
  onMenuClick,
  onCartClick,
  onAboutClick
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black z-20 border-t border-neutral-800">
      <div className="container mx-auto px-4 h-16 flex justify-around items-center">
        <NavButton 
            label="Menu"
            icon={<HomeIcon />}
            isActive={activeView === 'menu' || activeView === 'confirmation'}
            onClick={onMenuClick}
        />
        <NavButton
            label="About"
            icon={<InfoIcon />}
            isActive={activeView === 'about'}
            onClick={onAboutClick}
        />
        <NavButton 
            label="Cart"
            icon={<ShoppingCartIcon />}
            isActive={activeView === 'cart'}
            onClick={onCartClick}
            badgeCount={cartItemCount}
        />
      </div>
    </nav>
  );
};