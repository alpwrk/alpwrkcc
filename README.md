# alpwrk.cc

My personal site. No framework, no build step — just static files.
Live at [alpwrk.cc](https://alpwrk.cc).

## What it does

- Dark/light theme. Follows your system setting first, toggle it with the `#`
  button in the top right.
- Pulls what I'm currently listening to from the Last.fm API (or shows
  "do not disturb" when nothing's playing).
- A code-projects panel that slides up from the bottom and lists my GitHub repos
  live from the API — status dots (active/wip/archived), language bars and topics.
  Loads on first open and follows the theme (AMOLED black / white), crossfading
  with the rest of the page instead of hard-flashing.
- Results are cached in localStorage for 30 min, so opening the panel repeatedly
  doesn't burn through GitHub's 60 requests/hour limit. On a rate-limit or when
  offline it just keeps showing the cached view.
- Each theme has its own background image that only fades in once it's loaded,
  so it doesn't flicker when you switch.

## Layout

```
index.html   home + slide-up code-projects panel, sets the theme before first paint
main.js      last.fm now playing, theme toggle, background preload, github fetch + cache
style.css    css variables per theme, monospace home, scoped code-projects styles
imgs/        arch.jpg (dark) and ascnd.jpg (light)
```

## Running it locally

Any static server works — you need one so the Last.fm fetch doesn't hit CORS:

```sh
python -m http.server 8000
```

Then open [localhost:8000](http://localhost:8000).

## Editing

- **Links** on the home page are in `index.html` inside `nav.main-nav`.
- **Last.fm user** is in the fetch URL in `main.js` (`user=alpwrk`).
- **GitHub user** for the code-projects panel is `GITHUB_USERNAME` in `main.js`.
- **Cache duration** is `CACHE_TTL` in `main.js` (default 30 min); clear it by
  removing the `cp_repos_v1` key from localStorage.
- **Theme colors** are the CSS variables at the top of `style.css`. The
  code-projects panel has its own AMOLED/white palette scoped under
  `:root[data-theme="..."] #projects`.
