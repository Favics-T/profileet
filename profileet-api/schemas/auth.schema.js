const { z } = require('zod')

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .email('Invalid email address')

const passwordField = z
  .string()
  .min(1, 'Password is required')


const strongPasswordField = z
  .string()
  .min(6, 'Password must be at least 6 characters')

const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required'),

  email: emailField,

  password: strongPasswordField,

  
  role: z
    .enum(['designer', 'client'], {
      error: "role must be 'designer' or 'client'",
    })
    .default('designer'),
})

const artisanSchema=z.object({
  name:z.string(),
  email:emailField,
  password:passwordField,

  specialty: z.enum(['tailor', 'makeup Artist', 'hairdresser'], {
  error: "only hairdresser, tailor, and makeup Artist are allowed",
}).default('hairdresser'),
})

const loginSchema = z.object({
  email: emailField,
  password: passwordField,
})


const adminLoginSchema = z.object({
  email: emailField,
  password: passwordField,
})

const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'currentPassword is required'),

  newPassword: strongPasswordField,
})

module.exports = {
  signupSchema,
  artisanSchema,
  loginSchema,
  adminLoginSchema,
  changePasswordSchema,
}
