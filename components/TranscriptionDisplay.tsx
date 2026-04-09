import React, { useState, useRef, useEffect } from 'react';
import { TranscriptionResponse, Emotion } from '../types';
import { 
  User, Clock, Globe, Smile, Frown, AlertCircle, Meh, 
  UserCheck, Phone, MapPin, Stethoscope, Calendar, 
  CreditCard, MessageSquare, TrendingUp, Info, 
  FileText, ShieldCheck, Heart, Building2, PlayCircle
} from 'lucide-react';

interface TranscriptionDisplayProps {
  data: TranscriptionResponse;
  audioUrl?: string;
}

const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({ data, audioUrl }) => {
  const { analysis, segments, summary } = data;
  const [activeTab, setActiveTab] = useState<'entidades' | 'servicios' | 'transcripcion'>('entidades');
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const parseTimestampToSeconds = (ts: string) => {
    if (!ts) return 0;
    const parts = ts.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  };

  const segmentTimes = segments.map(s => parseTimestampToSeconds(s.timestamp));

  const getActiveSegmentIndex = () => {
    for (let i = segmentTimes.length - 1; i >= 0; i--) {
      if (currentTime >= segmentTimes[i]) {
        return i;
      }
    }
    return -1;
  };

  const activeIndex = getActiveSegmentIndex();

  const handleTimestampClick = (timeInSeconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = timeInSeconds;
      audioRef.current.play();
    }
  };

  const getEmotionIcon = (emotion?: Emotion) => {
    if (!emotion) return null;
    switch (emotion) {
      case Emotion.Happy: return <Smile size={12} className="text-green-500" />;
      case Emotion.Sad: return <Frown size={12} className="text-blue-500" />;
      case Emotion.Angry: return <AlertCircle size={12} className="text-red-500" />;
      case Emotion.Neutral:
      default: return <Meh size={12} className="text-slate-400" />;
    }
  };

  const getTagStyle = (tag: string) => {
    const base = "inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border";
    switch (tag) {
      case 'Persona': return `${base} bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 border-blue-100 dark:border-blue-800/50`;
      case 'Identificación': return `${base} bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 border-purple-100 dark:border-purple-800/50`;
      case 'Lugar': return `${base} bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300 border-orange-100 dark:border-orange-800/50`;
      case 'Cita Confirmada': return `${base} bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300 border-green-100 dark:border-green-800/50`;
      case 'Servicio': return `${base} bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300 border-teal-100 dark:border-teal-800/50`;
      case 'Contacto': return `${base} bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300 border-pink-100 dark:border-pink-800/50`;
      default: return `${base} bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700`;
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm flex flex-col h-full">
      
      {/* Top Banner / Summary */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex-shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-3">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
              <FileText size={12} className="mr-1.5" /> Resumen Ejecutivo
            </h3>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">{summary}</p>
          </div>
          <div className="border-l border-slate-200 dark:border-slate-800 pl-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
              <TrendingUp size={12} className="mr-1.5" /> Sentimiento
            </h3>
            <div className="flex items-center mb-1">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                analysis.sentimentAnalysis.score > 0.3 ? 'bg-green-500' : 
                analysis.sentimentAnalysis.score < -0.3 ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{analysis.sentimentAnalysis.label}</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">{analysis.sentimentAnalysis.details}</p>
          </div>
          <div className="border-l border-slate-200 dark:border-slate-800 pl-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
              <CreditCard size={12} className="mr-1.5" /> Tipo de Cliente
            </h3>
            <div className="flex items-center mb-1">
              <div className={`w-2 h-2 rounded-full mr-2 ${analysis.leadPotential.isLead ? 'bg-indigo-500' : 'bg-slate-400'}`}></div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{analysis.leadPotential.isLead ? 'Lead Potencial' : 'Cliente Existente'}</span>
            </div>
            {analysis.leadPotential.requestedInfo && (
              <p className="text-[10px] text-slate-500 leading-tight">{analysis.leadPotential.requestedInfo}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-5 flex space-x-6 flex-shrink-0 bg-white dark:bg-slate-900">
        <button 
          onClick={() => setActiveTab('entidades')}
          className={`py-3 text-xs font-semibold border-b-2 transition-colors focus:outline-none ${activeTab === 'entidades' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <div className="flex items-center"><ShieldCheck size={14} className="mr-1.5" /> Entidades Identificadas</div>
        </button>
        <button 
          onClick={() => setActiveTab('servicios')}
          className={`py-3 text-xs font-semibold border-b-2 transition-colors focus:outline-none ${activeTab === 'servicios' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <div className="flex items-center"><Stethoscope size={14} className="mr-1.5" /> Servicios y Citas</div>
        </button>
        <button 
          onClick={() => setActiveTab('transcripcion')}
          className={`py-3 text-xs font-semibold border-b-2 transition-colors focus:outline-none ${activeTab === 'transcripcion' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <div className="flex items-center"><MessageSquare size={14} className="mr-1.5" /> Transcripción</div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-5 flex-1 overflow-y-auto">
        
        {/* Tab: Entidades */}
        {activeTab === 'entidades' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysis.peopleProfiles.map((person, idx) => (
              <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded bg-slate-50/50 dark:bg-slate-800/50 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white flex items-center">
                      <UserCheck size={14} className="mr-1.5 text-indigo-500" />
                      {person.name}
                    </p>
                    <p className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mt-0.5">
                      {person.roleInConversation}
                    </p>
                  </div>
                </div>
                
                {person.roleDescription && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 italic leading-tight">
                    "{person.roleDescription}"
                  </p>
                )}

                <div className="space-y-4">
                  {/* Personal Data */}
                  {(person.personalData?.dateOfBirth || person.personalData?.age || person.personalData?.otherInfo) && (
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold mb-1.5 border-b border-slate-200 dark:border-slate-700 pb-1">Datos Personales</p>
                      <div className="text-xs space-y-1">
                        {person.personalData?.dateOfBirth && <p><span className="text-slate-500">Nacimiento:</span> {person.personalData.dateOfBirth}</p>}
                        {person.personalData?.age && <p><span className="text-slate-500">Edad:</span> {person.personalData.age}</p>}
                        {person.personalData?.otherInfo && <p className="text-slate-500">{person.personalData.otherInfo}</p>}
                      </div>
                    </div>
                  )}

                  {/* Identifications */}
                  {person.identifications && person.identifications.length > 0 && (
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold mb-1.5 border-b border-slate-200 dark:border-slate-700 pb-1">Identificación</p>
                      <div className="flex flex-wrap gap-1.5">
                        {person.identifications.map((id, i) => (
                          <span key={i} className="font-mono text-[10px] bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 shadow-sm">
                            <span className="font-bold text-indigo-500 mr-1">{id.type}:</span>{id.value}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact */}
                  {(person.contact?.phones?.length > 0 || person.contact?.addresses?.length > 0 || person.contact?.emails?.length > 0) && (
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold mb-1.5 border-b border-slate-200 dark:border-slate-700 pb-1">Contacto</p>
                      <div className="space-y-1.5">
                        {person.contact?.phones?.map((phone, i) => (
                          <p key={`phone-${i}`} className="flex items-center text-xs"><Phone size={10} className="mr-2 text-slate-400" /> {phone}</p>
                        ))}
                        {person.contact?.emails?.map((email, i) => (
                          <p key={`email-${i}`} className="flex items-center text-xs"><Globe size={10} className="mr-2 text-slate-400" /> {email}</p>
                        ))}
                        {person.contact?.addresses?.map((address, i) => (
                          <p key={`addr-${i}`} className="flex items-center text-xs"><MapPin size={10} className="mr-2 text-slate-400" /> {address}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {analysis.peopleProfiles.length === 0 && (
              <p className="text-xs text-slate-500 italic">No se detectaron perfiles detallados.</p>
            )}
          </div>
        )}

        {/* Tab: Servicios y Citas */}
        {activeTab === 'servicios' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                  <Stethoscope size={12} className="mr-1.5" /> Servicios Solicitados
                </h3>
                {analysis.serviceRequests.length > 0 ? (
                  <ul className="space-y-2">
                    {analysis.serviceRequests.map((service, i) => (
                      <li key={i} className="flex items-start text-sm bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded border border-slate-100 dark:border-slate-800">
                        <span className="text-indigo-500 mr-2 mt-0.5">•</span>
                        <span className="text-slate-700 dark:text-slate-300">{service}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">No se identificaron servicios.</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                <Calendar size={12} className="mr-1.5" /> Gestión de Citas
              </h3>
              {analysis.appointmentRequest && analysis.appointmentRequest.isConfirmed ? (
                <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/50 rounded p-4">
                  <div className="flex items-center text-green-700 dark:text-green-400 font-bold text-xs mb-3">
                    <Calendar size={14} className="mr-1.5" /> CITA CONFIRMADA
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[9px] text-green-600/70 dark:text-green-400/50 uppercase font-bold">Fecha / Hora</p>
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">{analysis.appointmentRequest.date || 'Pendiente'} - {analysis.appointmentRequest.time || 'Pendiente'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-green-600/70 dark:text-green-400/50 uppercase font-bold">Clínica</p>
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">{analysis.appointmentRequest.clinic || 'GomerMedi'}</p>
                    </div>
                  </div>
                  {analysis.appointmentRequest.details && (
                    <div className="mt-3 pt-3 border-t border-green-200/50 dark:border-green-800/50">
                      <p className="text-xs text-green-700/80 dark:text-green-400/80 italic">{analysis.appointmentRequest.details}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded p-4 text-center">
                  <Calendar size={24} className="mx-auto text-slate-400 mb-2 opacity-50" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No hay citas confirmadas</p>
                  <p className="text-xs text-slate-500 mt-1">La llamada no derivó en una cita agendada o quedó pendiente de confirmación.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Transcripción */}
        {activeTab === 'transcripcion' && (
          <div className="space-y-4 max-w-4xl relative">
            {audioUrl && (
              <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
                <audio 
                  ref={audioRef} 
                  src={audioUrl} 
                  controls 
                  className="w-full h-10 outline-none"
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                />
              </div>
            )}
            
            <div className="space-y-1">
              {segments.map((segment, index) => {
                const isActive = index === activeIndex;
                const timeInSeconds = segmentTimes[index];
                
                return (
                  <div 
                    key={index} 
                    className={`flex group text-sm p-2 rounded transition-colors ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                  >
                    <div className="flex-shrink-0 w-16 pt-0.5">
                      <button 
                        onClick={() => handleTimestampClick(timeInSeconds)}
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors flex items-center ${isActive ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:text-indigo-300' : 'text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900 dark:hover:text-indigo-400'}`}
                        title="Reproducir desde aquí"
                      >
                        <PlayCircle size={10} className="mr-1 opacity-50" />
                        {segment.timestamp}
                      </button>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline mb-0.5">
                        <span className={`font-semibold text-xs mr-2 ${segment.speaker.toLowerCase().includes('recep') ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {segment.speaker}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 flex items-center">
                          {getEmotionIcon(segment.emotion)}
                          <span className="ml-1">{segment.emotion}</span>
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed ${isActive ? 'text-slate-900 dark:text-slate-100 font-medium' : 'text-slate-600 dark:text-slate-400'}`}>
                        {segment.content}
                      </p>
                      {segment.tags && segment.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {segment.tags.map((tag, i) => (
                            <span key={i} className={getTagStyle(tag)}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default TranscriptionDisplay;
