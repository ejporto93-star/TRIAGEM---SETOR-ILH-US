import React, { useState, useMemo } from 'react';
import { 
  FunnelState, 
  MemberRecord, 
  AttendanceStatus, 
  EventModule 
} from '../types';
import { 
  UserCheck, 
  UserX, 
  RotateCcw, 
  Search, 
  ChevronRight, 
  Music, 
  MapPin, 
  Briefcase, 
  Award, 
  CheckCircle2, 
  FileText,
  Sparkles,
  MessageSquare,
  X,
  UserPlus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ManualRegistrationModal } from './ManualRegistrationModal';

interface FunnelTriageProps {
  event: EventModule;
  onUpdateAttendance: (memberId: string, status: AttendanceStatus, observacao?: string) => void;
  onAddManualMember: (memberData: {
    nome: string;
    instrumento: string;
    familia: MemberRecord['familia'];
    localidade: string;
    cargo: string;
    nivel: string;
    statusPresenca: AttendanceStatus;
    observacao?: string;
    oficializadoNoEnsaio?: boolean;
  }) => MemberRecord;
  onOpenManualReport: () => void;
  onViewDossier?: (member: MemberRecord) => void;
}

export const FunnelTriage: React.FC<FunnelTriageProps> = ({
  event,
  onUpdateAttendance,
  onAddManualMember,
  onOpenManualReport,
  onViewDossier,
}) => {
  const [funnel, setFunnel] = useState<FunnelState>({
    cargo: null,
    nivel: null,
    instrumento: null,
    localidade: null,
    nomeSelecionado: null,
  });

  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const [editingObsMemberId, setEditingObsMemberId] = useState<string | null>(null);
  const [obsInput, setObsInput] = useState('');
  const [savedSuccessMemberId, setSavedSuccessMemberId] = useState<string | null>(null);
  const [lastSavedNotification, setLastSavedNotification] = useState<string | null>(null);

  // Manual Registration Modal state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualInitialValues, setManualInitialValues] = useState<{
    cargo?: string | null;
    nivel?: string | null;
    instrumento?: string | null;
    localidade?: string | null;
  }>({});

  // 1. All members of the active event
  const allMembers = event.membros;

  // STEP 1: CARGOS AVAILABLE
  const availableCargos = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of allMembers) {
      counts[m.cargo] = (counts[m.cargo] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([cargo, count]) => ({ cargo, count }))
      .sort((a, b) => b.count - a.count);
  }, [allMembers]);

  // Candidates after Step 1
  const step1Filtered = useMemo(() => {
    if (!funnel.cargo) return allMembers;
    return allMembers.filter(m => m.cargo === funnel.cargo);
  }, [allMembers, funnel.cargo]);

  // STEP 2: NÍVEIS AVAILABLE (strictly filtered by Step 1)
  const availableNiveis = useMemo(() => {
    if (!funnel.cargo) return [];
    const counts: Record<string, number> = {};
    for (const m of step1Filtered) {
      counts[m.nivel] = (counts[m.nivel] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([nivel, count]) => ({ nivel, count }))
      .sort((a, b) => b.count - a.count);
  }, [step1Filtered, funnel.cargo]);

  // Candidates after Step 2
  const step2Filtered = useMemo(() => {
    if (!funnel.nivel) return step1Filtered;
    return step1Filtered.filter(m => m.nivel === funnel.nivel);
  }, [step1Filtered, funnel.nivel]);

  // STEP 3: INSTRUMENTOS AVAILABLE (strictly filtered by Step 1 & 2)
  const availableInstrumentos = useMemo(() => {
    if (!funnel.nivel) return [];
    const counts: Record<string, { count: number; familia: string }> = {};
    for (const m of step2Filtered) {
      if (!counts[m.instrumento]) {
        counts[m.instrumento] = { count: 0, familia: m.familia };
      }
      counts[m.instrumento].count += 1;
    }
    return Object.entries(counts)
      .map(([instrumento, data]) => ({ instrumento, count: data.count, familia: data.familia }))
      .sort((a, b) => b.count - a.count);
  }, [step2Filtered, funnel.nivel]);

  // Candidates after Step 3
  const step3Filtered = useMemo(() => {
    if (!funnel.instrumento) return step2Filtered;
    return step2Filtered.filter(m => m.instrumento === funnel.instrumento);
  }, [step2Filtered, funnel.instrumento]);

  // STEP 4: LOCALIDADES AVAILABLE (strictly filtered by Step 1, 2 & 3)
  const availableLocalidades = useMemo(() => {
    if (!funnel.instrumento) return [];
    const counts: Record<string, number> = {};
    for (const m of step3Filtered) {
      counts[m.localidade] = (counts[m.localidade] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([localidade, count]) => ({ localidade, count }))
      .sort((a, b) => a.localidade.localeCompare(b.localidade));
  }, [step3Filtered, funnel.instrumento]);

  // Candidates after Step 4 (ETAPA 5 FINAL RESULT)
  const finalCandidates = useMemo(() => {
    if (!funnel.localidade) return step3Filtered;
    return step3Filtered.filter(m => m.localidade === funnel.localidade);
  }, [step3Filtered, funnel.localidade]);

  // Quick Search Autocomplete Filter
  const quickSearchResults = useMemo(() => {
    if (!quickSearchQuery.trim() || quickSearchQuery.length < 2) return [];
    const q = quickSearchQuery.toLowerCase();
    return allMembers
      .filter(m => m.nome.toLowerCase().includes(q) || m.localidade.toLowerCase().includes(q))
      .slice(0, 8);
  }, [allMembers, quickSearchQuery]);

  // Determine current active step number (1 to 5)
  const currentStep = useMemo(() => {
    if (!funnel.cargo) return 1;
    if (!funnel.nivel) return 2;
    if (!funnel.instrumento) return 3;
    if (!funnel.localidade) return 4;
    return 5;
  }, [funnel]);

  // Known options across entire roster for autocomplete / suggestions
  const knownLocalidades = useMemo(() => {
    const set = new Set<string>();
    for (const m of allMembers) {
      if (m.localidade) set.add(m.localidade.trim().toUpperCase());
    }
    return Array.from(set).sort();
  }, [allMembers]);

  const knownInstrumentos = useMemo(() => {
    const set = new Set<string>();
    for (const m of allMembers) {
      if (m.instrumento) set.add(m.instrumento.trim().toUpperCase());
    }
    return Array.from(set).sort();
  }, [allMembers]);

  const knownCargos = useMemo(() => {
    const set = new Set<string>();
    for (const m of allMembers) {
      if (m.cargo) set.add(m.cargo.trim().toUpperCase());
    }
    return Array.from(set).sort();
  }, [allMembers]);

  const knownNiveis = useMemo(() => {
    const set = new Set<string>();
    for (const m of allMembers) {
      if (m.nivel) set.add(m.nivel.trim().toUpperCase());
    }
    return Array.from(set).sort();
  }, [allMembers]);

  // Count of manual attendees in this event
  const manualCount = useMemo(() => {
    return allMembers.filter(m => m.isManual || m.id.startsWith('MAN-')).length;
  }, [allMembers]);

  // Open manual registration modal with step context pre-filled
  const handleOpenManualModal = (step: number) => {
    setManualInitialValues({
      cargo: funnel.cargo,
      nivel: funnel.nivel,
      instrumento: funnel.instrumento,
      localidade: step === 5 ? funnel.localidade : null,
    });
    setIsManualModalOpen(true);
  };

  const handleSaveManualMember = (data: Parameters<typeof onAddManualMember>[0]) => {
    const newMember = onAddManualMember(data);
    // Automatically advance funnel to step 5 on this member so user sees them right away
    setFunnel({
      cargo: newMember.cargo,
      nivel: newMember.nivel,
      instrumento: newMember.instrumento,
      localidade: newMember.localidade,
      nomeSelecionado: newMember.nome,
    });

    if (data.statusPresenca === 'presente') {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899']
        });
      } catch (e) {
        // safe
      }
    }
  };

  // Handler to reset whole funnel
  const handleResetFunnel = () => {
    setFunnel({
      cargo: null,
      nivel: null,
      instrumento: null,
      localidade: null,
      nomeSelecionado: null,
    });
    setQuickSearchQuery('');
  };

  // Jump to specific member from quick search
  const handleSelectFromQuickSearch = (member: MemberRecord) => {
    setFunnel({
      cargo: member.cargo,
      nivel: member.nivel,
      instrumento: member.instrumento,
      localidade: member.localidade,
      nomeSelecionado: member.nome,
    });
    setQuickSearchQuery('');
  };

  // Trigger celebration on check-in
  const handleMarkPresente = (member: MemberRecord) => {
    onUpdateAttendance(member.id, 'presente');
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#10b981', '#3b82f6']
      });
    } catch (e) {
      // safe fallback
    }
  };

  // Toggle attendance between presente and ausente
  const handleToggleAttendance = (member: MemberRecord) => {
    if (member.statusPresenca === 'presente') {
      onUpdateAttendance(member.id, 'ausente');
    } else {
      handleMarkPresente(member);
    }
  };

  // Salva presença e leva automaticamente para a tela de nova triagem
  const handleSaveAndGoToNewTriage = (member: MemberRecord) => {
    if (member.statusPresenca !== 'presente') {
      onUpdateAttendance(member.id, 'presente');
    }

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#10b981', '#3b82f6', '#f59e0b']
      });
    } catch (e) {
      // safe fallback
    }

    setSavedSuccessMemberId(member.id);
    setLastSavedNotification(`Presença de ${member.nome} salva com sucesso!`);

    // Redireciona automaticamente para a tela de Nova Triagem
    setTimeout(() => {
      setSavedSuccessMemberId(null);
      handleResetFunnel();
    }, 400);

    setTimeout(() => {
      setLastSavedNotification(null);
    }, 3500);
  };

  const handleSaveObservation = (memberId: string) => {
    onUpdateAttendance(memberId, 'presente', obsInput);
    setEditingObsMemberId(null);
    setObsInput('');
  };

  return (
    <div className="space-y-6">
      
      {/* Toast de Presença Salva com Sucesso e Nova Triagem */}
      {lastSavedNotification && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl text-xs font-bold shadow-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>{lastSavedNotification}</span>
          </div>
          <span className="text-[11px] text-emerald-100 font-semibold bg-emerald-700/70 px-2.5 py-0.5 rounded whitespace-nowrap">
            ✓ Nova Triagem Iniciada
          </span>
        </div>
      )}

      {/* Top Action & Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Afunilamento Inteligente
              </span>
              <span className="text-xs text-slate-500">
                · {allMembers.length} participantes na base
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Triagem Musical por 5 Etapas Sequenciais
            </h2>
          </div>

          {/* Quick Search & Reset */}
          <div className="flex items-center gap-2 relative">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={quickSearchQuery}
                onChange={(e) => setQuickSearchQuery(e.target.value)}
                placeholder="Busca rápida por nome..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900 placeholder-slate-400"
              />
              {quickSearchQuery && (
                <button
                  onClick={() => setQuickSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Quick Search Dropdown */}
              {quickSearchResults.length > 0 && (
                <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden text-xs">
                  <div className="px-3 py-1.5 bg-slate-100 font-semibold text-slate-700 border-b border-slate-200">
                    Participantes Encontrados ({quickSearchResults.length})
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {quickSearchResults.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleSelectFromQuickSearch(m)}
                        className="w-full text-left p-2.5 hover:bg-amber-50 transition-colors flex flex-col gap-0.5"
                      >
                        <div className="font-semibold text-slate-900">{m.nome}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>{m.instrumento}</span>
                          <span>·</span>
                          <span>{m.cargo}</span>
                          <span>·</span>
                          <span className="text-slate-400">{m.localidade}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleResetFunnel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
              title="Limpar todos os filtros da triagem"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Limpar</span>
            </button>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            {/* Quick button to view manual registrations report */}
            <button
              onClick={onOpenManualReport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-amber-50 hover:bg-amber-100/80 border border-amber-300/80 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
              title="Abrir Relatório Oficial de Cadastros Manuais"
            >
              <FileText className="w-3.5 h-3.5 text-amber-700" />
              <span>Cadastros Manuais ({manualCount})</span>
            </button>

            {/* Quick button to add manual registration */}
            <button
              onClick={() => handleOpenManualModal(currentStep)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-xs"
              title="Cadastrar participante avulso no ensaio"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">+ Inscrição Manual</span>
            </button>
          </div>

        </div>

        {/* Funnel Visual Stepper & Breadcrumb Path */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            
            {/* Step 1 Tab */}
            <button
              onClick={() => setFunnel(f => ({ ...f, cargo: null, nivel: null, instrumento: null, localidade: null }))}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                funnel.cargo
                  ? 'border-emerald-200 bg-emerald-50/70 text-emerald-950'
                  : currentStep === 1
                  ? 'border-amber-400 bg-amber-50 text-slate-900 ring-2 ring-amber-400/30'
                  : 'border-slate-200 bg-slate-50/50 text-slate-500'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>1. Cargo</span>
                {funnel.cargo && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
              <div className="font-bold text-xs truncate mt-0.5">
                {funnel.cargo || 'Selecionar...'}
              </div>
            </button>

            {/* Step 2 Tab */}
            <button
              disabled={!funnel.cargo}
              onClick={() => setFunnel(f => ({ ...f, nivel: null, instrumento: null, localidade: null }))}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                !funnel.cargo
                  ? 'opacity-40 border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                  : funnel.nivel
                  ? 'border-emerald-200 bg-emerald-50/70 text-emerald-950'
                  : currentStep === 2
                  ? 'border-amber-400 bg-amber-50 text-slate-900 ring-2 ring-amber-400/30'
                  : 'border-slate-200 bg-slate-50/50 text-slate-500'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>2. Nível</span>
                {funnel.nivel && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
              <div className="font-bold text-xs truncate mt-0.5">
                {funnel.nivel || (funnel.cargo ? 'Selecionar...' : 'Aguardando')}
              </div>
            </button>

            {/* Step 3 Tab */}
            <button
              disabled={!funnel.nivel}
              onClick={() => setFunnel(f => ({ ...f, instrumento: null, localidade: null }))}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                !funnel.nivel
                  ? 'opacity-40 border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                  : funnel.instrumento
                  ? 'border-emerald-200 bg-emerald-50/70 text-emerald-950'
                  : currentStep === 3
                  ? 'border-amber-400 bg-amber-50 text-slate-900 ring-2 ring-amber-400/30'
                  : 'border-slate-200 bg-slate-50/50 text-slate-500'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>3. Instrumento</span>
                {funnel.instrumento && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
              <div className="font-bold text-xs truncate mt-0.5">
                {funnel.instrumento || (funnel.nivel ? 'Selecionar...' : 'Aguardando')}
              </div>
            </button>

            {/* Step 4 Tab */}
            <button
              disabled={!funnel.instrumento}
              onClick={() => setFunnel(f => ({ ...f, localidade: null }))}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                !funnel.instrumento
                  ? 'opacity-40 border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                  : funnel.localidade
                  ? 'border-emerald-200 bg-emerald-50/70 text-emerald-950'
                  : currentStep === 4
                  ? 'border-amber-400 bg-amber-50 text-slate-900 ring-2 ring-amber-400/30'
                  : 'border-slate-200 bg-slate-50/50 text-slate-500'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>4. Localidade</span>
                {funnel.localidade && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
              <div className="font-bold text-xs truncate mt-0.5">
                {funnel.localidade || (funnel.instrumento ? 'Selecionar...' : 'Aguardando')}
              </div>
            </button>

            {/* Step 5 Tab */}
            <div
              className={`col-span-2 sm:col-span-1 p-2.5 rounded-lg border text-left transition-all ${
                funnel.localidade
                  ? 'border-amber-500 bg-amber-500 text-slate-950 shadow-xs font-bold'
                  : 'opacity-40 border-slate-200 bg-slate-50 text-slate-400'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                5. Resultado
              </div>
              <div className="font-bold text-xs truncate mt-0.5">
                {funnel.localidade ? `${finalCandidates.length} candidato(s)` : 'Aguardando'}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ================= STEP 1: CARGO / MINISTÉRIO ================= */}
      {currentStep === 1 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-semibold text-amber-600">ETAPA 1 DE 5</span>
              <h3 className="text-base font-bold text-slate-900">Selecione o Cargo ou Ministério</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium tabular-nums">
              {availableCargos.length} cargos disponíveis
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableCargos.map(({ cargo, count }) => (
              <button
                key={cargo}
                onClick={() => setFunnel(f => ({ ...f, cargo, nivel: null, instrumento: null, localidade: null }))}
                className="group text-left p-3.5 rounded-xl border border-slate-200 hover:border-amber-400 bg-slate-50/50 hover:bg-amber-50/50 transition-all flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 group-hover:bg-amber-200 text-slate-700 group-hover:text-amber-900 flex items-center justify-center transition-colors">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 group-hover:text-amber-950 block">
                      {cargo}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {count === 1 ? '1 participante' : `${count} participantes`}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================= STEP 2: NÍVEL ================= */}
      {currentStep === 2 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-amber-600">ETAPA 2 DE 5</span>
                <span>·</span>
                <span className="text-slate-700">Cargo: <strong className="text-slate-900">{funnel.cargo}</strong></span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">Selecione o Nível do Participante</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium tabular-nums">
              {availableNiveis.length} níveis vinculados
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableNiveis.map(({ nivel, count }) => (
              <button
                key={nivel}
                onClick={() => setFunnel(f => ({ ...f, nivel, instrumento: null, localidade: null }))}
                className="group text-left p-3.5 rounded-xl border border-slate-200 hover:border-amber-400 bg-slate-50/50 hover:bg-amber-50/50 transition-all flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 group-hover:bg-amber-200 text-emerald-800 group-hover:text-amber-900 flex items-center justify-center transition-colors">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 group-hover:text-amber-950 block">
                      {nivel}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {count === 1 ? '1 participante' : `${count} participantes`}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
              </button>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => setFunnel(f => ({ ...f, cargo: null }))}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
            >
              ← Voltar para seleção de cargo
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 3: INSTRUMENTO ================= */}
      {currentStep === 3 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-amber-600">ETAPA 3 DE 5</span>
                <span>·</span>
                <span className="text-slate-700">{funnel.cargo} / {funnel.nivel}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">Selecione o Instrumento</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium tabular-nums">
              {availableInstrumentos.length} instrumentos vinculados
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableInstrumentos.map(({ instrumento, count, familia }) => (
              <button
                key={instrumento}
                onClick={() => setFunnel(f => ({ ...f, instrumento, localidade: null }))}
                className="group text-left p-3.5 rounded-xl border border-slate-200 hover:border-amber-400 bg-slate-50/50 hover:bg-amber-50/50 transition-all flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 group-hover:bg-amber-200 text-blue-800 group-hover:text-amber-900 flex items-center justify-center transition-colors">
                    <Music className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 group-hover:text-amber-950 block">
                      {instrumento}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Família: {familia} · {count} {count === 1 ? 'membro' : 'membros'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
              </button>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => setFunnel(f => ({ ...f, nivel: null }))}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
            >
              ← Voltar para seleção de nível
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 4: LOCALIDADE ================= */}
      {currentStep === 4 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-amber-600">ETAPA 4 DE 5</span>
                <span>·</span>
                <span className="text-slate-700">{funnel.cargo} / {funnel.nivel} / {funnel.instrumento}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">Selecione a Localidade (Comum Congregação)</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium tabular-nums hidden md:inline">
                {availableLocalidades.length} localidades vinculadas
              </span>
              <button
                onClick={() => handleOpenManualModal(4)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
                title="Cadastrar participante em outra congregação ou avulso"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Cadastrar Participante Avulso</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableLocalidades.map(({ localidade, count }) => (
              <button
                key={localidade}
                onClick={() => setFunnel(f => ({ ...f, localidade }))}
                className="group text-left p-3.5 rounded-xl border border-slate-200 hover:border-amber-400 bg-slate-50/50 hover:bg-amber-50/50 transition-all flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 group-hover:bg-amber-200 text-rose-800 group-hover:text-amber-900 flex items-center justify-center transition-colors">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 group-hover:text-amber-950 block">
                      {localidade}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {count === 1 ? '1 participante' : `${count} participantes`}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
              </button>
            ))}

            {/* Special Action Card for Manual Registration in Step 4 */}
            <button
              onClick={() => handleOpenManualModal(4)}
              className="group text-left p-3.5 rounded-xl border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-100/70 transition-all flex items-center justify-between gap-3 shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-200 group-hover:bg-amber-300 text-amber-950 flex items-center justify-center transition-colors">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-amber-950 block">
                    + Outra Localidade / Avulso
                  </span>
                  <span className="text-[11px] text-amber-800">
                    Cadastrar participante não listado
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-600 transition-colors" />
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setFunnel(f => ({ ...f, instrumento: null }))}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
            >
              ← Voltar para seleção de instrumento
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 5: NOME (RESULTADO & DESTAQUE) ================= */}
      {currentStep === 5 && (
        <div className="space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900 text-white p-4 rounded-xl shadow-md gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>ETAPA 5 · RESULTADO DO AFUNILAMENTO</span>
              </div>
              <p className="text-sm text-slate-200 mt-0.5">
                Critérios: <strong className="text-white">{funnel.cargo}</strong> · <strong className="text-white">{funnel.nivel}</strong> · <strong className="text-white">{funnel.instrumento}</strong> · <strong className="text-white">{funnel.localidade}</strong>
              </p>
            </div>
            
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => handleOpenManualModal(5)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg transition-colors whitespace-nowrap shadow-xs"
                title="Cadastrar participante manualmente nesta congregação"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Cadastrar Manual</span>
              </button>
              <button
                onClick={handleResetFunnel}
                className="px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors whitespace-nowrap"
              >
                Nova Triagem
              </button>
            </div>
          </div>

          {/* Empty result fallback */}
          {finalCandidates.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <UserX className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  NENHUM PARTICIPANTE ENCONTRADO COM OS CRITÉRIOS SELECIONADOS.
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  O participante pode não constar no relatório oficial do PDF. Você pode cadastrá-lo manualmente agora mesmo para esta congregação e instrumento.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => handleOpenManualModal(5)}
                  className="px-4 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Cadastrar Participante nesta Localidade (Manual)</span>
                </button>
                <button
                  onClick={handleResetFunnel}
                  className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Reiniciar Afunilamento
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {finalCandidates.map((m) => {
                const isPresente = m.statusPresenca === 'presente';

                return (
                  <div
                    key={m.id}
                    className={`rounded-2xl border-2 transition-all p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isPresente
                        ? 'border-emerald-500 bg-emerald-50/25 ring-1 ring-emerald-500/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {/* Nome do Participante */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Nome do Participante
                        </span>
                        {m.isManual && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                            ★ Manual
                          </span>
                        )}
                        <span className={`text-[10px] font-bold uppercase ${
                          isPresente ? 'text-emerald-700' : 'text-slate-400'
                        }`}>
                          {isPresente ? '● PRESENTE' : '○ AUSENTE'}
                        </span>
                      </div>
                      
                      <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug uppercase">
                        {m.nome}
                      </h3>
                    </div>

                    {/* Ações: Ícone Check Verde e Save */}
                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                      
                      {/* Ícone Check Verde (marca / desmarca presença) */}
                      <button
                        type="button"
                        onClick={() => handleToggleAttendance(m)}
                        className={`relative p-1.5 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                          isPresente
                            ? 'bg-emerald-100 ring-2 ring-emerald-500 shadow-xs'
                            : 'bg-slate-50 hover:bg-emerald-50 border border-slate-200 opacity-60 hover:opacity-100'
                        }`}
                        title={isPresente ? 'Presença confirmada (clique para alternar)' : 'Marcar como presente'}
                      >
                        <img
                          src="/assets/aistudio/image_ad0286d7.png"
                          alt="Check Verde"
                          className={`w-9 h-9 object-contain transition-transform ${
                            isPresente ? 'scale-105' : 'grayscale group-hover:grayscale-0'
                          }`}
                        />
                      </button>

                      {/* Botão Save com o ícone disquete oficial anexado */}
                      <button
                        type="button"
                        onClick={() => handleSaveAndGoToNewTriage(m)}
                        className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer ${
                          savedSuccessMemberId === m.id
                            ? 'bg-emerald-600 text-white shadow-emerald-500/25 ring-2 ring-emerald-400 scale-102'
                            : isPresente
                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25 ring-2 ring-blue-400'
                            : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
                        }`}
                        title="Salvar e ir automaticamente para Nova Triagem"
                      >
                        <img
                          src="/assets/aistudio/image_58212ce0.png"
                          alt="Save"
                          className="w-7 h-7 object-contain rounded-md shadow-2xs group-hover:scale-105 transition-transform"
                        />
                        <span className="text-xs font-black tracking-wider uppercase">
                          {savedSuccessMemberId === m.id ? 'Salvo ✓' : isPresente ? 'Salvo' : 'Save'}
                        </span>
                      </button>

                    </div>
                  </div>
                );
              })}

              {/* Action Card to Add Another Manual Attendee in Step 5 */}
              <div className="md:col-span-2 border-2 border-dashed border-slate-300 hover:border-amber-400 rounded-xl p-4 bg-slate-50/70 hover:bg-amber-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Não encontrou o participante nesta congregação?
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Cadastre um participante avulso com os critérios selecionados ({funnel.cargo} · {funnel.nivel} · {funnel.instrumento} · {funnel.localidade}).
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenManualModal(5)}
                  className="px-3.5 py-1.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg transition-colors shadow-2xs whitespace-nowrap self-start sm:self-auto"
                >
                  + Cadastrar Manualmente
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* Manual Registration Modal */}
      <ManualRegistrationModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSave={handleSaveManualMember}
        initialValues={manualInitialValues}
        knownLocalidades={knownLocalidades}
        knownInstrumentos={knownInstrumentos}
        knownCargos={knownCargos}
        knownNiveis={knownNiveis}
      />

    </div>
  );
};
