import React, { useMemo } from 'react';
import { 
  Filter, 
  FileText, 
  Users, 
  Upload, 
  Settings, 
  History,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { EventModule } from '../types';
import { calculateEnsaioMetrics } from '../services/metricsService';

interface HeaderProps {
  currentView: 'triagem' | 'resumo' | 'tabela';
  onViewChange: (view: 'triagem' | 'resumo' | 'tabela') => void;
  activeEvent: EventModule;
  onOpenImportModal: () => void;
  onOpenEventsModal: () => void;
  onOpenLogsModal: () => void;
  onOpenManualReport: () => void;
  onQuickPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  activeEvent,
  onOpenImportModal,
  onOpenEventsModal,
  onOpenLogsModal,
  onOpenManualReport,
  onQuickPrint
}) => {
  // Utiliza estritamente a FONTE ÚNICA DA VERDADE (calculateEnsaioMetrics)
  const metrics = useMemo(() => {
    return calculateEnsaioMetrics(activeEvent, 'presentes');
  }, [activeEvent]);

  // Contagem de participantes cadastrados manualmente
  const manualCount = useMemo(() => {
    return activeEvent.membros.filter(m => m.isManual || m.id.startsWith('MAN-')).length;
  }, [activeEvent.membros]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          
          {/* Zone 1: Brand wordmark (single line, no subtitle pill) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-lg shadow-inner ring-1 ring-slate-800">
              <span className="tracking-tighter">TI</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
                TRIAGEM – SETOR ILHÉUS
              </span>
              <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
                Sistema de Gestão & Triagem Musical
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (single line, clean typographic feedback) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onViewChange('triagem')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                currentView === 'triagem'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Triagem Funil</span>
            </button>

            <button
              onClick={() => onViewChange('resumo')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                currentView === 'resumo'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Resumo do Ensaio</span>
            </button>

            <button
              onClick={() => onViewChange('tabela')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                currentView === 'tabela'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Membros ({metrics.totalInscritos})</span>
            </button>

            <button
              onClick={onOpenManualReport}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                manualCount > 0
                  ? 'bg-amber-100 text-amber-950 border border-amber-300 hover:bg-amber-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Relatório Oficial de Cadastros Manuais no Ensaio"
            >
              <FileText className="w-3.5 h-3.5 text-amber-700" />
              <span>Cadastros Manuais {manualCount > 0 && `(${manualCount})`}</span>
            </button>

            <div className="h-4 w-px bg-slate-200 mx-1" />

            <button
              onClick={onOpenImportModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Importar PDF</span>
            </button>

            <button
              onClick={onOpenEventsModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>Eventos</span>
            </button>

            <button
              onClick={onOpenLogsModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap"
              title="Histórico de Triagem e Auditoria"
            >
              <History className="w-3.5 h-3.5" />
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action & Indicador PRESENTES auditado */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 tabular-nums">
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/80 shadow-2xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{metrics.totalPresentes} PRESENTES</span>
              </span>
              <span className="text-slate-400">/</span>
              <span className="font-medium text-slate-600">{metrics.totalInscritos} inscritos</span>
            </div>

            <button
              onClick={onQuickPrint}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg shadow-xs transition-colors whitespace-nowrap"
              title="Imprimir Resumo do Ensaio"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir Resumo</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
