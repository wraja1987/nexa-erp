export type Role = 'SUPER_ADMIN'|'ADMIN'|'USER';
export function getRoleFromRequest(): Role { return 'ADMIN'; }
export function ensureRoleAllowed(_r: Role): void {}
export function ensurePermissionAllowed(_p: string): void {}
export function getActorIdFromRequest(): string { return 'u1'; }
export function currentUser(){ return { id: 'u1', email: 'demo@example.com' }; }
