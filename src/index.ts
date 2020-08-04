import commander from 'commander'

import { logger } from './logger'
import { options } from './options'
import { version, name } from '../package.json'
import { initDb, closeDb } from './database'
import { importArea } from './runners/importArea'
import { importUniversities } from './runners/importUniversities'
import { importAreas } from './runners/importAreas'

commander.version(version)
  .option('-a --area <url>', 'Register a new area and scrape universities')
  .option('-A --areas <path>', 'Registers areas by urls from a text file')
  .option('-u --universities', 'Import all universities')
  .option('-o --offset <offset>', 'Offset when running mass imports')
  .option('-l --limit <limit>', 'Limit when running mass imports')
  .option('-v --verbose', 'Verbose log')
  .option('-f --force', 'Force overwrite')
  .parse(process.argv)

if (commander.verbose) {
  options.verbose = true
}

if (commander.force) {
  options.force = true
}

logger.debug(`Starting ${name} v${version}`)

interface Options {
  area?: string
  areas?: string
  universities?: string
  offset?: string
  limit?: string
}
const handleCommand = async (commandOptions: Options) => {
  const {
    area, areas, universities, offset, limit,
  } = commandOptions
  await initDb()

  if (areas) {
    await importAreas(areas)
  } else if (area) {
    await importArea(area)
  } else if (universities) {
    const parsedOffset = offset !== undefined ? +offset : undefined
    const parsedLimit = limit !== undefined ? +limit : undefined
    await importUniversities(parsedOffset, parsedLimit)
  } else {
    commander.help()
  }

  await closeDb()
}

const {
  area, areas, universities, offset, limit,
} = commander

handleCommand({
  area, areas, universities, offset, limit,
})
  .then(() => {
    logger.info('Finished successfully')
  })
  .catch((err) => {
    logger.error(`There was an error ${err.message}`)
    process.exit(1)
  })
