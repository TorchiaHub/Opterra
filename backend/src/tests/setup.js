import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'

const TEST_DB = 'tenderflow_test'

let testPool = null

export async function getTestPool() {
  if (testPool) return testPool

  const rootConn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'tenderflow_user',
    password: process.env.DB_PASSWORD || 'tenderflow_pass',
  })

  await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${TEST_DB}\``)
  await rootConn.end()

  testPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    database: TEST_DB,
    user: process.env.DB_USER || 'tenderflow_user',
    password: process.env.DB_PASSWORD || 'tenderflow_pass',
    waitForConnections: true,
    connectionLimit: 5,
  })

  return testPool
}

export async function setupTestDatabase() {
  const pool = await getTestPool()

  const migrationsDir = path.resolve('migrations')
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
    await pool.query(sql)
  }

  const seedsDir = path.resolve('seeds')
  const seedFiles = fs.readdirSync(seedsDir).filter(f => f.endsWith('.sql')).sort()

  for (const file of seedFiles) {
    const sql = fs.readFileSync(path.join(seedsDir, file), 'utf8')
    await pool.query(sql)
  }
}

export async function teardownTestDatabase() {
  if (testPool) {
    await testPool.query(`DROP DATABASE IF EXISTS \`${TEST_DB}\``)
    await testPool.end()
    testPool = null
  }
}

beforeAll(async () => {
  await setupTestDatabase()
})

afterAll(async () => {
  await teardownTestDatabase()
})
