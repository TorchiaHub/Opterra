import fs from 'fs'
import path from 'path'
import mysql from 'mysql2/promise'
import env from './env.js'
import logger from './logger.js'

async function runSeeds() {
  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.name,
    multipleStatements: true,
  })

  const seedsDir = path.resolve('seeds')
  const files = fs.readdirSync(seedsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()

  for (const file of files) {
    const sql = fs.readFileSync(path.join(seedsDir, file), 'utf8')
    logger.info(`Running seed: ${file}`)
    await connection.query(sql)
    logger.info(`Seed ${file} completed`)
  }

  await connection.end()
  logger.info('All seeds completed')
}

runSeeds().catch(err => {
  logger.error('Seed failed:', err)
  process.exit(1)
})
