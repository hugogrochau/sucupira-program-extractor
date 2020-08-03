import * as R from 'ramda'
import * as sqlite from 'sqlite'
import { Database } from 'sqlite3'
import { SQL } from 'sql-template-strings'
import { escape } from 'sqlstring'
import { logger } from './logger'

let db: sqlite.Database

export const initDb = async (): Promise<void> => {
  db = await sqlite.open({
    filename: './database.sqlite',
    driver: Database,
  })
  await db.migrate({})
}

export const closeDb = async (): Promise<void> => {
  await db.close()
}

const generateReplaceStatement = (object: Record<string, unknown>, table: string) => {
  const statement = SQL`REPLACE INTO `

  statement.append(`"${table}" (`)

  const columns = Object.keys(object)
  columns.forEach((column, index) => {
    if (index < columns.length - 1) {
      statement.append(`"${column}", `)
      return
    }

    statement.append(`"${column}"`)
  })

  statement.append(SQL`)
  VALUES (
  `)

  const values = Object.values(object)
  values.forEach((value, index) => {
    const escapedValue = escape(R.isNil(value) || value === '' ? null : value).replace(/\\'/g, '\'\'')

    if (index < values.length - 1) {
      statement.append(`${escapedValue}, `)
      return
    }

    statement.append(`${escapedValue}`)
  })

  statement.append(SQL`)`)

  return statement
}

export const saveEntity = async <T extends Record<string, unknown>>
(entity: T, entityName: string): Promise<void> => {
  logger.info(`Saving ${entityName} ${entity.id || JSON.stringify(entity)} to database`)

  const statement = generateReplaceStatement(entity, entityName)

  await db.run(statement)
}
