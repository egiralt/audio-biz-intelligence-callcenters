/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { Sparkles, Moon, Sun, Plus, Phone, Calendar, Search, Inbox, LayoutDashboard, Users, Settings, Filter, Download } from 'lucide-react';
import TranscriptionDisplay from './components/TranscriptionDisplay';
import Button from './components/Button';
import NewCallModal from './components/NewCallModal';
import { CallRecord } from './types';

function App() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

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
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden">
      
      {/* Top Navigation Bar (BI Style) */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 z-20">
        <div className="flex items-center justify-between px-4 h-12">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
              <Sparkles size={16} />
              <span className="font-bold text-sm tracking-tight">GomerMedi Intelligence</span>
            </div>
            
            {/* Horizontal Menu */}
            <nav className="hidden md:flex space-x-6 text-xs font-medium text-slate-500 dark:text-slate-400 h-12">
              <button className="flex items-center space-x-1.5 hover:text-slate-900 dark:hover:text-white transition-colors">
                <LayoutDashboard size={14} />
                <span>Dashboard</span>
              </button>
              <button className="flex items-center space-x-1.5 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400">
                <Phone size={14} />
                <span>Repositorio de Llamadas</span>
              </button>
              <button className="flex items-center space-x-1.5 hover:text-slate-900 dark:hover:text-white transition-colors">
                <Users size={14} />
                <span>Pacientes</span>
              </button>
              <button className="flex items-center space-x-1.5 hover:text-slate-900 dark:hover:text-white transition-colors">
                <Settings size={14} />
                <span>Configuración</span>
              </button>
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleDarkMode}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>
            <div className="w-6 h-6 rounded bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
              GM
            </div>
          </div>
        </div>
      </header>

      {/* Secondary Toolbar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-10 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsModalOpen(true)} icon={<Plus size={14} />}>
            Nueva Llamada
          </Button>
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-2"></div>
          <Button variant="ghost" icon={<Filter size={14} />}>Filtrar</Button>
          <Button variant="ghost" icon={<Download size={14} />}>Exportar</Button>
        </div>
        <div className="text-xs text-slate-500">
          {calls.length} registros encontrados
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar (List View) */}
        <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0">
          <div className="p-2 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar en llamadas..." 
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded text-xs focus:outline-none focus:border-indigo-500 dark:text-white transition-colors"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {calls.length === 0 ? (
              <div className="p-6 text-center text-slate-400 flex flex-col items-center justify-center h-full">
                <Inbox size={24} className="mb-2 opacity-20" />
                <p className="text-xs">No hay datos</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {calls.map(call => (
                  <li key={call.id}>
                    <button
                      onClick={() => setSelectedCallId(call.id)}
                      className={`w-full text-left px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                        selectedCallId === call.id 
                          ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-l-2 border-indigo-500' 
                          : 'border-l-2 border-transparent'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {call.result.analysis.callType}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatDate(call.date).split(',')[0]}
                        </span>
                      </div>
                      <p className="font-medium text-xs text-slate-900 dark:text-slate-100 truncate mb-1">
                        {call.result.analysis.peopleProfiles.find(p => p.roleInConversation.toLowerCase().includes('llamante') || p.roleInConversation.toLowerCase().includes('paciente'))?.name || 'Desconocido'}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-500 truncate">
                        {call.callCenter}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Main Content (Detail View) */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
          {selectedCall ? (
            <div className="h-full flex flex-col">
              <div className="bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 flex justify-between items-end">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white leading-tight mb-1">Detalle de Llamada</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    ID: {selectedCall.id} | Archivo: {selectedCall.fileName} | Fecha: {formatDate(selectedCall.date)}
                  </p>
                </div>
              </div>
              <div className="p-6">
                <TranscriptionDisplay data={selectedCall.result} audioUrl={selectedCall.audioUrl} />
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
              <Sparkles size={32} className="mb-3 opacity-20" />
              <p className="text-sm font-medium">Seleccione un registro para ver los detalles</p>
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
