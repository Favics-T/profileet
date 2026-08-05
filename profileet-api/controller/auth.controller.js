const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { prisma } = require("../config/db");

async function signup(req, res) {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email and password are required" });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "An account with that email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, role: role || "designer" },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      token,
      role: user.role,
      studio: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error("Failed to sign up:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      role: user.role,
      studio: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error("Failed to log in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ─── Admin credentials loaded from environment (never from frontend) ──────────
const ADMIN_ACCOUNTS = [
  {
    email:    process.env.ADMIN_SUPER_EMAIL,
    password: process.env.ADMIN_SUPER_PASSWORD,
    name:     process.env.ADMIN_SUPER_NAME,
    role:     'super_admin',
  },
  {
    email:    process.env.ADMIN_MANAGER_EMAIL,
    password: process.env.ADMIN_MANAGER_PASSWORD,
    name:     process.env.ADMIN_MANAGER_NAME,
    role:     'profile_manager',
  },
  {
    email:    process.env.ADMIN_SUPPORT_EMAIL,
    password: process.env.ADMIN_SUPPORT_PASSWORD,
    name:     process.env.ADMIN_SUPPORT_NAME,
    role:     'support_agent',
  },
  {
    email:    process.env.ADMIN_AUDITOR_EMAIL,
    password: process.env.ADMIN_AUDITOR_PASSWORD,
    name:     process.env.ADMIN_AUDITOR_NAME,
    role:     'auditor',
  },
]

async function adminLogin(req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' })
  }

  const match = ADMIN_ACCOUNTS.find(
    (a) => a.email === email && a.password === password
  )

  if (!match) {
    return res.status(401).json({ error: 'Invalid admin email or password' })
  }

  const token = jwt.sign(
    { userId: match.email, email: match.email, role: match.role, name: match.name },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  )

  res.json({
    success: true,
    token,
    admin: { email: match.email, name: match.name, role: match.role },
  })
}

function testProtected(req, res) {
  res.json({ message: "You are authenticated", userId: req.userId });
}

module.exports = { signup, login, adminLogin, testProtected };

