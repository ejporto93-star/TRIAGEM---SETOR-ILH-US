import { MemberRecord, InstrumentFamily } from '../types';

export interface ParseResult {
  members: MemberRecord[];
  totalIdentified: number;
  totalValid: number;
  duplicates: {
    nome: string;
    indices: number[];
    paginas: number[];
    motivo: string;
  }[];
  errors: {
    linha: string;
    pagina: number;
    motivo: string;
  }[];
  needsReview: {
    member: MemberRecord;
    motivo: string;
  }[];
  paginasTotal: number;
}

const KNOWN_LEVELS = [
  'RJM / OFICIALIZADO(A)',
  'RJM / CULTO OFICIAL',
  'RJM / ENSAIO',
  'CULTO OFICIAL',
  'OFICIALIZADO(A)',
  'CANDIDATO(A)',
  'ENSAIO',
  'RJM'
];

const KNOWN_CARGOS = [
  'SECRETÁRIO (A) DA MÚSICA',
  'SECRETÁRIO DA MÚSICA',
  'SECRETARIA DA MÚSICA',
  'ENCARREGADO REGIONAL',
  'ENCARREGADO LOCAL',
  'INSTRUTORA',
  'INSTRUTOR',
  'ORGANISTA',
  'MÚSICO'
];

const KNOWN_INSTRUMENTS = [
  'SAXOFONE SOPRANO CUR',
  'SAXOFONE SOPRANO RET',
  'SAXOFONE BARÍTONO',
  'SAXOFONE TENOR',
  'SAXOFONE ALTO',
  'SAXOFONE BAIXO',
  'CLARONE BAIXO',
  'CLARONE ALTO',
  'VIOLONCELO',
  'FLUGELHORN',
  'TROMBONITO',
  'EUPHONIUM',
  'CLARINETE',
  'TROMBONE',
  'TROMPETE',
  'VIOLINO',
  'FLAUTA',
  'CORNET',
  'TROMPA',
  'ACORDEON',
  'FAGOTE',
  'VIOLA',
  'ÓRGÃO',
  'OBOÉ',
  'TUBA'
];

export function getInstrumentFamily(instrumento: string): InstrumentFamily {
  const i = instrumento.toUpperCase();
  if (['VIOLINO', 'VIOLA', 'VIOLONCELO'].some(k => i.includes(k))) return 'Cordas';
  if (['ÓRGÃO', 'ORGAN', 'ACORDEON', 'TECLADO'].some(k => i.includes(k))) return 'Teclas';
  if (['FLAUTA', 'CLARINETE', 'SAXOFONE', 'OBOÉ', 'FAGOTE', 'CLARONE'].some(k => i.includes(k))) return 'Madeiras';
  if (['CORNET', 'TROMPETE', 'FLUGELHORN', 'TROMBONITO', 'TROMBONE', 'EUPHONIUM', 'EUFÔNIO', 'TUBA', 'TROMPA', 'BARÍTONO DE PISTO'].some(k => i.includes(k))) return 'Metais';
  return 'Outros';
}

export function parsePdfText(rawText: string): ParseResult {
  const lines = rawText.split(/\r?\n/);
  let currentPage = 1;
  let maxPageFound = 1;
  const parsedMembers: MemberRecord[] = [];
  const errors: ParseResult['errors'] = [];
  const needsReview: ParseResult['needsReview'] = [];

  for (let idx = 0; idx < lines.length; idx++) {
    let rawLine = lines[idx].trim();
    if (!rawLine) continue;

    // Track page indicators like "Página 1 de 24" or "==Start of OCR for page 1=="
    const pageMatch1 = rawLine.match(/p[áa]gina\s+(\d+)\s+de\s+(\d+)/i);
    if (pageMatch1) {
      currentPage = parseInt(pageMatch1[1], 10);
      maxPageFound = Math.max(maxPageFound, parseInt(pageMatch1[2], 10));
      continue;
    }
    const pageMatch2 = rawLine.match(/page\s+(\d+)/i);
    if (pageMatch2) {
      currentPage = parseInt(pageMatch2[1], 10);
      maxPageFound = Math.max(maxPageFound, currentPage);
      continue;
    }

    // Skip known header/footer phrases
    if (
      rawLine.startsWith('Sistema de') ||
      rawLine.startsWith('RELATÓRIO') ||
      rawLine.startsWith('Gerado em:') ||
      rawLine.startsWith('NOME INSTRUMENTO') ||
      rawLine.startsWith('Total:') ||
      rawLine.startsWith('==')
    ) {
      continue;
    }

    let line = rawLine;

    // 1. Detect NIVEL from the right
    let foundNivel = '';
    for (const lvl of KNOWN_LEVELS) {
      if (line.endsWith(lvl)) {
        foundNivel = lvl;
        line = line.slice(0, line.length - lvl.length).trim();
        break;
      }
    }

    if (!foundNivel) {
      // Check if it looks like a person line that couldn't match level
      if (line.split(/\s+/).length >= 4) {
        errors.push({
          linha: rawLine,
          pagina: currentPage,
          motivo: 'Nível não identificado no final da linha'
        });
      }
      continue;
    }

    // 2. Detect CARGO from the right
    let foundCargo = '';
    for (const crg of KNOWN_CARGOS) {
      if (line.endsWith(crg)) {
        foundCargo = crg;
        line = line.slice(0, line.length - crg.length).trim();
        break;
      }
    }

    if (!foundCargo) {
      errors.push({
        linha: rawLine,
        pagina: currentPage,
        motivo: 'Cargo/Ministério não identificado antes do nível'
      });
      continue;
    }

    // 3. Detect INSTRUMENTO in the remainder (between NOME and LOCALIDADE)
    let foundInst = '';
    let foundNome = '';
    let foundLocalidade = '';

    for (const inst of KNOWN_INSTRUMENTS) {
      const escaped = inst.replace(/\(/g, '\\(').replace(/\)/g, '\\)');
      const regex = new RegExp(`\\s+${escaped}\\s+`);
      const match = regex.exec(line);
      if (match) {
        foundInst = inst;
        foundNome = line.slice(0, match.index).trim();
        foundLocalidade = line.slice(match.index + match[0].length).trim();
        break;
      }
    }

    if (!foundInst || !foundNome || !foundLocalidade) {
      errors.push({
        linha: rawLine,
        pagina: currentPage,
        motivo: 'Não foi possível separar NOME, INSTRUMENTO e LOCALIDADE com precisão'
      });
      continue;
    }

    const member: MemberRecord = {
      id: 'imp_' + Date.now() + '_' + (parsedMembers.length + 1),
      nome: foundNome,
      instrumento: foundInst,
      familia: getInstrumentFamily(foundInst),
      localidade: foundLocalidade,
      cargo: foundCargo,
      nivel: foundNivel,
      pagina: currentPage,
      statusPresenca: 'ausente'
    };

    // Flag potential peculiarities for manual review
    if (foundNome.length < 3 || foundNome.split(' ').length < 2) {
      needsReview.push({
        member,
        motivo: 'Nome com apenas uma palavra ou muito curto'
      });
    } else if (foundNome.startsWith('︎') || /[^\w\s\u00C0-\u00FF'-]/i.test(foundNome)) {
      needsReview.push({
        member,
        motivo: 'Caracteres especiais ou marcador no início do nome preservados fielmente'
      });
    }

    parsedMembers.push(member);
  }

  // 4. Duplicate Detection (preserve all without auto-deleting)
  const nameMap = new Map<string, { indices: number[]; paginas: number[]; localities: string[]; instruments: string[] }>();
  parsedMembers.forEach((m, idx) => {
    const key = m.nome.trim().toUpperCase();
    const existing = nameMap.get(key) || { indices: [], paginas: [], localities: [], instruments: [] };
    existing.indices.push(idx);
    existing.paginas.push(m.pagina);
    existing.localities.push(m.localidade);
    existing.instruments.push(m.instrumento);
    nameMap.set(key, existing);
  });

  const duplicates: ParseResult['duplicates'] = [];
  for (const [nome, info] of nameMap.entries()) {
    if (info.indices.length > 1) {
      const distinctLoc = new Set(info.localities).size;
      const distinctInst = new Set(info.instruments).size;
      let motivo = `${info.indices.length} ocorrências identificadas.`;
      if (distinctInst > 1) {
        motivo += ` Instrumentos diferentes: ${Array.from(new Set(info.instruments)).join(' e ')}.`;
      }
      if (distinctLoc > 1) {
        motivo += ` Localidades diferentes: ${Array.from(new Set(info.localities)).join(' e ')}.`;
      }
      duplicates.push({
        nome,
        indices: info.indices,
        paginas: info.paginas,
        motivo
      });
    }
  }

  return {
    members: parsedMembers,
    totalIdentified: parsedMembers.length + errors.length,
    totalValid: parsedMembers.length,
    duplicates,
    errors,
    needsReview,
    paginasTotal: Math.max(maxPageFound, currentPage)
  };
}

// Function to extract text from an uploaded PDF File in browser using pdfjs-dist
export async function extractTextFromPdfFile(file: File): Promise<string> {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    // Set worker source
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      fullText += `\n==Start of OCR for page ${pageNum}==\nPágina ${pageNum} de ${pdf.numPages}\n`;
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Group items by line according to their vertical coordinate (y)
      const lineMap: Record<number, { x: number; text: string }[]> = {};
      for (const item of textContent.items as any[]) {
        if (!item.str || !item.str.trim()) continue;
        const y = Math.round(item.transform[5]);
        if (!lineMap[y]) lineMap[y] = [];
        lineMap[y].push({ x: Math.round(item.transform[4]), text: item.str });
      }

      // Sort descending by Y (top of page to bottom)
      const sortedY = Object.keys(lineMap).map(Number).sort((a, b) => b - a);
      for (const y of sortedY) {
        // Sort ascending by X (left to right)
        const rowItems = lineMap[y].sort((a, b) => a.x - b.x);
        const lineStr = rowItems.map(i => i.text.trim()).join(' ');
        fullText += lineStr + '\n';
      }
      fullText += `==End of OCR for page ${pageNum}==\n`;
    }

    return fullText;
  } catch (err) {
    console.warn('Extração direta do PDF falhou, utilizando leitor de texto puro:', err);
    // Fallback: try reading as text
    return await file.text();
  }
}
