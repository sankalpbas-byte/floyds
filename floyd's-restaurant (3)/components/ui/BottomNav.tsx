import React, { useContext } from 'react';
import { HomeIcon } from '../icons/HomeIcon';
import { ShoppingCartIcon } from '../icons/ShoppingCartIcon';
import { InfoIcon } from '../icons/InfoIcon';
import { AppContext } from '../../state/AppContext';
import { View } from '../../types';

interface NavButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  badgeCount?: number;
}

const NavButton: React.FC<NavButtonProps> = ({ label, icon, isActive, onClick, badgeCount }) => {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center justify-center w-full pt-3 pb-2 focus:outline-none group"
      aria-label={`Go to ${label}`}
    >
      <div className={`transition-all duration-300 transform group-active:scale-90 ${isActive ? 'text-green-400 -translate-y-1' : 'text-neutral-500 group-hover:text-neutral-300'}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-medium mt-1 transition-colors duration-300 ${isActive ? 'text-green-400 opacity-100' : 'text-neutral-500 opacity-0 group-hover:opacity-100'}`}>
        {label}
      </span>
      {isActive && (
        <span className="absolute bottom-1 w-1 h-1 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
      )}
      {badgeCount !== undefined && badgeCount > 0 && (
         <span className="absolute top-2 right-[calc(50%-12px)] flex h-5 w-5 rounded-full bg-red-500 text-white font-bold text-[10px] items-center justify-center border-2 border-[#121212] shadow-sm animate-bounce">
            {badgeCount}
         </span>
      )}
    </button>
  );
};

export const BottomNav: React.FC = React.memo(() => {
  const { state, setView } = useContext(AppContext);
  const { view, cartItems } = state;
  
  const handleNavClick = (targetView: View) => {
    setView(targetView);
  };

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
        {/* Gradient Fade for content underneath */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none"></div>
        
        {/* Glass Container */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#050505]/80 backdrop-blur-xl border-t border-white/5 pb-safe">
            <div className="container mx-auto px-4 h-16 flex justify-around items-center">
                <NavButton 
                    label="Menu"
                    icon={<HomeIcon />}
                    isActive={view === 'menu' || view === 'confirmation' || view === 'home'}
                    onClick={() => handleNavClick('menu')}
                />
                <NavButton
                    label="About"
                    icon={<InfoIcon />}
                    isActive={view === 'about'}
                    onClick={() => handleNavClick('about')}
                />
                <NavButton 
                    label="Cart"
                    icon={<ShoppingCartIcon />}
                    isActive={view === 'cart'}
                    onClick={() => handleNavClick('cart')}
                    badgeCount={cartItemCount}
                />
            </div>
        </div>
    </nav>
  );
});