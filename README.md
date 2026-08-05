# Robbie Donaldson — Artist Site

One-page site for Robbie Donaldson, country folk singer-songwriter in New York City. Built with Next.js, Tailwind CSS and Framer Motion; deploys as a static export to GitHub Pages.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Editing the site (no code needed)

Everything a musician needs to change lives in `/content` as plain JSON:

- `content/artist.json` — name, tagline, bio, booking email, social links, booking quick-facts, press photo list
- `content/tracks.json` — songs (title, note, audio URL, cover image, streaming links)
- `content/shows.json` — gigs; empty array `[]` shows the "just landed in New York" state with booking/newsletter buttons. Add entries like:
  ```json
  {
    "id": "jalopy-oct",
    "dateISO": "2026-10-14",
    "city": "Brooklyn, NY",
    "venue": "Jalopy Theatre",
    "ticketUrl": "https://...",
    "status": "upcoming"
  }
  ```
- `content/street.json` — the Around Town section: busking spots (place, when, note) and the tip jar links
- `content/media.json` — video and photo entries

## Placeholders to replace before going live

- [ ] Track audio URLs in `tracks.json` (currently SoundHelix demo audio) and cover art SVGs in `public/images/`
- [ ] All social URLs and the booking email in `artist.json` (currently guessed handles)
- [ ] Venmo / Cash App links in `street.json`
- [ ] Busking spots in `street.json` (current entries are examples)
- [ ] `canonicalUrl` in `artist.json` once a real domain exists
- [ ] Hero/press photos in `public/images/` if newer shots exist
- [ ] Press quotes in `artist.json` — leave empty until real ones exist; the section hides itself

## Media guidance

- Track covers and photos: `public/images` (WebP/AVIF preferred for new assets)
- About video: `public/video/placeholder-video.mp4` — swap for a real live take
- Keep any looping video short (6-10s), muted and compressed

## Production build

```bash
npm run typecheck
npm run lint
npm run build
```

Static output lands in `out/`. The GitHub Actions workflow in `.github/workflows/deploy.yml` publishes to GitHub Pages (site is served under the `/robbie-site` base path).

## Contact form

The booking form opens the visitor's email client (mailto) with the message pre-filled, so it works on static hosting with zero backend. Swap in Formspree or similar later if a real inbox flow is wanted.

## SEO included

- Metadata and OpenGraph in `app/layout.tsx`
- `robots.txt` and `sitemap.xml`
- Schema.org JSON-LD for `MusicGroup`, `MusicRecording` and `Event`
