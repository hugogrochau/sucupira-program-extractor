import commander from 'commander'

import { logger } from './logger'
import { options } from './options'
import { version, name } from '../package.json'
import { initDb, closeDb } from './database'
import { importArea } from './runners'

commander.version(version)
  .option('-a --area <url>', 'Register a new area and scrape universities')
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

const handleCommand = async (area?: string) => {
  await initDb()

  if (area) {
    await importArea(area)
  } else {
    commander.help()
  }

  await closeDb()
}

handleCommand(commander.area)
  .then(() => {
    logger.info('Finished successfully')
  })
  .catch((err) => {
    logger.error(`There was an error ${err.message}`)
    process.exit(1)
  })
