import React from 'react';
import { TranscriptionResponse, Emotion } from '../types';
import { 
  User, Clock, Globe, Smile, Frown, AlertCircle, Meh, 
  UserCheck, Phone, MapPin, Stethoscope, Calendar, 
  CreditCard, MessageSquare, TrendingUp, Info, 
  FileText, ShieldCheck, Heart
} from 'lucide-react';

interface TranscriptionDisplayProps {
  data: TranscriptionResponse;
}

const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({ data }) => {
  const { analysis, segments, summary } = data;

  const getEmotionBadge = (emotion?: Emotion) => {
    if (!emotion) return null;
    switch (emotion) {
      case Emotion.Happy:
        return <Smile size={16} className="text-green-500" />;
      case Emotion.Sad:
        return <Frown size={16} className="text-blue-500" />;
      case Emotion.Angry:
        return <AlertCircle size={16} className="text-red-500" />;
      case Emotion.Neutral:
      default:
        return <Meh size={16} className="text-slate-400" />;
    }
  };

  const getCallTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      informacion: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      citas: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      reclamacion: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      equivocada: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
      otro: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colors[type] || colors.otro}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Workflow Header: Summary & Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center">
              <FileText size={16} className="mr-2" /> Resumen de la Llamada
            </h3>
            {getCallTypeBadge(analysis.callType)}
          </div>
          <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed italic">
            "{summary}"
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Recepcionista</p>
              <p className="font-semibold flex items-center">
                <UserCheck size={14} className="mr-2 text-indigo-500" /> {analysis.receiverName}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Paciente / Llamante</p>
              <p className="font-semibold flex items-center">
                <User size={14} className="mr-2 text-indigo-500" /> {analysis.callerName || 'No identificado'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20 flex flex-col justify-between">
          <div>
            <h3 className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-4 flex items-center">
              <TrendingUp size={16} className="mr-2" /> Análisis de Sentimiento
            </h3>
            <div className="flex items-end space-x-2 mb-2">
              <span className="text-5xl font-black">{analysis.sentimentAnalysis.score}</span>
              <span className="text-indigo-200 text-sm mb-2">/ 10</span>
            </div>
            <p className="text-indigo-100 font-medium text-lg mb-2">{analysis.sentimentAnalysis.label}</p>
          </div>
          <p className="text-indigo-200 text-xs leading-tight">
            {analysis.sentimentAnalysis.details}
          </p>
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Patient & Identifications */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
            <ShieldCheck size={16} className="mr-2" /> Datos y Personas
          </h3>
          <div className="space-y-4">
            {analysis.callerData && (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 mb-1">Perfil del Llamante</p>
                <p className="text-sm">{analysis.callerData}</p>
              </div>
            )}
            
            {analysis.identifications.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">Identificaciones Detectadas</p>
                {analysis.identifications.map((id, i) => (
                  <div key={i} className="flex items-center justify-between bg-indigo-50/50 dark:bg-indigo-900/20 p-2 rounded border border-indigo-100/50 dark:border-indigo-800/50">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{id.type}</span>
                    <span className="text-sm font-mono">{id.value}</span>
                    <span className="text-[10px] uppercase px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded shadow-sm">
                      {id.owner === 'caller' ? 'Titular' : 'Tercero'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {analysis.otherPeople.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">Otras Personas Mencionadas</p>
                <div className="grid grid-cols-1 gap-2">
                  {analysis.otherPeople.map((p, i) => (
                    <div key={i} className="flex items-start p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
                      <div className="bg-white dark:bg-slate-700 p-1.5 rounded mr-3 mt-0.5">
                        <UserCheck size={14} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{p.name}</p>
                        <p className="text-[10px] text-indigo-500 font-bold uppercase">{p.role}</p>
                        <p className="text-xs text-slate-500">{p.responsibilities}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Medical & Appointments */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
            <Stethoscope size={16} className="mr-2" /> Servicios y Citas
          </h3>
          <div className="space-y-6">
            {analysis.serviceRequests.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-2">Servicios Solicitados</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.serviceRequests.map((s, i) => (
                    <span key={i} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium border border-indigo-100 dark:border-indigo-800">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {analysis.appointmentRequest && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl p-4">
                <div className="flex items-center text-green-700 dark:text-green-400 font-bold text-sm mb-3">
                  <Calendar size={16} className="mr-2" /> SOLICITUD DE CITA
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-green-600/70 dark:text-green-400/50 uppercase font-bold">Fecha / Hora</p>
                    <p className="text-sm font-bold">{analysis.appointmentRequest.date || 'Pendiente'} - {analysis.appointmentRequest.time || 'Pendiente'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-green-600/70 dark:text-green-400/50 uppercase font-bold">Clínica</p>
                    <p className="text-sm font-bold">{analysis.appointmentRequest.clinic || 'GomerMedi'}</p>
                  </div>
                </div>
                {analysis.appointmentRequest.details && (
                  <div className="mt-3 pt-3 border-t border-green-200/50 dark:border-green-800/50">
                    <p className="text-xs text-green-700/80 dark:text-green-400/80 italic">{analysis.appointmentRequest.details}</p>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center">
                  <CreditCard size={12} className="mr-1" /> Potencial Lead
                </p>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${analysis.leadPotential.isLead ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
                  <span className="text-sm font-bold">{analysis.leadPotential.isLead ? 'ALTO' : 'BAJO'}</span>
                </div>
                {analysis.leadPotential.requestedInfo && (
                  <p className="text-xs text-slate-500 mt-1">{analysis.leadPotential.requestedInfo}</p>
                )}
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center">
                  <Phone size={12} className="mr-1" /> Contacto
                </p>
                <div className="space-y-1">
                  {analysis.contactDetails.phones.map((p, i) => (
                    <p key={i} className="text-sm font-mono">{p}</p>
                  ))}
                  {analysis.contactDetails.addresses.map((a, i) => (
                    <p key={i} className="text-[10px] text-slate-500 leading-tight">{a}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Transcript Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center">
          <MessageSquare size={16} className="mr-2" /> Transcripción Detallada
        </h3>
        
        <div className="space-y-6">
          {segments.map((segment, index) => (
            <div key={index} className="flex group">
              <div className="flex-shrink-0 w-24 pt-1">
                <span className="text-[10px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  {segment.timestamp}
                </span>
              </div>
              <div className="flex-grow pb-6 border-l-2 border-slate-100 dark:border-slate-800 pl-6 relative">
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 group-hover:border-indigo-500 transition-colors"></div>
                
                <div className="flex items-center space-x-3 mb-1">
                  <span className={`text-xs font-black uppercase tracking-tighter ${
                    segment.speaker.toLowerCase().includes('recep') ? 'text-indigo-600' : 'text-slate-500'
                  }`}>
                    {segment.speaker}
                  </span>
                  {getEmotionBadge(segment.emotion)}
                </div>
                
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                  {segment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <div className="flex items-center space-x-2 text-slate-400 text-xs bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full">
          <Heart size={12} className="text-red-500" />
          <span>GomerMedi Salud - Canarias</span>
          <span className="opacity-30">|</span>
          <Globe size={12} />
          <span>Español (ES)</span>
        </div>
      </div>
    </div>
  );
};

export default TranscriptionDisplay;
