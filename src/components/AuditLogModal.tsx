import React, { useState } from 'react';
import { AuditLogEntry } from '../types';
import { StorageService } from '../services/storageService';
import { 
  X, 
  History, 
  Download, 
  Upload, 
  CheckCircle, 
  RotateCcw,
  Clock,
  User
} from 'lucide-react';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLogEntry[];
  onReloadDatabase: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  isOpen,
  onClose,
  logs,
  onReloadDatabase,
}) => {
  const [activeUser, setActiveUser] = useState(StorageService.getCurrentUser());
  const [isSavedUser, setIsSavedUser] = useState(false);

  if (!isOpen) return null;

  const handleSaveUserName = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.setCurrentUser(activeUser);
    setIsSavedUser(true);
    setTimeout(() => setIsSavedUser(false), 2000);
  };

  const handleExportBackup = () => {
    const json = StorageService.exportDatabaseJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `backup_triagem_ilheus_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = StorageService.importDatabaseJson(content);
      if (success) {
        alert('Banco de dados restaurado com sucesso!');
        onReloadDatabase();
      } else {
        alert('Erro ao restaurar backup. Verifique a integridade do arquivo JSON.');
      }
    };
    reader.readAsText(f);
  };

  const handleResetToFactory = () => {
    if (confirm('Atenção: Isso restaurará todos os 7 eventos originais e redefinirá as presenças. Continuar?')) {
      StorageService.resetToFactoryDefaults();
      onReloadDatabase();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Histórico Permanente e Auditoria
              </h2>
              <span className="text-xs text-slate-500">
                Registro de operações, identificação de operador e backup da base
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Operator identification config */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
              Identificação do Operador Atual (Multi-usuário)
            </span>
            <form onSubmit={handleSaveUserName} className="flex items-center gap-2">
              <div className="relative flex-1">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={activeUser}
                  onChange={(e) => setActiveUser(e.target.value)}
                  placeholder="Nome do Encarregado ou Secretário..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-800"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-1.5 font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                {isSavedUser ? 'Salvo ✓' : 'Salvar Operador'}
              </button>
            </form>
          </div>

          {/* Backup / Export Tools */}
          <div className="border border-slate-200 rounded-xl p-4 text-xs space-y-3">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
              Sincronização & Segurança dos Dados
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExportBackup}
                className="flex items-center gap-1.5 px-3 py-1.5 font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Baixar Backup Completo (.JSON)</span>
              </button>

              <label className="flex items-center gap-1.5 px-3 py-1.5 font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>Restaurar Backup (.JSON)</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleResetToFactory}
                className="flex items-center gap-1.5 px-3 py-1.5 font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Padrão Oficial</span>
              </button>
            </div>
          </div>

          {/* Audit Trail List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Log Cronológico de Atividades ({logs.length})
              </span>
              <span className="text-[11px] text-slate-500">
                Sincronizado em tempo real entre abas
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-72 overflow-y-auto text-xs bg-white">
              {logs.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  Nenhum log registrado ainda. As ações de triagem e presença aparecerão aqui.
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="p-3 hover:bg-slate-50 flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{log.usuario}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.2 rounded">
                          {log.eventoNome}
                        </span>
                      </div>
                      <div className="text-slate-700">
                        {log.membroNome && <strong className="text-slate-900">{log.membroNome}: </strong>}
                        {log.detalhes}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono shrink-0 whitespace-nowrap mt-0.5">
                      {new Date(log.timestamp).toLocaleTimeString('pt-BR')} - {new Date(log.timestamp).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
