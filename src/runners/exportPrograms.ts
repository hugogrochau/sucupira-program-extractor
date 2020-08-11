import fs from 'fs'
import { parse } from 'json2csv'
import { getFullPrograms } from '../database'
import { logger } from '../logger'

export const exportPrograms = async (limit?: number, offset?: number): Promise<void> => {
  const programs = await getFullPrograms(limit, offset)

  if (programs.length === 0) {
    logger.warn('No programs registered')
    return
  }

  logger.info(`Exporting ${programs.length} programs`)

  const fields = Object.keys(programs[0])

  const csv = parse(programs, { fields })

  fs.writeFileSync('programas.csv', csv, 'utf8')
  logger.info('Saved programs to programs.csv')
}
