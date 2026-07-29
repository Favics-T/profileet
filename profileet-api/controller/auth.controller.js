const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db")

async function signup(req,res){
    const {name, email, password}= req.body;

    if(!name || !email || !password){
        return res.status(400).json({error:"name , email and password are required"})
    }

   try {
    const password_hash = await bcrypt.hash(password, 10);

    const studio = await prisma.studio.create({
      data: { name, email, password_hash },
    });

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      studio: { id: user.id, name: studio.name, email: studio.email },
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "An account with that email already exists" });
    }
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
    const studio = await prisma.studio.findUnique({ where: { email } });

    if (!studio) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordMatches = await bcrypt.compare(password, studio.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { studioId: studio.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      studio: { id: studio.id, name: studio.name, email: studio.email },
    });
  }
   catch (error) {
    console.error("Failed to log in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

function testProtected(req, res) {
  res.json({ message: "You are authenticated", studioId: req.studioId });
}

module.exports = {
  signup,
  login,
  testProtected,
};  
