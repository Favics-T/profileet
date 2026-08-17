const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { prisma } = require("../config/db");

async function artisanSignup(req, res) {
  
  const { name, email, password, specialty,location } = req.body;


  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "An account with that email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.$transaction(async(tx)=>{
      const user = await tx.user.create({
        data:{
          name,
          email,
          password:hashedPassword,
          role:"designer",
        }
      });

      await tx.designer.create({
        data:{
          userId:user.id,
          specialty,
          initials: name.split(' ').map(n => n[0]).join('').toUpperCase(),
          color:"red"
        }
      })
      return user

    })

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: 'designer'
         },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      token,
      role: 'designer',
      studio: { id: newUser.id, email: newUser.email },
    });
  } catch (error) {
    console.error("Failed to sign up:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function login(req, res) {
  
  const { email, password } = req.body;

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

const ADMIN_ACCOUNT = 
  {
    adminEmail:    process.env.ADMIN_SUPER_EMAIL,
    adminPassword: process.env.ADMIN_SUPER_PASSWORD,
    adminName:     process.env.ADMIN_SUPER_NAME,
    
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
  res.json({ message: "You are authenticated", userId: req.userId });
}

async function changePassword(req, res) {
  
  const { currentPassword, newPassword } = req.body

  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const matches = await bcrypt.compare(currentPassword, user.password)
    if (!matches) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }

    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: req.userId }, data: { password: hashed } })

    res.json({ success: true, message: 'Password updated successfully' })
  } catch (error) {
    console.error('Failed to change password:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = { artisanSignup, login, adminLogin, changePassword, testProtected };

