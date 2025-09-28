# Nexa ERP Static Website (Hostinger)

Last updated: 2025-09-05

Purpose
- Provide a purely static marketing/docs site for Hostinger shared hosting (no Node).

Who should read this
- Web admins deploying to Hostinger shared hosting
- Maintainers updating marketing pages without touching ERP or the main website app

Scope
- Lives entirely in `apps/website-static/`
- Does not change ERP app or `apps/website/` in any way

Build
```bash
pnpm -w --filter @nexa/website-static install --ignore-scripts
pnpm -w --filter @nexa/website-static run build
```

Artifact
- Output directory: `apps/website-static/out/`
- Packaged ZIP (example): `nexa-static-hostinger.zip` containing `apps/website-static/out/`

Hostinger shared deployment (public_html)
1. Log into hPanel → Files → File Manager
2. Upload `nexa-static-hostinger.zip` to `public_html/`
3. Extract the ZIP; ensure `public_html/index.html` exists
4. Clear Hostinger cache/CDN if enabled
5. Browse site root: yourdomain.com/

Structure
- `app/` Next App Router pages (static only)
- `data/` JSON content (imported with `@/data/...`)
- `next.config.mjs` uses `output: 'export'`, images unoptimized, `trailingSlash: true`

Notes
- No Server Actions, SSR, or server-only features are used
- Contact form uses `mailto:` to avoid servers
- Update pages by editing files under `apps/website-static/app/`

Security
- No secrets required. Do not paste real secrets here.
- Privacy, cookies, accessibility, and security pages are included under `/compliance/*`.
