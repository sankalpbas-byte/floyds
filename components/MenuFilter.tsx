import React from 'react';

interface MenuFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const MenuFilter: React.FC<MenuFilterProps> = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div className="mb-8 flex justify-center flex-wrap gap-2">
      {categories.map(category => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`px-4 py-2 rounded-full font-medium text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-green-400 ${
            selectedCategory === category
              ? 'bg-green-500 text-black font-bold shadow-lg shadow-green-500/20'
              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};