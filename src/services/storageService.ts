import { EventModule, MemberRecord, AuditLogEntry, AttendanceStatus } from '../types';
import { INITIAL_EVENTS } from '../data/defaultEvents';

const STORAGE_KEY_EVENTS = 'triagem_ilheus_events_v1';
const STORAGE_KEY_ACTIVE_EVENT = 'triagem_ilheus_active_event_id';
const STORAGE_KEY_AUDIT_LOGS = 'triagem_ilheus_audit_logs';
const STORAGE_KEY_USER_NAME = 'triagem_ilheus_current_user';

// BroadcastChannel for instant multi-user / multi-tab synchronization
const channel = typeof window !== 'undefined' && 'BroadcastChannel' in window 
  ? new BroadcastChannel('triagem_setor_ilheus_realtime')
  : null;

export const StorageService = {
  getStoredEvents(): EventModule[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_EVENTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Sanitização rigorosa: garantir que nenhum número arbitrário persista no armazenamento
          const sanitized = parsed.map((ev: EventModule) => {
            return {
              ...ev,
              ministerioColaboradores: { anciaes: 0, diacono: 0, cooperadoresOficiais: 0, cooperadoresJovens: 0, colaboradores: 0 },
              parteMusical: { encarregadosRegionais: 0, examinadoras: 0, encarregadosLocais: 0, instrutores: 0, professores: 0, irmaosDptoMusical: 0 },
            };
          });
          return sanitized;
        }
      }
    } catch (e) {
      console.error('Erro ao ler eventos do localStorage:', e);
    }
    // Initialize defaults
    StorageService.saveEvents(INITIAL_EVENTS, false);
    return INITIAL_EVENTS;
  },

  saveEvents(events: EventModule[], broadcast = true): void {
    try {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
      if (broadcast && channel) {
        channel.postMessage({ type: 'EVENTS_UPDATED', timestamp: Date.now() });
      }
    } catch (e) {
      console.error('Erro ao salvar eventos:', e);
    }
  },

  getActiveEventId(): string {
    const id = localStorage.getItem(STORAGE_KEY_ACTIVE_EVENT);
    return id || 'ensaio-regional';
  },

  setActiveEventId(id: string): void {
    localStorage.setItem(STORAGE_KEY_ACTIVE_EVENT, id);
    if (channel) {
      channel.postMessage({ type: 'ACTIVE_EVENT_CHANGED', id, timestamp: Date.now() });
    }
  },

  getCurrentUser(): string {
    return localStorage.getItem(STORAGE_KEY_USER_NAME) || 'Administrador Setor Ilhéus';
  },

  setCurrentUser(name: string): void {
    localStorage.setItem(STORAGE_KEY_USER_NAME, name);
  },

  getAuditLogs(): AuditLogEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_AUDIT_LOGS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Erro ao ler logs de auditoria:', e);
    }
    return [];
  },

  addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'usuario'>): void {
    try {
      const logs = StorageService.getAuditLogs();
      const newLog: AuditLogEntry = {
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        timestamp: new Date().toISOString(),
        usuario: StorageService.getCurrentUser(),
        ...entry
      };
      // Keep last 500 logs
      const updated = [newLog, ...logs].slice(0, 500);
      localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(updated));
      if (channel) {
        channel.postMessage({ type: 'AUDIT_LOG_ADDED', log: newLog });
      }
    } catch (e) {
      console.error('Erro ao registrar log:', e);
    }
  },

  updateMemberAttendance(
    eventId: string,
    memberId: string,
    status: AttendanceStatus,
    observacao?: string
  ): EventModule[] {
    const events = StorageService.getStoredEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return events;

    const event = events[eventIndex];
    let memberName = '';
    const updatedMembers = event.membros.map(m => {
      if (m.id === memberId) {
        memberName = m.nome;
        return {
          ...m,
          statusPresenca: status,
          presencaTimestamp: new Date().toISOString(),
          presencaUsuario: StorageService.getCurrentUser(),
          observacao: observacao !== undefined ? observacao : m.observacao
        };
      }
      return m;
    });

    events[eventIndex] = {
      ...event,
      membros: updatedMembers,
      atualizadoEm: new Date().toISOString()
    };

    StorageService.saveEvents(events);
    StorageService.addAuditLog({
      eventoId: eventId,
      eventoNome: event.nome,
      acao: status === 'presente' ? 'checkin' : status === 'ausente' ? 'checkout' : 'observacao',
      detalhes: `Status de presença alterado para: ${status.toUpperCase()}${observacao ? ' (Obs: ' + observacao + ')' : ''}`,
      membroNome: memberName
    });

    return events;
  },

  batchUpdateAttendance(
    eventId: string,
    memberIds: string[],
    status: AttendanceStatus
  ): EventModule[] {
    const events = StorageService.getStoredEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return events;

    const event = events[eventIndex];
    const idSet = new Set(memberIds);
    const updatedMembers = event.membros.map(m => {
      if (idSet.has(m.id)) {
        return {
          ...m,
          statusPresenca: status,
          presencaTimestamp: new Date().toISOString(),
          presencaUsuario: StorageService.getCurrentUser()
        };
      }
      return m;
    });

    events[eventIndex] = {
      ...event,
      membros: updatedMembers,
      atualizadoEm: new Date().toISOString()
    };

    StorageService.saveEvents(events);
    StorageService.addAuditLog({
      eventoId: eventId,
      eventoNome: event.nome,
      acao: 'checkin',
      detalhes: `Atualização em lote: ${memberIds.length} participantes marcados como ${status.toUpperCase()}`
    });

    return events;
  },

  addManualMember(
    eventId: string,
    memberData: {
      nome: string;
      instrumento: string;
      familia: MemberRecord['familia'];
      localidade: string;
      cargo: string;
      nivel: string;
      statusPresenca: AttendanceStatus;
      observacao?: string;
      oficializadoNoEnsaio?: boolean;
    }
  ): { events: EventModule[]; newMember: MemberRecord } {
    const events = StorageService.getStoredEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) throw new Error('Evento não encontrado');

    const event = events[eventIndex];
    const timestamp = new Date().toISOString();
    const currentUser = StorageService.getCurrentUser();

    // ID único com prefixo MAN
    const uniqueSuffix = Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
    const newMemberId = `MAN-${uniqueSuffix}`;

    const newMember: MemberRecord = {
      id: newMemberId,
      nome: memberData.nome.trim().toUpperCase(),
      instrumento: memberData.instrumento.trim().toUpperCase(),
      familia: memberData.familia,
      localidade: memberData.localidade.trim().toUpperCase(),
      cargo: memberData.cargo.trim().toUpperCase(),
      nivel: memberData.nivel.trim().toUpperCase(),
      pagina: 0,
      statusPresenca: memberData.statusPresenca,
      presencaTimestamp: memberData.statusPresenca === 'presente' ? timestamp : undefined,
      presencaUsuario: memberData.statusPresenca === 'presente' ? currentUser : undefined,
      observacao: memberData.observacao?.trim() || undefined,
      oficializadoNoEnsaio: memberData.oficializadoNoEnsaio || false,
      isManual: true,
      cadastradoEm: timestamp,
      cadastradoPor: currentUser,
    };

    const updatedMembers = [newMember, ...event.membros];

    events[eventIndex] = {
      ...event,
      membros: updatedMembers,
      versionInfo: {
        ...event.versionInfo,
        quantidadeRegistros: updatedMembers.length
      },
      atualizadoEm: timestamp
    };

    StorageService.saveEvents(events);
    StorageService.addAuditLog({
      eventoId: eventId,
      eventoNome: event.nome,
      acao: 'cadastro_manual',
      detalhes: `Inscrição manual avulsa: ${newMember.nome} (${newMember.cargo} / ${newMember.instrumento} - ${newMember.localidade}) cadastrado como ${newMember.statusPresenca.toUpperCase()}`,
      membroNome: newMember.nome
    });

    return { events, newMember };
  },

  deleteManualMember(eventId: string, memberId: string): EventModule[] {
    const events = StorageService.getStoredEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return events;

    const event = events[eventIndex];
    const targetMember = event.membros.find(m => m.id === memberId);
    if (!targetMember) return events;

    const filteredMembers = event.membros.filter(m => m.id !== memberId);

    events[eventIndex] = {
      ...event,
      membros: filteredMembers,
      versionInfo: {
        ...event.versionInfo,
        quantidadeRegistros: filteredMembers.length
      },
      atualizadoEm: new Date().toISOString()
    };

    StorageService.saveEvents(events);
    StorageService.addAuditLog({
      eventoId: eventId,
      eventoNome: event.nome,
      acao: 'exclusao_manual',
      detalhes: `Cadastro manual excluído: ${targetMember.nome} (${targetMember.instrumento} - ${targetMember.localidade})`,
      membroNome: targetMember.nome
    });

    return events;
  },

  resetAllAttendance(eventId: string): EventModule[] {
    const events = StorageService.getStoredEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return events;

    const event = events[eventIndex];
    const updatedMembers = event.membros.map(m => ({
      ...m,
      statusPresenca: 'ausente' as AttendanceStatus,
      presencaTimestamp: undefined,
      presencaUsuario: undefined
    }));

    events[eventIndex] = {
      ...event,
      membros: updatedMembers,
      atualizadoEm: new Date().toISOString()
    };

    StorageService.saveEvents(events);
    StorageService.addAuditLog({
      eventoId: eventId,
      eventoNome: event.nome,
      acao: 'limpeza_presencas',
      detalhes: 'Todas as presenças deste evento foram redefinidas para Ausente.'
    });

    return events;
  },

  updateEventMetadata(eventId: string, updates: Partial<EventModule>): EventModule[] {
    const events = StorageService.getStoredEvents();
    const idx = events.findIndex(e => e.id === eventId);
    if (idx === -1) return events;

    events[idx] = {
      ...events[idx],
      ...updates,
      atualizadoEm: new Date().toISOString()
    };

    StorageService.saveEvents(events);
    StorageService.addAuditLog({
      eventoId: eventId,
      eventoNome: events[idx].nome,
      acao: 'edicao_evento',
      detalhes: `Configurações do evento atualizadas.`
    });

    return events;
  },

  createEvent(newEvent: EventModule): EventModule[] {
    const events = StorageService.getStoredEvents();
    const updated = [...events, newEvent];
    StorageService.saveEvents(updated);
    StorageService.addAuditLog({
      eventoId: newEvent.id,
      eventoNome: newEvent.nome,
      acao: 'edicao_evento',
      detalhes: `Novo evento cadastrado com ${newEvent.membros.length} participantes.`
    });
    return updated;
  },

  deleteEvent(eventId: string): EventModule[] {
    const events = StorageService.getStoredEvents();
    if (events.length <= 1) {
      alert('Não é possível excluir o único evento restante.');
      return events;
    }
    const target = events.find(e => e.id === eventId);
    const filtered = events.filter(e => e.id !== eventId);
    StorageService.saveEvents(filtered);
    if (target) {
      StorageService.addAuditLog({
        eventoId: eventId,
        eventoNome: target.nome,
        acao: 'edicao_evento',
        detalhes: `Evento excluído pelo administrador.`
      });
    }
    return filtered;
  },

  subscribeToChanges(callback: () => void): () => void {
    if (!channel) return () => {};
    const listener = (event: MessageEvent) => {
      callback();
    };
    channel.addEventListener('message', listener);
    return () => {
      channel.removeEventListener('message', listener);
    };
  },

  exportDatabaseJson(): string {
    const backup = {
      exportedAt: new Date().toISOString(),
      appName: 'TRIAGEM – SETOR ILHÉUS',
      events: StorageService.getStoredEvents(),
      logs: StorageService.getAuditLogs()
    };
    return JSON.stringify(backup, null, 2);
  },

  importDatabaseJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && Array.isArray(parsed.events)) {
        StorageService.saveEvents(parsed.events);
        if (Array.isArray(parsed.logs)) {
          localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(parsed.logs));
        }
        return true;
      }
    } catch (e) {
      console.error('Falha ao restaurar backup JSON:', e);
    }
    return false;
  },

  resetToFactoryDefaults(): EventModule[] {
    StorageService.saveEvents(INITIAL_EVENTS);
    localStorage.removeItem(STORAGE_KEY_AUDIT_LOGS);
    return INITIAL_EVENTS;
  }
};
