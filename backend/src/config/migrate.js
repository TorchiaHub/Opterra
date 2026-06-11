import fs from 'fs'
import path from 'path'
import mysql from 'mysql2/promise'
import env from './env.js'
import logger from './logger.js'

async function runMigrations() {
  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.name,
    multipleStatements: true,
  })

  const migrationsDir = path.resolve('migrations')
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
    logger.info(`Running migration: ${file}`)
    await connection.query(sql)
    logger.info(`Migration ${file} completed`)
  }

  await connection.end()
  logger.info('All migrations completed')
}

runMigrations().catch(err => {
  logger.error('Migration failed:', err)
  process.exit(1)
})
