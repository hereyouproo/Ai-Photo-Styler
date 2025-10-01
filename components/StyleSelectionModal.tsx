import React, { useState, useEffect, useMemo } from 'react';
import { Style } from '../types';
import StyleCard from './StyleCard';

interface StyleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  styles: Style[];
  selectedStyleName: string | null;
  onSelect: (style: Style) => void;
  onEdit: (style: Style) => void;
  onDelete: (name: string) => void;
  onAddNew: () => void;
}

const StyleSelectionModal: React.FC<StyleSelectionModalProps> = ({ isOpen, onClose, styles, selectedStyleName, onSelect, onEdit, onDelete, onAddNew }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset view when modal is closed
      const timer = setTimeout(() => setSelectedCategory(null), 300); // delay to allow for closing animation
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const { categories, categoryImages } = useMemo(() => {
    const uniqueCategories = [...new Set(styles.map(s => String(s.category || 'Uncategorized')))].sort();
    // FIX: Explicitly type `category` as a string to prevent it from being inferred as `unknown`, which cannot be used as an index type.
    const images = uniqueCategories.reduce((acc, category: string) => {
      const firstStyle = styles.find(s => s.category === category);
      acc[category] = firstStyle?.imageUrl || '';
      return acc;
    }, {} as Record<string, string>);
    return { categories: uniqueCategories, categoryImages: images };
  }, [styles]);

  const stylesForCategory = styles.filter(s => s.category === selectedCategory);
  
  const handleClose = () => {
    setSelectedCategory(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300"
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-gray-900/70 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl text-white transform transition-all flex flex-col h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            {selectedCategory && (
                <button onClick={() => setSelectedCategory(null)} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Back to categories">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </button>
            )}
            <h2 className="text-xl font-bold capitalize">{selectedCategory ? selectedCategory : 'Select a Category'}</h2>
          </div>

          <div className="flex items-center gap-4">
            <button 
                onClick={onAddNew} 
                className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                Add New Style
            </button>
            <button onClick={handleClose} className="p-2 rounded-full hover:bg-white/10 -mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
          </div>
        </header>
        
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {selectedCategory ? (
              // View for showing styles within a category
              <div key="styles-view" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {stylesForCategory.map(style => (
                  <StyleCard 
                    key={style.name} 
                    style={style} 
                    isSelected={selectedStyleName === style.name} 
                    onSelect={onSelect} 
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            ) : categories.length > 0 ? (
              // View for showing categories
              <div key="categories-view" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map(category => (
                  <div 
                    key={category} 
                    onClick={() => setSelectedCategory(category)} 
                    className="relative group aspect-video rounded-lg overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 ring-1 ring-white/10 hover:ring-2 hover:ring-blue-400"
                  >
                    <img src={categoryImages[category]} alt={category} className="w-full h-full object-cover blur-sm group-hover:blur-none transition-all duration-300" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
                        <h3 className="text-2xl font-bold text-white capitalize text-center">{category}</h3>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // View for when no styles are available
              <div key="no-styles-view" className="flex flex-col items-center justify-center h-full text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="font-semibold">No Styles Found</p>
                  <p className="text-sm">Click "Add New Style" to create your first one.</p>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
};

export default StyleSelectionModal;
