import React, { useState } from 'react';
import { EventModule } from '../types';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  Calendar, 
  MapPin, 
  Save,
  Layers
} from 'lucide-react';

interface EventManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: EventModule[];
  activeEventId: string;
  onSelectEvent: (id: string) => void;
  onUpdateEvent: (eventId: string, updates: Partial<EventModule>) => void;
  onCreateEvent: (newEvent: EventModule) => void;
  onDeleteEvent: (eventId: string) => void;
}

export const EventManagerModal: React.FC<EventManagerModalProps> = ({
  isOpen,
  onClose,
  events,
  activeEventId,
  onSelectEvent,
  onUpdateEvent,
  onCreateEvent,
  onDeleteEvent,
}) => {
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<EventModule>>({});
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newForm, setNewForm] = useState({
    nome: '',
    descricao: '',
    data: new Date().toISOString().split('T')[0],
    local: 'ILHÉUS (CENTRAL)',
    cidadeUf: 'ILHÉUS - BA',
    anciaoAtendimento: 'APARECIDO DE FREITAS',
    encarregadoRegional: 'MARCOS ANTÔNIO BORGES CARNEIRO',
    cloneRosterFromId: 'ensaio-regional'
  });

  if (!isOpen) return null;

  const handleStartEdit = (ev: EventModule) => {
    setEditingEventId(ev.id);
    setEditForm({
      nome: ev.nome,
      descricao: ev.descricao,
      data: ev.data,
      local: ev.local,
      cidadeUf: ev.cidadeUf,
      anciaoAtendimento: ev.anciaoAtendimento,
      encarregadoRegional: ev.encarregadoRegional,
      observacoesTexto: ev.observacoesTexto
    });
  };

  const handleSaveEdit = (eventId: string) => {
    onUpdateEvent(eventId, editForm);
    setEditingEventId(null);
  };

  const handleCreateNew = () => {
    if (!newForm.nome.trim()) {
      alert('Informe o nome do evento.');
      return;
    }

    const sourceEvent = events.find(e => e.id === newForm.cloneRosterFromId) || events[0];
    const newId = 'evt_' + Date.now();

    const created: EventModule = {
      id: newId,
      nome: newForm.nome.trim().toUpperCase(),
      descricao: newForm.descricao,
      data: newForm.data,
      local: newForm.local,
      cidadeUf: newForm.cidadeUf,
      anciaoAtendimento: newForm.anciaoAtendimento,
      encarregadoRegional: newForm.encarregadoRegional,
      ministerioColaboradores: { anciaes: 0, diacono: 0, cooperadoresOficiais: 0, cooperadoresJovens: 0, colaboradores: 0 },
      parteMusical: { encarregadosRegionais: 0, examinadoras: 0, encarregadosLocais: 0, instrutores: 0, professores: 0, irmaosDptoMusical: 0 },
      oficializacao: { musicos: 0, organistas: 0 },
      observacoesTexto: sourceEvent.observacoesTexto,
      versionInfo: {
        ...sourceEvent.versionInfo,
        dataImportacao: new Date().toLocaleString('pt-BR'),
        versao: 'Base Clonada de ' + sourceEvent.nome
      },
      membros: sourceEvent.membros.map(m => ({
        ...m,
        id: 'cln_' + Math.random().toString(36).substring(2, 9),
        statusPresenca: 'ausente',
        presencaTimestamp: undefined,
        observacao: undefined
      })),
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    };

    onCreateEvent(created);
    onSelectEvent(newId);
    setIsCreatingNew(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">
              Gerenciamento dos Módulos de Eventos
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Módulos e Configurações de Ensaios
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">
              {events.length} módulos cadastrados. Cada módulo possui sua própria base e relatórios.
            </span>
            <button
              onClick={() => setIsCreatingNew(!isCreatingNew)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Módulo / Evento</span>
            </button>
          </div>

          {/* New Event Form */}
          {isCreatingNew && (
            <div className="bg-amber-50/70 border border-amber-300 rounded-xl p-4 text-xs space-y-3">
              <span className="font-bold text-amber-950 uppercase text-[11px] block">
                Cadastrar Novo Módulo de Ensaio
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-semibold">Nome do Evento</label>
                  <input
                    type="text"
                    placeholder="Ex: ENSAIO ESPECIAL DE JOVENS"
                    value={newForm.nome}
                    onChange={(e) => setNewForm({ ...newForm, nome: e.target.value })}
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-semibold">Data do Evento</label>
                  <input
                    type="date"
                    value={newForm.data}
                    onChange={(e) => setNewForm({ ...newForm, data: e.target.value })}
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-semibold">Local (Igreja)</label>
                  <input
                    type="text"
                    value={newForm.local}
                    onChange={(e) => setNewForm({ ...newForm, local: e.target.value })}
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-semibold">Clonar Participantes de:</label>
                  <select
                    value={newForm.cloneRosterFromId}
                    onChange={(e) => setNewForm({ ...newForm, cloneRosterFromId: e.target.value })}
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-medium"
                  >
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id}>
                        {ev.nome} ({ev.membros.length} membros)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsCreatingNew(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateNew}
                  className="px-4 py-1.5 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400"
                >
                  Criar Módulo
                </button>
              </div>
            </div>
          )}

          {/* Events List */}
          <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
            {events.map((ev) => {
              const isSelected = ev.id === activeEventId;
              const isEditing = editingEventId === ev.id;

              return (
                <div key={ev.id} className="p-4 hover:bg-slate-50/70 transition-colors">
                  {isEditing ? (
                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase font-semibold">Nome do Evento</label>
                          <input
                            type="text"
                            value={editForm.nome || ''}
                            onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                            className="w-full mt-1 px-2.5 py-1.5 border border-slate-300 rounded-md font-bold text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase font-semibold">Data</label>
                          <input
                            type="date"
                            value={editForm.data || ''}
                            onChange={(e) => setEditForm({ ...editForm, data: e.target.value })}
                            className="w-full mt-1 px-2.5 py-1.5 border border-slate-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase font-semibold">Localidade</label>
                          <input
                            type="text"
                            value={editForm.local || ''}
                            onChange={(e) => setEditForm({ ...editForm, local: e.target.value })}
                            className="w-full mt-1 px-2.5 py-1.5 border border-slate-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase font-semibold">Ancião em Atendimento</label>
                          <input
                            type="text"
                            value={editForm.anciaoAtendimento || ''}
                            onChange={(e) => setEditForm({ ...editForm, anciaoAtendimento: e.target.value })}
                            className="w-full mt-1 px-2.5 py-1.5 border border-slate-300 rounded-md"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={() => setEditingEventId(null)}
                          className="px-3 py-1 text-slate-600 hover:text-slate-800"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleSaveEdit(ev.id)}
                          className="px-3.5 py-1 font-bold bg-slate-900 text-white rounded-md hover:bg-slate-800"
                        >
                          Salvar Alterações
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{ev.nome}</span>
                          {isSelected && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              Ativo no momento
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                          <span>{ev.membros.length} participantes</span>
                          <span>·</span>
                          <span>{ev.local}</span>
                          <span>·</span>
                          <span>{ev.data ? new Date(ev.data + 'T12:00:00').toLocaleDateString('pt-BR') : 'Sem data'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isSelected && (
                          <button
                            onClick={() => onSelectEvent(ev.id)}
                            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
                          >
                            Ativar
                          </button>
                        )}

                        <button
                          onClick={() => handleStartEdit(ev)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                          title="Editar Nome e Dados"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {events.length > 1 && (
                          <button
                            onClick={() => {
                              if (confirm(`Excluir o evento ${ev.nome}?`)) {
                                onDeleteEvent(ev.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Excluir Módulo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
          >
            Concluir
          </button>
        </div>

      </div>
    </div>
  );
};
