import NextAuth from 'next-auth'
import { buildAuthConfig } from '../../../../lib/auth/options'

export const { GET, POST } = NextAuth(buildAuthConfig())


