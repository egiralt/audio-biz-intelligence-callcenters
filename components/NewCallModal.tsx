import React, { useState } from 'react';
import { X, Building2, Sparkles, AlertTriangle } from 'lucide-react';
import FileUploader from './FileUploader';
import Button from './Button';
import { transcribeAudio } from '../services/geminiService';
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
      const data = await transcribeAudio(audioData.base64, audioData.mimeType, callCenter);
      
      const newRecord: CallRecord = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        fileName: fileName,
        callCenter: callCenter,
        result: data
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Nueva Llamada</h2>
          <button onClick={handleClose} disabled={status === 'processing'} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {status === 'error' && error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start text-red-700 dark:text-red-400">
              <AlertTriangle className="mr-3 flex-shrink-0 mt-0.5" size={20} />
              <p>{error}</p>
            </div>
          )}

          {status === 'processing' ? (
            <div className="py-12 text-center">
              <div className="flex justify-center mb-6">
                 <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin"></div>
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                        <Sparkles size={24} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
                    </div>
                 </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Analizando Llamada...</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Gemini está identificando interlocutores, detectando citas médicas y analizando el sentimiento de la conversación.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label htmlFor="callCenter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center">
                  <Building2 size={16} className="mr-2 text-indigo-500" />
                  Seleccionar Call Center
                </label>
                <select
                  id="callCenter"
                  value={callCenter}
                  onChange={(e) => setCallCenter(e.target.value)}
                  className="block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-3 px-4 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors"
                >
                  {CALL_CENTERS.map((cc) => (
                    <option key={cc} value={cc}>{cc}</option>
                  ))}
                </select>
              </div>

              <FileUploader onFileSelected={handleAudioReady} disabled={status === 'processing'} />
            </div>
          )}
        </div>

        {status !== 'processing' && (
          <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end space-x-3">
            <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
            <Button 
              onClick={handleTranscribe} 
              disabled={!audioData}
              icon={<Sparkles size={16} />}
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
