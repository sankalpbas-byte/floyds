import React, { useState, useMemo, useContext } from 'react';
import { AppContext } from '../../state/AppContext';
import { CATEGORIES } from '../../constants';
import { MenuFilter } from '../ui/MenuFilter';
import { MenuItemCard } from '../ui/MenuItemCard';
import { MenuItem } from '../../types';

export const MenuView: React.FC = () => {
  const { state } = useContext(AppContext);
  const { menuItems } = state;
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredMenuItems = useMemo(() => {
    if (selectedCategory === 'All') {
      return menuItems;
    }
    return menuItems.filter(item => item.category === selectedCategory);
  }, [selectedCategory, menuItems]);

  return (
    <>
      <MenuFilter 
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      {menuItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-neutral-500">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-4"></div>
           <p>Loading menu...</p>
        </div>
      ) : (
        /* content-visibility-auto class added in index.html for performance on large lists */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 content-visibility-auto">
          {filteredMenuItems.map(item => (
            <MenuItemCard 
              key={item.id} 
              item={item} 
            />
          ))}
        </div>
      )}
    </>
  );
};

export default MenuView;