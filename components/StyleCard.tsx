import React from 'react';
import { Style } from '../types';

interface StyleCardProps {
  style: Style;
  isSelected: boolean;
  onSelect: (style: Style) => void;
  onEdit: (style: Style) => void;
  onDelete: (name: string) => void;
}

const StyleCard: React.FC<StyleCardProps> = ({ style, isSelected, onSelect, onEdit, onDelete }) => {
  const selectedClasses = isSelected ? 'ring-2 ring-blue-400 shadow-lg shadow-blue-400/50' : 'ring-1 ring-white/10';
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent onSelect from firing when edit is clicked
    onEdit(style);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(style.name);
  }
  
  return (
    <div
      className={`relative group aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 ${selectedClasses}`}
      onClick={() => onSelect(style)}
    >
      <img src={style.imageUrl} alt={style.name} className="w-full h-full object-cover" loading="lazy" />

      {/* Local style indicator */}
      {style.isLocal && (
        <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm p-1.5 rounded-full text-white" title="Locally saved style">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Action buttons - appear on group hover */}
      <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button 
          onClick={handleEditClick}
          className="bg-black/40 backdrop-blur-sm p-1.5 rounded-full text-white hover:bg-black/70 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label={`Edit ${style.name} style`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
          </svg>
        </button>
        {style.isLocal && (
          <button 
            onClick={handleDeleteClick}
            className="bg-red-600/70 backdrop-blur-sm p-1.5 rounded-full text-white hover:bg-red-500 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label={`Delete ${style.name} style`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default StyleCard;
