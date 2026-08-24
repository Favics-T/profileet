const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cuid = require('cuid')
const { pool } = require('../config/db')

function toInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function randomColor() {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, '0')}`
}


async function artisanSignup(req, res) {
  const { name, email, password, specialty, location } = req.body
  const client = await pool.connect()

  try {
    const { rows: existingRows } = await client.query(
      `SELECT id FROM "User" WHERE email = $1`,
      [email]
    )
    if (existingRows.length > 0) {
      return res.status(409).json({ error: 'An account with that email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const userId = cuid()

    await client.query('BEGIN')

    const { rows: userRows } = await client.query(
      `INSERT INTO "User" (id, name, email, password, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, name, email, hashedPassword, 'artisan']
    )
    const newUser = userRows[0]

    const profileId = cuid()
    const joined = new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })

    await client.query(
      `INSERT INTO "ArtisanProfile" (id, "artisanId", "fullName", specialty, location, initials, color, joined)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [profileId, userId, name, specialty || '', location || '', toInitials(name), randomColor(), joined]
    )

    await client.query('COMMIT')

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: 'artisan' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      success: true,
      token,
      role: 'artisan',
      user: { id: newUser.id, email: newUser.email, name: newUser.name },
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Failed to sign up artisan:', error)
    res.status(500).json({ error: 'Internal server error' })
  } finally {
    client.release()
  }
}


async function clientSignup(req, res) {
  const { name, email, password } = req.body
  const client = await pool.connect()

  try {
    const { rows: existingRows } = await client.query(
      `SELECT id FROM "User" WHERE email = $1`,
      [email]
    )
    if (existingRows.length > 0) {
      return res.status(409).json({ error: 'An account with that email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const userId = cuid()

    await client.query('BEGIN')

    const { rows: userRows } = await client.query(
      `INSERT INTO "User" (id, name, email, password, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, name, email, hashedPassword, 'client']
    )
    const newUser = userRows[0]

    const profileId = cuid()
    const firstName = name.split(' ')[0] || ''
    const lastName = name.split(' ').slice(1).join(' ') || ''

    await client.query(
      `INSERT INTO "ClientProfile" (id, "clientId", "firstName", "lastName", email)
       VALUES ($1, $2, $3, $4, $5)`,
      [profileId, userId, firstName, lastName, email]
    )

    await client.query('COMMIT')

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: 'client' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      success: true,
      token,
      role: 'client',
      user: { id: newUser.id, email: newUser.email, name: newUser.name },
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Failed to sign up client:', error)
    res.status(500).json({ error: 'Internal server error' })
  } finally {
    client.release()
  }
}


async function login(req, res) {
  const { email, password } = req.body

  try {
    const { rows } = await pool.query(
      `SELECT * FROM "User" WHERE email = $1`,
      [email]
    )
    const user = rows[0]
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const passwordMatches = await bcrypt.compare(password, user.password)
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      token,
      role: user.role,
      user: { id: user.id, email: user.email, name: user.name },
    })
  } catch (error) {
    console.error('Failed to log in:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}


const ADMIN_ACCOUNT = {
  adminEmail: process.env.ADMIN_SUPER_EMAIL,
  adminPassword: process.env.ADMIN_SUPER_PASSWORD,
  adminName: process.env.ADMIN_SUPER_NAME,
}

async function adminLogin(req, res) {
  const { adminEmail, adminPassword, adminName } = ADMIN_ACCOUNT
  const { email, password } = req.body

  if (email !== adminEmail) {
    return res.status(401).json({ error: 'Only admin can have access' })
  }

  const passwordMatches = await bcrypt.compare(password, adminPassword)
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Only admin can have access' })
  }

  const token = jwt.sign(
    { email: adminEmail, role: 'admin', name: adminName },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  )

  res.json({
    success: true,
    token,
    admin: { email: adminEmail, name: adminName },
  })
}

function testProtected(req, res) {
  res.json({ message: 'You are authenticated', userId: req.userId })
}


async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body

  try {
    const { rows } = await pool.query(
      `SELECT * FROM "User" WHERE id = $1`,
      [req.userId]
    )
    const user = rows[0]
    if (!user) return res.status(404).json({ error: 'User not found' })

    const matches = await bcrypt.compare(currentPassword, user.password)
    if (!matches) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }

    const hashed = await bcrypt.hash(newPassword, 10)
    await pool.query(
      `UPDATE "User" SET password = $1 WHERE id = $2`,
      [hashed, req.userId]
    )

    res.json({ success: true, message: 'Password updated successfully' })
  } catch (error) {
    console.error('Failed to change password:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = {
  artisanSignup,
  clientSignup,
  login,
  adminLogin,
  changePassword,
  testProtected,
}