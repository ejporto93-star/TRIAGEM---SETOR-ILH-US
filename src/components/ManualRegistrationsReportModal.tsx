import React, { useState, useMemo } from 'react';
import { EventModule, MemberRecord, AttendanceStatus } from '../types';
import { 
  X, 
  Printer, 
  Download, 
  Search, 
  UserPlus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Music, 
  Briefcase,
  AlertCircle,
  FileText
} from 'lucide-react';

interface ManualRegistrationsReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventModule;
  onUpdateAttendance: (memberId: string, status: AttendanceStatus, observacao?: string) => void;
  onDeleteManualMember: (memberId: string) => void;
  onOpenNewRegistration: () => void;
}

export const ManualRegistrationsReportModal: React.FC<ManualRegistrationsReportModalProps> = ({
  isOpen,
  onClose,
  event,
  onUpdateAttendance,
  onDeleteManualMember,
  onOpenNewRegistration,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'presente' | 'ausente' | 'justificado'>('todos');
  const [memberToDelete, setMemberToDelete] = useState<MemberRecord | null>(null);

  // Filter only members flagged as manual (isManual === true or ID starts with 'MAN-')
  const manualMembers = useMemo(() => {
    return event.membros.filter(m => m.isManual || m.id.startsWith('MAN-'));
  }, [event.membros]);

  // Filtered list based on search and status
  const filteredList = useMemo(() => {
    return manualMembers.filter(m => {
      if (statusFilter !== 'todos' && m.statusPresenca !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.nome.toLowerCase().includes(q) ||
          m.localidade.toLowerCase().includes(q) ||
          m.instrumento.toLowerCase().includes(q) ||
          m.cargo.toLowerCase().includes(q) ||
          (m.observacao && m.observacao.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [manualMembers, statusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = manualMembers.length;
    const presentes = manualMembers.filter(m => m.statusPresenca === 'presente').length;
    const ausentes = manualMembers.filter(m => m.statusPresenca === 'ausente').length;
    const justificados = manualMembers.filter(m => m.statusPresenca === 'justificado').length;
    const oficializados = manualMembers.filter(m => m.oficializadoNoEnsaio).length;
    
    // Distinct localities
    const locSet = new Set(manualMembers.map(m => m.localidade));

    return {
      total,
      presentes,
      ausentes,
      justificados,
      oficializados,
      totalLocalidades: locSet.size
    };
  }, [manualMembers]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Data/Hora Cadastro', 'Nome Completo', 'Cargo', 'Nível', 'Instrumento', 'Família', 'Localidade', 'Status Presença', 'Oficializado no Ensaio', 'Observação'];
    const rows = manualMembers.map(m => [
      m.id,
      m.cadastradoEm ? new Date(m.cadastradoEm).toLocaleString('pt-BR') : '',
      `"${m.nome.replace(/"/g, '""')}"`,
      `"${m.cargo}"`,
      `"${m.nivel}"`,
      `"${m.instrumento}"`,
      `"${m.familia}"`,
      `"${m.localidade.replace(/"/g, '""')}"`,
      m.statusPresenca.toUpperCase(),
      m.oficializadoNoEnsaio ? 'SIM' : 'NÃO',
      `"${(m.observacao || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cadastros_manuais_${event.id}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden my-4 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header (Screen Only) */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                  Relatório Oficial de Cadastros Manuais
                </span>
                <span className="text-xs text-slate-400">· {event.nome}</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Inscrições Manuais e Participantes Avulsos
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNewRegistration}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">+ Novo Cadastro</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
              title="Exportar CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs transition-colors"
              title="Imprimir Relatório A4"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir A4</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper View Wrapper */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 print:p-0 print:space-y-4">
          
          {/* Printable Official Header (Always visible on print and screen) */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                  CONGREGAÇÃO CRISTÃ NO BRASIL — SETOR ILHÉUS
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  RELATÓRIO DE INSCRIÇÕES E CADASTROS MANUAIS NO ENSAIO
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  Evento: <strong className="text-slate-900">{event.nome}</strong> · Local: <strong>{event.local} ({event.cidadeUf})</strong> · Data: <strong>{event.data}</strong>
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Emissão Oficial
                </span>
                <span className="text-xs font-bold text-slate-800 tabular-nums">
                  {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-1 inline-block">
                  {stats.presentes} PRESENTES de {stats.total} CADASTRADOS
                </span>
              </div>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[11px] font-bold uppercase text-slate-500 block">
                Total de Cadastros Manuais
              </span>
              <span className="text-2xl font-black text-slate-900 mt-0.5 block tabular-nums">
                {stats.total}
              </span>
              <span className="text-[11px] text-slate-500">
                Em {stats.totalLocalidades} {stats.totalLocalidades === 1 ? 'localidade' : 'localidades'}
              </span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <span className="text-[11px] font-bold uppercase text-emerald-800 block">
                Presentes Confirmados
              </span>
              <span className="text-2xl font-black text-emerald-900 mt-0.5 block tabular-nums">
                {stats.presentes}
              </span>
              <span className="text-[11px] text-emerald-700 font-medium">
                {stats.total > 0 ? `${Math.round((stats.presentes / stats.total) * 100)}% de frequência` : '0%'}
              </span>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <span className="text-[11px] font-bold uppercase text-amber-800 block">
                Ausentes / Justificados
              </span>
              <span className="text-2xl font-black text-amber-900 mt-0.5 block tabular-nums">
                {stats.ausentes + stats.justificados}
              </span>
              <span className="text-[11px] text-amber-700">
                {stats.ausentes} ausentes · {stats.justificados} justificados
              </span>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <span className="text-[11px] font-bold uppercase text-blue-800 block">
                Oficializados no Ensaio
              </span>
              <span className="text-2xl font-black text-blue-900 mt-0.5 block tabular-nums">
                {stats.oficializados}
              </span>
              <span className="text-[11px] text-blue-700">
                Com aptidão registrada
              </span>
            </div>

          </div>

          {/* Search and Filters Toolbar (Screen Only) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
            
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome, localidade, instrumento..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setStatusFilter('todos')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                  statusFilter === 'todos' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Todos ({manualMembers.length})
              </button>
              <button
                onClick={() => setStatusFilter('presente')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                  statusFilter === 'presente' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
                }`}
              >
                Presentes ({stats.presentes})
              </button>
              <button
                onClick={() => setStatusFilter('ausente')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                  statusFilter === 'ausente' ? 'bg-slate-700 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Ausentes ({stats.ausentes})
              </button>
              <button
                onClick={() => setStatusFilter('justificado')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                  statusFilter === 'justificado' ? 'bg-amber-600 text-white' : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
                }`}
              >
                Justificados ({stats.justificados})
              </button>
            </div>

          </div>

          {/* Table of Manual Attendees */}
          {filteredList.length === 0 ? (
            <div className="border border-dashed border-slate-300 rounded-xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                Nenhum cadastro manual encontrado
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {manualMembers.length === 0 
                  ? 'Ainda não foram realizados cadastros manuais neste ensaio. Você pode incluir participantes avulsos pelas etapas 4 ou 5 da Triagem Funil.'
                  : 'Nenhum resultado corresponde ao filtro de busca selecionado.'}
              </p>
              {manualMembers.length === 0 && (
                <button
                  onClick={onOpenNewRegistration}
                  className="px-4 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl shadow-xs transition-colors"
                >
                  + Cadastrar Primeiro Participante Avulso
                </button>
              )}
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-[10px] w-12 text-center">#</th>
                    <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-[10px]">Data / Hora</th>
                    <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-[10px]">Nome Completo</th>
                    <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-[10px]">Cargo / Nível</th>
                    <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-[10px]">Instrumento</th>
                    <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-[10px]">Localidade</th>
                    <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-[10px] text-center">Presença</th>
                    <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-[10px]">Observação</th>
                    <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-[10px] text-right no-print">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredList.map((m, idx) => {
                    const isPresente = m.statusPresenca === 'presente';
                    const isJustificado = m.statusPresenca === 'justificado';
                    const isAusente = m.statusPresenca === 'ausente';

                    return (
                      <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 text-center font-bold text-slate-400 tabular-nums">
                          {idx + 1}
                        </td>

                        <td className="py-2.5 px-3 font-medium text-slate-500 whitespace-nowrap tabular-nums">
                          {m.cadastradoEm 
                            ? new Date(m.cadastradoEm).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
                            : 'No ensaio'}
                        </td>

                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span>{m.nome}</span>
                            {m.oficializadoNoEnsaio && (
                              <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">
                                Oficializado
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            ID: {m.id}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                          <strong className="block font-semibold">{m.cargo}</strong>
                          <span className="text-[11px] text-slate-500">{m.nivel}</span>
                        </td>

                        <td className="py-2.5 px-3 text-slate-800 whitespace-nowrap">
                          <span className="font-semibold block">{m.instrumento}</span>
                          <span className="text-[11px] text-slate-500">Família: {m.familia}</span>
                        </td>

                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {m.localidade}
                        </td>

                        {/* Presença badge with quick-toggle in screen view */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase ${
                            isPresente 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isJustificado
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-slate-100 text-slate-600 border border-slate-300'
                          }`}>
                            {isPresente ? '● Presente' : isJustificado ? '▲ Justificado' : '○ Ausente'}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate" title={m.observacao || ''}>
                          {m.observacao ? (
                            <span className="text-[11px] italic text-amber-900 bg-amber-50/80 px-1.5 py-0.5 rounded border border-amber-200">
                              {m.observacao}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>

                        {/* Actions (Screen only) */}
                        <td className="py-2.5 px-3 text-right whitespace-nowrap no-print">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                const nextStatus: AttendanceStatus = isPresente ? 'ausente' : 'presente';
                                onUpdateAttendance(m.id, nextStatus);
                              }}
                              className={`px-2 py-1 text-[11px] font-bold rounded transition-colors ${
                                isPresente
                                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
                              }`}
                              title="Alternar presença"
                            >
                              {isPresente ? 'Desmarcar' : 'Presente'}
                            </button>

                            <button
                              onClick={() => setMemberToDelete(m)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Excluir cadastro manual"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Official Signatures for Printed Document */}
          <div className="pt-8 border-t border-slate-300 hidden print:block">
            <div className="grid grid-cols-2 gap-12 text-center text-xs">
              <div>
                <div className="border-t border-slate-800 pt-1 font-bold text-slate-900 uppercase">
                  {event.encarregadoRegional || 'Encarregado Regional'}
                </div>
                <div className="text-[10px] text-slate-600 uppercase">Encarregado Regional do Setor</div>
              </div>
              <div>
                <div className="border-t border-slate-800 pt-1 font-bold text-slate-900 uppercase">
                  {event.anciaoAtendimento || 'Ancião no Atendimento'}
                </div>
                <div className="text-[10px] text-slate-600 uppercase">Ancião que Presidiu o Ensaio</div>
              </div>
            </div>
          </div>

        </div>

        {/* Delete Confirmation Sub-Modal */}
        {memberToDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 space-y-3 border border-slate-200 animate-in fade-in zoom-in-95">
              <h4 className="text-sm font-bold text-slate-900">
                Confirmar Exclusão de Cadastro Manual
              </h4>
              <p className="text-xs text-slate-600">
                Deseja realmente remover o cadastro manual de <strong>{memberToDelete.nome}</strong>?
                Esta ação atualizará os totais de presença e o histórico de auditoria.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setMemberToDelete(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onDeleteManualMember(memberToDelete.id);
                    setMemberToDelete(null);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-xs"
                >
                  Sim, Excluir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer (Screen Only) */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 sm:p-4 flex items-center justify-between text-xs text-slate-600 no-print">
          <div>
            Exibindo <strong>{filteredList.length}</strong> de <strong>{manualMembers.length}</strong> cadastros manuais neste ensaio.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors"
          >
            Fechar Relatório
          </button>
        </div>

      </div>
    </div>
  );
};
