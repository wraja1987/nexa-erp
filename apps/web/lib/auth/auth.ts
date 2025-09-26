export interface SessionUser {
  id: string;
  email: string;
  tenantId?: string;
}

export interface Session {
  user?: SessionUser;
}

export async function getSession(): Promise<Session> {
  const email = process.env.DEMO_EMAIL || "demo@example.com";
  return { user: { id: "u-demo", email, tenantId: "demo-live" } };
}




