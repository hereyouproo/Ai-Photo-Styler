import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';

interface UploaderProps {
  onImageUpload: (files: FileList) => void;
  children: React.ReactNode;
  hasUploadedImage: boolean;
}

export interface UploaderHandle {
  triggerUpload: () => void;
}

const Uploader = forwardRef<UploaderHandle, UploaderProps>(({ onImageUpload, children, hasUploadedImage }, ref) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    triggerUpload: () => {
      fileInputRef.current?.click();
    },
  }));

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onImageUpload(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };
  
  const handleContainerClick = () => {
    // This allows clicking the placeholder area to upload an initial image.
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onImageUpload(files);
      // Reset the input value to allow uploading the same file again
      event.target.value = '';
    }
  };

  return (
    <div
      className="relative w-full h-full flex justify-center items-center rounded-2xl overflow-hidden glassmorphism"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/png, image/jpeg, image/webp" 
            multiple
        />

        <div onClick={!hasUploadedImage ? handleContainerClick : undefined} className="w-full h-full flex items-center justify-center">
          {children}
        </div>
        
        {isDragging && (
          <div className="absolute inset-0 bg-blue-500/30 border-4 border-dashed border-blue-400 rounded-2xl flex flex-col items-center justify-center pointer-events-none transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="mt-4 text-xl font-bold text-white">Drop image(s) here</p>
          </div>
        )}
    </div>
  );
});

export default Uploader;