# Security & Governance

- Headers: HSTS, CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-Frame-Options via middleware.
- Rate limiting: per-IP sliding window; health/webhook endpoints eased.
- RBAC/SoD: route-level guards on write endpoints using `x-role` header in demos.
- AI governance: prompt masking, token caps, audit logs; no secret logging.
