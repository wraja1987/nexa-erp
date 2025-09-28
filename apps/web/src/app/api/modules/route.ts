import { NextResponse } from "next/server";
import { getModulesTree } from "@/server/modulesTree";


export async function GET() {
  try {
    const data = getModulesTree();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}
