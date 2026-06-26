# Dental Health — Landing Page

A single-page dental clinic landing page built with **React + Vite + TypeScript + Tailwind CSS**. No external UI or icon libraries — the entire page lives in `src/App.tsx`.

## Features

- **Splash screen** — a 0→100 counter (2000ms) at the bottom-left, then a fade-out reveal.
- **Fixed navbar** — animated hamburger + slide-in mobile menu, desktop "Menu" pill.
- **Three full-screen sections**:
  1. **Hero** — feature bars + a large "Dental Care" hero card.
  2. **Smile Gallery** — a card mosaic with a services strip.
  3. **Implant Dentistry** — solid cards, image grid, and a tall image with glass overlays.
- **"Masked cards"** — sections 1 & 2 share one background image across multiple cards, each
  showing a different window into the same image (computed via `ResizeObserver`).
- **Staggered reveal** — sections fade/slide in via `IntersectionObserver`.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build
npm run preview  # preview the production build
```

## Project structure

```
index.html          # font links + title
src/
  main.tsx          # React entry
  App.tsx           # everything: hooks, components, sections
  index.css         # Tailwind + base styles
tailwind.config.js  # default config
```
