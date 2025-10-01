
import React, { useState } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (apiKey: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave }) => {
  const [key, setKey] = useState('');

  const handleSaveClick = () => {
    if (key.trim()) {
      onSave(key.trim());
    }
  };
  
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-[100] p-4 transition-opacity duration-300"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-gray-900/70 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-md text-white transform transition-all flex flex-col"
      >
        <header className="p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-center">Gemini API Key Required</h2>
        </header>
        
        <div className="p-6 space-y-4">
          <p className="text-gray-300 text-sm text-center">
            Please enter your Google Gemini API key to use the app.
            Your key is stored only on this device and is never shared.
          </p>
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-2">API Key</label>
            <input 
              id="apiKey" 
              type="password" 
              value={key} 
              onChange={e => setKey(e.target.value)} 
              placeholder="Enter your API key here" 
              className="w-full bg-black/30 border border-white/20 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="block text-center text-sm text-blue-400 hover:underline">
            Get an API Key from Google AI Studio
          </a>
          <div className="pt-4 flex justify-end">
            <button 
              onClick={handleSaveClick} 
              disabled={!key.trim()} 
              className="w-full px-6 py-2.5 rounded-lg bg-blue-600 font-semibold hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
            >
              Save and Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
