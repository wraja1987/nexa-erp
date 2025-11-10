# Uptime Monitors — Health, Readiness, Error Rate

Scope: Production alias `https://app.nexaai.co.uk`

Endpoints to monitor (GET):
- `/api/healthz` — Expect 200 JSON: `{ ok:true, db:true, redis:<bool> }`
- `/api/readyz` — Expect 200 JSON: `{ ok:true, db:true, redis:<bool> }`

Cadence:
- Interval: 60s
- Regions: EU (primary), US (secondary)

Alert policy:
- Alert after 2 consecutive failures
- Cooldown: 10m
- Channels: Email + Slack webhook

Suggested providers:
- UptimeRobot, BetterStack, Pingdom (any equivalent is fine)

Example checks (curl):
```bash
curl -fsS https://app.nexaai.co.uk/api/healthz | jq
curl -fsS https://app.nexaai.co.uk/api/readyz  | jq
```

Expected HTTP: 200; tolerant of `"redis": false`.

Error rate:
- If your platform supports apdex or error rate, set threshold alert for 5xx > 1% in 5m window.


