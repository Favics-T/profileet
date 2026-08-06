const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  signup,
  login,
  adminLogin,
  changePassword,
  testProtected,
} = require("../controller/auth.controller");

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/admin/login", adminLogin);

router.patch("/password", requireAuth, changePassword);

router.get("/test-protected", requireAuth, testProtected);

module.exports = router;
