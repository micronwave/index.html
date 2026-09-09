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

`site/og-image.png` (1200x630) is rendered from `tools/og-card.html`:

```
python tools/render-og.py
```

Headless Chrome draws the card at 2x and it is downsampled to 1200x630. The
red bar is laid in afterwards, against ink measured off the raster, so it
starts on the cap of "Aaron" and ends on the last of "altergott.dev" no matter
what the type is set at. Pillow is the only dependency.
