export type InstrumentFamily = 'Cordas' | 'Teclas' | 'Madeiras' | 'Metais' | 'Outros';

export type AttendanceStatus = 'presente' | 'ausente' | 'justificado';

export interface MemberRecord {
  id: string;
  nome: string;
  instrumento: string;
  familia: InstrumentFamily;
  localidade: string;
  cargo: string;
  nivel: string;
  pagina: number;
  statusPresenca: AttendanceStatus;
  presencaTimestamp?: string;
  presencaUsuario?: string;
  observacao?: string;
  oficializadoNoEnsaio?: boolean;
  isManual?: boolean;
  cadastradoEm?: string;
  cadastradoPor?: string;
}

export interface VersionInfo {
  dataImportacao: string;
  nomeArquivo: string;
  responsavel: string;
  quantidadeRegistros: number;
  versao: string;
}

export interface MinisterioColaboradores {
  anciaes: number;
  diacono: number;
  cooperadoresOficiais: number;
  cooperadoresJovens: number;
  colaboradores: number; // Irmãos/irmãs colaboradores
}

export interface ParteMusical {
  encarregadosRegionais: number;
  examinadoras: number;
  encarregadosLocais: number;
  instrutores: number;
  professores: number;
  irmaosDptoMusical: number;
}

export interface OficializacaoInfo {
  musicos: number;
  organistas: number;
}

export interface EventModule {
  id: string;
  nome: string;
  descricao?: string;
  data: string;
  local: string;
  cidadeUf: string;
  anciaoAtendimento: string;
  encarregadoRegional: string;
  ministerioColaboradores: MinisterioColaboradores;
  parteMusical: ParteMusical;
  oficializacao: OficializacaoInfo;
  observacoesTexto?: string;
  versionInfo: VersionInfo;
  membros: MemberRecord[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventoId: string;
  eventoNome: string;
  usuario: string;
  acao: 'checkin' | 'checkout' | 'importacao' | 'edicao_evento' | 'observacao' | 'limpeza_presencas' | 'cadastro_manual' | 'exclusao_manual';
  detalhes: string;
  membroNome?: string;
}

export interface FunnelState {
  cargo: string | null;
  nivel: string | null;
  instrumento: string | null;
  localidade: string | null;
  nomeSelecionado: string | null;
}
