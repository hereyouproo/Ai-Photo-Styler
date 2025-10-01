
import React, { useState, useEffect } from 'react';
import { Style } from '../types';

interface StyleEditorModalProps {
  isOpen: boolean;
  editingStyle: Style | null;
  onClose: () => void;
  onSave: (style: Style, editingStyle: Style | null) => void;
}

const StyleEditorModal: React.FC<StyleEditorModalProps> = ({ isOpen, editingStyle, onClose, onSave }) => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingStyle) {
        setPrompt(editingStyle.prompt);
        setImageUrl(editingStyle.imageUrl);
        setCategory(editingStyle.category || '');
      } else {
        // Reset for "Add New"
        setPrompt('');
        setImageUrl('');
        setCategory('');
      }
    }
  }, [isOpen, editingStyle]);

  const handleSave = () => {
    if (prompt.trim() && imageUrl.trim() && category.trim()) {
      onSave({
        name: prompt.trim(), // Name is derived from prompt
        prompt: prompt.trim(),
        imageUrl: imageUrl.trim(),
        category: category.trim(),
      }, editingStyle);
      onClose();
    }
  };

  if (!isOpen) return null;
  
  const isSaveDisabled = !prompt.trim() || !imageUrl.trim() || !category.trim();
  const modalTitle = editingStyle ? 'Edit Style' : 'Add New Style';

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-gray-900/70 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-md text-white transform transition-all flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-xl font-bold">{modalTitle}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 -mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </header>
        
        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
            <input id="imageUrl" type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/image.png" className="w-full bg-black/30 border border-white/20 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="w-full aspect-video bg-black/20 rounded-lg flex items-center justify-center overflow-hidden border border-white/10">
            {imageUrl ? <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" /> : <p className="text-gray-500 text-sm">Image Preview</p>}
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <input id="category" type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g., men, women, two people" className="w-full bg-black/30 border border-white/20 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">Prompt</label>
            <textarea id="prompt" rows={4} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="e.g., A vibrant oil painting of..." className="w-full bg-black/30 border border-white/20 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none custom-scrollbar" />
            <p className="text-xs text-gray-500 mt-1">The prompt is also used as the unique style name.</p>
          </div>
          <div className="pt-4 flex justify-end gap-4">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">Cancel</button>
            <button onClick={handleSave} disabled={isSaveDisabled} className="px-6 py-2 rounded-lg bg-blue-600 font-semibold hover:bg-blue-700 disabled:bg-gray-700">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleEditorModal;
