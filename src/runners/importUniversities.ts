import cheerio from 'cheerio'
import { getAreaUniversities, saveEntity } from '../database'
import { fetchPageHtml } from '../utils/fetchPageHtml'
import { getParamsFromUrl } from '../utils/getParamsFromUrl'
import { SimplifiedAreaUniversity, UniversityProgram } from '../types'
import { logger } from '../logger'

export const importUniversityPrograms = async (params: SimplifiedAreaUniversity): Promise<void> => {
  const { id, idAreaAvaliacao, idAreaConhecimento } = params
  const url = `https://sucupira.capes.gov.br/sucupira/public/consultas/coleta/programa/quantitativos/quantitativoPrograma.jsf?areaAvaliacao=${idAreaAvaliacao}&areaConhecimento=${idAreaConhecimento}&cdRegiao=0&ies=${id}`

  const result = await fetchPageHtml(url)
  const programs: Partial<UniversityProgram>[] = []
  cheerio.load(result)('.conteudo-container table tbody tr').each((_, el) => {
    const $ = cheerio.load(el)
    const nome = $('td:first-child a').text()
    const programUrl = $('td:first-child a').attr('href')
    if (!programUrl) {
      throw new Error('Missing program url')
    }

    const { cd_programa: programId } = getParamsFromUrl(programUrl, ['cd_programa'], { host: 'https://sucupira.capes.gov.br/' })
    programs.push({
      idUniversidade: id,
      nome,
      id: programId,
    })

    logger.debug(`Parsed program ${nome}`)
  })

  const saveEntityPromises = programs.map((el) => saveEntity(el, 'universityProgram'))
  await Promise.all(saveEntityPromises)
  logger.info(`Saved ${programs.length} programs`)
}

export const importUniversities = async (offset?: number, limit?: number): Promise<void> => {
  const areaUniversities = await getAreaUniversities(offset, limit)
  logger.debug(`Loaded ${areaUniversities.length} universities`)

  const promises = areaUniversities.map(importUniversityPrograms)
  await Promise.all(promises)
}
