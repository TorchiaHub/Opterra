import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import env from '../../config/env.js'
import logger from '../../config/logger.js'
import * as queries from './auth.queries.js'

const SALT_ROUNDS = 12

function generateAccessToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role_code,
      email: user.email,
    },
    env.jwt.secret,
    { expiresIn: env.jwt.accessExpiresIn }
  )
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex')
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

async function register(payload) {
  const existing = await queries.getTenantBySlug(payload.slug)
  if (existing) {
    throw Object.assign(new Error('Slug già in uso.'), {
      statusCode: 422,
      code: 'VALIDATION_ERROR',
    })
  }

  const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS)

  const { tenantId, userId } = await queries.createTenantWithManager({
    name: payload.name,
    slug: payload.slug,
    vatNumber: payload.vatNumber,
    industry: payload.industry,
    country: payload.country,
    email: payload.email,
    passwordHash,
    firstName: payload.firstName,
    lastName: payload.lastName,
  })

  const user = await queries.getUserById(userId)

  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken()
  const tokenHash = hashToken(refreshToken)

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  await queries.insertRefreshToken(userId, tokenHash, expiresAt)

  logger.info('Tenant registered', { tenantId, userId, slug: payload.slug })

  return {
    user: {
      id: userId,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: 'manager',
      tenantId,
    },
    accessToken,
    refreshToken,
  }
}

async function login(email, password) {
  const user = await queries.findUserByEmailGlobal(email)
  if (!user) {
    throw Object.assign(new Error('Email o password non validi.'), {
      statusCode: 401,
      code: 'UNAUTHORIZED',
    })
  }

  const isValid = await bcrypt.compare(password, user.password_hash)
  if (!isValid) {
    throw Object.assign(new Error('Email o password non validi.'), {
      statusCode: 401,
      code: 'UNAUTHORIZED',
    })
  }

  await queries.updateLastLogin(user.id)

  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken()
  const tokenHash = hashToken(refreshToken)

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  await queries.insertRefreshToken(user.id, tokenHash, expiresAt)

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role_code,
      tenantId: user.tenant_id,
    },
    accessToken,
    refreshToken,
  }
}

async function refresh(refreshTokenValue) {
  const tokenHash = hashToken(refreshTokenValue)
  const storedToken = await queries.findRefreshToken(tokenHash)

  if (!storedToken) {
    throw Object.assign(new Error('Refresh token non valido o scaduto.'), {
      statusCode: 401,
      code: 'UNAUTHORIZED',
    })
  }

  await queries.revokeRefreshToken(tokenHash)

  const user = await queries.getUserById(storedToken.user_id)
  if (!user) {
    throw Object.assign(new Error('Utente non trovato.'), {
      statusCode: 401,
      code: 'UNAUTHORIZED',
    })
  }

  const accessToken = generateAccessToken(user)
  const newRefreshToken = generateRefreshToken()
  const newTokenHash = hashToken(newRefreshToken)

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  await queries.insertRefreshToken(user.id, newTokenHash, expiresAt)

  return {
    accessToken,
    refreshToken: newRefreshToken,
  }
}

async function logout(refreshTokenValue) {
  const tokenHash = hashToken(refreshTokenValue)
  await queries.revokeRefreshToken(tokenHash)
}

export { register, login, refresh, logout }
