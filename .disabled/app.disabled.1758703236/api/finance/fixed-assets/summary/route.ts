import { proxyGET } from "../../../_proxy";
export const dynamic = "force-dynamic"; export const revalidate = 0;
export async function GET(req: Request){ return proxyGET(req, "/api/finance/fixed-assets/summary"); }
