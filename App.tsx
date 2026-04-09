/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { Sparkles, Moon, Sun, Plus, Phone, Calendar, Search, Inbox } from 'lucide-react';
import TranscriptionDisplay from './components/TranscriptionDisplay';
import Button from './components/Button';
import NewCallModal from './components/NewCallModal';
import { CallRecord } from './types';

function App() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Initialize dark mode based on system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleAddCall = (record: CallRecord) => {
    setCalls(prev => [record, ...prev]);
    setSelectedCallId(record.id);
    setIsModalOpen(false);
  };

  const selectedCall = calls.find(c => c.id === selectedCallId);

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 z-10 transition-colors duration-300">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/30">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 leading-tight">
                GomerMedi
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Repositorio de Llamadas</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Button onClick={() => setIsModalOpen(true)} icon={<Plus size={16} />}>
              Nueva Llamada
            </Button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-colors duration-300">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar llamadas..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-colors"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {calls.length === 0 ? (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center h-full">
                <Inbox size={32} className="mb-2 opacity-20" />
                <p className="text-sm">No hay llamadas registradas</p>
              </div>
            ) : (
              calls.map(call => (
                <button
                  key={call.id}
                  onClick={() => setSelectedCallId(call.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    selectedCallId === call.id 
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 shadow-sm' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      {call.result.analysis.callType}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center">
                      <Calendar size={10} className="mr-1" /> {formatDate(call.date)}
                    </span>
                  </div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white truncate mb-1">
                    {call.result.analysis.peopleProfiles.find(p => p.roleInConversation.toLowerCase().includes('llamante') || p.roleInConversation.toLowerCase().includes('paciente'))?.name || 'Desconocido'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center">
                    <Phone size={10} className="mr-1" /> {call.callCenter}
                  </p>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 sm:p-8">
          {selectedCall ? (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6 flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Ficha de Llamada</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Registrada el {formatDate(selectedCall.date)} • Archivo: {selectedCall.fileName}
                  </p>
                </div>
              </div>
              <TranscriptionDisplay data={selectedCall.result} />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-full shadow-sm mb-4 border border-slate-100 dark:border-slate-800">
                <Sparkles size={48} className="text-indigo-200 dark:text-indigo-900/50" />
              </div>
              <h2 className="text-xl font-medium text-slate-600 dark:text-slate-300 mb-2">Selecciona una llamada</h2>
              <p className="text-sm max-w-md text-center">
                Elige una llamada del panel lateral para ver su ficha de análisis detallada, o registra una nueva llamada.
              </p>
              <Button onClick={() => setIsModalOpen(true)} className="mt-6" icon={<Plus size={16} />}>
                Registrar Nueva Llamada
              </Button>
            </div>
          )}
        </main>
      </div>

      <NewCallModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleAddCall} 
      />
    </div>
  );
}

export default App;
