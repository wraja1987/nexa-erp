import { NextRequest } from 'next/server'
import { z } from 'zod'
import { authenticator } from 'otplib'
import { prisma } from '../../../../../lib/db'

const schema = z.object({ userId: z.string(), token: z.string() })

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(()=>null)
    const { userId, token } = schema.parse(json)
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user?.mfaSecret) return Response.json({ ok:false, code:400, message:'MFA not initialized' }, { status:400 })
    const valid = authenticator.verify({ token, secret: user.mfaSecret })
    if (!valid) return Response.json({ ok:false, code:401, message:'Invalid token' }, { status:401 })
    await prisma.user.update({ where: { id: userId }, data: { mfaEnabled: true } })
    return Response.json({ ok:true })
  } catch {
    return Response.json({ ok:false, code:400, message:'Failed' }, { status:400 })
  }
}





