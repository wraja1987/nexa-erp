import { NextResponse } from "next/server"
export const dynamic = "force-dynamic"; export const revalidate = 0;
export async function GET(){
  // Local stub so the portal always shows KPIs even if upstream is not ready
  return NextResponse.json({ a: 405280, b: 168, c: 23450 })
}


