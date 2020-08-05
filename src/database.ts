import * as R from 'ramda'
import * as sqlite from 'sqlite'
import { Database } from 'sqlite3'
import { SQL } from 'sql-template-strings'
import { escape } from 'sqlstring'
import { logger } from './logger'
import { SimplifiedAreaUniversity } from './types'

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
  logger.debug(`Saving ${entityName} ${entity.id || JSON.stringify(entity)} to database`)

  const statement = generateReplaceStatement(entity, entityName)

  await db.run(statement)
}

export const getAreaUniversities = async (
  offset?: number, limit?: number,
): Promise<SimplifiedAreaUniversity[]> => {
  const statement = SQL`SELECT "id", "idAreaAvaliacao", "idAreaConhecimento" FROM "areaUniversity"`
  if (limit) {
    statement.append(` LIMIT ${limit}`)
  }

  if (offset) {
    statement.append(` OFFSET ${offset}`)
  }

  const result = await db.all<SimplifiedAreaUniversity[]>(statement)

  return result
}

export const getPrograms = async (
  offset?: number, limit?: number,
): Promise<{ id: string; idUniversidade: number}[]> => {
  const statement = SQL`SELECT "id", "idUniversidade" FROM "universityProgram"`
  if (limit) {
    statement.append(` LIMIT ${limit}`)
  }

  if (offset) {
    statement.append(` OFFSET ${offset}`)
  }

  return db.all(statement)
}
