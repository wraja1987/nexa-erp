import { NextResponse } from next/server;
import { getModulesTree } from @/server/modulesTree;

export const dynamic = force-dynamic;

export async function GET() {
  try {
    const data = getModulesTree();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}
