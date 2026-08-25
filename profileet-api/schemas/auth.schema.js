const { z } = require('zod')

const emailField = z.string().trim().toLowerCase().email('Invalid email address')
const passwordField = z.string().min(1, 'Password is required')
const strongPasswordField = z.string().min(6, 'Password must be at least 6 characters')

const signupSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: emailField,
  password: strongPasswordField,
  role: z.enum(['artisan', 'client'], {
    error: "role must be 'artisan' or 'client'",
  }).default('artisan'),
})


const artisanSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: emailField,
  password: strongPasswordField,
  specialty: z.enum(['tailor', 'makeup artist', 'hairdresser', 'chef'], {
    error: 'specialty must be one of: tailor, makeup artist, hairdresser, chef',
  }),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
})

// Client registration
const clientSignupSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: emailField,
  password: strongPasswordField,
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
  currentPassword: z.string().min(1, 'currentPassword is required'),
  newPassword: strongPasswordField,
})

module.exports = {
  signupSchema,
  artisanSchema,
  clientSignupSchema,
  loginSchema,
  adminLoginSchema,
  changePasswordSchema,
}
