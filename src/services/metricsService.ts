import { MemberRecord, EventModule } from '../types';

export interface EnsaioMetrics {
  // Escopo e Base
  scope: 'presentes' | 'todos';
  totalInscritos: number;
  totalPresentes: number;
  totalAusentes: number;
  totalJustificados: number;

  // A) PRESENÇA REAL (Total Geral de Pessoas Distintas)
  totalGeralPresentes: number;
  participantesUnicosIds: string[];
  duplicidadesDetectadas: { nome: string; count: number; ids: string[] }[];
  duplicidadesPresentes: { nome: string; count: number; ids: string[] }[];
  membrosAuditados: MemberRecord[];

  // B) MÚSICOS COM INSTRUMENTOS (Indicador de Classificação)
  totalMusicos: number;
  musicosIds: string[];

  // C) ORGANISTAS (Indicador de Classificação)
  totalOrganistas: number;
  organistasIds: string[];

  // D) MÚSICOS + ORGANISTAS (Pessoas Distintas nesta união)
  totalMusicosOrganistas: number;
  musicosOrganistasIds: string[];

  // E) MINISTÉRIOS E COLABORADORES (Indicador de Classificação Independente)
  anciaes: number;
  diacono: number;
  cooperadoresOficiais: number;
  cooperadoresJovens: number;
  colaboradores: number;
  totalMinisterioColab: number;
  ministerioColabIds: string[];

  // F) PARTE MUSICAL (Indicador de Classificação de Funções)
  encarregadosRegionais: number;
  examinadoras: number;
  encarregadosLocais: number;
  instrutores: number;
  professores: number;
  irmaosDptoMusical: number;
  totalParteMusical: number;

  // G) INSTRUMENTOS (Contagem real de cada instrumento registrado)
  violinos: number;
  violas: number;
  violoncelos: number;
  subtotalCordas: number;

  acordeon: number;
  orgao: number;
  subtotalTeclas: number;

  flautas: number;
  oboe: number;
  oboeAmore: number;
  corneIngles: number;
  fagotes: number;
  clarinetes: number;
  claroneAlto: number;
  claroneBaixo: number;
  saxSoprano: number;
  saxAlto: number;
  saxTenor: number;
  saxBaritono: number;
  saxBaixo: number;
  subtotalMadeiras: number;

  cornet: number;
  trompetes: number;
  flugelhorns: number;
  trompa: number;
  trombones: number;
  trombonito: number;
  baritonoPisto: number;
  eufonios: number;
  tubas: number;
  subtotalMetais: number;

  // Total Real de Instrumentos Registrados
  totalInstrumentosRegistrados: number;
  grandInstTotal: number;

  // H) GRÁFICO DE DISTRIBUIÇÃO (Calculado estritamente sobre totalInstrumentosRegistrados)
  pctCordas: number;
  pctTeclas: number;
  pctMadeiras: number;
  pctMetais: number;
  hasInstrumentData: boolean;

  // I) OFICIALIZAÇÃO (Lançamentos de oficialização confirmados)
  oficializadosMusicos: number;
  oficializadosOrganistas: number;
  totalOficializados: number;

  // J) VALIDAÇÃO AUTOMÁTICA DE INTEGRIDADE (Seção 6 do Prompt)
  integrity: {
    isValid: boolean;
    headerPresentes: number;
    dashboardTotalGeral: number;
    dbUniquePresentIdsCount: number;
    divergencias: string[];
    conferidoEm: string;
  };
}

/**
 * Normaliza e identifica se um cargo pertence à categoria de Ministério ou Colaborador
 */
export function isCargoMinisterioOuColaborador(cargo: string): boolean {
  const c = cargo.toUpperCase();
  return (
    c.includes('ANCIÃO') ||
    c.includes('ANCIAO') ||
    c.includes('DIÁCONO') ||
    c.includes('DIACONO') ||
    c.includes('COOPERADOR') ||
    c.includes('COLABORADOR')
  );
}

/**
 * FONTE ÚNICA DA VERDADE (Single Source of Truth)
 * 
 * Regra Obrigatória da Seção 1:
 * TOTAL GERAL DE PRESENTES = CONTAGEM DE IDENTIFICADORES ÚNICOS DE PARTICIPANTES COM PRESENÇA CONFIRMADA.
 * 
 * É PROIBIDO somar categorias sobrepostas (como músicos + organistas + ministérios).
 * Cada pessoa é contabilizada uma única vez pelo seu ID.
 */
export function calculateEnsaioMetrics(
  event: EventModule,
  scope: 'presentes' | 'todos' = 'presentes'
): EnsaioMetrics {
  const allMembers = event.membros || [];

  // Contagens básicas da base geral
  const totalInscritos = allMembers.length;
  const presentMembers = allMembers.filter(m => m.statusPresenca === 'presente');
  const totalPresentes = presentMembers.length;
  const totalAusentes = allMembers.filter(m => m.statusPresenca === 'ausente').length;
  const totalJustificados = allMembers.filter(m => m.statusPresenca === 'justificado').length;

  // 1. Definição do conjunto ativo conforme o escopo selecionado
  const activeSet = scope === 'presentes' ? presentMembers : allMembers;

  // 2. REGRA DO TOTAL GERAL: CONTAGEM DE IDENTIFICADORES ÚNICOS (IDs)
  // Utiliza Set de IDs para garantir que nenhuma pessoa seja contabilizada mais de uma vez
  const activeIdsSet = new Set<string>();
  const activeMembersDistinct: MemberRecord[] = [];

  for (const m of activeSet) {
    if (!activeIdsSet.has(m.id)) {
      activeIdsSet.add(m.id);
      activeMembersDistinct.push(m);
    }
  }

  // TOTAL GERAL DE PRESENTES: Quantidade de IDs únicos com presença confirmada
  const totalGeralPresentes = activeIdsSet.size;
  const participantesUnicosIds = Array.from(activeIdsSet);

  // Detecção de duplicidades de nomes entre os presentes para auditoria
  const nameMap = new Map<string, string[]>();
  for (const m of activeMembersDistinct) {
    const k = m.nome.trim().toUpperCase();
    const ids = nameMap.get(k) || [];
    ids.push(m.id);
    nameMap.set(k, ids);
  }
  const duplicidadesDetectadas: { nome: string; count: number; ids: string[] }[] = [];
  for (const [nome, ids] of nameMap.entries()) {
    if (ids.length > 1) {
      duplicidadesDetectadas.push({ nome, count: ids.length, ids });
    }
  }

  // 3. INDICADORES DE CLASSIFICAÇÃO INDEPENDENTES (Não somados ao Total Geral)

  // B) MÚSICOS COM INSTRUMENTOS
  const musicosIdsSet = new Set<string>();
  for (const m of activeMembersDistinct) {
    const c = (m.cargo || '').toUpperCase();
    const i = (m.instrumento || '').toUpperCase();
    if (c !== 'ORGANISTA' && i !== 'ÓRGÃO' && i !== '' && i !== 'NENHUM') {
      musicosIdsSet.add(m.id);
    }
  }
  const totalMusicos = musicosIdsSet.size;

  // C) ORGANISTAS
  const organistasIdsSet = new Set<string>();
  for (const m of activeMembersDistinct) {
    const c = (m.cargo || '').toUpperCase();
    const i = (m.instrumento || '').toUpperCase();
    if (c === 'ORGANISTA' || i === 'ÓRGÃO') {
      organistasIdsSet.add(m.id);
    }
  }
  const totalOrganistas = organistasIdsSet.size;

  // D) MÚSICOS + ORGANISTAS (União sem duplicidade de IDs)
  const musicosOrganistasIdsSet = new Set<string>([...musicosIdsSet, ...organistasIdsSet]);
  const totalMusicosOrganistas = musicosOrganistasIdsSet.size;

  // E) MINISTÉRIOS E COLABORADORES (Exclusivamente pessoas cadastradas no banco de dados com presença confirmada)
  // Regras Mandatórias das Seções 1, 2, 3 e 5:
  // - Eliminação total de valores fixos, dados de demonstração ou quantidades padrão.
  // - Contagem realizada exclusivamente a partir de registros comprováveis no banco de dados.
  // - Se uma categoria não possuir registros reais comprovados, o valor é estritamente 0.
  const ministerioIdsSet = new Set<string>();
  let anciaes = 0;
  let diacono = 0;
  let cooperadoresOficiais = 0;
  let cooperadoresJovens = 0;
  let colaboradores = 0;

  for (const m of activeMembersDistinct) {
    const c = (m.cargo || '').toUpperCase();
    if (isCargoMinisterioOuColaborador(c)) {
      ministerioIdsSet.add(m.id);
    }
    if (c === 'ANCIÃO' || c === 'ANCIAO') anciaes++;
    else if (c === 'DIÁCONO' || c === 'DIACONO') diacono++;
    else if (c.includes('COOPERADOR DO OFÍCIO') || c === 'COOPERADOR OFICIAL') cooperadoresOficiais++;
    else if (c.includes('COOPERADOR DE JOVENS') || c.includes('COOPERADOR JOVENS')) cooperadoresJovens++;
    else if (c.includes('COLABORADOR')) colaboradores++;
  }

  const totalMinisterioColab = anciaes + diacono + cooperadoresOficiais + cooperadoresJovens + colaboradores;

  // F) PARTE MUSICAL (Classificação de cargos da liderança musical presentes)
  let encarregadosRegionais = 0;
  let examinadoras = 0;
  let encarregadosLocais = 0;
  let instrutores = 0;
  let professores = 0;
  let irmaosDptoMusical = 0;

  for (const m of activeMembersDistinct) {
    const c = (m.cargo || '').toUpperCase();
    if (c === 'ENCARREGADO REGIONAL') encarregadosRegionais++;
    else if (c === 'EXAMINADORA') examinadoras++;
    else if (c === 'ENCARREGADO LOCAL') encarregadosLocais++;
    else if (c === 'INSTRUTOR' || c === 'INSTRUTORA') instrutores++;
    else if (c.includes('PROFESSOR')) professores++;
    else if (c.includes('SECRETÁRIO') || c.includes('SECRETARIA') || c.includes('DPTO')) irmaosDptoMusical++;
  }
  const totalParteMusical = encarregadosRegionais + examinadoras + encarregadosLocais + instrutores + professores + irmaosDptoMusical;

  // 4. CONTAGEM REAL DOS INSTRUMENTOS
  const instMap: Record<string, number> = {};
  for (const m of activeMembersDistinct) {
    const inst = (m.instrumento || '').trim().toUpperCase();
    if (inst && inst !== 'NENHUM') {
      instMap[inst] = (instMap[inst] || 0) + 1;
    }
  }

  // CORDAS
  const violinos = instMap['VIOLINO'] || 0;
  const violas = instMap['VIOLA'] || 0;
  const violoncelos = instMap['VIOLONCELO'] || 0;
  const subtotalCordas = violinos + violas + violoncelos;

  // TECLAS
  const acordeon = instMap['ACORDEON'] || 0;
  const orgao = (instMap['ÓRGÃO'] || 0) + (instMap['ORGAN'] || 0);
  const subtotalTeclas = acordeon + orgao;

  // MADEIRAS
  const flautas = instMap['FLAUTA'] || 0;
  const oboe = instMap['OBOÉ'] || 0;
  const oboeAmore = instMap["OBOÉ D'AMORE"] || 0;
  const corneIngles = instMap['CORNE INGLÊS'] || 0;
  const fagotes = (instMap['FAGOTE'] || 0) + (instMap['FAGOTES'] || 0);
  const clarinetes = instMap['CLARINETE'] || 0;
  const claroneAlto = instMap['CLARONE ALTO'] || 0;
  const claroneBaixo = (instMap['CLARONE BAIXO'] || 0) + (instMap['CLARONE BAIXOS'] || 0);
  const saxSoprano = (instMap['SAXOFONE SOPRANO CUR'] || 0) + (instMap['SAXOFONE SOPRANO RET'] || 0) + (instMap['SAXOFONE SOPRANO'] || 0);
  const saxAlto = instMap['SAXOFONE ALTO'] || 0;
  const saxTenor = instMap['SAXOFONE TENOR'] || 0;
  const saxBaritono = instMap['SAXOFONE BARÍTONO'] || 0;
  const saxBaixo = instMap['SAXOFONE BAIXO'] || 0;
  const subtotalMadeiras = flautas + oboe + oboeAmore + corneIngles + fagotes + clarinetes + claroneAlto + claroneBaixo + saxSoprano + saxAlto + saxTenor + saxBaritono + saxBaixo;

  // METAIS
  const cornet = instMap['CORNET'] || 0;
  const trompetes = instMap['TROMPETE'] || 0;
  const flugelhorns = instMap['FLUGELHORN'] || 0;
  const trompa = (instMap['TROMPA'] || 0) + (instMap['TROMBA'] || 0);
  const trombones = instMap['TROMBONE'] || 0;
  const trombonito = instMap['TROMBONITO'] || 0;
  const baritonoPisto = instMap['BARÍTONO DE PISTO'] || 0;
  const eufonios = (instMap['EUPHONIUM'] || 0) + (instMap['EUFÔNIO'] || 0);
  const tubas = instMap['TUBA'] || 0;
  const subtotalMetais = cornet + trompetes + flugelhorns + trompa + trombones + trombonito + baritonoPisto + eufonios + tubas;

  // Total Real de Instrumentos Contabilizados
  const totalInstrumentosRegistrados = subtotalCordas + subtotalTeclas + subtotalMadeiras + subtotalMetais;

  // 5. GRÁFICO DE DISTRIBUIÇÃO
  // Calculado estritamente sobre totalInstrumentosRegistrados
  const hasInstrumentData = totalInstrumentosRegistrados > 0;
  const pctCordas = hasInstrumentData ? Number(((subtotalCordas / totalInstrumentosRegistrados) * 100).toFixed(1)) : 0;
  const pctTeclas = hasInstrumentData ? Number(((subtotalTeclas / totalInstrumentosRegistrados) * 100).toFixed(1)) : 0;
  const pctMadeiras = hasInstrumentData ? Number(((subtotalMadeiras / totalInstrumentosRegistrados) * 100).toFixed(1)) : 0;
  const pctMetais = hasInstrumentData ? Number(((subtotalMetais / totalInstrumentosRegistrados) * 100).toFixed(1)) : 0;

  // 6. OFICIALIZAÇÃO (Exclusivamente participantes presentes com oficialização confirmada)
  let oficializadosMusicos = 0;
  let oficializadosOrganistas = 0;
  for (const m of activeMembersDistinct) {
    const c = (m.cargo || '').toUpperCase();
    const n = (m.nivel || '').toUpperCase();
    const i = (m.instrumento || '').toUpperCase();
    if (m.oficializadoNoEnsaio || n.includes('OFICIALIZADO')) {
      if (c === 'ORGANISTA' || i === 'ÓRGÃO') {
        oficializadosOrganistas++;
      } else {
        oficializadosMusicos++;
      }
    }
  }
  if (event.oficializacao) {
    if (event.oficializacao.musicos > 0) oficializadosMusicos = event.oficializacao.musicos;
    if (event.oficializacao.organistas > 0) oficializadosOrganistas = event.oficializacao.organistas;
  }
  const totalOficializados = oficializadosMusicos + oficializadosOrganistas;

  // 7. VALIDAÇÃO AUTOMÁTICA DE INTEGRIDADE (Seção 6 do Prompt)
  // Compara:
  // 1. Total de presentes do cabeçalho
  // 2. Total geral de presentes do resumo
  // 3. Quantidade de IDs únicos com presença confirmada no banco de dados
  const headerPresentes = totalPresentes;
  const dashboardTotalGeral = totalGeralPresentes;
  const dbUniquePresentIdsCount = new Set(presentMembers.map(m => m.id)).size;

  const divergencias: string[] = [];

  if (scope === 'presentes') {
    if (headerPresentes !== dashboardTotalGeral) {
      divergencias.push(`Divergência: Cabeçalho indica ${headerPresentes} presentes, mas o Resumo exibe ${dashboardTotalGeral}.`);
    }
    if (dashboardTotalGeral !== dbUniquePresentIdsCount) {
      divergencias.push(`Divergência: Total do Resumo (${dashboardTotalGeral}) difere da contagem de IDs únicos no banco (${dbUniquePresentIdsCount}).`);
    }
    if (headerPresentes !== dbUniquePresentIdsCount) {
      divergencias.push(`Divergência: Cabeçalho (${headerPresentes}) difere dos IDs únicos no banco (${dbUniquePresentIdsCount}).`);
    }
  }

  return {
    scope,
    totalInscritos,
    totalPresentes,
    totalAusentes,
    totalJustificados,

    totalGeralPresentes,
    participantesUnicosIds,
    duplicidadesDetectadas,
    duplicidadesPresentes: duplicidadesDetectadas,
    membrosAuditados: activeMembersDistinct,

    totalMusicos,
    musicosIds: Array.from(musicosIdsSet),

    totalOrganistas,
    organistasIds: Array.from(organistasIdsSet),

    totalMusicosOrganistas,
    musicosOrganistasIds: Array.from(musicosOrganistasIdsSet),

    anciaes,
    diacono,
    cooperadoresOficiais,
    cooperadoresJovens,
    colaboradores,
    totalMinisterioColab,
    ministerioColabIds: Array.from(ministerioIdsSet),

    encarregadosRegionais,
    examinadoras,
    encarregadosLocais,
    instrutores,
    professores,
    irmaosDptoMusical,
    totalParteMusical,

    violinos,
    violas,
    violoncelos,
    subtotalCordas,

    acordeon,
    orgao,
    subtotalTeclas,

    flautas,
    oboe,
    oboeAmore,
    corneIngles,
    fagotes,
    clarinetes,
    claroneAlto,
    claroneBaixo,
    saxSoprano,
    saxAlto,
    saxTenor,
    saxBaritono,
    saxBaixo,
    subtotalMadeiras,

    cornet,
    trompetes,
    flugelhorns,
    trompa,
    trombones,
    trombonito,
    baritonoPisto,
    eufonios,
    tubas,
    subtotalMetais,

    totalInstrumentosRegistrados,
    grandInstTotal: totalInstrumentosRegistrados,
    pctCordas,
    pctTeclas,
    pctMadeiras,
    pctMetais,
    hasInstrumentData,

    oficializadosMusicos,
    oficializadosOrganistas,
    totalOficializados,

    integrity: {
      isValid: divergencias.length === 0,
      headerPresentes,
      dashboardTotalGeral,
      dbUniquePresentIdsCount,
      divergencias,
      conferidoEm: new Date().toISOString()
    }
  };
}
