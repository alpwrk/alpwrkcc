# alpwrk.cc

My personal site. No framework, no build step — just static files.
Live at [alpwrk.cc](https://alpwrk.cc).

## What it does

- Dark/light theme. Follows your system setting first, toggle it with the `#`
  button in the top right. A hand-drawn arrow points at the button on first
  load and fades itself out after two seconds.
- The home heading is the alpwrk wordmark, swapped per theme (inverted PNG for
  light). It's a background image on the `<h1>` with the text pushed off-screen,
  so "alpwrk" is still there for screen readers and if the image never loads.
- A code-projects panel that slides up from the bottom and lists my GitHub repos
  live from the API — status dots (active/wip/archived), language bars and topics.
  Loads on first open and follows the theme (AMOLED black / white), crossfading
  with the rest of the page instead of hard-flashing.
- Results are cached in localStorage for 30 min, so opening the panel repeatedly
  doesn't burn through GitHub's 60 requests/hour limit. On a rate-limit or when
  offline it just keeps showing the cached view.
- Both wordmark variants are preloaded and only fade in once they're ready, so
  switching themes doesn't flash. The toggle stays disabled for the length of
  that crossfade.

## Layout

```
index.html   home + slide-up code-projects panel, sets the theme before first paint
main.js      theme toggle, wordmark preload, github fetch + cache
style.css    css variables per theme, monospace home, scoped code-projects styles
imgs/        alpwrkBANNERv2.png (dark), alpwrkBANNERv2-inv.png (light)
```

The two wordmark PNGs have no alpha — the dark one is black-on-black, the light
one white-on-white. That only works because they match `--bg` exactly. Putting
the wordmark on any other colour needs a transparent export.

## Running it locally

Any static server works — you need one so the GitHub fetch doesn't hit CORS
(over `file://` the origin is `null` and the API rejects it):

```sh
python -m http.server 8000
```

Then open [localhost:8000](http://localhost:8000).

## Editing

- **Links** on the home page are in `index.html` inside `nav.main-nav`.
- **Tagline** under the wordmark is the `p.tagline` line in `index.html`.
- **Wordmark size** is `h1.name` in `style.css` (plus a smaller value in the
  `max-width: 600px` block).
- **GitHub user** for the code-projects panel is `GITHUB_USERNAME` in `main.js`.
- **Cache duration** is `CACHE_TTL` in `main.js` (default 30 min); clear it by
  removing the `cp_repos_v1` key from localStorage.
- **Theme colors** are the CSS variables at the top of `style.css`. The
  code-projects panel has its own AMOLED/white palette scoped under
  `:root[data-theme="..."] #projects`.
- **Crossfade timing** on theme switch is `BG_FADE_OUT` / `BG_SWITCH_DELAY` /
  `BG_FADE_IN` in `main.js`.
