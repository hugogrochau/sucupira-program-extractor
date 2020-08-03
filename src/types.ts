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

export interface UniversityProgram extends Record<string, number | string | Date> {
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
  complemento: string
  bairro: string
  municipio: string
  fax: string
  telefone: string
  ramal: string
  emailDoPrograma: string
  url: string
  inicio: Date
  coord_latitude: number
  coord_long: number
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
