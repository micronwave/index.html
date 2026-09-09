# altergott.dev

Personal portfolio for Aaron Altergott. A single static page — no build step, no
dependencies, no framework.

## Layout

```
site/
  index.html   the whole site: markup, CSS, and JS in one file
  404.html     not-found page
  img/         project screenshots
  og-image.png social preview card
  CNAME        custom domain (altergott.dev)
```

## Local preview

Any static server over `site/` works:

```
npx serve site
# or
python -m http.server -d site 5173
```

## Deploy

Push to `main`. `.github/workflows/deploy.yml` uploads `site/` straight to
GitHub Pages — no install, no build.

## Social card

`site/og-image.png` (1200×630) is rendered from `tools/og-card.html`:

```
chrome --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=2 --window-size=1200,630 \
  --virtual-time-budget=6000 --screenshot=card@2x.png tools/og-card.html
```

Then downscale the 2400×1260 capture to 1200×630 (Lanczos) and save over
`site/og-image.png`.
