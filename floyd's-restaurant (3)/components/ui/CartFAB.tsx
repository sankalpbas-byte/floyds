import React from 'react';
import { ShoppingCartIcon } from '../icons/ShoppingCartIcon';

interface CartFABProps {
  itemCount: number;
  onClick: () => void;
}

export const CartFAB: React.FC<CartFABProps> = ({ itemCount, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 z-10 bg-green-500 text-black p-4 rounded-full shadow-lg hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-green-400 transition-transform transform hover:scale-110 duration-200"
      aria-label={`View cart with ${itemCount} items`}
    >
      <ShoppingCartIcon />
      <span className="absolute -top-1 -right-1 block h-6 w-6 rounded-full bg-red-500 text-white font-bold text-xs flex items-center justify-center border-2 border-green-500">
        {itemCount}
      </span>
    </button>
  );
};
