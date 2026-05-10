const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const { readUser, writeUser } = require('../utils/db')
const { generateTokens, verifyToken } = require('../utils/jwt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const { sendVerificationEmail } = require('../utils/email')

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Username already exists
 */

router.post('/register', async (req, res) => {
  const db = readUser()
  const { username, password, email } = req.body
  if (db.users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' })
  }
  const hashedPassword = await bcrypt.hash(password, 10)
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const newUser = { id: Date.now().toString(), username, email, password: hashedPassword, verified: false, verificationCode: code }
  db.users.push(newUser)
  writeUser(db)
  await sendVerificationEmail(email, username, code)
  res.json({ message: 'User registered. Check your email for verification code.' })
})

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Verify email with code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid code
 */
router.post('/verify', (req, res) => {
  const { username, code } = req.body
  const db = readUser()
  const user = db.users.find(u => u.username === username)
  if (!user) {
    return res.status(400).json({ error: 'User not found' })
  }
  if (user.verificationCode !== code) {
    return res.status(400).json({ error: 'Invalid code' })
  }
  user.verified = true
  user.verificationCode = null
  writeUser(db)
  res.json({ message: 'Email verified successfully' })
})

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and get tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns access and refresh tokens
 *       400:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
  const { username, password, } = req.body
  const db = readUser()
  const user = db.users.find(u => u.username === username)
  if (!user) {
    return res.status(400).json({ error: 'Invalid credentials' })
  }
  if (!user.verified) {
    return res.status(400).json({ error: 'Please verify your email first' })
  }
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(400).json({ error: 'Invalid credentials' })
  }
  const tokens = generateTokens(user)
  res.json({ tokens })
})

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns a new access token
 *       400:
 *         description: Invalid refresh token
 */
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body
  const decoded = verifyToken(refreshToken)
  if (!decoded) {
    return res.status(400).json({ error: 'Invalid refresh token' })
  }
  const accessToken = jwt.sign(
    { id: decoded.id, username: decoded.username },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  )
  res.json({ accessToken })
})


module.exports = router