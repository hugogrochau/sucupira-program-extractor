import cheerio from 'cheerio'
import { logger } from '../logger'
import { fetchPageHtml } from '../utils/fetchPageHtml'
import { saveEntity } from '../database'
import { AreaUniversity, Area } from '../types'
import { getParamsFromUrl } from '../utils/getParamsFromUrl'

export const importArea = async (url: string): Promise<void> => {
  try {
    const { areaAvaliacao, areaConhecimento } = getParamsFromUrl(url, ['areaAvaliacao', 'areaConhecimento'])
    const result = await fetchPageHtml(`https://sucupira.capes.gov.br/sucupira/public/consultas/coleta/programa/quantitativos/quantitativoIes.jsf?areaAvaliacao=${areaAvaliacao}&areaConhecimento=${areaConhecimento}`)

    const areaUniversities: AreaUniversity[] = []
    cheerio.load(result)('.conteudo-container table tbody tr').slice(0, -1).each((_, el) => {
      const $ = cheerio.load(el)
      const nome = $('td:first-child a').text()
      const universityUrl = $('td:first-child a').attr('href')
      if (!universityUrl) {
        throw new Error('Missing universityUrl')
      }
      const uf = $('td:nth-child(2)').text().substr(0, 2)
      const numeroDeProgramas = +$('td:nth-child(3)').text()
      const numeroDeCursos = +$('td:nth-child(10)').text()
      const params = getParamsFromUrl(universityUrl, ['ies'], { host: 'https://sucupira.capes.gov.br/' })

      logger.debug(`Parsed university ${nome} (${params.ies})`)
      areaUniversities.push({
        id: +params.ies,
        idAreaAvaliacao: +areaAvaliacao,
        idAreaConhecimento: +areaConhecimento,
        nome,
        numeroDeCursos,
        numeroDeProgramas,
        uf,
      })
    })

    const areaUniversitiesPromises = areaUniversities.map((el) => saveEntity(el, 'areaUniversity'))
    const area: Area = {
      idAreaAvaliacao: +areaAvaliacao,
      idAreaConhecimento: +areaConhecimento,
    }
    await Promise.all([
      ...areaUniversitiesPromises,
      saveEntity(area, 'area'),
    ])
    logger.info(`Saved ${areaUniversities.length} universities`)
  } catch (err) {
    logger.error(err.message)
  }
}
