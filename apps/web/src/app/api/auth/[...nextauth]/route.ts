import NextAuth from 'next-auth'
import { buildAuthConfig } from '@/src/lib/auth/options'

export const { GET, POST } = NextAuth(buildAuthConfig())


