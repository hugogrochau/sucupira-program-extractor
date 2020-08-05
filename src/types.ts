export interface Area extends Record<string, number | string> {
  idAreaAvaliacao: number
  idAreaConhecimento: number
}

export interface AreaUniversity extends Record<string, number | string> {
  id: number
  idAreaAvaliacao: number
  idAreaConhecimento: number
  nome: string
  uf: string
  numeroDeProgramas: number
  numeroDeCursos: number
}

export type SimplifiedAreaUniversity = Pick<AreaUniversity, 'id' | 'idAreaAvaliacao' | 'idAreaConhecimento'>

export interface UniversityProgram extends Record<string, number | string | Date | null> {
  id: string
  idUniversidade: number
  nome: string
  nomeCoordenador: string
  nomeIngles: string
  areaBasica: string
  areaAvaliacao: string
  situacao: string
  cep: string
  logradouro: string
  numero: string
  complemento: string | null
  bairro: string
  municipio: string
  fax: string | null
  telefone: string | null
  ramal: string | null
  emailDoPrograma: string
  url: string
  inicio: Date
  fim: Date | null
  coordLatitude: number
  coordLongitude: number
  nivel: string
  codigoCurso: string
  notaCurso: string
  dataDaRecomendacao: Date
  creditosEmDisciplinas: number
  creditosEmTrabalhosDeConclusao: number
  outrosCreditos: number
  equivalenciaHoraCredito: number
  situacaoCurso: string
}

export type PartialUniversityProgram = Partial<UniversityProgram> & Pick<UniversityProgram, 'id' | 'idUniversidade' | 'nome'>
