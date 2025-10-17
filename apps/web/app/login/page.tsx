import type { Metadata } from 'next'
import LoginApproved from '@/src/features/auth/LoginApproved'

export const metadata: Metadata = {
  title: 'Sign in to Nexa ERP'
}

export default function Page() {
  return <LoginApproved />
}