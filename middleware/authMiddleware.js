const { verifyToken } = require('../utils/jwt')

function authMiddleware(req, res, next) {
  const token = req.headers.authorization
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  const cleanToken = token.replace('Bearer ', '')
  const decoded = verifyToken(cleanToken)
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' })
  }
  req.user = decoded
  next()
}

module.exports = authMiddleware