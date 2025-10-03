import client from "prom-client";
const g = globalThis as any;
if (!g.__NEXA_PROM_REG__) {
  const reg = new client.Registry();
  client.collectDefaultMetrics({ register: reg, prefix: "nexa_" });
  const rlHits = new client.Counter({ name: "nexa_rl_hits_total", help: "Rate-limit checks performed", labelNames: ["route","tenant"] });
  const rlBlocked = new client.Counter({ name: "nexa_rl_blocked_total", help: "Rate-limit blocks (429)", labelNames: ["route","tenant"] });
  const idemSkips = new client.Counter({ name: "nexa_idem_skips_total", help: "Idempotency duplicates short-circuited", labelNames: ["key"] });
  const rlCurrent = new client.Gauge({ name: "nexa_rl_current_requests", help: "Current count seen in window for last request", labelNames: ["route","tenant"] });
  reg.registerMetric(rlHits); reg.registerMetric(rlBlocked); reg.registerMetric(idemSkips); reg.registerMetric(rlCurrent);
  g.__NEXA_PROM_REG__ = reg; g.__NEXA_PROM_METRICS__ = { rlHits, rlBlocked, idemSkips, rlCurrent };
}
export function registry(): client.Registry { return (globalThis as any).__NEXA_PROM_REG__; }
export const metrics = (globalThis as any).__NEXA_PROM_METRICS__ as {
  rlHits: client.Counter<string>;
  rlBlocked: client.Counter<string>;
  idemSkips: client.Counter<string>;
  rlCurrent: client.Gauge<string>;
};
