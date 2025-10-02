## Summary
Explain what changed and why.

## Checks
- [ ] Images are served via `next/image` or `<img srcset>` with WebP/AVIF available.
- [ ] Critical font uses `next/font` (display: "swap"); no unused weights/styles.
- [ ] `/login` and `/dashboard` still pass Lighthouse gates locally (`pnpm verify:budgets`).
- [ ] Accessibility basics: labelled inputs, focus-visible, colour contrast, `<main>` landmark, no empty links/buttons.
