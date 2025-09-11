# Nexa POS — PCI Scope Review and Device Handling

## Scope Decision
Nexa POS uses Stripe Terminal (PCI-listed devices). Card data is entered on the reader; Nexa servers and clients do not handle PAN, track, or CVV. Nexa remains out of PCI DSS scope for card data storage/processing/transmission except for device handling, connection tokens, and webhook security.

## Stripe Terminal Flow
1) Create Payment Intent (Stripe API)
2) Collect on the reader (Terminal)
3) Capture payment
4) Webhook receive → verify signature → idempotent handling
5) Reconciliation job closes any gaps

## Device Handling
- Register devices (serial, site, last seen)
- Physical checks: seals intact, no tamper indicators
- Storage: locked cabinet when not in use
- Loss/Theft: revoke, mark compromised, inform Stripe support
- Updates: apply firmware per Stripe guidance
- Disposal: follow vendor instructions; decommission in inventory

## Application Controls
- TLS enforced; CSP nonces on web
- RBAC and segregation of duties for POS posting
- Webhook verify with Stripe signature; idempotency keys stored
- Observability: metrics and logs; alert on failure spikes or backlog

## References
- Stripe Terminal docs
- PCI DSS SAQ P2PE or SAQ A guidance (as applicable)

