import fs from 'fs'
import { importArea } from './importArea'
import { logger } from '../logger'
import { isValidUrl } from '../utils/isValidUrl'

export const importAreas = async (fileLocation: string): Promise<void> => {
  const data = fs.readFileSync(fileLocation, 'utf8')
  const universities = data.split('\n').filter(isValidUrl)

  logger.info(`Importing ${universities.length} universities`)

  const promises = universities.filter(isValidUrl).map(importArea)

  await Promise.all(promises)
}
