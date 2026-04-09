/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef } from 'react';
import { UploadCloud, FileAudio, X } from 'lucide-react';
import { AudioData } from '../types';

interface FileUploaderProps {
  onFileSelected: (audioData: AudioData) => void;
  disabled?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelected, disabled }) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
      alert("Please upload a valid audio file.");
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64 = base64String.split(',')[1];
      
      // Force mimeType to audio to prevent Gemini from expecting video frames
      // if the browser detects an audio file (like .mpeg) as video/*
      let mimeType = file.type;
      if (mimeType.startsWith('video/')) {
        mimeType = mimeType.replace('video/', 'audio/');
      }
      
      onFileSelected({
        blob: file,
        base64,
        mimeType
      });
    };
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  // Keyboard support for activating the file input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="audio/*,video/*"
        onChange={handleChange}
        disabled={disabled}
      />
      
      {!fileName ? (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="Upload audio file"
          className={`flex flex-col items-center justify-center p-6 border border-dashed rounded transition-all outline-none focus:ring-1 focus:ring-indigo-500 ${
            dragActive 
              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10" 
              : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-indigo-400 dark:hover:border-indigo-500"
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={handleKeyDown}
        >
          <UploadCloud size={24} className={`mb-2 ${dragActive ? 'text-indigo-500' : 'text-slate-400'}`} />
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Haz clic o arrastra un archivo
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            MP3, WAV, M4A, WEBM (Max 20MB)
          </p>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded p-3 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <FileAudio size={16} className="text-indigo-500 flex-shrink-0" />
            <div className="truncate">
              <p className="font-medium text-xs text-slate-800 dark:text-slate-200 truncate">{fileName}</p>
            </div>
          </div>
          <button 
            onClick={handleClear}
            className="p-1 text-slate-400 hover:text-red-500 transition-colors focus:outline-none"
            disabled={disabled}
            aria-label="Remove file"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;