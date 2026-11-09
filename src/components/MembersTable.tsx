import React, { useState, useMemo } from 'react';
import { MemberRecord, AttendanceStatus, EventModule } from '../types';
import { 
  Search, 
  Filter, 
  Download, 
  UserCheck, 
  UserX, 
  CheckSquare, 
  Square, 
  RotateCcw,
  MessageSquare,
  ChevronDown
} from 'lucide-react';

interface MembersTableProps {
  event: EventModule;
  onUpdateAttendance: (memberId: string, status: AttendanceStatus, observacao?: string) => void;
  onBatchUpdateAttendance: (memberIds: string[], status: AttendanceStatus) => void;
  onResetAllAttendance: () => void;
}

export const MembersTable: React.FC<MembersTableProps> = ({
  event,
  onUpdateAttendance,
  onBatchUpdateAttendance,
  onResetAllAttendance
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCargo, setSelectedCargo] = useState('ALL');
  const [selectedNivel, setSelectedNivel] = useState('ALL');
  const [selectedFamilia, setSelectedFamilia] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedLocalidade, setSelectedLocalidade] = useState('ALL');
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null);
  const [obsText, setObsText] = useState('');

  // Dropdown options
  const cargos = useMemo(() => ['ALL', ...Array.from(new Set(event.membros.map(m => m.cargo)))], [event.membros]);
  const niveis = useMemo(() => ['ALL', ...Array.from(new Set(event.membros.map(m => m.nivel)))], [event.membros]);
  const familias = useMemo(() => ['ALL', 'Cordas', 'Madeiras', 'Metais', 'Teclas'], []);
  const localidades = useMemo(() => ['ALL', ...Array.from(new Set(event.membros.map(m => m.localidade))).sort()], [event.membros]);

  // Filtered members
  const filteredMembers = useMemo(() => {
    return event.membros.filter(m => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = m.nome.toLowerCase().includes(q);
        const matchesInst = m.instrumento.toLowerCase().includes(q);
        const matchesLoc = m.localidade.toLowerCase().includes(q);
        if (!matchesName && !matchesInst && !matchesLoc) return false;
      }
      if (selectedCargo !== 'ALL' && m.cargo !== selectedCargo) return false;
      if (selectedNivel !== 'ALL' && m.nivel !== selectedNivel) return false;
      if (selectedFamilia !== 'ALL' && m.familia !== selectedFamilia) return false;
      if (selectedStatus !== 'ALL' && m.statusPresenca !== selectedStatus) return false;
      if (selectedLocalidade !== 'ALL' && m.localidade !== selectedLocalidade) return false;
      return true;
    });
  }, [event.membros, searchQuery, selectedCargo, selectedNivel, selectedFamilia, selectedStatus, selectedLocalidade]);

  // Toggle selection
  const handleSelectAll = () => {
    if (selectedIds.length === filteredMembers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMembers.map(m => m.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBatchPresente = () => {
    if (selectedIds.length === 0) return;
    onBatchUpdateAttendance(selectedIds, 'presente');
    setSelectedIds([]);
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'NOME', 'INSTRUMENTO', 'FAMILIA', 'LOCALIDADE', 'CARGO', 'NIVEL', 'PAGINA_PDF', 'PRESENCA', 'OBSERVACAO'];
    const rows = filteredMembers.map(m => [
      `"${m.id}"`,
      `"${m.nome.replace(/"/g, '""')}"`,
      `"${m.instrumento}"`,
      `"${m.familia}"`,
      `"${m.localidade}"`,
      `"${m.cargo}"`,
      `"${m.nivel}"`,
      m.pagina,
      `"${m.statusPresenca.toUpperCase()}"`,
      `"${(m.observacao || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_${event.nome.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden space-y-4 p-5">
      
      {/* Header and Counters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Relação Completa de Participantes
          </h2>
          <p className="text-xs text-slate-500">
            Exibindo <strong className="text-slate-800">{filteredMembers.length}</strong> de {event.membros.length} participantes da base oficial
            {' · '}
            <span className="font-semibold text-emerald-700">{event.membros.filter(m => m.statusPresenca === 'presente').length} presentes</span>
            {' · '}
            <span className="text-slate-500">{event.membros.filter(m => m.statusPresenca === 'ausente').length} ausentes</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBatchPresente}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg shadow-xs hover:bg-emerald-500 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Marcar ({selectedIds.length}) Presentes</span>
            </button>
          )}

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Deseja realmente redefinir todas as presenças deste evento para Ausente?')) {
                onResetAllAttendance();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
            title="Redefinir presenças para início de novo ensaio"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Zerar Presenças</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100 text-xs">
        
        {/* Search Input */}
        <div className="sm:col-span-2 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar por nome, instrumento..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:bg-white text-slate-900 placeholder-slate-400"
          />
        </div>

        {/* Cargo Filter */}
        <div>
          <select
            value={selectedCargo}
            onChange={(e) => setSelectedCargo(e.target.value)}
            className="w-full py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
          >
            <option value="ALL">Todos os Cargos</option>
            {cargos.filter(c => c !== 'ALL').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Nível Filter */}
        <div>
          <select
            value={selectedNivel}
            onChange={(e) => setSelectedNivel(e.target.value)}
            className="w-full py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
          >
            <option value="ALL">Todos os Níveis</option>
            {niveis.filter(n => n !== 'ALL').map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* Família Filter */}
        <div>
          <select
            value={selectedFamilia}
            onChange={(e) => setSelectedFamilia(e.target.value)}
            className="w-full py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
          >
            <option value="ALL">Todas Famílias</option>
            <option value="Cordas">Cordas</option>
            <option value="Madeiras">Madeiras</option>
            <option value="Metais">Metais</option>
            <option value="Teclas">Teclas</option>
          </select>
        </div>

        {/* Presença Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
          >
            <option value="ALL">Qualquer Presença</option>
            <option value="presente">Apenas Presentes</option>
            <option value="ausente">Apenas Ausentes</option>
            <option value="justificado">Apenas Justificados</option>
          </select>
        </div>

      </div>

      {/* Main Table */}
      <div className="border border-slate-200 rounded-lg overflow-x-auto">
        <table className="w-full text-left text-xs divide-y divide-slate-200">
          <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredMembers.length && filteredMembers.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                />
              </th>
              <th className="p-3">Nome do Participante</th>
              <th className="p-3">Instrumento</th>
              <th className="p-3">Localidade</th>
              <th className="p-3">Cargo / Ministério</th>
              <th className="p-3">Nível</th>
              <th className="p-3 text-center">PDF</th>
              <th className="p-3 text-center">Presença</th>
              <th className="p-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-500">
                  Nenhum registro encontrado com os filtros atuais.
                </td>
              </tr>
            ) : (
              filteredMembers.map((m) => {
                const isSelected = selectedIds.includes(m.id);
                const isPresente = m.statusPresenca === 'presente';
                const isJustificado = m.statusPresenca === 'justificado';

                return (
                  <tr 
                    key={m.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isSelected ? 'bg-amber-50/50' : isPresente ? 'bg-emerald-50/15' : ''
                    }`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(m.id)}
                        className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                      />
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{m.nome}</span>
                        {(m.isManual || m.id.startsWith('MAN-')) && (
                          <span className="text-[9px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded border border-amber-300">
                            MANUAL
                          </span>
                        )}
                      </div>
                      {m.observacao && (
                        <div className="text-[11px] text-amber-800 italic mt-0.5 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 inline text-amber-600" />
                          <span>{m.observacao}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-medium text-slate-800">
                      {m.instrumento}
                      <span className="text-[10px] text-slate-400 block font-normal">{m.familia}</span>
                    </td>
                    <td className="p-3 text-slate-700">{m.localidade}</td>
                    <td className="p-3 font-semibold text-slate-800">{m.cargo}</td>
                    <td className="p-3 text-slate-600">{m.nivel}</td>
                    <td className="p-3 text-center tabular-nums text-slate-500 font-medium">
                      {(m.isManual || m.id.startsWith('MAN-')) ? (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          Avulso
                        </span>
                      ) : (
                        `Pág. ${m.pagina}`
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isPresente
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : isJustificado
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {m.statusPresenca}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onUpdateAttendance(m.id, isPresente ? 'ausente' : 'presente')}
                          className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
                            isPresente
                              ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                              : 'bg-emerald-600 text-white hover:bg-emerald-500'
                          }`}
                        >
                          {isPresente ? 'Ausente' : 'Presente'}
                        </button>

                        <button
                          onClick={() => {
                            setActiveEditingId(m.id);
                            setObsText(m.observacao || '');
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                          title="Observação"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {activeEditingId === m.id && (
                        <div className="mt-2 text-left bg-white border border-slate-300 p-2 rounded shadow-lg absolute z-20 w-64 -translate-x-32">
                          <span className="block text-[10px] font-bold text-slate-700 mb-1">Observação do Participante</span>
                          <input
                            type="text"
                            value={obsText}
                            onChange={(e) => setObsText(e.target.value)}
                            placeholder="Anotações para o relatório..."
                            className="w-full text-xs p-1.5 border border-slate-300 rounded mb-2"
                          />
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => {
                                onUpdateAttendance(m.id, m.statusPresenca, obsText);
                                setActiveEditingId(null);
                              }}
                              className="px-2 py-0.5 bg-slate-900 text-white rounded text-[11px] font-bold"
                            >
                              Salvar
                            </button>
                            <button
                              onClick={() => setActiveEditingId(null)}
                              className="px-2 py-0.5 text-slate-500 text-[11px]"
                            >
                              Fechar
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
