import cheerio from 'cheerio'
import { parse } from 'date-fns'
import { saveEntity, getPrograms } from '../database'
import { fetchPageHtml } from '../utils/fetchPageHtml'
import { UniversityProgram } from '../types'
import { logger } from '../logger'
import { cleanString } from '../utils/cleanString'

declare global {
  interface ObjectConstructor {
    fromEntries<K>(xs: [string|number|symbol, K][]): Record<string, K>
  }
}

const parseBrazilianDate = (date: string) => parse(date, 'MM/dd/yyyy', new Date())

interface ParseTelefoneAndRamalReturn {
  telefone: string | null
  ramal: string | null
}
const parseTelefoneAndRamal = (telefoneAndRamalStr: string): ParseTelefoneAndRamalReturn => {
  const telefoneRamalRegex = /(\(\d{2}\) \d{4,5}-\d{4})\s.*Ramal:\s*(\d*)/
  const telefoneRamalMatch = telefoneRamalRegex.exec(telefoneAndRamalStr)
  if (!telefoneRamalMatch || telefoneRamalMatch.length !== 3) {
    return {
      telefone: null,
      ramal: null,
    }
  }

  const [, telefone, ramal] = telefoneRamalMatch

  return { telefone, ramal }
}

interface ImportProgramParams {
  id: string
  idUniversidade: number
}
export const importProgram = async (params: ImportProgramParams): Promise<void> => {
  const { id, idUniversidade } = params
  const programUrl = `https://sucupira.capes.gov.br/sucupira/public/consultas/coleta/programa/viewPrograma.jsf?cd_programa=${id}`
  logger.debug(`Extracting program with url: ${programUrl}`)

  const result = await fetchPageHtml(programUrl)
  const $ = cheerio.load(result)

  const nome = $('span#form\\:nomeProg').text()
  const nomeCoordenador = $('span#form\\:nomeCoordenador').text()
  const nomeIngles = $('span#form\\:nomeProgIngles').text()

  const areaBasica = $('span#form\\:codNomeAreaProg').text()
  const areaAvaliacao = $('span#form\\:areaAvProg').text()

  const situacao = $('span#form\\:situacaoPrograma').text()

  const cep = $('span#form\\:j_idt52\\:0\\:cep').text()
  const logradouro = $('span#form\\:j_idt52\\:0\\:logradouro').text()
  const numero = $('span#form\\:j_idt52\\:0\\:numEndereco').text()
  const complemento = $('span#form\\:j_idt52\\:0\\:complemento').text()
  const bairro = $('span#form\\:j_idt52\\:0\\:bairro').text()
  const municipio = $('span#form\\:j_idt52\\:0\\:cidade').text()

  const fax = $('span#form\\:j_idt52\\:0\\:fax').text()
  const fullTelefone = cleanString($('form#form > div.row:nth-child(3) fieldset div.row:nth-child(9) table tr:first-child td').text())
  const { telefone, ramal } = parseTelefoneAndRamal(fullTelefone)

  const emailDoPrograma = $('form#form > div.row:nth-child(3) fieldset > div.row:nth-child(10) > div:nth-child(2)').text()
  const url = $('span#form\\:j_idt52\\:0\\:url').text()

  const inicio = $('span#form\\:j_idt52\\:0\\:dataInclusao').text()
  const fim = $('span#form\\:j_idt52\\:0\\:dataExclusao').text()

  const coordLatitude = $('span.0lat').text()
  const coordLongitude = $('span.0lng').text()

  const nivel = $('span#form\\:j_idt85\\:0\\:grauCurso').text()

  const codigoCurso = $('span#form\\:j_idt85\\:0\\:codCurso').text()

  const notaCurso = $('form#form > div.row:nth-child(4) fieldset > div.row:nth-child(4) > div:nth-child(2)').text()
  logger.debug(`notaCurso ${notaCurso} ${programUrl}`)

  const dataDaRecomendacao = $('form#form > div.row:nth-child(4) fieldset > div.row:nth-child(5) > div:nth-child(2)').text()

  const situacaoCurso = $('span#form\\:j_idt85\\:0\\:sitCurso').text()

  const creditosEmDisciplinas = $('span#form\\:j_idt85\\:0\\:credDisciplina').text()
  const creditosEmTrabalhosDeConclusao = $('span#form\\:j_idt85\\:0\\:credTrabConclusao').text()
  const outrosCreditos = $('span#form\\:j_idt85\\:0\\:credTituOutros').text()
  const equivalenciaHoraCredito = $('span#form\\:j_idt85\\:0\\:equivCredChCurso').text()

  const unparsedProgram: UniversityProgram = {
    id,
    idUniversidade,
    nome,
    nomeCoordenador,
    nomeIngles,
    areaBasica,
    areaAvaliacao,
    situacao,
    logradouro,
    numero,
    bairro,
    complemento,
    municipio,
    cep,
    fax,
    telefone,
    ramal,
    emailDoPrograma,
    url,
    inicio: parseBrazilianDate(inicio),
    fim: fim ? parseBrazilianDate(fim) : null,
    coordLatitude: +coordLatitude,
    coordLongitude: +coordLongitude,
    nivel,
    codigoCurso,
    notaCurso,
    dataDaRecomendacao: parseBrazilianDate(dataDaRecomendacao),
    situacaoCurso,
    creditosEmDisciplinas: +creditosEmDisciplinas,
    outrosCreditos: +outrosCreditos,
    creditosEmTrabalhosDeConclusao: +creditosEmTrabalhosDeConclusao,
    equivalenciaHoraCredito: +equivalenciaHoraCredito,
  }

  type ValueType = number | string | Date | null | undefined
  const cleanValue = (value: ValueType): ValueType => {
    if (typeof value !== 'string') {
      return value
    }

    if (value === '') {
      return null
    }

    return cleanString(value)
  }
  const cleanedPairs = Object.entries(unparsedProgram)
    .map(([key, value]): [string, ValueType] => ([key, cleanValue(value)]))

  const program = Object.fromEntries(cleanedPairs)

  await saveEntity(program, 'universityProgram')
  logger.info(`Saved program ${program.nome}`)
}

export const importPrograms = async (offset?: number, limit?: number): Promise<void> => {
  const programIds = await getPrograms(offset, limit)
  logger.info(`Importing ${programIds.length} programs`)

  const promises = programIds.map(importProgram)
  await Promise.all(promises)
}
