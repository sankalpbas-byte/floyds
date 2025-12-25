import React from 'react';
import { MenuItem } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { HeartIcon } from './icons/HeartIcon';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (itemId: number) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAddToCart, isFavorite, onToggleFavorite }) => {
  return (
    <div className="bg-neutral-900 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:border-green-500/50 flex flex-col border border-neutral-800">
      <div className="relative">
        <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover" />
        <button
          onClick={() => onToggleFavorite(item.id)}
          className="absolute top-3 right-3 p-2 bg-black/50 rounded-full text-white hover:text-red-400 focus:outline-none transition-all duration-200"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <HeartIcon isFilled={isFavorite} />
        </button>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-white">{item.name}</h3>
          <p className="text-lg font-bold text-green-400">Nrs. {item.price.toFixed(0)}</p>
        </div>
        <p className="text-gray-300 text-sm mb-4 flex-grow">{item.description}</p>
        <button
          onClick={() => onAddToCart(item)}
          className="mt-auto w-full bg-green-500 text-black py-2 px-4 rounded-lg font-bold hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-green-400 transition-colors duration-300 flex items-center justify-center"
        >
          <PlusIcon />
          <span className="ml-2">Add to Cart</span>
        </button>
      </div>
    </div>
  );
};
