Last updated: 2025-09-05

Purpose
- Explain how to build and deploy the Nexa static marketing site to Hostinger shared hosting.

Who should read this
- Web admins responsible for uploading the static site to Hostinger
- Maintainers updating marketing pages without changing the ERP application

Overview
- The static website lives in `apps/website-static/`. It does not affect the ERP or the main Next.js website app.
- It is 100% static: no Server Actions, no SSR, and no Node server required.

Build steps
```bash
# From repository root
pnpm -w --filter @nexa/website-static install --ignore-scripts
pnpm -w --filter @nexa/website-static run build
# Output: apps/website-static/out/
```

Packaging for Hostinger
```bash
# From repository root
zip -r nexa-static-hostinger.zip apps/website-static/out/
```

Hostinger shared hosting (public_html) deployment
1. Open hPanel → Files → File Manager
2. Upload `nexa-static-hostinger.zip` to `public_html/`
3. Extract the ZIP (so `public_html/index.html` exists)
4. Clear Hostinger cache/CDN if enabled
5. Visit the site root (e.g. `https://yourdomain/`)

Included routes
- Home: `/`
- Pricing: `/pricing/`
- Features: `/features/`
- Solutions: `/solutions/`
- Industries: `/industries/`
- Docs: `/docs/` (+ guides under `/docs/<slug>/`)
- Legal: `/legal/`
- Compliance: `/compliance/privacy/`, `/compliance/cookies/`, `/compliance/accessibility/`, `/compliance/security/`
- Contact: `/contact/`

Content updates
- Edit files under `apps/website-static/app/` and `apps/website-static/data/`
- Rebuild and repackage as above

Environment variables
- Do not paste real secrets here. The static site does not require secrets.

Troubleshooting
- 404s: Ensure extracted files are directly under `public_html/` (not nested in a subfolder). Re-extract if needed.
- Stale assets: Clear Hostinger cache/CDN and browser cache.
- Broken links: Confirm `trailingSlash: true` in `apps/website-static/next.config.mjs` and rebuild.
