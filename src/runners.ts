import cheerio from 'cheerio'
import { logger } from './logger'
import { fetchPageHtml } from './fetchPageHtml'
import { saveEntity } from './database'
import { AreaUniversity, Area } from './types'

interface GetParamsFromUrlOpts {
  host?: string
}
const getParamsFromUrl = <T extends string>
  (url: string, params: T[], options: GetParamsFromUrlOpts = {}): Record<T, string> => {
  const parsedUrl = new URL(url, options.host)
  const result: Partial<Record<T, string>> = {}
  params.forEach((param) => {
    const paramValue = parsedUrl.searchParams.get(param)
    if (paramValue === null) {
      throw new Error(`Param ${paramValue} does not exist`)
    }

    result[param] = paramValue
  })

  return result as Record<T, string>
}

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
  } catch (err) {
    logger.error(err.message)
  }
}
