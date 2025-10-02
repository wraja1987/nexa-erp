# CORS & Cookies — Proof (2025-10-02T20:52:01Z)
- Allow-list: `https://app.nexaai.co.uk`, `https://api.nexaai.co.uk`
- Preflight: expect **204**, **Access-Control-Allow-Origin: https://app.nexaai.co.uk**, **Vary: Origin**
- Simple GET: expect **200**, **Access-Control-Allow-Origin: https://app.nexaai.co.uk**, **Access-Control-Allow-Credentials: true**
- Disallowed Origin: expect **403**
- Session cookies: **Secure**, **HttpOnly**, **SameSite=Lax**, **domain=app.nexaai.co.uk**
