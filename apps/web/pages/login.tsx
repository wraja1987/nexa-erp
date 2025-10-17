import Head from 'next/head'
import dynamic from 'next/dynamic'
const LoginApproved = dynamic(() => import('@/src/features/auth/LoginApproved'), { ssr: true })

export default function LoginPage() {
  return (
    <>
      <Head><title>Sign in to Nexa ERP</title></Head>
      <LoginApproved />
    </>
  )
}
