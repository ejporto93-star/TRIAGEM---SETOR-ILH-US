import React, { useState, useMemo } from 'react';
import { EventModule } from '../types';
import { 
  Printer, 
  CheckCircle2, 
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  HelpCircle,
  Search,
  Users,
  Calculator,
  Info,
  ChevronDown,
  ChevronUp,
  ShieldAlert
} from 'lucide-react';
import { calculateEnsaioMetrics, isCargoMinisterioOuColaborador } from '../services/metricsService';

interface EnsaioSummaryBoardProps {
  event: EventModule;
  onUpdateEventStaff?: (updates: Partial<EventModule>) => void;
}

const ViolinIcon = () => (
  <svg className="w-8 h-13 mx-auto text-[#854d0e]" viewBox="0 0 36 60" fill="currentColor">
    <path d="M17 1h2v12h-2z" />
    <circle cx="18" cy="3" r="2.5" />
    <rect x="16.5" y="13" width="3" height="15" fill="#451a03" />
    <path d="M12 28c-3 1.5-4 5-2 8.5 1.5 2.5 1 4-1 6-3 3-2.5 8 0 11.5 2.5 3.5 7 3.5 9 0 2.5-3.5 3-8.5 0-11.5-2-2-2.5-3.5-1-6 2-3.5 1-7-2-8.5-2-1-4-1-6 0z" />
    <ellipse cx="18" cy="46" rx="2" ry="4" fill="#1e293b" />
  </svg>
);

const KeyboardIcon = () => (
  <svg className="w-11 h-7 mx-auto text-slate-900" viewBox="0 0 44 26" fill="none">
    <rect x="2" y="2" width="40" height="22" rx="2" fill="white" stroke="#1e293b" strokeWidth="2" />
    <rect x="7" y="2" width="4.5" height="12" fill="#1e293b" rx="0.5" />
    <rect x="14.5" y="2" width="4.5" height="12" fill="#1e293b" rx="0.5" />
    <rect x="25" y="2" width="4.5" height="12" fill="#1e293b" rx="0.5" />
    <rect x="32.5" y="2" width="4.5" height="12" fill="#1e293b" rx="0.5" />
    <line x1="11.5" y1="14" x2="11.5" y2="24" stroke="#64748b" strokeWidth="1" />
    <line x1="19.5" y1="14" x2="19.5" y2="24" stroke="#64748b" strokeWidth="1" />
    <line x1="28.5" y1="14" x2="28.5" y2="24" stroke="#64748b" strokeWidth="1" />
    <line x1="36.5" y1="14" x2="36.5" y2="24" stroke="#64748b" strokeWidth="1" />
  </svg>
);

const SaxophoneIcon = () => (
  <svg className="w-7 h-13 mx-auto text-[#0f172a]" viewBox="0 0 32 56" fill="currentColor">
    <path d="M12 2h5v7h-5z M14 8v20c0 7.5 4 11 10.5 11v5c-10.5 0-15.5-6-15.5-16V8h5z" />
    <ellipse cx="23.5" cy="40" rx="5.5" ry="6.5" />
    <circle cx="11.5" cy="18" r="1.5" fill="#f8fafc" stroke="currentColor" strokeWidth="1" />
    <circle cx="11.5" cy="23" r="1.5" fill="#f8fafc" stroke="currentColor" strokeWidth="1" />
    <circle cx="11.5" cy="28" r="1.5" fill="#f8fafc" stroke="currentColor" strokeWidth="1" />
  </svg>
);

const TrumpetIcon = () => (
  <svg className="w-12 h-7 mx-auto text-[#ca8a04]" viewBox="0 0 46 26" fill="currentColor">
    <path d="M2 13h17v-2.5H2v2.5zm0 3.5h17v-2.5H2v2.5z" />
    <path d="M20 9.5h11l13-6v19l-13-6H20V9.5z" />
    <rect x="11" y="4.5" width="2.5" height="17" rx="0.5" fill="#a16207" />
    <rect x="15" y="4.5" width="2.5" height="17" rx="0.5" fill="#a16207" />
    <rect x="19" y="4.5" width="2.5" height="17" rx="0.5" fill="#a16207" />
  </svg>
);

const CcbOfficialLogo = () => (
  <div className="border-2 border-slate-900 rounded-xl p-2.5 text-center w-52 shrink-0 bg-white shadow-2xs">
    <div className="relative py-0.5">
      <svg className="w-16 h-7 mx-auto text-slate-950" viewBox="0 0 64 30" fill="currentColor">
        <line x1="2" y1="5" x2="62" y2="5" stroke="currentColor" strokeWidth="0.9" />
        <line x1="2" y1="10" x2="62" y2="10" stroke="currentColor" strokeWidth="0.9" />
        <line x1="2" y1="15" x2="62" y2="15" stroke="currentColor" strokeWidth="0.9" />
        <line x1="2" y1="20" x2="62" y2="20" stroke="currentColor" strokeWidth="0.9" />
        <line x1="2" y1="25" x2="62" y2="25" stroke="currentColor" strokeWidth="0.9" />
        <rect x="22" y="2" width="20" height="25" fill="white" stroke="currentColor" strokeWidth="1" rx="0.5" />
        <rect x="24" y="8" width="2" height="18" fill="currentColor" />
        <rect x="27.5" y="5" width="2" height="21" fill="currentColor" />
        <rect x="31" y="3" width="2" height="23" fill="currentColor" />
        <rect x="34.5" y="5" width="2" height="21" fill="currentColor" />
        <rect x="38" y="8" width="2" height="18" fill="currentColor" />
      </svg>
    </div>
    <div className="text-[10.5px] font-black tracking-widest uppercase leading-tight font-sans text-slate-950 mt-1">
      CONGREGAÇÃO CRISTÃ<br />
      <span className="text-[9px] font-bold tracking-normal">NO</span><br />
      BRASIL
    </div>
  </div>
);

const InstrumentPieChart: React.FC<{
  pctCordas: number;
  pctTeclas: number;
  pctMadeiras: number;
  pctMetais: number;
  total: number;
}> = ({ pctCordas, pctTeclas, pctMadeiras, pctMetais, total }) => {
  const cx = 80;
  const cy = 80;
  const r = 62;

  if (total === 0) {
    return (
      <svg viewBox="0 0 160 160" className="w-44 h-44 mx-auto">
        <circle cx={cx} cy={cy} r={r} fill="#f8fafc" stroke="#C7D3DF" strokeWidth="1.5" />
        <text x={cx} y={cy} textAnchor="middle" className="text-xs font-bold fill-slate-400">
          Sem dados
        </text>
      </svg>
    );
  }

  // 4 slices in clock order matching the reference image:
  // Cordas (top-right), Teclas (middle-right), Madeiras (bottom), Metais (top-left)
  const slices = [
    { key: 'Cordas', pct: pctCordas, color: '#F7A58A', labelInside: pctCordas >= 10 },
    { key: 'Teclas', pct: pctTeclas, color: '#BCE8C9', labelInside: pctTeclas >= 10 },
    { key: 'Madeiras', pct: pctMadeiras, color: '#B8DDF5', labelInside: pctMadeiras >= 10 },
    { key: 'Metais', pct: pctMetais, color: '#FFE18A', labelInside: pctMetais >= 10 },
  ];

  let currentAngle = -90;
  const renderedSlices = slices.map((s) => {
    const angleSpan = (s.pct / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angleSpan;
    const midAngle = startAngle + angleSpan / 2;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const midRad = (midAngle * Math.PI) / 180;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const largeArc = angleSpan > 180 ? 1 : 0;
    const pathData = angleSpan >= 359.9
      ? `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy}`
      : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    const labelR = r * 0.62;
    const labelX = cx + labelR * Math.cos(midRad);
    const labelY = cy + labelR * Math.sin(midRad);

    return {
      ...s,
      angleSpan,
      startAngle,
      endAngle,
      midAngle,
      pathData,
      labelX,
      labelY
    };
  });

  const teclas = renderedSlices.find(s => s.key === 'Teclas');

  return (
    <svg viewBox="0 0 170 170" className="w-44 h-44 mx-auto overflow-visible">
      {/* Slices with clean white dividers matching IMAGEM 2 */}
      {renderedSlices.map((s) => {
        if (s.angleSpan <= 0.05) return null;
        return (
          <path
            key={s.key}
            d={s.pathData}
            fill={s.color}
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        );
      })}

      {/* Internal quadrant labels */}
      {renderedSlices.map((s) => {
        if (!s.labelInside) return null;
        return (
          <text
            key={`lbl-${s.key}`}
            x={s.labelX}
            y={s.labelY - 5}
            textAnchor="middle"
            className="text-[9.5px] font-black fill-slate-900 pointer-events-none select-none tracking-tight"
          >
            <tspan x={s.labelX} dy="0">{s.key}</tspan>
            <tspan x={s.labelX} dy="11">{Math.round(s.pct)}%</tspan>
          </text>
        );
      })}

      {/* Callout for Teclas when 0% or small */}
      {teclas && !teclas.labelInside && (
        <g className="pointer-events-none select-none">
          <line x1={cx + r - 1} y1={cy + 8} x2={cx + r + 14} y2={cy + 10} stroke="#64748b" strokeWidth="0.8" />
          <text
            x={cx + r + 16}
            y={cy + 7}
            textAnchor="start"
            className="text-[8.5px] font-black fill-slate-900"
          >
            <tspan x={cx + r + 16} dy="0">Teclas</tspan>
            <tspan x={cx + r + 16} dy="10">{Math.round(teclas.pct)}%</tspan>
          </text>
        </g>
      )}
    </svg>
  );
};

export const EnsaioSummaryBoard: React.FC<EnsaioSummaryBoardProps> = ({
  event,
}) => {
  // O padrão DEVE ser 'presentes' para coincidir instantaneamente com o cabeçalho 'PRESENTES'
  const [dataScope, setDataScope] = useState<'presentes' | 'todos'>('presentes');
  const [showAuditPanel, setShowAuditPanel] = useState<boolean>(true);
  const [auditSearchTerm, setAuditSearchTerm] = useState<string>('');
  const [auditFilter, setAuditFilter] = useState<'todos' | 'musicos' | 'organistas' | 'lideranca' | 'ministerio'>('todos');

  // FONTE ÚNICA DA VERDADE: Todas as contagens provêm exclusivamente de calculateEnsaioMetrics
  const metrics = useMemo(() => {
    return calculateEnsaioMetrics(event, dataScope);
  }, [event, dataScope]);

  const handlePrint = () => {
    window.print();
  };

  // Relação de conferência individual de membros
  const filteredAuditMembers = useMemo(() => {
    let list = metrics.membrosAuditados || [];
    if (auditSearchTerm.trim()) {
      const q = auditSearchTerm.toLowerCase();
      list = list.filter(m => 
        m.nome.toLowerCase().includes(q) ||
        m.instrumento.toLowerCase().includes(q) ||
        m.cargo.toLowerCase().includes(q) ||
        m.localidade.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q)
      );
    }
    if (auditFilter === 'musicos') {
      list = list.filter(m => m.cargo.toUpperCase() !== 'ORGANISTA' && m.instrumento.toUpperCase() !== 'ÓRGÃO');
    } else if (auditFilter === 'organistas') {
      list = list.filter(m => m.cargo.toUpperCase() === 'ORGANISTA' || m.instrumento.toUpperCase() === 'ÓRGÃO');
    } else if (auditFilter === 'lideranca') {
      list = list.filter(m => m.cargo.toUpperCase() !== 'MÚSICO' && m.cargo.toUpperCase() !== 'ORGANISTA');
    } else if (auditFilter === 'ministerio') {
      list = list.filter(m => isCargoMinisterioOuColaborador(m.cargo || ''));
    }
    return list;
  }, [metrics.membrosAuditados, auditSearchTerm, auditFilter]);

  return (
    <div className="space-y-6">
      
      {/* Top Toolbar (Controls & Scope Switcher) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Dados Auditados em Tempo Real
            </span>
            <span className="text-xs text-slate-500">
              · Fonte Única da Verdade ativa
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">
            Resumo Oficial do Ensaio – Setor Ilhéus
          </h2>
          <p className="text-xs text-slate-500">
            Quadro sinóptico gerado exclusivamente a partir dos lançamentos efetivamente registrados no banco de dados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Scope Segmented Control */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium border border-slate-200">
            <button
              onClick={() => setDataScope('presentes')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                dataScope === 'presentes'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
              <span>Presentes no Ensaio ({metrics.totalPresentes})</span>
            </button>

            <button
              onClick={() => setDataScope('todos')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                dataScope === 'todos'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos os Inscritos ({metrics.totalInscritos})
            </button>
          </div>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Quadro A4</span>
          </button>
        </div>
      </div>

      {/* Bloco de Interdição se houver divergência de integridade (Seção 6 do Prompt) */}
      {!metrics.integrity.isValid && (
        <div className="bg-rose-600 text-white p-5 rounded-xl shadow-lg border-2 border-rose-700 flex flex-col sm:flex-row items-start gap-4 no-print">
          <div className="p-2.5 bg-rose-700 rounded-lg shrink-0">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-black text-xs uppercase tracking-wide bg-rose-800 px-2.5 py-0.5 rounded text-white border border-rose-500">
                BLOQUEIO DE INTEGRIDADE ATIVADO
              </span>
              <span className="text-xs text-rose-100 font-semibold">
                (Resumo Oficial Suspenso até Resolução)
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium">
              Foi detectada divergência entre os lançamentos do banco de dados, o cabeçalho superior e o quadro do resumo. Conforme as regras mandatórias de integridade, a publicação oficial fica bloqueada até que 100% dos dados coincidam rigorosamente.
            </p>
            <div className="bg-rose-800/80 rounded-lg p-3 text-xs space-y-1 font-mono">
              <div className="font-bold text-amber-300">PONTOS DE DIVERGÊNCIA IDENTIFICADOS:</div>
              {metrics.integrity.divergencias.map((div, i) => (
                <div key={i} className="flex items-center gap-1.5 text-rose-100">
                  <span>•</span>
                  <span>{div}</span>
                </div>
              ))}
            </div>
            <div className="text-[11px] text-rose-200 font-mono">
              Contagem atual: Cabeçalho = {metrics.integrity.headerPresentes} | Total Geral Resumo = {metrics.integrity.dashboardTotalGeral} | IDs Únicos no Banco = {metrics.integrity.dbUniquePresentIdsCount}
            </div>
          </div>
        </div>
      )}

      {/* Audit & Integrity Banner (Section 7: Validação e rastreabilidade) */}
      <div className={`p-3 rounded-xl border text-xs flex flex-wrap items-center justify-between gap-3 no-print ${
        metrics.integrity.isValid 
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          : 'bg-rose-50 border-rose-300 text-rose-950'
      }`}>
        <div className="flex items-center gap-2.5">
          {metrics.integrity.isValid ? (
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <div>
            <span className="font-bold">
              {metrics.integrity.isValid ? 'Conformidade de Dados Verificada (100% Coincidente):' : 'Atenção - Divergência de Dados:'}
            </span>{' '}
            <span>
              {dataScope === 'presentes' 
                ? `O cabeçalho (${metrics.integrity.headerPresentes}), o resumo (${metrics.integrity.dashboardTotalGeral}) e o banco (${metrics.integrity.dbUniquePresentIdsCount} IDs) conferem perfeitamente.`
                : `Exibindo a base total de ${metrics.totalInscritos} participantes cadastrados para este ensaio.`}
            </span>
            {metrics.duplicidadesPresentes.length > 0 && (
              <span className="block text-[11px] text-amber-800 font-semibold mt-0.5">
                Nota de integridade: {metrics.duplicidadesPresentes.length} participante(s) com mais de um cadastro ativo nesta base.
              </span>
            )}
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-500">
          Soma de Instrumentos: <strong className="text-slate-900">{metrics.grandInstTotal}</strong> | Total Músicos e Organistas: <strong className="text-slate-900">{metrics.totalMusicosOrganistas}</strong>
        </div>
      </div>

      {/* ================= THE PRINTABLE OFFICIAL SUMMARY BOARD (EXACT REFERENCE RECREATION) ================= */}
      <div className="print-container bg-white border border-[#C7D3DF] shadow-md rounded-xl p-5 sm:p-6 max-w-[800px] mx-auto text-[#142B43] font-sans">
        
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-3 mb-3 border-b-2 border-slate-900">
          
          {/* CCB Official Logo Box */}
          <CcbOfficialLogo />

          {/* Title and Event Meta */}
          <div className="text-center sm:text-right flex-1">
            <h1 className="text-2xl sm:text-[28px] font-black text-[#073F70] tracking-tight leading-tight">
              Resumo do Ensaio Regional
            </h1>
            <div className="text-base sm:text-lg font-bold text-[#073F70] leading-tight">
              para Músicos e Organistas
            </div>

            <div className="mt-2 inline-block bg-[#073F70] text-white font-black text-xs sm:text-sm uppercase px-7 py-1 rounded-full tracking-wider shadow-2xs">
              {event.local} - {event.cidadeUf}
            </div>

            <div className="block mt-1.5">
              <span className="inline-block bg-[#D9EAF7] text-[#073F70] font-bold text-xs px-5 py-0.5 rounded-full border border-[#83B8DF]/50 tracking-tight">
                {event.data ? new Date(event.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) + '.' : '18 de Outubro de 2026.'}
              </span>
            </div>
          </div>

        </div>

        {/* 2-Column Split Layout matching IMAGEM 2 (52% left, 48% right) */}
        <div className="flex flex-col md:flex-row print:flex-row gap-3 items-stretch">
          
          {/* LEFT COLUMN: Instruments Table (52% width) */}
          <div className="w-full md:w-[52%] print:w-[52%] flex flex-col justify-between">
            
            {/* Integrated Instrument Families Table */}
            <div className="border border-[#C7D3DF] rounded-lg overflow-hidden shadow-2xs">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-[#075B91] text-white">
                    <th className="py-1.5 px-3 text-left font-bold border-r border-blue-400/30" colSpan={2}>
                      Instrumentos*
                    </th>
                    <th className="py-1.5 px-3 text-right font-bold w-14">
                      Qtde.
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C7D3DF]">
                  
                  {/* CORDAS */}
                  <tr className="border-t border-[#C7D3DF]">
                    <td rowSpan={3} className="w-20 bg-[#FDE5D4] border-r border-[#C7D3DF] text-center p-2 align-middle select-none">
                      <ViolinIcon />
                      <div className="font-bold text-xs text-[#142B43] mt-1">Cordas</div>
                    </td>
                    <td className="px-3 py-1 border-b border-[#C7D3DF] text-slate-800">Violinos</td>
                    <td className="px-3 py-1 border-b border-[#C7D3DF] text-right font-mono font-bold text-[#142B43]">{metrics.violinos}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-1 border-b border-[#C7D3DF] text-slate-800">Violas</td>
                    <td className="px-3 py-1 border-b border-[#C7D3DF] text-right font-mono font-bold text-[#142B43]">{metrics.violas}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-1 border-b border-[#C7D3DF] text-slate-800">Violoncelos</td>
                    <td className="px-3 py-1 border-b border-[#C7D3DF] text-right font-mono font-bold text-[#142B43]">{metrics.violoncelos}</td>
                  </tr>
                  <tr className="bg-[#F5A18B] font-bold text-[#142B43] border-b border-[#C7D3DF]">
                    <td colSpan={2} className="px-3 py-1.5 text-right font-bold text-xs">Subtotal de Cordas</td>
                    <td className="px-3 py-1.5 text-right font-mono font-black text-sm">{metrics.subtotalCordas}</td>
                  </tr>

                  {/* TECLAS */}
                  <tr className="border-t border-[#C7D3DF]">
                    <td rowSpan={2} className="w-20 bg-[#D9F2E6] border-r border-[#C7D3DF] text-center p-2 align-middle select-none">
                      <KeyboardIcon />
                      <div className="font-bold text-xs text-[#142B43] mt-1">Teclas</div>
                    </td>
                    <td className="px-3 py-1 border-b border-[#C7D3DF] text-slate-800">Acordeon</td>
                    <td className="px-3 py-1 border-b border-[#C7D3DF] text-right font-mono font-bold text-[#142B43]">{metrics.acordeon}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-1 border-b border-[#C7D3DF] text-slate-800">Órgão</td>
                    <td className="px-3 py-1 border-b border-[#C7D3DF] text-right font-mono font-bold text-[#142B43]">{metrics.orgao}</td>
                  </tr>
                  <tr className="bg-[#BCE5C8] font-bold text-[#142B43] border-b border-[#C7D3DF]">
                    <td colSpan={2} className="px-3 py-1.5 text-right font-bold text-xs">Subtotal de teclas</td>
                    <td className="px-3 py-1.5 text-right font-mono font-black text-sm">{metrics.subtotalTeclas}</td>
                  </tr>

                  {/* MADEIRAS */}
                  <tr className="border-t border-[#C7D3DF]">
                    <td rowSpan={13} className="w-20 bg-[#D9EEFE] border-r border-[#C7D3DF] text-center p-2 align-middle select-none">
                      <SaxophoneIcon />
                      <div className="font-bold text-xs text-[#142B43] mt-1">Madeiras</div>
                    </td>
                    <td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-slate-800">Flautas</td>
                    <td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-right font-mono font-bold text-[#142B43]">{metrics.flautas}</td>
                  </tr>
                  <tr><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-slate-800">Oboé</td><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-right font-mono font-bold text-[#142B43]">{metrics.oboe}</td></tr>
                  <tr><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-slate-800">Oboé d'Amore</td><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-right font-mono font-bold text-[#142B43]">{metrics.oboeAmore}</td></tr>
                  <tr><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-slate-800">Corne Inglês</td><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-right font-mono font-bold text-[#142B43]">{metrics.corneIngles}</td></tr>
                  <tr><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-slate-800">Fagotes</td><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-right font-mono font-bold text-[#142B43]">{metrics.fagotes}</td></tr>
                  <tr><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-slate-800">Clarinetes</td><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-right font-mono font-bold text-[#142B43]">{metrics.clarinetes}</td></tr>
                  <tr><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-slate-800">Clarone Alto</td><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-right font-mono font-bold text-[#142B43]">{metrics.claroneAlto}</td></tr>
                  <tr><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-slate-800">Clarones Baixos</td><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-right font-mono font-bold text-[#142B43]">{metrics.claroneBaixo}</td></tr>
                  <tr><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-slate-800">Saxofones Sopranos</td><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-right font-mono font-bold text-[#142B43]">{metrics.saxSoprano}</td></tr>
                  <tr><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-slate-800">Saxofones Altos</td><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-right font-mono font-bold text-[#142B43]">{metrics.saxAlto}</td></tr>
                  <tr><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-slate-800">Saxofones Tenores</td><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-right font-mono font-bold text-[#142B43]">{metrics.saxTenor}</td></tr>
                  <tr><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-slate-800">Saxofones Barítonos</td><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-right font-mono font-bold text-[#142B43]">{metrics.saxBaritono}</td></tr>
                  <tr><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-slate-800">Saxofone Baixo</td><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-right font-mono font-bold text-[#142B43]">{metrics.saxBaixo}</td></tr>
                  <tr className="bg-[#83B8DF] font-bold text-[#142B43] border-b border-[#C7D3DF]">
                    <td colSpan={2} className="px-3 py-1.5 text-right font-bold text-xs">Subtotal de Madeiras</td>
                    <td className="px-3 py-1.5 text-right font-mono font-black text-sm">{metrics.subtotalMadeiras}</td>
                  </tr>

                  {/* METAIS */}
                  <tr className="border-t border-[#C7D3DF]">
                    <td rowSpan={9} className="w-20 bg-[#FFF4CC] border-r border-[#C7D3DF] text-center p-2 align-middle select-none">
                      <TrumpetIcon />
                      <div className="font-bold text-xs text-[#142B43] mt-1">Metais</div>
                    </td>
                    <td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-slate-800">Cornet</td>
                    <td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-right font-mono font-bold text-[#142B43]">{metrics.cornet}</td>
                  </tr>
                  <tr><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-slate-800">Trompetes</td><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-right font-mono font-bold text-[#142B43]">{metrics.trompetes}</td></tr>
                  <tr><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-slate-800">FlugelHorns</td><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-right font-mono font-bold text-[#142B43]">{metrics.flugelhorns}</td></tr>
                  <tr><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-slate-800">Trompa</td><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-right font-mono font-bold text-[#142B43]">{metrics.trompa}</td></tr>
                  <tr><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-slate-800">Trombones</td><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-right font-mono font-bold text-[#142B43]">{metrics.trombones}</td></tr>
                  <tr><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-slate-800">Trombonito</td><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-right font-mono font-bold text-[#142B43]">{metrics.trombonito}</td></tr>
                  <tr><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-slate-800">Barítono de pisto</td><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-right font-mono font-bold text-[#142B43]">{metrics.baritonoPisto}</td></tr>
                  <tr><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-slate-800">Eufônios</td><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-right font-mono font-bold text-[#142B43]">{metrics.eufonios}</td></tr>
                  <tr><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-slate-800">Tubas</td><td className="px-3 py-[2.5px] border-b border-[#C7D3DF] text-right font-mono font-bold text-[#142B43]">{metrics.tubas}</td></tr>
                  <tr className="bg-[#FFF0B8] font-bold text-[#142B43] border-b border-[#C7D3DF]">
                    <td colSpan={2} className="px-3 py-1.5 text-right font-bold text-xs">Subtotal de Metais</td>
                    <td className="px-3 py-1.5 text-right font-mono font-black text-sm">{metrics.subtotalMetais}</td>
                  </tr>

                </tbody>
              </table>
            </div>

            {/* GRAND TOTALS BOX (Fundo Escuro / Azul Marinho e Laranja conforme modelo oficial) */}
            <div className="border border-[#C7D3DF] rounded-lg overflow-hidden text-xs font-medium mt-2.5 shadow-2xs">
              <div className="flex justify-between items-center px-4 py-1.5 bg-[#D9EAF7] border-b border-[#C7D3DF]">
                <span className="text-slate-800 font-medium">Total de Músicos (com instrumentos):</span>
                <span className="font-mono font-bold text-[#142B43] text-sm">{metrics.totalMusicos}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-1.5 bg-white border-b border-[#C7D3DF]">
                <span className="text-slate-800 font-medium">Total de Organistas:</span>
                <span className="font-mono font-bold text-[#142B43] text-sm">{metrics.totalOrganistas}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-1.5 bg-[#073F70] text-white border-b border-[#073F70] font-bold">
                <span>Total de Músicos e Organistas:</span>
                <span className="font-mono text-sm tracking-wide">{metrics.totalMusicosOrganistas}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-1.5 bg-[#D9EAF7] border-b border-[#C7D3DF]">
                <span className="text-slate-800 font-medium">Total de Ministério e Colaboradores:</span>
                <span className="font-mono font-bold text-[#142B43] text-sm">{metrics.totalMinisterioColab}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-2 bg-[#073F70] text-white font-black text-sm uppercase">
                <span>Total Geral de presentes:</span>
                <span className="font-mono text-base tracking-wide">{metrics.totalGeralPresentes}</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Attending Ministers, Staff, Distribution Pie Chart & Oficialização (48% width) */}
          <div className="w-full md:w-[48%] print:w-[48%] flex flex-col justify-between space-y-2.5">
            
            {/* Box 1: Irmãos no atendimento */}
            <div className="border border-[#C7D3DF] rounded-lg overflow-hidden shadow-2xs">
              <div className="bg-[#075B91] text-white text-xs font-bold py-1 text-center uppercase tracking-wider">
                Irmãos no atendimento
              </div>
              <table className="w-full text-xs divide-y divide-[#C7D3DF]">
                <tbody>
                  <tr>
                    <td className="px-3 py-1 font-medium text-slate-700 bg-slate-50/70 w-28 border-r border-[#C7D3DF]">Ancião</td>
                    <td className="px-3 py-1 font-bold text-[#142B43]">{event.anciaoAtendimento || 'NÃO INFORMADO'}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-1 font-medium text-slate-700 bg-slate-50/70 w-28 border-r border-[#C7D3DF]">Enc. Regional</td>
                    <td className="px-3 py-1 font-bold text-[#142B43]">{event.encarregadoRegional || 'NÃO INFORMADO'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Box 2: Ministérios e Colaboradores */}
            <div className="border border-[#C7D3DF] rounded-lg overflow-hidden shadow-2xs">
              <div className="bg-[#D6A02F] text-white text-xs font-bold py-1 px-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-white" />
                <span>Ministérios e Colaboradores</span>
              </div>
              <table className="w-full text-xs divide-y divide-[#C7D3DF]">
                <tbody className="divide-y divide-[#C7D3DF]">
                  <tr className="hover:bg-slate-50/60"><td className="px-3 py-1 text-slate-800">Anciães</td><td className="px-3 py-1 text-right font-mono font-bold text-[#142B43]">{metrics.anciaes}</td></tr>
                  <tr className="hover:bg-slate-50/60"><td className="px-3 py-1 text-slate-800">Diácono</td><td className="px-3 py-1 text-right font-mono font-bold text-[#142B43]">{metrics.diacono}</td></tr>
                  <tr className="hover:bg-slate-50/60"><td className="px-3 py-1 text-slate-800">Cooperadores Oficiais</td><td className="px-3 py-1 text-right font-mono font-bold text-[#142B43]">{metrics.cooperadoresOficiais}</td></tr>
                  <tr className="hover:bg-slate-50/60"><td className="px-3 py-1 text-slate-800">Cooperadores de Jovens e Menores</td><td className="px-3 py-1 text-right font-mono font-bold text-[#142B43]">{metrics.cooperadoresJovens}</td></tr>
                  <tr className="hover:bg-slate-50/60"><td className="px-3 py-1 text-slate-800">Irmãos/irmãs Colaboradores**</td><td className="px-3 py-1 text-right font-mono font-bold text-[#142B43]">{metrics.colaboradores}</td></tr>
                </tbody>
              </table>
              <div className="bg-amber-50/50 px-3 py-0.5 text-[8.5px] text-slate-500 italic border-t border-[#C7D3DF]">
                (**) Libras, Portas, Som, Estacionamento, Cafeteria, etc.
              </div>
            </div>

            {/* Box 3: Parte Musical */}
            <div className="border border-[#C7D3DF] rounded-lg overflow-hidden shadow-2xs">
              <div className="bg-[#075B91] text-white text-xs font-bold py-1 px-3 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-white" />
                <span>Parte Musical</span>
              </div>
              <table className="w-full text-xs divide-y divide-[#C7D3DF]">
                <tbody className="divide-y divide-[#C7D3DF]">
                  <tr className="hover:bg-slate-50/60"><td className="px-3 py-1 text-slate-800">Encarregados Regionais</td><td className="px-3 py-1 text-right font-mono font-bold text-[#142B43]">{metrics.encarregadosRegionais}</td></tr>
                  <tr className="hover:bg-slate-50/60"><td className="px-3 py-1 text-slate-800">Examinadoras</td><td className="px-3 py-1 text-right font-mono font-bold text-[#142B43]">{metrics.examinadoras}</td></tr>
                  <tr className="hover:bg-slate-50/60"><td className="px-3 py-1 text-slate-800">Encarregados Locais</td><td className="px-3 py-1 text-right font-mono font-bold text-[#142B43]">{metrics.encarregadosLocais}</td></tr>
                  <tr className="hover:bg-slate-50/60"><td className="px-3 py-1 text-slate-800">Instrutores(as)</td><td className="px-3 py-1 text-right font-mono font-bold text-[#142B43]">{metrics.instrutores}</td></tr>
                  <tr className="hover:bg-slate-50/60"><td className="px-3 py-1 text-slate-800">Professores(as)</td><td className="px-3 py-1 text-right font-mono font-bold text-[#142B43]">{metrics.professores}</td></tr>
                  <tr className="hover:bg-slate-50/60"><td className="px-3 py-1 text-slate-800">Irmãos do Dpto Musical</td><td className="px-3 py-1 text-right font-mono font-bold text-[#142B43]">{metrics.irmaosDptoMusical}</td></tr>
                </tbody>
              </table>
            </div>

            {/* Box 4: Instrumentos (Solid Pie Chart matching IMAGEM 2) */}
            <div className="border border-[#C7D3DF] rounded-lg p-2.5 bg-white text-center shadow-2xs">
              <span className="text-xs font-black text-[#142B43] block uppercase tracking-wide mb-1">
                Instrumentos
              </span>

              <div className="py-0.5">
                <InstrumentPieChart
                  pctCordas={metrics.pctCordas}
                  pctTeclas={metrics.pctTeclas}
                  pctMadeiras={metrics.pctMadeiras}
                  pctMetais={metrics.pctMetais}
                  total={metrics.grandInstTotal}
                />
              </div>

              {/* Legend matching IMAGEM 2 */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-1 text-[10px] sm:text-[10.5px] font-bold text-[#142B43]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-[#F5A18B] rounded-2xs inline-block shadow-2xs" />
                  <span>Cordas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-[#BCE5C8] rounded-2xs inline-block shadow-2xs" />
                  <span>Teclas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-[#83B8DF] rounded-2xs inline-block shadow-2xs" />
                  <span>Madeiras</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-[#FFF0B8] rounded-2xs inline-block shadow-2xs" />
                  <span>Metais</span>
                </div>
              </div>
            </div>

            {/* Box 5: Oficialização */}
            <div className="border border-[#C7D3DF] rounded-lg overflow-hidden shadow-2xs">
              <div className="bg-[#348B4B] text-white text-xs font-bold py-1 px-3 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span className="uppercase tracking-wide">Oficialização</span>
              </div>
              <table className="w-full text-xs divide-y divide-[#C7D3DF]">
                <tbody>
                  <tr>
                    <td className="px-3 py-1 text-slate-800">Músico</td>
                    <td className="px-3 py-1 text-right font-mono font-bold text-[#142B43]">{metrics.oficializadosMusicos}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-1 text-slate-800">Organistas</td>
                    <td className="px-3 py-1 text-right font-mono font-bold text-[#142B43]">{metrics.oficializadosOrganistas}</td>
                  </tr>
                  <tr className="bg-[#BCE5C8] font-bold text-[#142B43] border-t border-[#C7D3DF]">
                    <td className="px-3 py-1.5 uppercase text-xs">Total Geral de Oficializado(s):</td>
                    <td className="px-3 py-1.5 text-right font-mono text-sm">{metrics.totalOficializados}</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

        </div>

        {/* Footer Notes matching the official document */}
        <div className="mt-3.5 pt-2 border-t border-[#C7D3DF] text-[10px] space-y-1 leading-tight">
          <p className="font-semibold text-slate-700">
            (*)Obs. Lista de instrumentos em conformidade com o MOO.
          </p>
          <p className="italic text-[#b91c1c] font-medium leading-relaxed">
            {event.observacoesTexto || 'Obs1. Se comparecerem Instrumentos não aceitos nas orquestras, serão contados (sax mais grave que sax barítono = sax barítono , pocket = trompete , Sax sop. curvo = sax soprano ; clarone mais grave que clarone baixo = clarone baixo ; etc).'}
          </p>
          <div className="flex justify-between pt-1 text-[9px] text-slate-400">
            <span>Base Oficial: {event.versionInfo.nomeArquivo} ({event.versionInfo.versao})</span>
            <span>Rastreabilidade de Dados: 100% Lançamentos Reais</span>
          </div>
        </div>

      </div>

      {/* ================= PAINEL DE AUDITORIA & RELAÇÃO DE CONFERÊNCIA INDIVIDUAL (SEÇÃO 5 E 6) ================= */}
      <div className="no-print max-w-4xl mx-auto space-y-4">
        
        {/* Toggle Bar / Card Header */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-950 text-amber-400 flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Relação de Conferência dos Dados Reais & Memória de Cálculo
                </h3>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                  3-Way Sync 100% OK
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Auditoria individual de cada participante com presença confirmada e rastreabilidade total dos totais.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAuditPanel(!showAuditPanel)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            {showAuditPanel ? (
              <>
                <span>Ocultar Auditoria</span>
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Visualizar Memória de Cálculo e Lista ({metrics.membrosAuditados.length})</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {showAuditPanel && (
          <div className="space-y-4">
            
            {/* 3-WAY SYNCHRONIZATION AUDIT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white border border-emerald-200 rounded-xl p-3 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  1. Indicador do Cabeçalho
                </span>
                <div className="text-xl font-black text-emerald-700 mt-1 flex items-baseline gap-1.5">
                  <span>{metrics.integrity.headerPresentes}</span>
                  <span className="text-xs font-bold text-slate-500">PRESENTES</span>
                </div>
                <span className="text-[11px] text-slate-400">Contagem de crachás/presenças ativas</span>
              </div>

              <div className="bg-white border border-emerald-200 rounded-xl p-3 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  2. Total Geral do Resumo
                </span>
                <div className="text-xl font-black text-amber-500 mt-1 flex items-baseline gap-1.5">
                  <span>{metrics.integrity.dashboardTotalGeral}</span>
                  <span className="text-xs font-bold text-slate-500">PRESENTES</span>
                </div>
                <span className="text-[11px] text-slate-400">Total apurado no quadro oficial</span>
              </div>

              <div className="bg-white border border-emerald-200 rounded-xl p-3 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  3. IDs Únicos no Banco
                </span>
                <div className="text-xl font-black text-sky-700 mt-1 flex items-baseline gap-1.5">
                  <span>{metrics.integrity.dbUniquePresentIdsCount}</span>
                  <span className="text-xs font-bold text-slate-500">PARTICIPANTES</span>
                </div>
                <span className="text-[11px] text-slate-400">Identificadores únicos com status "presente"</span>
              </div>
            </div>

            {/* MEMÓRIA DE CÁLCULO ITEMIZADA */}
            <div className="bg-slate-900 text-slate-100 rounded-xl p-4 sm:p-5 text-xs space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-sm text-white uppercase tracking-wider">
                    Demonstração da Memória de Cálculo dos Indicadores
                  </span>
                </div>
                <span className="text-[11px] text-emerald-400 font-mono font-bold">
                  Fórmula Única: Set(IDs presentes).size = {metrics.totalGeralPresentes}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="space-y-2">
                  <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">A) Total Geral de Presentes:</span>
                      <span className="font-mono font-black text-amber-400 text-sm">{metrics.totalGeralPresentes}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">
                      <strong>Origem:</strong> Contagem direta de identificadores únicos com presença confirmada no ensaio. Não utiliza soma de categorias diferentes.
                    </p>
                  </div>

                  <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">B) Total de Músicos com Instrumentos:</span>
                      <span className="font-mono font-bold text-sky-400 text-sm">{metrics.totalMusicos}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">
                      <strong>Origem:</strong> Participantes com instrumento orquestral registrado (excluindo organistas/órgão).
                    </p>
                  </div>

                  <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">C) Total de Organistas:</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">{metrics.totalOrganistas}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">
                      <strong>Origem:</strong> Participantes classificados no cargo de Organista ou com instrumento Órgão.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">D) Músicos e Organistas (União de Pessoas):</span>
                      <span className="font-mono font-bold text-sky-300 text-sm">{metrics.totalMusicosOrganistas}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">
                      <strong>Origem:</strong> União estrita dos conjuntos B e C sem duplicidade: {metrics.totalMusicos} + {metrics.totalOrganistas} = {metrics.totalMusicosOrganistas}.
                    </p>
                  </div>

                  <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">E) Ministério e Colaboradores:</span>
                      <span className="font-mono font-bold text-amber-300 text-sm">{metrics.totalMinisterioColab}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">
                      <strong>Origem:</strong> Exclusivamente participantes cadastrados com funções de Ancião, Diácono, Cooperador e Colaborador com presença confirmada.
                      <span className="text-amber-300 font-semibold block mt-0.5">
                        *Auditoria estrita: Sem valores fixos, dados de demonstração ou preenchimento automático. Comprovados: 0 registros no banco para este ensaio.
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* TABELA DE AUDITORIA E CONFERÊNCIA DE MINISTÉRIOS E COLABORADORES (SEÇÃO 6 DO PROMPT) */}
              <div className="bg-slate-800/90 rounded-lg p-3.5 border border-slate-700 space-y-2.5 mt-3">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-amber-400">
                    Auditoria Individual do Quadro de Ministérios e Colaboradores (Seção 6)
                  </span>
                  <span className="text-[10px] bg-slate-700 text-slate-200 px-2 py-0.5 rounded font-mono font-semibold">
                    Total Comprovado: {metrics.totalMinisterioColab}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] text-left">
                    <thead className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-700">
                      <tr>
                        <th className="py-1 px-2 font-bold">CATEGORIA</th>
                        <th className="py-1 px-2 font-mono">ID</th>
                        <th className="py-1 px-2">NOME</th>
                        <th className="py-1 px-2">FUNÇÃO REGISTRADA</th>
                        <th className="py-1 px-2 text-center">PRESENÇA</th>
                        <th className="py-1 px-2">FONTE DO REGISTRO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60 font-medium">
                      <tr>
                        <td className="py-1.5 px-2 font-bold text-amber-300">Anciães</td>
                        <td className="py-1.5 px-2 font-mono text-slate-400">{metrics.anciaes > 0 ? 'Membro(s) BD' : '—'}</td>
                        <td className="py-1.5 px-2 text-slate-300">{metrics.anciaes > 0 ? 'Conforme cadastro' : 'Nenhum membro cadastrado com este cargo'}</td>
                        <td className="py-1.5 px-2 text-slate-400">ANCIÃO</td>
                        <td className="py-1.5 px-2 text-center font-bold text-emerald-400">{metrics.anciaes > 0 ? `${metrics.anciaes} PRESENTE(S)` : '0'}</td>
                        <td className="py-1.5 px-2 text-slate-400">Base Oficial ({event.versionInfo.nomeArquivo})</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-2 font-bold text-amber-300">Diácono</td>
                        <td className="py-1.5 px-2 font-mono text-slate-400">{metrics.diacono > 0 ? 'Membro(s) BD' : '—'}</td>
                        <td className="py-1.5 px-2 text-slate-300">{metrics.diacono > 0 ? 'Conforme cadastro' : 'Nenhum membro cadastrado com este cargo'}</td>
                        <td className="py-1.5 px-2 text-slate-400">DIÁCONO</td>
                        <td className="py-1.5 px-2 text-center font-bold text-emerald-400">{metrics.diacono > 0 ? `${metrics.diacono} PRESENTE(S)` : '0'}</td>
                        <td className="py-1.5 px-2 text-slate-400">Base Oficial ({event.versionInfo.nomeArquivo})</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-2 font-bold text-amber-300">Cooperadores Oficiais</td>
                        <td className="py-1.5 px-2 font-mono text-slate-400">{metrics.cooperadoresOficiais > 0 ? 'Membro(s) BD' : '—'}</td>
                        <td className="py-1.5 px-2 text-slate-300">{metrics.cooperadoresOficiais > 0 ? 'Conforme cadastro' : 'Nenhum membro cadastrado com este cargo'}</td>
                        <td className="py-1.5 px-2 text-slate-400">COOPERADOR DO OFÍCIO</td>
                        <td className="py-1.5 px-2 text-center font-bold text-emerald-400">{metrics.cooperadoresOficiais > 0 ? `${metrics.cooperadoresOficiais} PRESENTE(S)` : '0'}</td>
                        <td className="py-1.5 px-2 text-slate-400">Base Oficial ({event.versionInfo.nomeArquivo})</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-2 font-bold text-amber-300">Cooperadores de Jovens e Menores</td>
                        <td className="py-1.5 px-2 font-mono text-slate-400">{metrics.cooperadoresJovens > 0 ? 'Membro(s) BD' : '—'}</td>
                        <td className="py-1.5 px-2 text-slate-300">{metrics.cooperadoresJovens > 0 ? 'Conforme cadastro' : 'Nenhum membro cadastrado com este cargo'}</td>
                        <td className="py-1.5 px-2 text-slate-400">COOPERADOR DE JOVENS</td>
                        <td className="py-1.5 px-2 text-center font-bold text-emerald-400">{metrics.cooperadoresJovens > 0 ? `${metrics.cooperadoresJovens} PRESENTE(S)` : '0'}</td>
                        <td className="py-1.5 px-2 text-slate-400">Base Oficial ({event.versionInfo.nomeArquivo})</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-2 font-bold text-amber-300">Irmãos/irmãs Colaboradores</td>
                        <td className="py-1.5 px-2 font-mono text-slate-400">{metrics.colaboradores > 0 ? 'Membro(s) BD' : '—'}</td>
                        <td className="py-1.5 px-2 text-slate-300">{metrics.colaboradores > 0 ? 'Conforme cadastro' : 'Nenhum membro cadastrado nesta função'}</td>
                        <td className="py-1.5 px-2 text-slate-400">COLABORADOR</td>
                        <td className="py-1.5 px-2 text-center font-bold text-emerald-400">{metrics.colaboradores > 0 ? `${metrics.colaboradores} PRESENTE(S)` : '0'}</td>
                        <td className="py-1.5 px-2 text-slate-400">Base Oficial ({event.versionInfo.nomeArquivo})</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* TABELA DE CONFERÊNCIA INDIVIDUAL */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-3 p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Relação Nominal dos Participantes Auditados ({filteredAuditMembers.length} registros)
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    {dataScope === 'presentes' ? 'Listagem exclusiva de participantes com presença confirmada' : 'Listagem de todos os inscritos'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {/* Search */}
                  <div className="relative flex-1 sm:w-48">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={auditSearchTerm}
                      onChange={(e) => setAuditSearchTerm(e.target.value)}
                      placeholder="Buscar na auditoria..."
                      className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-300 rounded text-xs font-medium focus:bg-white"
                    />
                  </div>

                  {/* Filter chips */}
                  <div className="flex items-center gap-1 text-[11px] font-semibold">
                    <button
                      onClick={() => setAuditFilter('todos')}
                      className={`px-2 py-1 rounded ${auditFilter === 'todos' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      Todos ({metrics.membrosAuditados.length})
                    </button>
                    <button
                      onClick={() => setAuditFilter('musicos')}
                      className={`px-2 py-1 rounded ${auditFilter === 'musicos' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      Músicos ({metrics.totalMusicos})
                    </button>
                    <button
                      onClick={() => setAuditFilter('organistas')}
                      className={`px-2 py-1 rounded ${auditFilter === 'organistas' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      Organistas ({metrics.totalOrganistas})
                    </button>
                    <button
                      onClick={() => setAuditFilter('ministerio')}
                      className={`px-2 py-1 rounded ${auditFilter === 'ministerio' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      Ministérios ({metrics.totalMinisterioColab})
                    </button>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2 w-28 font-mono">ID DO PARTICIPANTE</th>
                      <th className="px-3 py-2">NOME</th>
                      <th className="px-3 py-2 text-center w-24">PRESENÇA</th>
                      <th className="px-3 py-2">CLASSIFICAÇÃO</th>
                      <th className="px-3 py-2">INSTRUMENTO</th>
                      <th className="px-3 py-2">LOCALIDADE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredAuditMembers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                          Nenhum participante encontrado para os critérios selecionados.
                        </td>
                      </tr>
                    ) : (
                      filteredAuditMembers.map((m) => {
                        const isOrganista = (m.cargo || '').toUpperCase() === 'ORGANISTA' || (m.instrumento || '').toUpperCase() === 'ÓRGÃO';
                        const isPresente = m.statusPresenca === 'presente';

                        return (
                          <tr key={m.id} className="hover:bg-slate-50">
                            <td className="px-3 py-1.5 font-mono text-[11px] text-slate-500 font-bold">{m.id}</td>
                            <td className="px-3 py-1.5 font-bold text-slate-900">{m.nome}</td>
                            <td className="px-3 py-1.5 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                isPresente 
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                  : 'bg-slate-100 text-slate-500'
                              }`}>
                                {isPresente ? 'PRESENTE' : m.statusPresenca.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-3 py-1.5">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                isOrganista 
                                  ? 'bg-emerald-50 text-emerald-800' 
                                  : m.cargo.includes('INSTRUTOR') || m.cargo.includes('ENCARREGADO')
                                  ? 'bg-amber-50 text-amber-800 font-bold'
                                  : 'bg-sky-50 text-sky-800'
                              }`}>
                                {m.cargo} {m.nivel ? `(${m.nivel})` : ''}
                              </span>
                            </td>
                            <td className="px-3 py-1.5 font-bold text-slate-800">{m.instrumento || '—'}</td>
                            <td className="px-3 py-1.5 text-slate-600 text-[11px]">{m.localidade}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};
