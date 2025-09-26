import { NextRequest } from 'next/server'
import { authenticator } from 'otplib'
import { prisma } from '../../../../../lib/db'
import { ensureRoleAllowed } from '../../../../../lib/rbac'

export async function POST(req: NextRequest) {
  try {
    ensureRoleAllowed(req, ['admin'])
    const userId = req.headers.get('x-user-id') || ''
    if (!userId) return Response.json({ ok:false, code:400, message:'Missing user' }, { status:400 })
    const secret = authenticator.generateSecret()
    await prisma.user.update({ where: { id: userId }, data: { mfaSecret: secret } })
    const label = `Nexa:${userId}`
    const otpAuth = authenticator.keyuri(label, 'Nexa', secret)
    return Response.json({ ok:true, otpAuth })
  } catch {
    return Response.json({ ok:false, code:400, message:'Failed' }, { status:400 })
  }
}





