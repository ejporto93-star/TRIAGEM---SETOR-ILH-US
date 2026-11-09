import React from 'react';
import { EventModule } from '../types';
import { Calendar, MapPin, ChevronRight, Edit3 } from 'lucide-react';

interface EventSelectorBarProps {
  events: EventModule[];
  activeEventId: string;
  onSelectEvent: (id: string) => void;
  onEditActiveEvent: () => void;
}

export const EventSelectorBar: React.FC<EventSelectorBarProps> = ({
  events,
  activeEventId,
  onSelectEvent,
  onEditActiveEvent,
}) => {
  const activeEvent = events.find(e => e.id === activeEventId) || events[0];

  return (
    <div className="bg-slate-900 text-slate-100 border-b border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Module Switcher Tabs (clean segmented scrollable bar) */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mr-1 whitespace-nowrap">
              Módulos:
            </span>
            {events.map((ev) => {
              const isActive = ev.id === activeEventId;
              const count = ev.membros.length;
              return (
                <button
                  key={ev.id}
                  onClick={() => onSelectEvent(ev.id)}
                  className={`px-3 py-1.5 rounded font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>{ev.nome}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded ${isActive ? 'bg-amber-500/40 text-slate-950 font-bold' : 'text-slate-400 bg-slate-800'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={onEditActiveEvent}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors whitespace-nowrap shrink-0"
            title="Editar dados deste evento"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Editar Evento</span>
          </button>
        </div>

        {/* Active Event Context strip */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 font-semibold text-white">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{activeEvent.nome}</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{activeEvent.data ? new Date(activeEvent.data + 'T12:00:00').toLocaleDateString('pt-BR') : 'Data a definir'}</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{activeEvent.local} · {activeEvent.cidadeUf}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span>Ancião: <strong className="text-slate-200 font-medium">{activeEvent.anciaoAtendimento || 'Não informado'}</strong></span>
            <span>·</span>
            <span>Enc. Regional: <strong className="text-slate-200 font-medium">{activeEvent.encarregadoRegional || 'Não informado'}</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
};
