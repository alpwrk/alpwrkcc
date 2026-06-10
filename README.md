# alpwrk.cc

My personal site. No framework, no build step — just static files.
Live at [alpwrk.cc](https://alpwrk.cc).

## What it does

- Dark/light theme. Follows your system setting first, toggle it with the `#`
  button in the top right.
- Pulls what I'm currently listening to from the Last.fm API (or shows
  "do not disturb" when nothing's playing).
- A code-projects page that lists my GitHub repos live from the API — status
  dots (active/wip/archived), language bars and topics. Loads on first open.
- Each theme has its own background image that only fades in once it's loaded,
  so it doesn't flicker when you switch.

## Layout

```
index.html   home + code-projects page, sets the theme before first paint
main.js      last.fm now playing, theme toggle, background preload, github fetch
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
- **GitHub user** for the code-projects page is `GITHUB_USERNAME` in `main.js`.
- **Theme colors** are the CSS variables at the top of `style.css`. The
  code-projects page has its own dark palette scoped under `#projects`.
