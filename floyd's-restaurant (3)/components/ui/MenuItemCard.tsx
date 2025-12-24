import React, { useContext, useState } from 'react';
import { MenuItem } from '../../types';
import { PlusIcon } from '../icons/PlusIcon';
import { HeartIcon } from '../icons/HeartIcon';
import { AppContext } from '../../state/AppContext';
import { CheckIcon } from '../icons/CheckIcon';

interface MenuItemCardProps {
  item: MenuItem;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = React.memo(({ item }) => {
  const { state, addToCart, toggleFavorite } = useContext(AppContext);
  const { favoriteItemIds } = state;
  const isFavorite = favoriteItemIds.includes(item.id);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(item);
    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  const handleToggleFavorite = () => {
    toggleFavorite(item.id);
  };

  return (
    <div className="group bg-[#121212] rounded-2xl overflow-hidden border border-white/5 hover:border-green-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-green-900/10 flex flex-col h-full transform translate-z-0">
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-800">
        <img 
          src={item.imageUrl} 
          alt={item.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
        <button
          onClick={handleToggleFavorite}
          className="absolute top-3 right-3 p-2.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-black/60 hover:text-red-400 focus:outline-none transition-all duration-200 active:scale-95"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <HeartIcon isFilled={isFavorite} />
        </button>
      </div>
      
      <div className="p-5 flex flex-col flex-grow relative">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="text-lg font-bold text-white leading-tight tracking-tight">{item.name}</h3>
          <span className="shrink-0 bg-green-500/10 text-green-400 font-bold px-2 py-1 rounded-md text-sm border border-green-500/20">
            Nrs. {item.price.toFixed(0)}
          </span>
        </div>
        
        <p className="text-neutral-400 text-sm mb-6 flex-grow line-clamp-3 leading-relaxed">
          {item.description}
        </p>
        
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className={`mt-auto w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#121212] transition-all duration-300 flex items-center justify-center transform active:scale-[0.98] ${
            isAdding
              ? 'bg-green-600 text-white cursor-not-allowed shadow-inner'
              : 'bg-green-500 text-black hover:bg-green-400 shadow-lg shadow-green-500/20 hover:shadow-green-500/30'
          }`}
        >
          {isAdding ? (
            <>
              <CheckIcon />
              <span className="ml-2">Added</span>
            </>
          ) : (
            <>
              <PlusIcon />
              <span className="ml-2">Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
});