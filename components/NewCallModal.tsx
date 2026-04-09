import React, { useState } from 'react';
import { X, Building2, Sparkles, AlertTriangle } from 'lucide-react';
import FileUploader from './FileUploader';
import Button from './Button';
import { transcribeAudio, uploadAudio } from '../services/apiClient';
import { AppStatus, AudioData, CallRecord } from '../types';

const CALL_CENTERS = [
  "Neutral (General)",
  "GomerMedi - Tenerife",
  "GomerMedi - Gran Canaria",
  "GomerMedi - Fuerteventura",
  "GomerMedi - La Gomera"
];

interface NewCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (record: CallRecord) => void;
}

const NewCallModal: React.FC<NewCallModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [status, setStatus] = useState<AppStatus>('idle');
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [callCenter, setCallCenter] = useState<string>(CALL_CENTERS[0]);
  const [fileName, setFileName] = useState<string>('');

  if (!isOpen) return null;

  const handleAudioReady = (data: AudioData) => {
    setAudioData(data);
    setFileName((data.blob as File).name || 'audio_file');
    setError(null);
  };

  const handleTranscribe = async () => {
    if (!audioData) return;

    setStatus('processing');
    setError(null);

    try {
      // 1. Subir el audio al servicio de ficheros
      const uploadResult = await uploadAudio(audioData.base64, audioData.mimeType);
      
      // 2. Solicitar la transcripción usando el ID/filename del audio
      const data = await transcribeAudio(uploadResult.fileName, audioData.mimeType, callCenter);

      const newRecord: CallRecord = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        fileName: fileName,
        callCenter: callCenter,
        result: data,
        audioUrl: uploadResult.url,
        audioId: uploadResult.fileName
      };
      
      setStatus('success');
      onSuccess(newRecord);
      handleReset();
    } catch (err) {
      console.error(err);
      setError("Ha ocurrido un error durante el procesamiento. Por favor, inténtelo de nuevo.");
      setStatus('error');
    }
  };

  const handleReset = () => {
    setAudioData(null);
    setStatus('idle');
    setError(null);
    setFileName('');
  };

  const handleClose = () => {
    if (status === 'processing') return;
    handleReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center">
            <Building2 size={14} className="mr-2 text-indigo-500" />
            Nueva Llamada
          </h2>
          <button onClick={handleClose} disabled={status === 'processing'} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <X size={16} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto">
          {status === 'error' && error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 flex items-start text-red-700 dark:text-red-400 text-xs">
              <AlertTriangle className="mr-2 flex-shrink-0 mt-0.5" size={14} />
              <p>{error}</p>
            </div>
          )}

          {status === 'processing' ? (
            <div className="py-8 text-center">
              <div className="flex justify-center mb-4">
                 <div className="relative">
                    <div className="w-10 h-10 border-2 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin"></div>
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                        <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
                    </div>
                 </div>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Analizando Llamada...</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[250px] mx-auto">
                Extrayendo entidades, detectando citas y analizando sentimiento.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="callCenter" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Centro de Atención (Call Center)
                </label>
                <select
                  id="callCenter"
                  value={callCenter}
                  onChange={(e) => setCallCenter(e.target.value)}
                  className="block w-full rounded border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 px-3 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs transition-colors outline-none"
                >
                  {CALL_CENTERS.map((cc) => (
                    <option key={cc} value={cc}>{cc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Archivo de Audio
                </label>
                <FileUploader onFileSelected={handleAudioReady} disabled={status === 'processing'} />
              </div>
            </div>
          )}
        </div>

        {status !== 'processing' && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end space-x-2">
            <Button variant="ghost" onClick={handleClose}>Cancelar</Button>
            <Button 
              onClick={handleTranscribe} 
              disabled={!audioData}
              icon={<Sparkles size={14} />}
            >
              Generar Ficha
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewCallModal;
