import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AttendanceStatus, MemberRecord } from '../types';
import { getInstrumentFamily } from '../services/pdfParser';
import { 
  X, 
  UserPlus, 
  Check, 
  MapPin, 
  Music, 
  Briefcase, 
  Award, 
  Search, 
  ChevronDown, 
  PlusCircle,
  Building2
} from 'lucide-react';

interface ManualRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    nome: string;
    instrumento: string;
    familia: MemberRecord['familia'];
    localidade: string;
    cargo: string;
    nivel: string;
    statusPresenca: AttendanceStatus;
    observacao?: string;
    oficializadoNoEnsaio?: boolean;
  }) => void;
  initialValues?: {
    cargo?: string | null;
    nivel?: string | null;
    instrumento?: string | null;
    localidade?: string | null;
  };
  knownLocalidades?: string[];
  knownInstrumentos?: string[];
  knownCargos?: string[];
  knownNiveis?: string[];
}

export const ManualRegistrationModal: React.FC<ManualRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialValues,
  knownLocalidades = [],
  knownInstrumentos = [],
  knownCargos = [],
  knownNiveis = [],
}) => {
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('MÚSICO');
  const [nivel, setNivel] = useState('CANDIDATO(A)');
  const [instrumento, setInstrumento] = useState('VIOLINO');
  
  // Smart Search Combobox State for Localidade
  const [localidadeInput, setLocalidadeInput] = useState('');
  const [isLocalidadeDropdownOpen, setIsLocalidadeDropdownOpen] = useState(false);
  const comboboxRef = useRef<HTMLDivElement>(null);

  const [statusPresenca, setStatusPresenca] = useState<AttendanceStatus>('presente');
  const [observacao, setObservacao] = useState('');
  const [oficializadoNoEnsaio, setOficializadoNoEnsaio] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close combobox dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsLocalidadeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sync initial values whenever modal opens or initial values change
  useEffect(() => {
    if (isOpen) {
      setNome('');
      setObservacao('');
      setStatusPresenca('presente');
      setOficializadoNoEnsaio(false);
      setError(null);

      if (initialValues?.cargo) setCargo(initialValues.cargo);
      else setCargo('MÚSICO');

      if (initialValues?.nivel) setNivel(initialValues.nivel);
      else setNivel('CANDIDATO(A)');

      if (initialValues?.instrumento) setInstrumento(initialValues.instrumento);
      else setInstrumento('VIOLINO');

      if (initialValues?.localidade) {
        setLocalidadeInput(initialValues.localidade);
      } else if (knownLocalidades.length > 0) {
        setLocalidadeInput(knownLocalidades[0]);
      } else {
        setLocalidadeInput('');
      }
      setIsLocalidadeDropdownOpen(false);
    }
  }, [isOpen, initialValues, knownLocalidades]);

  // Filtered registered localidades based on typed text
  const filteredLocalidades = useMemo(() => {
    const q = localidadeInput.trim().toLowerCase();
    if (!q) return knownLocalidades;
    return knownLocalidades.filter(loc => loc.toLowerCase().includes(q));
  }, [knownLocalidades, localidadeInput]);

  // Check if current input matches exactly a registered one
  const isExactRegisteredMatch = useMemo(() => {
    const trimmed = localidadeInput.trim().toUpperCase();
    return knownLocalidades.some(loc => loc.toUpperCase() === trimmed);
  }, [knownLocalidades, localidadeInput]);

  const defaultCargos = useMemo(() => {
    const set = new Set([
      'MÚSICO',
      'ORGANISTA',
      'INSTRUTOR',
      'INSTRUTORA',
      'ENCARREGADO LOCAL',
      'ENCARREGADO REGIONAL',
      'SECRETÁRIO (A) DA MÚSICA',
      ...knownCargos
    ]);
    return Array.from(set).sort();
  }, [knownCargos]);

  const defaultNiveis = useMemo(() => {
    const set = new Set([
      'CANDIDATO(A)',
      'ENSAIO',
      'RJM',
      'RJM / ENSAIO',
      'RJM / CULTO OFICIAL',
      'CULTO OFICIAL',
      'OFICIALIZADO(A)',
      'RJM / OFICIALIZADO(A)',
      ...knownNiveis
    ]);
    return Array.from(set).sort();
  }, [knownNiveis]);

  const defaultInstrumentos = useMemo(() => {
    const set = new Set([
      'VIOLINO',
      'VIOLA',
      'VIOLONCELO',
      'FLAUTA',
      'CLARINETE',
      'CLARONE ALTO',
      'CLARONE BAIXO',
      'OBOÉ',
      'FAGOTE',
      'SAXOFONE SOPRANO',
      'SAXOFONE ALTO',
      'SAXOFONE TENOR',
      'SAXOFONE BARÍTONO',
      'SAXOFONE BAIXO',
      'TROMPETE',
      'CORNET',
      'FLUGELHORN',
      'TROMPA',
      'TROMBONE',
      'TROMBONITO',
      'BARÍTONO DE PISTO',
      'EUFÔNIO',
      'TUBA',
      'ACORDEON',
      'ÓRGÃO',
      ...knownInstrumentos
    ]);
    return Array.from(set).sort();
  }, [knownInstrumentos]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalNome = nome.trim();
    const finalLocalidade = localidadeInput.trim().toUpperCase();

    if (!finalNome || finalNome.length < 3) {
      setError('Por favor, informe o nome completo do participante (ao menos 3 letras).');
      return;
    }

    if (!finalLocalidade) {
      setError('Por favor, informe a Comum Congregação / Localidade.');
      return;
    }

    const calculatedFamily = getInstrumentFamily(instrumento);

    onSave({
      nome: finalNome.toUpperCase(),
      cargo: cargo.toUpperCase(),
      nivel: nivel.toUpperCase(),
      instrumento: instrumento.toUpperCase(),
      familia: calculatedFamily,
      localidade: finalLocalidade,
      statusPresenca,
      observacao: observacao.trim() || undefined,
      oficializadoNoEnsaio,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div 
        className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                  Inscrição Manual no Ensaio
                </span>
                <span className="text-[11px] text-slate-300">Etapas 4 / 5</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Cadastrar Participante Avulso
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-800 rounded-lg font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* Nome Completo */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Nome Completo do Participante *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Ex: SILAS DE OLIVEIRA SANTOS"
              className="w-full px-3.5 py-2.5 text-sm font-semibold border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 uppercase placeholder:normal-case placeholder:font-normal placeholder:text-slate-400"
            />
          </div>

          {/* Grid: Cargo, Nível, Instrumento */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>Cargo / Ministério</span>
              </label>
              <select
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className="w-full px-2.5 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                {defaultCargos.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-slate-400" />
                <span>Nível Musical</span>
              </label>
              <select
                value={nivel}
                onChange={(e) => setNivel(e.target.value)}
                className="w-full px-2.5 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                {defaultNiveis.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <Music className="w-3.5 h-3.5 text-slate-400" />
                <span>Instrumento</span>
              </label>
              <select
                value={instrumento}
                onChange={(e) => setInstrumento(e.target.value)}
                className="w-full px-2.5 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                {defaultInstrumentos.map((inst) => (
                  <option key={inst} value={inst}>{inst}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Localidade (Comum Congregação) com Busca Inteligente */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 relative" ref={comboboxRef}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Localidade (Comum Congregação) *</span>
              </label>

              {localidadeInput.trim() && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors ${
                  isExactRegisteredMatch
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-900 border-amber-300'
                }`}>
                  {isExactRegisteredMatch ? '✓ Cadastrada na Base' : '★ Nova Localidade (Avulsa)'}
                </span>
              )}
            </div>

            {/* Smart Combobox Input */}
            <div className="relative">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={localidadeInput}
                  onChange={(e) => {
                    setLocalidadeInput(e.target.value);
                    setIsLocalidadeDropdownOpen(true);
                    if (error) setError(null);
                  }}
                  onFocus={() => setIsLocalidadeDropdownOpen(true)}
                  placeholder="Digite letras para filtrar ou digite uma nova localidade..."
                  className="w-full pl-9 pr-16 py-2.5 text-xs font-bold uppercase bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 placeholder:normal-case placeholder:font-normal placeholder:text-slate-400 shadow-2xs"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  {localidadeInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setLocalidadeInput('');
                        setIsLocalidadeDropdownOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                      title="Limpar campo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsLocalidadeDropdownOpen(!isLocalidadeDropdownOpen)}
                    className="p-1 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-100"
                    title="Ver lista de localidades"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${isLocalidadeDropdownOpen ? 'rotate-180 text-amber-600' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Dropdown Menu com Sugestões e Opção de Nova Localidade */}
              {isLocalidadeDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-300 rounded-xl shadow-xl max-h-56 overflow-y-auto z-50 divide-y divide-slate-100 animate-in fade-in duration-100">
                  
                  {/* Option to use custom typed text if not exactly matching a registered one */}
                  {localidadeInput.trim() && !isExactRegisteredMatch && (
                    <button
                      type="button"
                      onClick={() => {
                        setLocalidadeInput(localidadeInput.trim().toUpperCase());
                        setIsLocalidadeDropdownOpen(false);
                      }}
                      className="w-full text-left p-2.5 bg-amber-50/80 hover:bg-amber-100 transition-colors flex items-center justify-between gap-2 border-b border-amber-200"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                          <PlusCircle className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-amber-950 block">
                            Usar nova localidade: "{localidadeInput.trim().toUpperCase()}"
                          </span>
                          <span className="text-[10px] text-amber-800">
                            Cadastrar comum congregação avulsa (não cadastrada no PDF)
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded">
                        Nova
                      </span>
                    </button>
                  )}

                  {/* List of filtered registered localidades */}
                  {filteredLocalidades.length > 0 ? (
                    <div>
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 flex items-center justify-between">
                        <span>Localidades na Base Oficial ({filteredLocalidades.length})</span>
                        <span className="text-[9px] text-slate-400">Clique para selecionar</span>
                      </div>
                      {filteredLocalidades.map((loc) => {
                        const isSelected = loc.toUpperCase() === localidadeInput.trim().toUpperCase();
                        return (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => {
                              setLocalidadeInput(loc);
                              setIsLocalidadeDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                              isSelected 
                                ? 'bg-amber-50 text-amber-950 font-bold' 
                                : 'hover:bg-slate-50 text-slate-800 font-semibold'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-600' : 'text-slate-400'}`} />
                              <span>{loc}</span>
                            </div>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 text-center text-xs text-slate-500">
                      Nenhuma localidade oficial encontrada com "{localidadeInput}". Você pode utilizar o que digitou como uma nova localidade avulsa.
                    </div>
                  )}

                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-0.5">
              <span>💡 Digite algumas letras para buscar ou escreva livremente o nome de uma localidade não cadastrada.</span>
            </div>
          </div>

          {/* Presença e Observações */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            
            {/* Status de Presença */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Status Inicial de Presença
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setStatusPresenca('presente')}
                  className={`py-1.5 text-xs font-bold rounded-md transition-colors ${
                    statusPresenca === 'presente'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ✓ Presente
                </button>
                <button
                  type="button"
                  onClick={() => setStatusPresenca('ausente')}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                    statusPresenca === 'ausente'
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Ausente
                </button>
                <button
                  type="button"
                  onClick={() => setStatusPresenca('justificado')}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                    statusPresenca === 'justificado'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Justificado
                </button>
              </div>
            </div>

            {/* Oficializado no Ensaio */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 w-full">
                <input
                  type="checkbox"
                  checked={oficializadoNoEnsaio}
                  onChange={(e) => setOficializadoNoEnsaio(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800">
                  Oficializado(a) neste Ensaio
                </span>
              </label>
            </div>

          </div>

          {/* Observação */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Observação / Motivo do Cadastro Manual (Opcional)
            </label>
            <input
              type="text"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex: Transferido recentemente, sem ficha no PDF oficial, visitante..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 placeholder:text-slate-400"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-xl shadow-md transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Concluir e Salvar Cadastro</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
