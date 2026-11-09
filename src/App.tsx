/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { EventModule, MemberRecord, AttendanceStatus, VersionInfo } from './types';
import { StorageService } from './services/storageService';
import { Header } from './components/Header';
import { EventSelectorBar } from './components/EventSelectorBar';
import { FunnelTriage } from './components/FunnelTriage';
import { EnsaioSummaryBoard } from './components/EnsaioSummaryBoard';
import { MembersTable } from './components/MembersTable';
import { PdfImportModal } from './components/PdfImportModal';
import { EventManagerModal } from './components/EventManagerModal';
import { AuditLogModal } from './components/AuditLogModal';
import { ManualRegistrationsReportModal } from './components/ManualRegistrationsReportModal';
import { ManualRegistrationModal } from './components/ManualRegistrationModal';

export default function App() {
  const [events, setEvents] = useState<EventModule[]>(() => StorageService.getStoredEvents());
  const [activeEventId, setActiveEventId] = useState<string>(() => StorageService.getActiveEventId());
  const [currentView, setCurrentView] = useState<'triagem' | 'resumo' | 'tabela'>('triagem');
  
  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [isManualReportOpen, setIsManualReportOpen] = useState(false);
  const [isManualAddModalOpen, setIsManualAddModalOpen] = useState(false);

  // Subscribe to real-time multi-tab synchronization
  useEffect(() => {
    const unsubscribe = StorageService.subscribeToChanges(() => {
      setEvents(StorageService.getStoredEvents());
      setActiveEventId(StorageService.getActiveEventId());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Active event object
  const activeEvent = useMemo(() => {
    return events.find(e => e.id === activeEventId) || events[0];
  }, [events, activeEventId]);

  // Handler for selecting an event module
  const handleSelectEvent = (id: string) => {
    setActiveEventId(id);
    StorageService.setActiveEventId(id);
  };

  // Handler for attendance updates
  const handleUpdateAttendance = (memberId: string, status: AttendanceStatus, observacao?: string) => {
    const updated = StorageService.updateMemberAttendance(activeEventId, memberId, status, observacao);
    setEvents([...updated]);
  };

  // Handler for batch attendance updates
  const handleBatchUpdateAttendance = (memberIds: string[], status: AttendanceStatus) => {
    const updated = StorageService.batchUpdateAttendance(activeEventId, memberIds, status);
    setEvents([...updated]);
  };

  // Handler for resetting all attendance in active event
  const handleResetAllAttendance = () => {
    const updated = StorageService.resetAllAttendance(activeEventId);
    setEvents([...updated]);
  };

  // Handler for creating a manual member registration
  const handleAddManualMember = (memberData: {
    nome: string;
    instrumento: string;
    familia: MemberRecord['familia'];
    localidade: string;
    cargo: string;
    nivel: string;
    statusPresenca: AttendanceStatus;
    observacao?: string;
    oficializadoNoEnsaio?: boolean;
  }): MemberRecord => {
    const { events: updatedEvents, newMember } = StorageService.addManualMember(activeEventId, memberData);
    setEvents([...updatedEvents]);
    return newMember;
  };

  // Handler for deleting a manual member registration
  const handleDeleteManualMember = (memberId: string) => {
    const updated = StorageService.deleteManualMember(activeEventId, memberId);
    setEvents([...updated]);
  };

  // Handler for confirming imported PDF roster
  const handleConfirmImport = (importedMembers: MemberRecord[], versionInfo: VersionInfo) => {
    const current = StorageService.getStoredEvents();
    const idx = current.findIndex(e => e.id === activeEventId);
    if (idx === -1) return;

    current[idx] = {
      ...current[idx],
      membros: importedMembers,
      versionInfo,
      atualizadoEm: new Date().toISOString()
    };

    StorageService.saveEvents(current);
    StorageService.addAuditLog({
      eventoId: activeEventId,
      eventoNome: current[idx].nome,
      acao: 'importacao',
      detalhes: `Importação de PDF efetivada com sucesso: ${importedMembers.length} participantes carregados (Arquivo: ${versionInfo.nomeArquivo}).`
    });

    setEvents([...current]);
  };

  // Handler for updating event configurations
  const handleUpdateEvent = (eventId: string, updates: Partial<EventModule>) => {
    const updated = StorageService.updateEventMetadata(eventId, updates);
    setEvents([...updated]);
  };

  // Handler for creating a new event module
  const handleCreateEvent = (newEvent: EventModule) => {
    const updated = StorageService.createEvent(newEvent);
    setEvents([...updated]);
  };

  // Handler for deleting an event module
  const handleDeleteEvent = (eventId: string) => {
    const updated = StorageService.deleteEvent(eventId);
    setEvents([...updated]);
    if (activeEventId === eventId && updated.length > 0) {
      setActiveEventId(updated[0].id);
      StorageService.setActiveEventId(updated[0].id);
    }
  };

  // Handler for reloading database (e.g. after restoring backup)
  const handleReloadDatabase = () => {
    setEvents(StorageService.getStoredEvents());
    setActiveEventId(StorageService.getActiveEventId());
  };

  const handleQuickPrint = () => {
    setCurrentView('resumo');
    setTimeout(() => {
      window.print();
    }, 250);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* Top Navigation Bar */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        activeEvent={activeEvent}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenEventsModal={() => setIsEventsModalOpen(true)}
        onOpenLogsModal={() => setIsLogsModalOpen(true)}
        onOpenManualReport={() => setIsManualReportOpen(true)}
        onQuickPrint={handleQuickPrint}
      />

      {/* Module Selector Bar (7 Modules Switcher) */}
      <EventSelectorBar
        events={events}
        activeEventId={activeEventId}
        onSelectEvent={handleSelectEvent}
        onEditActiveEvent={() => setIsEventsModalOpen(true)}
      />

      {/* Main App Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* VIEW 1: TRIAGEM POR AFUNILAMENTO (5 ETAPAS) */}
        {currentView === 'triagem' && (
          <FunnelTriage
            event={activeEvent}
            onUpdateAttendance={handleUpdateAttendance}
            onAddManualMember={handleAddManualMember}
            onOpenManualReport={() => setIsManualReportOpen(true)}
          />
        )}

        {/* VIEW 2: RESUMO DO ENSAIO (QUADRO OFICIAL) */}
        {currentView === 'resumo' && (
          <EnsaioSummaryBoard
            event={activeEvent}
            onUpdateEventStaff={(updates) => handleUpdateEvent(activeEventId, updates)}
          />
        )}

        {/* VIEW 3: RELAÇÃO COMPLETA DE MEMBROS (TABELA) */}
        {currentView === 'tabela' && (
          <MembersTable
            event={activeEvent}
            onUpdateAttendance={handleUpdateAttendance}
            onBatchUpdateAttendance={handleBatchUpdateAttendance}
            onResetAllAttendance={handleResetAllAttendance}
          />
        )}

      </main>

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TRIAGEM – SETOR ILHÉUS · Sistema Inteligente de Consulta e Gerenciamento Musical</span>
          <span className="text-[11px] text-slate-400">Base oficial: {activeEvent.versionInfo.nomeArquivo} ({activeEvent.versionInfo.quantidadeRegistros} membros)</span>
        </div>
      </footer>

      {/* PDF Import Modal */}
      <PdfImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        activeEvent={activeEvent}
        onConfirmImport={handleConfirmImport}
      />

      {/* Event Manager Modal */}
      <EventManagerModal
        isOpen={isEventsModalOpen}
        onClose={() => setIsEventsModalOpen(false)}
        events={events}
        activeEventId={activeEventId}
        onSelectEvent={handleSelectEvent}
        onUpdateEvent={handleUpdateEvent}
        onCreateEvent={handleCreateEvent}
        onDeleteEvent={handleDeleteEvent}
      />

      {/* Audit Log Modal */}
      <AuditLogModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        logs={StorageService.getAuditLogs()}
        onReloadDatabase={handleReloadDatabase}
      />

      {/* Relatório Oficial de Cadastros Manuais no Ensaio */}
      <ManualRegistrationsReportModal
        isOpen={isManualReportOpen}
        onClose={() => setIsManualReportOpen(false)}
        event={activeEvent}
        onUpdateAttendance={handleUpdateAttendance}
        onDeleteManualMember={handleDeleteManualMember}
        onOpenNewRegistration={() => setIsManualAddModalOpen(true)}
      />

      {/* Modal Avulso para Inscrição Manual */}
      <ManualRegistrationModal
        isOpen={isManualAddModalOpen}
        onClose={() => setIsManualAddModalOpen(false)}
        onSave={(data) => {
          handleAddManualMember(data);
          setIsManualAddModalOpen(false);
        }}
        knownLocalidades={Array.from(new Set(activeEvent.membros.map(m => m.localidade))).sort()}
        knownInstrumentos={Array.from(new Set(activeEvent.membros.map(m => m.instrumento))).sort()}
        knownCargos={Array.from(new Set(activeEvent.membros.map(m => m.cargo))).sort()}
        knownNiveis={Array.from(new Set(activeEvent.membros.map(m => m.nivel))).sort()}
      />

    </div>
  );
}
