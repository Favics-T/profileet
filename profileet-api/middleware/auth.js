const jwt = require('jsonwebtoken')

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = payload.userId
    req.role   = payload.role
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

function requireDesigner(req, res, next) {
  
  if (req.role !== 'designer') {
    return res.status(403).json({ error: 'Forbidden' })
  }
  next()
}

function requireClient(req, res, next) {
  if (req.role !== 'client') {
    return res.status(403).json({ error: 'Forbidden' })
  }
  next()
}


function requireRole(...allowedRoles) {
  return function (req, res, next) {
    if (!allowedRoles.includes(req.role)) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    next()
  }
}

module.exports = { requireAuth, requireDesigner, requireClient, requireRole }