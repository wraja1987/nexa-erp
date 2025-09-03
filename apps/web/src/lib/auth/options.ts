import type { NextAuthConfig } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import AzureADProvider from 'next-auth/providers/azure-ad'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export function buildAuthConfig(): NextAuthConfig {
  const providers: NextAuthConfig['providers'] = []

  // Credentials provider is always available
  providers.push(
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined
        if (!email || !password) return null

        const user = await prisma.user.findUnique({ where: { email } }).catch(() => null)
        if (!user) return null

        const passwordHash: string | null = (user as any).passwordHash ?? (user as any).hashedPassword ?? null
        if (!passwordHash) return null

        const ok = await bcrypt.compare(password, passwordHash)
        if (!ok) return null

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

  const config: NextAuthConfig = {
    providers,
    pages: {
      signIn: '/login',
    },
    session: { strategy: 'jwt' },
    secret: process.env.NEXTAUTH_SECRET,
  }

  return config
}


