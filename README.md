# Innovexa Technologies — Website

A responsive, **multi-page**, **100% frontend-only** marketing website for Innovexa Technologies. HTML5, CSS3, and vanilla JavaScript — no backend, no database, no API, no build step. Black / Navy / Silver + blue-accent visual identity, with a premium software-house design pass (Inter typography, token-driven design system, scroll-reveal animation) and a cinematic particle-assembly splash screen.

## Splash screen

`index.html` only. A canvas-based particle system samples the real pixels of `assets/logo.jpg` (position + color) via an offscreen canvas, scatters that many particles uniformly across the viewport, then animates them along organic curved paths into the logo's actual shape and colors. Once assembled, it cross-fades into the crisp logo image, reveals "Innovexa Technologies" underneath, holds briefly, then fades out to reveal the already-loaded Home page.

- Shown once per browser session (`sessionStorage`), only on first visit to Home — navigating back to Home later in the same session skips it instantly.
- Respects `prefers-reduced-motion`: skips the canvas/particles entirely and shows a simple, fast logo + name fade instead.
- Falls back gracefully if the canvas pixel-read is blocked (e.g. opening the file directly via `file://` without a local server can taint the canvas) — you still get a clean logo + name fade, just without the particle effect.
- A 7-second safety timeout guarantees the splash can never get stuck and block the site.
- Logic lives entirely in `js/splash.js`; appearance in the "SPLASH SCREEN" section of `css/style.css`.

## Frontend-only

Per the strict frontend-only requirement, there is **no backend of any kind** — the contact form validates client-side and simulates a submission (short delay → success message → reset) with no network request, no PHP, no API. There is no database, admin panel, authentication, or server-side logic anywhere in the project.

## Pages

| Page | File | Contains |
|---|---|---|
| Home | `index.html` | Splash screen, hero, condensed About preview, top-3 services preview, CTA banner |
| About | `about.html` | Full About section, "Why Innovexa" section, CTA banner |
| Services | `services.html` | All 6 services (numbered 01–06, App Development → Web Development → AI Automation → remaining), "How We Work" process steps, CTA banner |
| Industries | `industries.html` | 6 industry verticals (Healthcare, FinTech, E-commerce, Real Estate, Education, Logistics) each with a short pitch and relevant service tags, CTA banner |
| Contact | `contact.html` | Contact details, socials, trust badges, frontend-only contact form (Name, Email, Phone, Subject, Message) |

Every page shares the same header, footer, fonts, colors, spacing and components.

> **Industries content is realistic placeholder copy** — six verticals a software house would plausibly serve, written to be genuinely useful as a starting point, but not based on real case studies or client data. Swap in real client/industry specifics whenever you have them.
>
> **No dedicated Products/Projects/Reviews/Blog pages yet** — those are a larger, separate scope (new content, new nav items, new card templates) not yet built. Happy to add them once priorities/content are confirmed.

## Design system

- **Typography**: Inter (400–800) for every heading, body, nav, button and form element. IBM Plex Mono is kept only where it reads as intentionally technical — the hero's code-window mockup and small eyebrow labels.
- **Tokens** (`css/style.css` `:root`): color palette, spacing/radius scale, a 3-tier shadow scale, and a single easing curve with two durations reused everywhere instead of one-off values.
- **Scroll reveal**: sections and cards fade/rise into place on scroll (`.reveal` + `IntersectionObserver`), with a safety-net fallback and full reduced-motion support.
- **Navbar**: transparent at the top, gains a blurred background + shadow once scrolled; active/hover states animate via `transform: scaleX()`.
- **Page transitions**: clicking an internal link fades the current page out briefly before navigating — real, separate page loads, no JS router, so refresh and back/forward work normally.

## Pages

| Page | File | Contains |
|---|---|---|
| Home | `index.html` | Hero, condensed About preview, top-3 services preview, CTA banner |
| About | `about.html` | Full About section, "Why Innovexa" section, CTA banner |
| Services | `services.html` | All 6 services, "How We Work" process steps, CTA banner |
| Contact | `contact.html` | Contact details, socials, trust badges, contact form |

Every page shares the same header, footer, fonts, colors, spacing and components — nothing was redesigned, only redistributed.

> **No dedicated Products page:** the current site doesn't have a product-catalog section (it's a services/agency business), so a Products page wasn't invented. If you have real product/portfolio content you want on its own page, send it over and it can be added the same way as the other pages.

## Navigation behaviour

- The navbar links to real files (`index.html`, `about.html`, `services.html`, `contact.html`) — **not** anchor scrolling. Each click is a full page navigation with its own URL, its own `<title>`, and its own meta description.
- Browser refresh, back/forward, and direct linking all work normally because these are real, separate HTML documents — no JavaScript router is required or used.
- The current page is auto-highlighted in the navbar (`js/script.js`) by matching the URL against each nav link, so `about.html` lights up "About", etc. — works automatically on any page without per-page markup.
- A subtle one-time fade/slide-in (`.page-transition` in `css/style.css`) plays on each page load. It respects `prefers-reduced-motion`.
- The mobile menu uses the exact same links, so navigation is identical (and closes automatically after a tap) on phones and tablets.

## Clean URLs (optional)

By default every link points to a `.html` file (e.g. `about.html`) — this is the most compatible option and works on **any** host with zero configuration, including opening the files directly.

If you'd like the address bar to show `/about` instead of `/about.html`, three ready-to-use configs are included — add whichever matches your host, no code changes needed:

- **Apache / shared hosting (cPanel etc.):** `.htaccess` (already in the project root)
- **Netlify:** `_redirects`
- **Vercel:** `vercel.json`

These are opt-in — the site works correctly whether or not you use them.

## Structure

```
innovexa/
├── index.html            Home
├── about.html             About
├── services.html           Services
├── contact.html             Contact
├── css/
│   └── style.css              Design tokens, shared layout, page-hero + CTA-banner components
├── js/
│   └── script.js               Mobile nav, active-link detection, page transition, form validation
├── php/
│   └── contact.php               Server-side validation + emails the enquiry
├── assets/
│   └── logo.jpg                    Company logo
├── .htaccess                        Optional: clean URLs on Apache
├── _redirects                        Optional: clean URLs on Netlify
├── vercel.json                        Optional: clean URLs on Vercel
└── README.md
```

## Running locally

```bash
# Any static file server works for browsing all four pages
python3 -m http.server 8000

# Full preview including the PHP contact form
php -S localhost:8000
```

Then open `http://localhost:8000`.

## Contact form

Unchanged from the original: `js/script.js` validates client-side and POSTs to `php/contact.php`, which re-validates and emails `innovexa.technologies01@gmail.com` via PHP's `mail()`. See the code comments in `contact.php` if you need to switch to SMTP/PHPMailer on your host.

## Customizing

- **Colors / fonts**: CSS variables at the top of `css/style.css` (`:root`) — unchanged from the original.
- **Per-page copy**: lives directly in each page's HTML.
- **Adding a page**: copy the header/footer block from an existing page, drop in your section markup, add a link in the navbar of all four pages (and the footer "Company" column).
