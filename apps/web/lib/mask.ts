export const mask = (val?: string | null, visible = 4) => {
  if (!val) return '';
  const s = String(val);
  if (s.length <= visible) return '*'.repeat(Math.max(3, s.length));
  return s.slice(0, visible) + '***';
};
export const mocksEnabled = () => process.env.SMOKE_MOCKS_ENABLED === 'true';

