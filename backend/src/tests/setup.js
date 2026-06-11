import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'

const TEST_DB = 'tenderflow_test'

let testPool = null

export async function getTestPool() {
  if (testPool) return testPool

  testPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    database: TEST_DB,
    user: process.env.DB_ROOT_USER || 'root',
    password: process.env.DB_ROOT_PASSWORD || 'password',
    waitForConnections: true,
    connectionLimit: 5,
    multipleStatements: true,
  })

  return testPool
}

export async function setupTestDatabase() {
  const rootConn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_ROOT_USER || 'root',
    password: process.env.DB_ROOT_PASSWORD || 'password',
  })

  await rootConn.query(`DROP DATABASE IF EXISTS \`${TEST_DB}\``)
  await rootConn.query(`CREATE DATABASE \`${TEST_DB}\``)
  await rootConn.end()

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
    await testPool.end()
    testPool = null
  }

  const rootConn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_ROOT_USER || 'root',
    password: process.env.DB_ROOT_PASSWORD || 'password',
  })
  await rootConn.query(`DROP DATABASE IF EXISTS \`${TEST_DB}\``)
  await rootConn.end()
}

beforeAll(async () => {
  await setupTestDatabase()
})

afterAll(async () => {
  await teardownTestDatabase()
})
