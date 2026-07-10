# Mustang Kyidug USA — Website Redesign

A complete modern redesign of **mustangkyidug.com**. Pure HTML/CSS/JS — no build
step, no framework, no dependencies to install. Upload the folder to any static
host and it works.

## Pages

| File | Page |
|---|---|
| `index.html` | Home — full-screen hero, mission, pillars, festivals preview, photo filmstrip |
| `about.html` | About — story, mission & vision, what we do |
| `origin.html` | History — Kingdom of Lo, animated timeline, migration story |
| `people.html` | Community — Loba & Thakali peoples, programs in the USA |
| `culture.html` | Culture — Buddhism, language, thangka, dress, cuisine, festivals |
| `events.html` | Events — Losar, Tiji, Chhongu, Dhazang, ways to get involved |
| `tourism.html` | Tourism — Lo Manthang, Muktinath, Kagbeni, treks, travel tips |
| `gallery.html` | Gallery — 27-photo lightbox gallery + 6 community films |
| `contact.html` | Contact — info cards, form, embedded map |

Page filenames match the old site (`origin.html`, `people.html`, …) so existing
links and search results keep working after deployment.

## Features

- **Design system** inspired by Mustang itself: monastery clay red, ochre gold,
  Himalayan sky blue, and the five prayer-flag colours as a signature strip.
- **Animations**: Ken Burns hero, staggered headline reveal, scroll-reveal
  sections, animated counters, auto-scrolling photo filmstrip, hover lifts.
  All animations respect `prefers-reduced-motion`.
- **Responsive**: sticky glass header on scroll, full-screen mobile menu,
  fluid type with `clamp()`, grids that collapse gracefully to one column.
- **Gallery**: masonry photo grid with a keyboard-navigable lightbox
  (arrow keys / Escape) and privacy-friendly `youtube-nocookie` video embeds.
- **Accessibility**: semantic landmarks, alt text on photographs, visible
  focus rings, `aria-current` page marking, reduced-motion support.
- **SEO**: unique titles and meta descriptions per page.

## Structure

```
mustangkyidug-redesign/
├── index.html … contact.html   (9 pages)
├── css/style.css               (single shared stylesheet / design system)
├── js/main.js                  (nav, reveals, counters, lightbox, form)
├── images/                     (original site photos, mustang1–27.jpg)
├── favicon.svg
└── README.md
```

## Run locally

Any static server works, e.g.:

```
python -m http.server 8000
```

then open <http://localhost:8000>. (Opening `index.html` directly from disk
also works.)

## Notes & next steps

- **Contact form** currently opens the visitor's email app pre-addressed to
  `mustangkyidug@gmail.com`. For true in-page submission, create a free
  [Formspree](https://formspree.io) form and point the form's `action` at it
  (then remove the `mailto:` logic in `js/main.js`).
- **Fonts** (Fraunces + Manrope) load from Google Fonts. For a fully
  self-hosted site, download the fonts and swap the `<link>` tags for
  `@font-face` rules.
- **Map**: the contact page embeds Google Maps by address query
  (no API key needed). A "Get directions" button is provided as a fallback.
- `images/mustang-main.jpg` from the old site is actually an **AVIF** file
  mislabelled as `.jpg` (it may not display in all browsers). The redesign
  does not use it — `mustang3.jpg` is the new hero.
- To update gallery photos: drop new files in `images/` and add a matching
  `<a data-lightbox>` block in `gallery.html`.
