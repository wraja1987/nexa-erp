# CORS & Cookies Verification
- ALLOW list contains: https://app.nexaai.co.uk
- Preflight returns 204 with ACAO=https://app.nexaai.co.uk
- Simple GET includes ACAO and credentials allowed
- Disallowed origin blocked with 403
- Cookies: Secure, HttpOnly, SameSite=Lax, domain set
