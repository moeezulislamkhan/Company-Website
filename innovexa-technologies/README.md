# Innovexa Technologies — Website

A responsive, **multi-page** marketing website for Innovexa Technologies, built with HTML5, CSS3, vanilla JavaScript and a PHP contact-form handler. Black / Navy / Silver + blue-accent visual identity, now with a premium software-house design pass: Inter typography, a token-driven design system, scroll-reveal animation, and polished hover/motion throughout.

## Design system (this pass)

- **Typography**: Inter (400–800) for every heading, body, nav, button and form element. IBM Plex Mono is kept only where it reads as intentionally technical — the hero's code-window mockup and the small dot-marker eyebrow labels.
- **Tokens** (`css/style.css` `:root`): color palette, spacing/radius scale, a 3-tier shadow scale (`--shadow-sm/md/lg` + a blue `--shadow-glow`), and a single easing curve (`--ease`) with two durations (`--duration-fast` 220ms for micro-interactions, `--duration-base` 480ms / `--duration-slow` 700ms for section-level motion) reused everywhere instead of one-off values.
- **Hero**: layered blurred glow orbs + an animated background grid, with the headline, subhead, CTAs and badges entering in a staggered sequence on load.
- **Scroll reveal**: sections and cards fade/rise into place the moment they enter the viewport (`.reveal` + `IntersectionObserver` in `js/script.js`), with staggered card groups via a `--reveal-i` custom property set inline in the HTML. Fully skipped in favor of static, fully-visible content for `prefers-reduced-motion` users, and a 2.5s JS safety-net ensures nothing is ever left stuck invisible if the observer misbehaves.
- **Navbar**: transparent at the top of the page, gains a blurred background + shadow once scrolled (`.is-scrolled`, toggled in JS); active/hover link states animate via `transform: scaleX()` rather than `width` for smoother, GPU-friendly motion.
- **Cards & buttons**: consistent hover language (lift + shadow + border/icon accent) across service cards, "why us" cards, the glow-card, and process steps; a small reusable button system (`btn-primary` / `btn-ghost` / `btn-text`) with hover, active, and disabled states, and an arrow icon that nudges right on hover.
- **Page transitions**: clicking an internal link fades the current page out briefly before navigating, so moving between pages feels continuous rather than a hard cut. Real, separate page loads — no JS router — so refresh and back/forward still work exactly as expected.
- **Responsive**: tuned down to 320px, with spacing (not just type) tightened at small sizes rather than just shrinking the desktop layout.

All of this is additive polish on the existing structure and copy — no content, business information, branding, or page architecture was changed to make room for it.

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
