// Support NextAuth v4 typings
import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import AzureADProvider from 'next-auth/providers/azure-ad'
import CredentialsProvider from 'next-auth/providers/credentials'
import { authenticator } from 'otplib'
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export function buildAuthConfig(): NextAuthOptions {
  const providers: NextAuthOptions['providers'] = [] as any

  // Credentials provider is always available
  providers.push(
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        otp: { label: 'One-time code', type: 'text', placeholder: '123456' },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined
        const otp = credentials?.otp as string | undefined
        if (!email || !password) return null

        const user = await prisma.user.findUnique({ where: { email } }).catch(() => null)
        if (!user) return null

        const passwordHash: string | null = (user as any).passwordHash ?? (user as any).hashedPassword ?? null
        if (!passwordHash) return null

        const ok = await bcrypt.compare(password, passwordHash)
        if (!ok) return null

        // Enforce MFA for credential sign-in when enabled
        const mfaEnabled = (user as any).mfaEnabled === true
        const mfaSecret = (user as any).mfaSecret as string | undefined
        if (mfaEnabled) {
          if (!mfaSecret || !otp || !authenticator.verify({ token: otp, secret: mfaSecret })) {
            // Signal error to NextAuth
            throw new Error('mfa_required')
          }
        }

        return {
          id: String((user as any).id ?? email),
          email: (user as any).email,
          name: (user as any).name ?? null,
          role: (user as any).role ?? null,
        }
      },
    })
  )

  // Conditionally add Google
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    )
  }

  // Conditionally add Microsoft (Azure AD)
  if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
    providers.push(
      AzureADProvider({
        clientId: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        tenantId: process.env.MICROSOFT_TENANT_ID,
      })
    )
  }

  const config: NextAuthOptions = {
    providers,
    pages: {
      signIn: '/login',
    },
    session: { strategy: 'jwt' },
    secret: process.env.NEXTAUTH_SECRET,
  }

  return config
}


