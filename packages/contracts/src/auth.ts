import { z } from 'zod'

const PasswordSchema = z.string().min(12).max(128)

export const UserRoleSchema = z.enum(['ADMIN', 'EDITOR', 'REVIEWER'])

export const AuthenticatedUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.email(),
  role: UserRoleSchema,
})

export const RegisterRequestSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().transform((email) => email.toLowerCase()),
  password: PasswordSchema,
  registrationKey: z.string().min(1),
})

export const LoginRequestSchema = z.object({
  email: z.email().transform((email) => email.toLowerCase()),
  password: PasswordSchema,
})

export const AuthSessionSchema = z.object({
  token: z.string().min(1),
  expiresAt: z.iso.datetime(),
  user: AuthenticatedUserSchema,
})

export type AuthenticatedUser = z.infer<typeof AuthenticatedUserSchema>
export type LoginRequest = z.infer<typeof LoginRequestSchema>
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>
export type AuthSession = z.infer<typeof AuthSessionSchema>
