import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuthRateLimit } from '@/lib/auth/guard'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // delegate to NextAuth email signin endpoint by redirecting
  if (req.method === 'POST') {
    // Let NextAuth handle this route
    res.redirect(302, `/api/auth/signin/email?json=true`)
  } else {
    res.status(405).end()
  }
}

export default withAuthRateLimit(handler)

// removed: handled by catch-all [...nextauth]



