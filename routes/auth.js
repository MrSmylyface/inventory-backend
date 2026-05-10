const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const { readUser, writeUser } = require('../utils/db')
const { generateTokens, verifyToken } = require('../utils/jwt')
const jwt = require('jsonwebtoken')
require('dotenv').config()

router.post('/register', async (req, res) => {
  const db = readUser()
  const { username, password } = req.body
  if (db.users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' })
  }
  const hashedPassword = await bcrypt.hash(password, 10)
  const newUser = { id: Date.now().toString(), username, password: hashedPassword }
  db.users.push(newUser)
  writeUser(db)
  res.json({ message: 'User registered successfully' })
})

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  const db = readUser()
  const user = db.users.find(u => u.username === username)
  if (!user) {
    return res.status(400).json({ error: 'Invalid credentials' })
  }
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(400).json({ error: 'Invalid credentials' })
  }
  const tokens = generateTokens(user)
  res.json({ tokens })
})

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