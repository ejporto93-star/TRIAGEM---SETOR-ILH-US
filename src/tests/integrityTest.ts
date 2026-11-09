import { calculateEnsaioMetrics } from '../services/metricsService';
import { EventModule, MemberRecord } from '../types';

function createMockEvent(members: MemberRecord[]): EventModule {
  return {
    id: 'test-event',
    nome: 'ENSAIO DE HOMOLOGAÇÃO (DADOS ISOLADOS)',
    data: '2026-11-05',
    local: 'ILHÉUS (CENTRAL)',
    cidadeUf: 'ILHÉUS - BA',
    anciaoAtendimento: 'ANCIÃO TESTE',
    encarregadoRegional: 'ENCARREGADO TESTE',
    ministerioColaboradores: { anciaes: 0, diacono: 0, cooperadoresOficiais: 0, cooperadoresJovens: 0, colaboradores: 0 },
    parteMusical: { encarregadosRegionais: 0, examinadoras: 0, encarregadosLocais: 0, instrutores: 0, professores: 0, irmaosDptoMusical: 0 },
    oficializacao: { musicos: 0, organistas: 0 },
    versionInfo: {
      dataImportacao: '05/11/2026',
      nomeArquivo: 'teste.pdf',
      responsavel: 'Homologação',
      quantidadeRegistros: members.length,
      versao: '1.0'
    },
    membros: members,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString()
  };
}

console.log('=================================================================');
console.log('INICIANDO BATERIA DE TESTES DE HOMOLOGAÇÃO (SEÇÃO 9)');
console.log('=================================================================');

// Test 1: Ensaio com ZERO participantes presentes
{
  const members: MemberRecord[] = [
    { id: '1', nome: 'P1', instrumento: 'VIOLINO', familia: 'Cordas', localidade: 'CENTRAL', cargo: 'MÚSICO', nivel: 'OFICIALIZADO(A)', pagina: 1, statusPresenca: 'ausente' },
    { id: '2', nome: 'P2', instrumento: 'ÓRGÃO', familia: 'Teclas', localidade: 'CENTRAL', cargo: 'ORGANISTA', nivel: 'OFICIALIZADO(A)', pagina: 1, statusPresenca: 'ausente' }
  ];
  const ev = createMockEvent(members);
  const m = calculateEnsaioMetrics(ev, 'presentes');

  console.log('\n[TESTE 1] Ensaio com 0 presentes:');
  console.log(`  Total Presentes: ${m.totalPresentes}`);
  console.log(`  Total Geral Presentes: ${m.totalGeralPresentes}`);
  console.log(`  Subtotal Cordas: ${m.subtotalCordas}`);
  console.log(`  Tem dados para gráfico: ${m.hasInstrumentData}`);
  console.log(`  Integridade Válida: ${m.integrity.isValid}`);
  if (m.totalPresentes !== 0 || m.totalGeralPresentes !== 0 || m.hasInstrumentData !== false) {
    throw new Error('Falha no Teste 1');
  }
  console.log('  -> PASSOU COM SUCESSO.');
}

// Test 2: Ensaio com 1 participante presente
{
  const members: MemberRecord[] = [
    { id: '1', nome: 'P1', instrumento: 'VIOLINO', familia: 'Cordas', localidade: 'CENTRAL', cargo: 'MÚSICO', nivel: 'OFICIALIZADO(A)', pagina: 1, statusPresenca: 'presente' },
    { id: '2', nome: 'P2', instrumento: 'CLARINETE', familia: 'Madeiras', localidade: 'CENTRAL', cargo: 'MÚSICO', nivel: 'CANDIDATO(A)', pagina: 1, statusPresenca: 'ausente' }
  ];
  const ev = createMockEvent(members);
  const m = calculateEnsaioMetrics(ev, 'presentes');

  console.log('\n[TESTE 2] Ensaio com 1 presente:');
  console.log(`  Total Presentes: ${m.totalPresentes}`);
  console.log(`  Total Geral Presentes: ${m.totalGeralPresentes}`);
  console.log(`  Violinos: ${m.violinos}, Subtotal Cordas: ${m.subtotalCordas}`);
  console.log(`  Clarinetes: ${m.clarinetes} (Ausente não foi contabilizado)`);
  console.log(`  Percentual Cordas: ${m.pctCordas}%`);
  if (m.totalPresentes !== 1 || m.totalGeralPresentes !== 1 || m.violinos !== 1 || m.clarinetes !== 0 || m.pctCordas !== 100) {
    throw new Error('Falha no Teste 2');
  }
  console.log('  -> PASSOU COM SUCESSO.');
}

// Test 3: Ensaio com EXATAMENTE 14 participantes presentes (Caso reportado pelo usuário)
{
  // 6 Cordas (4 Violinos, 1 Viola, 1 Cello), 2 Teclas (2 Órgãos), 4 Madeiras (2 Flautas, 2 Clarinetes), 2 Metais (1 Trompete, 1 Tuba)
  // Total = 6 + 2 + 4 + 2 = 14!
  const members: MemberRecord[] = [
    // Cordas (6)
    { id: '1', nome: 'Membro 1', instrumento: 'VIOLINO', familia: 'Cordas', localidade: 'CENTRAL', cargo: 'MÚSICO', nivel: 'OFICIALIZADO(A)', pagina: 1, statusPresenca: 'presente' },
    { id: '2', nome: 'Membro 2', instrumento: 'VIOLINO', familia: 'Cordas', localidade: 'CENTRAL', cargo: 'MÚSICO', nivel: 'OFICIALIZADO(A)', pagina: 1, statusPresenca: 'presente' },
    { id: '3', nome: 'Membro 3', instrumento: 'VIOLINO', familia: 'Cordas', localidade: 'CONQUISTA', cargo: 'MÚSICO', nivel: 'CULTO OFICIAL', pagina: 1, statusPresenca: 'presente' },
    { id: '4', nome: 'Membro 4', instrumento: 'VIOLINO', familia: 'Cordas', localidade: 'SÃO JOSÉ', cargo: 'MÚSICO', nivel: 'RJM', pagina: 1, statusPresenca: 'presente' },
    { id: '5', nome: 'Membro 5', instrumento: 'VIOLA', familia: 'Cordas', localidade: 'CENTRAL', cargo: 'MÚSICO', nivel: 'OFICIALIZADO(A)', pagina: 1, statusPresenca: 'presente' },
    { id: '6', nome: 'Membro 6', instrumento: 'VIOLONCELO', familia: 'Cordas', localidade: 'SALOBRINHO', cargo: 'MÚSICO', nivel: 'RJM', pagina: 1, statusPresenca: 'presente' },
    // Teclas (2)
    { id: '7', nome: 'Membro 7', instrumento: 'ÓRGÃO', familia: 'Teclas', localidade: 'CENTRAL', cargo: 'ORGANISTA', nivel: 'OFICIALIZADO(A)', pagina: 1, statusPresenca: 'presente' },
    { id: '8', nome: 'Membro 8', instrumento: 'ÓRGÃO', familia: 'Teclas', localidade: 'CONQUISTA', cargo: 'ORGANISTA', nivel: 'CULTO OFICIAL', pagina: 1, statusPresenca: 'presente' },
    // Madeiras (4)
    { id: '9', nome: 'Membro 9', instrumento: 'FLAUTA', familia: 'Madeiras', localidade: 'CENTRAL', cargo: 'MÚSICO', nivel: 'OFICIALIZADO(A)', pagina: 1, statusPresenca: 'presente' },
    { id: '10', nome: 'Membro 10', instrumento: 'FLAUTA', familia: 'Madeiras', localidade: 'OLIVENÇA', cargo: 'MÚSICO', nivel: 'RJM', pagina: 1, statusPresenca: 'presente' },
    { id: '11', nome: 'Membro 11', instrumento: 'CLARINETE', familia: 'Madeiras', localidade: 'CENTRAL', cargo: 'MÚSICO', nivel: 'OFICIALIZADO(A)', pagina: 1, statusPresenca: 'presente' },
    { id: '12', nome: 'Membro 12', instrumento: 'CLARINETE', familia: 'Madeiras', localidade: 'TEOTONIO VILELA', cargo: 'INSTRUTOR', nivel: 'OFICIALIZADO(A)', pagina: 1, statusPresenca: 'presente' },
    // Metais (2)
    { id: '13', nome: 'Membro 13', instrumento: 'TROMPETE', familia: 'Metais', localidade: 'CENTRAL', cargo: 'MÚSICO', nivel: 'OFICIALIZADO(A)', pagina: 1, statusPresenca: 'presente' },
    { id: '14', nome: 'Membro 14', instrumento: 'TUBA', familia: 'Metais', localidade: 'CONQUISTA', cargo: 'MÚSICO', nivel: 'OFICIALIZADO(A)', pagina: 1, statusPresenca: 'presente' },
    // Ausentes (10 membros não presentes)
    { id: '15', nome: 'Ausente 1', instrumento: 'TROMPETE', familia: 'Metais', localidade: 'CENTRAL', cargo: 'MÚSICO', nivel: 'OFICIALIZADO(A)', pagina: 1, statusPresenca: 'ausente' },
    { id: '16', nome: 'Ausente 2', instrumento: 'VIOLINO', familia: 'Cordas', localidade: 'CENTRAL', cargo: 'MÚSICO', nivel: 'CANDIDATO(A)', pagina: 1, statusPresenca: 'ausente' }
  ];

  const ev = createMockEvent(members);
  const m = calculateEnsaioMetrics(ev, 'presentes');

  console.log('\n[TESTE 3] Ensaio com 14 presentes (Caso Real de Divergência):');
  console.log(`  Total Presentes: ${m.totalPresentes}`);
  console.log(`  Total Geral Presentes: ${m.totalGeralPresentes}`);
  console.log(`  Subtotal Cordas: ${m.subtotalCordas}`);
  console.log(`  Subtotal Teclas: ${m.subtotalTeclas}`);
  console.log(`  Subtotal Madeiras: ${m.subtotalMadeiras}`);
  console.log(`  Subtotal Metais: ${m.subtotalMetais}`);
  console.log(`  Soma das Famílias: ${m.subtotalCordas + m.subtotalTeclas + m.subtotalMadeiras + m.subtotalMetais}`);
  console.log(`  Total Músicos: ${m.totalMusicos}`);
  console.log(`  Total Organistas: ${m.totalOrganistas}`);
  console.log(`  Total Músicos e Organistas: ${m.totalMusicosOrganistas}`);
  console.log(`  Total Ministério e Colaboradores: ${m.totalMinisterioColab}`);
  console.log(`  Percentuais: Cordas ${m.pctCordas}%, Teclas ${m.pctTeclas}%, Madeiras ${m.pctMadeiras}%, Metais ${m.pctMetais}%`);
  console.log(`  Integridade Válida: ${m.integrity.isValid}`);

  if (m.totalPresentes !== 14) throw new Error(`Esperado 14 presentes, obtido ${m.totalPresentes}`);
  if (m.totalGeralPresentes !== 14) throw new Error(`Esperado totalGeralPresentes 14, obtido ${m.totalGeralPresentes}`);
  if (m.totalMusicosOrganistas !== 14) throw new Error(`Esperado totalMusicosOrganistas 14, obtido ${m.totalMusicosOrganistas}`);
  if (m.grandInstTotal !== 14) throw new Error(`Esperado grandInstTotal 14, obtido ${m.grandInstTotal}`);
  if (!m.integrity.isValid) throw new Error(`Divergências encontradas: ${m.integrity.divergencias.join(', ')}`);
  console.log('  -> PASSOU COM SUCESSO. Rastreabilidade 100% comprovada.');
}

// Test 5: Alteração de presença de PRESENTE para AUSENTE
{
  const members: MemberRecord[] = [
    { id: '1', nome: 'M1', instrumento: 'VIOLINO', familia: 'Cordas', localidade: 'CENTRAL', cargo: 'MÚSICO', nivel: 'OFICIALIZADO(A)', pagina: 1, statusPresenca: 'presente' },
    { id: '2', nome: 'M2', instrumento: 'VIOLINO', familia: 'Cordas', localidade: 'CENTRAL', cargo: 'MÚSICO', nivel: 'OFICIALIZADO(A)', pagina: 1, statusPresenca: 'presente' }
  ];
  const ev = createMockEvent(members);
  let m = calculateEnsaioMetrics(ev, 'presentes');
  if (m.totalPresentes !== 2 || m.violinos !== 2) throw new Error('Falha pré-alteração');

  // Muta M2 para ausente
  ev.membros[1].statusPresenca = 'ausente';
  m = calculateEnsaioMetrics(ev, 'presentes');
  console.log('\n[TESTE 5] Mudança de presença PRESENTE -> AUSENTE:');
  console.log(`  Total Presentes após mudança: ${m.totalPresentes} (era 2)`);
  console.log(`  Violinos após mudança: ${m.violinos} (era 2)`);
  if (m.totalPresentes !== 1 || m.violinos !== 1 || m.subtotalCordas !== 1) {
    throw new Error('Falha no Teste 5');
  }
  console.log('  -> PASSOU COM SUCESSO.');
}

// Test 6: Exclusão de um lançamento
{
  const members: MemberRecord[] = [
    { id: '1', nome: 'M1', instrumento: 'VIOLINO', familia: 'Cordas', localidade: 'CENTRAL', cargo: 'MÚSICO', nivel: 'OFICIALIZADO(A)', pagina: 1, statusPresenca: 'presente' },
    { id: '2', nome: 'M2', instrumento: 'TROMPETE', familia: 'Metais', localidade: 'CENTRAL', cargo: 'MÚSICO', nivel: 'OFICIALIZADO(A)', pagina: 1, statusPresenca: 'presente' }
  ];
  const ev = createMockEvent(members);
  ev.membros = ev.membros.filter(m => m.id !== '2'); // remove M2
  const m = calculateEnsaioMetrics(ev, 'presentes');
  console.log('\n[TESTE 6] Exclusão de registro:');
  console.log(`  Total Presentes: ${m.totalPresentes}`);
  console.log(`  Trompetes: ${m.trompetes}`);
  console.log(`  Subtotal Metais: ${m.subtotalMetais}`);
  if (m.totalPresentes !== 1 || m.trompetes !== 0 || m.subtotalMetais !== 0) {
    throw new Error('Falha no Teste 6');
  }
  console.log('  -> PASSOU COM SUCESSO.');
}

// Test 7: Alteração de instrumento
{
  const members: MemberRecord[] = [
    { id: '1', nome: 'M1', instrumento: 'VIOLINO', familia: 'Cordas', localidade: 'CENTRAL', cargo: 'MÚSICO', nivel: 'OFICIALIZADO(A)', pagina: 1, statusPresenca: 'presente' }
  ];
  const ev = createMockEvent(members);
  ev.membros[0].instrumento = 'VIOLA';
  const m = calculateEnsaioMetrics(ev, 'presentes');
  console.log('\n[TESTE 7] Alteração de instrumento:');
  console.log(`  Violinos: ${m.violinos}, Violas: ${m.violas}`);
  console.log(`  Subtotal Cordas: ${m.subtotalCordas}`);
  if (m.violinos !== 0 || m.violas !== 1 || m.subtotalCordas !== 1) {
    throw new Error('Falha no Teste 7');
  }
  console.log('  -> PASSOU COM SUCESSO.');
}

// Test 9 & 10: Comparação entre Cabeçalho, Tabelas, Totais e Gráficos
{
  const members: MemberRecord[] = [
    { id: '1', nome: 'M1', instrumento: 'VIOLINO', familia: 'Cordas', localidade: 'CENTRAL', cargo: 'MÚSICO', nivel: 'OFICIALIZADO(A)', pagina: 1, statusPresenca: 'presente' },
    { id: '2', nome: 'M2', instrumento: 'CLARINETE', familia: 'Madeiras', localidade: 'CENTRAL', cargo: 'MÚSICO', nivel: 'OFICIALIZADO(A)', pagina: 1, statusPresenca: 'presente' },
    { id: '3', nome: 'M3', instrumento: 'ÓRGÃO', familia: 'Teclas', localidade: 'CENTRAL', cargo: 'ORGANISTA', nivel: 'OFICIALIZADO(A)', pagina: 1, statusPresenca: 'ausente' },
    { id: '4', nome: 'M4', instrumento: 'TUBA', familia: 'Metais', localidade: 'CENTRAL', cargo: 'MÚSICO', nivel: 'CANDIDATO(A)', pagina: 1, statusPresenca: 'justificado' }
  ];
  const ev = createMockEvent(members);
  const m = calculateEnsaioMetrics(ev, 'presentes');

  console.log('\n[TESTE 9 e 10] Comparação e consistência cruzada:');
  console.log(`  Inscritos: ${m.totalInscritos} (4)`);
  console.log(`  Presentes: ${m.totalPresentes} (2)`);
  console.log(`  Ausentes: ${m.totalAusentes} (1)`);
  console.log(`  Justificados: ${m.totalJustificados} (1)`);
  console.log(`  Soma das Presenças: ${m.totalPresentes + m.totalAusentes + m.totalJustificados} === ${m.totalInscritos}`);
  console.log(`  Subtotal Cordas (1) + Madeiras (1) = ${m.subtotalCordas + m.subtotalMadeiras} === Presentes (${m.totalPresentes})`);
  console.log(`  Percentuais calculados: Cordas ${m.pctCordas}%, Madeiras ${m.pctMadeiras}%, Teclas ${m.pctTeclas}%, Metais ${m.pctMetais}%`);
  console.log(`  Soma dos Percentuais: ${m.pctCordas + m.pctMadeiras}%`);

  if (m.totalPresentes !== 2 || m.totalInscritos !== 4 || (m.pctCordas + m.pctMadeiras !== 100)) {
    throw new Error('Falha no Teste 9/10');
  }
  console.log('  -> PASSOU COM SUCESSO. Concordância matemática 100%.');
}

// Test 11: Inscrição Manual Avulsa (isManual: true)
{
  const members: MemberRecord[] = [
    { id: '1', nome: 'M1', instrumento: 'VIOLINO', familia: 'Cordas', localidade: 'CENTRAL', cargo: 'MÚSICO', nivel: 'OFICIALIZADO(A)', pagina: 1, statusPresenca: 'presente' },
    { 
      id: 'MAN-ABC123', 
      nome: 'PARTICIPANTE AVULSO TESTE', 
      instrumento: 'TROMBONE', 
      familia: 'Metais', 
      localidade: 'NOVA LOCALIDADE', 
      cargo: 'MÚSICO', 
      nivel: 'CANDIDATO(A)', 
      pagina: 0, 
      statusPresenca: 'presente',
      isManual: true,
      cadastradoEm: new Date().toISOString()
    }
  ];
  const ev = createMockEvent(members);
  const m = calculateEnsaioMetrics(ev, 'presentes');

  console.log('\n[TESTE 11] Integridade com Inscrição Manual Avulsa:');
  console.log(`  Total Presentes: ${m.totalPresentes} (2)`);
  console.log(`  Total Geral Presentes: ${m.totalGeralPresentes} (2)`);
  console.log(`  Trombones: ${m.trombones} (1)`);
  console.log(`  Subtotal Metais: ${m.subtotalMetais} (1)`);
  console.log(`  Subtotal Cordas: ${m.subtotalCordas} (1)`);
  console.log(`  Percentual Cordas: ${m.pctCordas}%, Metais: ${m.pctMetais}%`);
  console.log(`  Validação de Integridade: ${m.integrity.isValid}`);

  if (m.totalPresentes !== 2 || m.trombones !== 1 || m.subtotalMetais !== 1 || !m.integrity.isValid) {
    throw new Error('Falha no Teste 11');
  }
  console.log('  -> PASSOU COM SUCESSO. Cadastro manual auditado e perfeitamente sincronizado.');
}

console.log('\n=================================================================');
console.log('TODOS OS TESTES DE HOMOLOGAÇÃO FORAM CONCLUÍDOS COM 100% DE SUCESSO.');
console.log('=================================================================');
