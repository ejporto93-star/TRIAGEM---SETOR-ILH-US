import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  FileText, 
  Sparkles,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  parsePdfText, 
  extractTextFromPdfFile, 
  ParseResult 
} from '../services/pdfParser';
import { MemberRecord, VersionInfo, EventModule } from '../types';

interface PdfImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeEvent: EventModule;
  onConfirmImport: (importedMembers: MemberRecord[], versionInfo: VersionInfo) => void;
}

export const PdfImportModal: React.FC<PdfImportModalProps> = ({
  isOpen,
  onClose,
  activeEvent,
  onConfirmImport,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'conferencia'>('upload');

  // Version identification state
  const [fileName, setFileName] = useState('TRIAGEM - SETOR ILHÉUS.pdf');
  const [responsibleName, setResponsibleName] = useState('Administração Musical - Setor Ilhéus');
  const [versionLabel, setVersionLabel] = useState('2.0 Atualizada');
  const [filterPreview, setFilterPreview] = useState<'all' | 'duplicates' | 'errors' | 'review'>('all');

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    setFile(uploaded);
    setFileName(uploaded.name);
    setIsProcessing(true);

    try {
      const extracted = await extractTextFromPdfFile(uploaded);
      setRawText(extracted);
      const result = parsePdfText(extracted);
      setParseResult(result);
      setActiveTab('conferencia');
    } catch (err) {
      alert('Erro ao extrair texto do PDF: ' + String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadOfficialReference = async () => {
    setIsProcessing(true);
    setFileName('TRIAGEM - SETOR ILHÉUS.pdf');
    try {
      const res = await fetch('/assets/aistudio/TRIAGEM_-_SETOR_ILH_US_9daa7795.pdf');
      const blob = await res.blob();
      const refFile = new File([blob], 'TRIAGEM - SETOR ILHÉUS.pdf', { type: 'application/pdf' });
      const extracted = await extractTextFromPdfFile(refFile);
      setRawText(extracted);
      const result = parsePdfText(extracted);
      setParseResult(result);
      setActiveTab('conferencia');
    } catch (e) {
      alert('Não foi possível carregar o arquivo anexado diretamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessRawText = () => {
    if (!rawText.trim()) return;
    setIsProcessing(true);
    try {
      const result = parsePdfText(rawText);
      setParseResult(result);
      setActiveTab('conferencia');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (!parseResult || parseResult.members.length === 0) {
      alert('Nenhum registro válido identificado para importação.');
      return;
    }

    const versionInfo: VersionInfo = {
      dataImportacao: new Date().toLocaleString('pt-BR'),
      nomeArquivo: fileName,
      responsavel: responsibleName,
      quantidadeRegistros: parseResult.members.length,
      versao: versionLabel,
    };

    onConfirmImport(parseResult.members, versionInfo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">
                Módulo de Importação Oficial
              </span>
              <span className="text-xs text-slate-500">
                Evento de destino: <strong className="text-slate-800">{activeEvent.nome}</strong>
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Importação e Extração de PDF – Triagem Musical
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white text-xs font-semibold">
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'border-amber-500 text-amber-950 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>1. Seleção do Arquivo / Texto</span>
          </button>

          <button
            onClick={() => {
              if (parseResult) setActiveTab('conferencia');
            }}
            disabled={!parseResult}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
              !parseResult
                ? 'opacity-40 text-slate-400 cursor-not-allowed border-transparent'
                : activeTab === 'conferencia'
                ? 'border-amber-500 text-amber-950 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>2. Tela de Conferência dos Dados ({parseResult ? parseResult.members.length : 0})</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: UPLOAD / SELECTION */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              
              {/* Quick Load Official Asset Banner */}
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span>PDF Oficial de Referência Detectado</span>
                  </div>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Arquivo oficial anexado: <code>TRIAGEM - SETOR ILHÉUS.pdf</code> (24 páginas, 706 membros).
                  </p>
                </div>
                <button
                  onClick={handleLoadOfficialReference}
                  disabled={isProcessing}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors shrink-0"
                >
                  {isProcessing ? 'Extraindo...' : 'Carregar Este Arquivo'}
                </button>
              </div>

              {/* Upload Drag & Drop Area */}
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-amber-500 transition-colors bg-slate-50/50">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-amber-600 mx-auto flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Arraste ou selecione o arquivo PDF do Evento
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  O sistema extrairá automaticamente as colunas: <strong>NOME, INSTRUMENTO, LOCALIDADE, CARGO/MINISTÉRIO e NÍVEL</strong>, preservando fielmente acentos e grafias.
                </p>

                <div className="mt-4">
                  <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg cursor-pointer shadow-xs">
                    <span>Procurar arquivo no computador</span>
                    <input
                      type="file"
                      accept=".pdf,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Or Direct Paste OCR / Text */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Ou Cole o Texto Extraído do Relatório / PDF:
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Útil para conferência rápida ou relatórios já digitalizados
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Cole aqui o texto copiado do PDF com as linhas de participantes..."
                  className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                {rawText && (
                  <button
                    onClick={handleProcessRawText}
                    disabled={isProcessing}
                    className="px-4 py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs"
                  >
                    Processar Texto Colado
                  </button>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: CONFERÊNCIA DOS DADOS */}
          {activeTab === 'conferencia' && parseResult && (
            <div className="space-y-5">
              
              {/* Mandatory Conference KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Identificados</span>
                  <span className="text-xl font-extrabold text-slate-900 font-mono">{parseResult.totalIdentified}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">linhas no documento</span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Válidos</span>
                  <span className="text-xl font-extrabold text-emerald-800 font-mono">{parseResult.totalValid}</span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5">prontos para gravar</span>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">Duplicados</span>
                  <span className="text-xl font-extrabold text-amber-800 font-mono">{parseResult.duplicates.length}</span>
                  <span className="text-[10px] text-amber-600 block mt-0.5">preservados na base</span>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <span className="text-[10px] uppercase font-bold text-blue-700 block">Conferência</span>
                  <span className="text-xl font-extrabold text-blue-800 font-mono">{parseResult.needsReview.length}</span>
                  <span className="text-[10px] text-blue-600 block mt-0.5">caracteres especiais</span>
                </div>

                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                  <span className="text-[10px] uppercase font-bold text-rose-700 block">Erros Linha</span>
                  <span className="text-xl font-extrabold text-rose-800 font-mono">{parseResult.errors.length}</span>
                  <span className="text-[10px] text-rose-600 block mt-0.5">incompletos</span>
                </div>
              </div>

              {/* Duplicate Details Warning if any */}
              {parseResult.duplicates.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 text-amber-950 p-3.5 rounded-xl text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Registros Duplicados Identificados (Regra 9: Não excluídos automaticamente)</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11px] text-amber-800">
                    {parseResult.duplicates.map((d, idx) => (
                      <li key={idx}>
                        <strong>{d.nome}</strong>: {d.motivo} (Páginas: {d.paginas.join(', ')})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Version Identification Metadata Form (Required in Section 2) */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                  Identificação da Versão da Base
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-semibold">Nome do Arquivo</label>
                    <input
                      type="text"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-semibold">Responsável pela Importação</label>
                    <input
                      type="text"
                      value={responsibleName}
                      onChange={(e) => setResponsibleName(e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-semibold">Identificação da Versão</label>
                    <input
                      type="text"
                      value={versionLabel}
                      onChange={(e) => setVersionLabel(e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Preview Table of Extracted Records */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Prévia dos Registros Extraídos (Páginas 1 a {parseResult.paginasTotal})
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Exibindo os primeiros 50 registros extraídos
                  </span>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-60 overflow-y-auto">
                  <table className="w-full text-xs text-left divide-y divide-slate-200">
                    <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-600 sticky top-0">
                      <tr>
                        <th className="p-2 text-center">Pág</th>
                        <th className="p-2">Nome</th>
                        <th className="p-2">Instrumento</th>
                        <th className="p-2">Localidade</th>
                        <th className="p-2">Cargo</th>
                        <th className="p-2">Nível</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {parseResult.members.slice(0, 50).map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 text-center text-slate-400 font-mono text-[11px]">{m.pagina}</td>
                          <td className="p-2 font-bold text-slate-900">{m.nome}</td>
                          <td className="p-2 text-slate-700">{m.instrumento}</td>
                          <td className="p-2 text-slate-600">{m.localidade}</td>
                          <td className="p-2 text-slate-800 font-medium">{m.cargo}</td>
                          <td className="p-2 text-slate-600">{m.nivel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Cancelar
          </button>

          {activeTab === 'conferencia' && parseResult ? (
            <button
              onClick={handleConfirm}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar e Efetivar Importação ({parseResult.members.length} Participantes)</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (parseResult) setActiveTab('conferencia');
              }}
              disabled={!parseResult}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg ${
                parseResult ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Avançar para Conferência</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
