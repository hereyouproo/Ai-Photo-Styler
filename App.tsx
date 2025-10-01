import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Style } from './types';
import { fetchStylesFromGoogleSheet } from './services/googleSheetsService';
import Spinner from './components/Spinner';
import StyleEditorModal from './components/StyleEditorModal';
import Uploader, { UploaderHandle } from './components/Uploader';
import StyleSelectionModal from './components/StyleSelectionModal';
import ApiKeyModal from './components/ApiKeyModal';

// --- Icon Components ---
const PhotoIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25-2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06l2.755-2.756a.75.75 0 011.06 0l3.001 3.002 4.06-4.06a.75.75 0 011.06 0l3.125 3.126V6H3v10.06z" clipRule="evenodd" /></svg>
);
const SparklesIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 8.25a1.75 1.75 0 100-3.5 1.75 1.75 0 000 3.5zM1.25 6.75a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5zM17.25 6.75a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5zM6.75 1.25a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5zM13.25 1.25a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5zM6.75 17.25a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5zM13.25 17.25a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5zM3.275 3.275a.75.75 0 00-1.06-1.06l-1.062 1.06a.75.75 0 001.06 1.06l1.06-1.06zM16.725 3.275a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 00-1.06 1.06l1.06 1.06zM3.275 16.725a.75.75 0 00-1.06 1.06l1.06 1.06a.75.75 0 001.06-1.06l-1.06-1.06zM16.725 16.725a.75.75 0 001.06 1.06l1.06-1.06a.75.75 0 00-1.06-1.06l-1.06 1.06z" /></svg>
);
const AddIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
);
const HistoryIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" /></svg>
);
const DownloadIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" /><path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" /></svg>
);
const EyeIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /><path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.18l.88-1.32a1.651 1.651 0 011.659-.92h12.992a1.651 1.651 0 011.659.92l.88 1.32a1.651 1.651 0 010 1.18l-.88 1.32a1.651 1.651 0 01-1.659.92H3.203a1.651 1.651 0 01-1.659-.92L.664 10.59zM10 14a4 4 0 100-8 4 4 0 000 8z" clipRule="evenodd" /></svg>
);
const KeyIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>
);

// --- Constants ---
const API_KEY_STORAGE_KEY = 'gemini-api-key';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type });
};

const App: React.FC = () => {
  // --- API Key and AI Client State ---
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const aiRef = useRef<GoogleGenAI | null>(null);

  // --- App State ---
  const [sourceFiles, setSourceFiles] = useState<File[]>([]);
  const [sourceImageUrls, setSourceImageUrls] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPromptFocused, setIsPromptFocused] = useState(false);
  const [styles, setStyles] = useState<Style[]>([]);
  const [selectedStyleName, setSelectedStyleName] = useState<string | null>(null);
  const [isStyleSelectionOpen, setIsStyleSelectionOpen] = useState(false);
  const [isStyleEditorOpen, setIsStyleEditorOpen] = useState(false);
  const [styleToEdit, setStyleToEdit] = useState<Style | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const uploaderRef = useRef<UploaderHandle>(null);
  const promptTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const LOCAL_STORAGE_KEY = 'ai-photo-styler-styles';

  // --- Effects ---
  useEffect(() => {
    // Load API Key from localStorage on initial mount
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      setIsApiKeyModalOpen(true);
    }
  }, []);

  useEffect(() => {
    // Initialize AI Client when API Key is available
    if (apiKey) {
      try {
        aiRef.current = new GoogleGenAI({ apiKey });
      } catch (e) {
        console.error("Failed to initialize GoogleGenAI:", e);
        setError("Invalid API Key format. Please enter a valid key.");
        localStorage.removeItem(API_KEY_STORAGE_KEY);
        setApiKey(null);
        setIsApiKeyModalOpen(true);
      }
    }
  }, [apiKey]);
  
  useEffect(() => {
    return () => { sourceImageUrls.forEach(URL.revokeObjectURL); };
  }, [sourceImageUrls]);

  useEffect(() => {
    const loadStyles = async () => {
      try {
        const localStylesData = localStorage.getItem(LOCAL_STORAGE_KEY);
        const parsedLocalStyles: Style[] = localStylesData ? JSON.parse(localStylesData) : [];
        const localStyles = parsedLocalStyles.map(s => ({ ...s, category: s.category || 'My Styles' }));
        
        const fetchedStyles = await fetchStylesFromGoogleSheet();
        const localStyleNames = new Set(localStyles.map(s => s.name));
        const uniqueFetchedStyles = fetchedStyles.filter(s => !localStyleNames.has(s.name));
        const combinedStyles = [...localStyles, ...uniqueFetchedStyles];
        setStyles(combinedStyles);
        
        const updatedLocalStyles = combinedStyles.filter(s => s.isLocal);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedLocalStyles));

      } catch (err) {
        setToastMessage("Could not load style templates.");
      }
    };
    loadStyles();
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    if (countdown > 0) {
      countdownTimerRef.current = window.setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => {
      if (countdownTimerRef.current) {
        window.clearTimeout(countdownTimerRef.current);
      }
    };
  }, [countdown]);

  // --- Handlers ---
  const handleSaveApiKey = (newKey: string) => {
    localStorage.setItem(API_KEY_STORAGE_KEY, newKey);
    setApiKey(newKey);
    setIsApiKeyModalOpen(false);
    setToastMessage("API Key saved!");
  };

  const handleNewSession = () => {
    sourceImageUrls.forEach(URL.revokeObjectURL);
    setSourceFiles([]); setSourceImageUrls([]);
    setHistory([]); setHistoryIndex(-1);
    setIsHistoryPanelOpen(false); setPrompt('');
    setError(null); setSelectedStyleName(null);
    setIsLoading(false); setToastMessage("New session started.");
  };

  const handleImageUpload = (files: FileList) => {
    const newFiles = Array.from(files);
    setSourceFiles(prev => [...prev, ...newFiles]);
    const newUrls = newFiles.map(file => URL.createObjectURL(file));
    setSourceImageUrls(prev => [...prev, ...newUrls]);
    setError(null);
  };

  const handleRemoveSourceImage = (index: number) => {
    URL.revokeObjectURL(sourceImageUrls[index]);
    setSourceFiles(prev => prev.filter((_, i) => i !== index));
    setSourceImageUrls(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleUseHistoryItemAsSource = async (index: number) => {
      if (index < 0 || !history[index]) return;
      const imageToUse = history[index];
      const newFile = await dataUrlToFile(imageToUse, `generated-source-${Date.now()}.png`);
      sourceImageUrls.forEach(URL.revokeObjectURL);
      setSourceFiles([newFile]);
      setSourceImageUrls([URL.createObjectURL(newFile)]);
      setHistory([]); setHistoryIndex(-1);
      setIsHistoryPanelOpen(false); setError(null);
      setToastMessage("Image from history set as new source.");
  };
  
  const handleDownload = () => {
      if (historyIndex < 0 || !history[historyIndex]) return;
      const link = document.createElement('a');
      link.href = history[historyIndex];
      link.download = `ai-styler-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setToastMessage("Image downloaded.");
  };

  const handleStyleSelect = (style: Style) => {
    setPrompt(style.prompt); setSelectedStyleName(style.name);
    setIsStyleSelectionOpen(false);
  };
  
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if(selectedStyleName && styles.find(s => s.name === selectedStyleName)?.prompt !== e.target.value) {
        setSelectedStyleName(null);
    }
  }

  const handlePromptFocus = () => {
    setIsPromptFocused(true);
    // On mobile devices, the virtual keyboard can take a moment to appear.
    // A short timeout ensures the layout has adjusted before we scroll the input into view.
    setTimeout(() => {
      promptTextAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 300);
  };

  const handleGenerate = async () => {
    if (!aiRef.current) {
        setToastMessage("API Client not initialized. Please set your API Key.");
        setIsApiKeyModalOpen(true);
        return;
    }
    if (sourceFiles.length === 0 && !prompt.trim()) {
      setToastMessage("Please upload an image or enter a prompt.");
      return;
    }

    setIsLoading(true); setError(null);

    try {
      if (sourceFiles.length > 0) {
        const imageParts = await Promise.all(sourceFiles.map(async (file) => {
            const base64Data = await fileToBase64(file);
            return { inlineData: { data: base64Data, mimeType: file.type } };
        }));
        const contents = {
          parts: [...imageParts, { text: prompt.trim() || 'Subtly enhance the image(s).' }],
        };
        const response = await aiRef.current.models.generateContent({
          model: 'gemini-2.5-flash-image-preview',
          contents,
          config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
        });
        
        const candidate = response.candidates?.[0];
        if (!candidate || !candidate.content || !candidate.content.parts) {
          let errorMessage = "The model did not return a valid response. This might be due to safety filters or an invalid prompt.";
          if (candidate?.finishReason) errorMessage = `Generation failed. Reason: ${candidate.finishReason}. Please adjust your prompt or image.`;
          throw new Error(errorMessage);
        }

        const imagePart = candidate.content.parts.find(p => p.inlineData);
        if (imagePart?.inlineData) {
          const newImage = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
          const newHistory = [...history.slice(0, historyIndex + 1), newImage];
          setHistory(newHistory); setHistoryIndex(newHistory.length - 1);
        } else {
          const textPart = candidate.content.parts.find(p => p.text);
          throw new Error(textPart?.text || "The model did not return an image. This could be due to safety filters.");
        }
      } else {
        const response = await aiRef.current.models.generateImages({
            model: 'imagen-4.0-generate-001', prompt: prompt.trim(),
            config: { numberOfImages: 1, outputMimeType: 'image/png', aspectRatio: '1:1' },
        });
        
        if (response.generatedImages?.[0]?.image?.imageBytes) {
            const newImage = `data:image/png;base64,${response.generatedImages[0].image.imageBytes}`;
            const newHistory = [...history.slice(0, historyIndex + 1), newImage];
            setHistory(newHistory); setHistoryIndex(newHistory.length - 1);
        } else {
            throw new Error("The model did not return an image. This might be due to safety filters or an invalid prompt.");
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred.";
      const isRateLimitError = (err instanceof Error && (
        err.message.includes('429') || 
        err.message.toLowerCase().includes('quota') || 
        err.message.toLowerCase().includes('resource_exhausted')
      ));

      if (isRateLimitError) {
        let retryDelay = 30; // Default wait time in seconds
        try {
          const jsonStringMatch = message.match(/{.*}/s);
          if (jsonStringMatch) {
            const errorDetails = JSON.parse(jsonStringMatch[0]);
            const retryInfo = errorDetails.error?.details?.find(
              (d: any) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
            );
            if (retryInfo && retryInfo.retryDelay) {
              const delaySeconds = parseInt(retryInfo.retryDelay.replace('s', ''), 10);
              if (!isNaN(delaySeconds) && delaySeconds > 0) {
                  retryDelay = delaySeconds;
              }
            }
          }
        } catch (e) {
          console.warn("Could not parse retry delay from the error message. Defaulting.", e);
        }
        
        setError(`Rate limit reached. Please wait ${retryDelay}s before trying again.`);
        setCountdown(retryDelay);
        setToastMessage(`Please wait ${retryDelay}s`);

      } else if (message.toLowerCase().includes('api key not valid')) {
        setError("Your API Key is invalid or has been revoked. Please enter a valid one.");
        localStorage.removeItem(API_KEY_STORAGE_KEY);
        setApiKey(null); setIsApiKeyModalOpen(true);
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenStyleEditor = (style: Style | null) => {
    setStyleToEdit(style); setIsStyleSelectionOpen(false); setIsStyleEditorOpen(true);
  };
  
  const handleSaveStyle = (style: Style, editingStyle: Style | null) => {
    if (editingStyle) {
       setStyles(currentStyles => {
        const newStyles = currentStyles.map(s => s.name === editingStyle!.name ? {...style, isLocal: true} : s);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newStyles.filter(s => s.isLocal)));
        return newStyles;
      });
      setToastMessage("Style updated!");
    } else {
      if (styles.some(s => s.name === style.name)) {
        setToastMessage("A style with this prompt name already exists."); return;
      }
      const newStyle: Style = { ...style, isLocal: true };
      setStyles(currentStyles => {
        const newStyles = [newStyle, ...currentStyles];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newStyles.filter(s => s.isLocal)));
        return newStyles;
      });
      setToastMessage("New style added!");
    }
  };
  
  const handleDeleteStyle = (name: string) => {
    setStyles(currentStyles => {
        const newStyles = currentStyles.filter(s => s.name !== name);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newStyles.filter(s => s.isLocal)));
        return newStyles;
    });
    setToastMessage("Style deleted.");
  };
  
  const currentImageUrl = history[historyIndex] || null;
  const selectedStyle = styles.find(s => s.name === selectedStyleName);

  const CanvasContent = () => {
    if (isLoading) return <div className="flex flex-col items-center gap-4"><Spinner /><p className="text-gray-400">Generating...</p></div>;
    if (error) return (
      <div className="text-center text-red-400 p-4 max-w-md">
        <p className="font-bold mb-2">Generation Failed</p>
        <p className="text-sm">{error}</p>
      </div>
    );
    if (currentImageUrl) {
        const displayUrl = isComparing && sourceImageUrls.length > 0 ? sourceImageUrls[0] : currentImageUrl;
        return (
            <div className="relative w-full h-full flex items-center justify-center">
                <img src={displayUrl} alt={isComparing ? "Original source" : "Generated by AI"} className="max-w-full max-h-full object-contain rounded-lg transition-all duration-150" />
                {sourceImageUrls.length > 0 && (
                    <button
                        onMouseDown={() => setIsComparing(true)} onMouseUp={() => setIsComparing(false)}
                        onMouseLeave={() => setIsComparing(false)} onTouchStart={(e) => { e.preventDefault(); setIsComparing(true); }}
                        onTouchEnd={() => setIsComparing(false)} aria-label="Hold to compare with source image"
                        title="Hold to compare with source"
                        className="absolute bottom-4 p-3 rounded-full glassmorphism text-white hover:bg-white/20 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
                    >
                        <EyeIcon className="w-6 h-6" />
                    </button>
                )}
            </div>
        );
    }
    if (sourceImageUrls.length > 0) return <img src={sourceImageUrls[0]} alt="Source" className="max-w-full max-h-full object-contain rounded-lg" />;
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center text-gray-400 border-2 border-dashed border-gray-600 rounded-2xl p-8 cursor-pointer hover:bg-white/5 transition-colors">
          <PhotoIcon className="w-16 h-16 text-gray-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Upload Your Image</h2>
          <p className="max-w-sm">Click here or drag and drop an image to get started.</p>
      </div>
    );
  };
  
  return (
    <div className="h-dvh w-screen bg-[#121212] text-white flex flex-col antialiased overflow-hidden">
        <ApiKeyModal isOpen={isApiKeyModalOpen} onSave={handleSaveApiKey} />

        {apiKey ? (
            <>
                <main className="flex-1 relative flex items-center justify-center p-4 min-h-0">
                    <div className="absolute top-4 left-4 z-30 flex flex-col items-center gap-3">
                        <button onClick={handleNewSession} title="New Session" className="p-2 rounded-full glassmorphism text-white hover:bg-white/20 transition-colors" aria-label="Start new session">
                            <AddIcon className="w-6 h-6" />
                        </button>
                        <button onClick={() => setIsApiKeyModalOpen(true)} title="Change API Key" className="p-2 rounded-full glassmorphism text-white hover:bg-white/20 transition-colors" aria-label="Change API Key">
                            <KeyIcon className="w-6 h-6" />
                        </button>
                        {history.length > 0 && (
                            <button onClick={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)} title="Toggle History" className="p-2 rounded-full glassmorphism text-white hover:bg-white/20 transition-colors" aria-label="Toggle history panel">
                                <HistoryIcon className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                    
                    <div className="absolute top-4 right-4 z-30 flex flex-col items-center gap-3">
                        {currentImageUrl && (
                            <button onClick={handleDownload} title="Download Image" className="p-2 rounded-full glassmorphism text-white hover:bg-white/20 transition-colors">
                                <DownloadIcon className="w-6 h-6"/>
                            </button>
                        )}
                    </div>

                    <Uploader ref={uploaderRef} onImageUpload={handleImageUpload} hasUploadedImage={sourceImageUrls.length > 0}>
                        <CanvasContent />
                    </Uploader>
                    
                    {history.length > 0 && (
                        <aside className={`absolute top-0 right-0 h-full p-4 transition-transform duration-300 ease-in-out z-20 ${isHistoryPanelOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'}`}>
                            <div className="glassmorphism w-28 h-full rounded-2xl p-2 flex flex-col gap-2">
                                <h3 className="text-sm text-center text-gray-300 font-semibold tracking-wider flex-shrink-0 pt-1">History</h3>
                                <div className="flex-1 overflow-y-auto custom-scrollbar -mr-1 pr-1 space-y-2">
                                    {history.map((imageUrl, index) => (
                                        <div key={`${imageUrl.slice(-10)}-${index}`} className="relative group w-full aspect-square">
                                            <button onClick={() => setHistoryIndex(index)} className={`w-full h-full rounded-lg flex-shrink-0 overflow-hidden transition-all duration-200 transform hover:scale-105 ${historyIndex === index ? 'ring-2 ring-blue-400' : 'ring-1 ring-white/20'}`} aria-label={`View history item ${index + 1}`}>
                                                <img src={imageUrl} alt={`History ${index + 1}`} className="w-full h-full object-cover" />
                                            </button>
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg pointer-events-none">
                                                <button onClick={(e) => { e.stopPropagation(); handleUseHistoryItemAsSource(index); }} title="Use as new source" className="p-2 rounded-full bg-black/50 hover:bg-white/20 text-white transition-colors pointer-events-auto" aria-label={`Use history item ${index + 1} as new source`}>
                                                    <PhotoIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </aside>
                    )}
                </main>

                <footer className="flex-shrink-0 p-4 pt-2 w-full max-w-4xl mx-auto">
                    <div className="glassmorphism rounded-2xl p-3 flex flex-col gap-3 transition-all duration-300">
                        {sourceImageUrls.length > 0 && (
                            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 -mb-1">
                                {sourceImageUrls.map((url, index) => (
                                    <div key={url} className="relative group flex-shrink-0">
                                        <img src={url} alt={`Source ${index + 1}`} className="w-14 h-14 object-cover rounded-lg"/>
                                        <button onClick={() => handleRemoveSourceImage(index)} className="absolute -top-1 -right-1 bg-red-600 p-0.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                        </button>
                                    </div>
                                ))}
                                <button onClick={() => uploaderRef.current?.triggerUpload()} title="Add another image" className="w-14 h-14 flex-shrink-0 flex items-center justify-center bg-white/5 border-2 border-dashed border-white/20 rounded-lg hover:bg-white/10 transition-colors">
                                    <AddIcon className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>
                        )}
                        <div className="flex items-start gap-2">
                            <button onClick={() => setIsStyleSelectionOpen(true)} className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center overflow-hidden">
                                {selectedStyle ? <img src={selectedStyle.imageUrl} alt={selectedStyle.name} className="w-full h-full object-cover" /> : <SparklesIcon className="w-6 h-6 text-gray-300" />}
                            </button>
                            <textarea
                                ref={promptTextAreaRef}
                                value={prompt} 
                                onChange={handlePromptChange} 
                                onFocus={handlePromptFocus} 
                                onBlur={() => setIsPromptFocused(false)} 
                                placeholder="Describe an image to create, or a style to apply..." 
                                rows={isPromptFocused ? 4 : 1} 
                                className="w-full bg-transparent text-base py-3 px-2 focus:outline-none resize-none custom-scrollbar transition-all duration-300 ease-in-out" 
                            />
                            <button onClick={handleGenerate} disabled={isLoading || countdown > 0 || (sourceFiles.length === 0 && !prompt.trim())} className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-lg bg-blue-600 font-semibold text-white hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors">
                                {isLoading ? (
                                    <Spinner />
                                ) : countdown > 0 ? (
                                    <span className="text-sm font-mono">{countdown}s</span>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                                )}
                            </button>
                        </div>
                    </div>
                </footer>

                <StyleSelectionModal isOpen={isStyleSelectionOpen} onClose={() => setIsStyleSelectionOpen(false)} styles={styles} onSelect={handleStyleSelect} onEdit={handleOpenStyleEditor} onDelete={handleDeleteStyle} onAddNew={() => handleOpenStyleEditor(null)} selectedStyleName={selectedStyleName}/>
                <StyleEditorModal isOpen={isStyleEditorOpen} onClose={() => setIsStyleEditorOpen(false)} onSave={handleSaveStyle} editingStyle={styleToEdit}/>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
                <Spinner />
                <p className="mt-4 text-gray-400">Initializing...</p>
            </div>
        )}

        {toastMessage && (
            <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-green-600/80 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm z-50 animate-pulse">
            {toastMessage}
            </div>
        )}
    </div>
  );
};

export default App;