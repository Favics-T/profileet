const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");
const {
  signup,
  login,
  adminLogin,
  changePassword,
  testProtected,
} = require("../controller/auth.controller");

const router = express.Router();

router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.post("/admin/login", authLimiter, adminLogin);

router.patch("/password", requireAuth, changePassword);
router.get("/test-protected", requireAuth, testProtected);

module.exports = router;