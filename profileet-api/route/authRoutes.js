const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");
const { validate } = require("../middleware/validate");
const {
  artisanSchema,
  clientSignupSchema,
  loginSchema,
  adminLoginSchema,
  changePasswordSchema,
} = require("../schemas/auth.schema");
const {
  artisanSignup,
  clientSignup,
  login,
  adminLogin,
  changePassword,
  testProtected,
} = require("../controller/auth.controller");

const router = express.Router();

router.post("/designersignup", authLimiter, validate(artisanSchema),   artisanSignup);
router.post("/clientsignup",   authLimiter, validate(clientSignupSchema), clientSignup);
router.post("/login",          authLimiter, validate(loginSchema),      login);
router.post("/admin/login",    authLimiter, validate(adminLoginSchema),  adminLogin);

router.patch("/password",        requireAuth, validate(changePasswordSchema), changePassword);
router.get("/test-protected",    requireAuth, testProtected);

module.exports = router;

