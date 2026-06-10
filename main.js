let reposLoaded = false;

function go(page) {
  if (page === 'projects') openProjects();
  else closeProjects();
}

function openProjects() {
  const el = document.getElementById('projects');
  el.classList.add('active');
  requestAnimationFrame(() =>
    requestAnimationFrame(() => el.classList.add('open')));
  if (!reposLoaded) {
    reposLoaded = true;
    loadRepos();
  }
}

function closeProjects() {
  const el = document.getElementById('projects');
  el.classList.remove('open');
  el.addEventListener('transitionend', function done(e) {
    if (e.propertyName !== 'transform') return;
    el.classList.remove('active');
    el.removeEventListener('transitionend', done);
  });
}

const GITHUB_USERNAME = 'alpwrk';
const API_BASE = 'https://api.github.com';

const WEBSITE_LINKS = {};

function getStatus(repo) {
  if (repo.archived) return 'archived';
  if (repo.topics && repo.topics.includes('wip')) return 'wip';
  return 'active';
}

function langColor(lang) {
  const map = {
    JavaScript: '#f7df1e', TypeScript: '#3178c6', Python: '#3572A5',
    Rust: '#dea584', Go: '#00ADD8', Java: '#b07219', 'C++': '#f34b7d',
    C: '#555555', HTML: '#e34c26', CSS: '#563d7c', Ruby: '#701516',
    Swift: '#F05138', Kotlin: '#A97BFF', Dart: '#00B4AB',
  };
  return map[lang] || '#666';
}

function linkifyDesc(text) {
  return text.replace(/\b([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g, (match) =>
    `<a href="https://${match}" target="_blank" onclick="event.stopPropagation()">${match}</a>`
  );
}

function langBar(langs) {
  const total = Object.values(langs).reduce((a, b) => a + b, 0);
  if (!total) return '';
  const segments = Object.entries(langs)
    .sort((a, b) => b[1] - a[1])
    .map(([lang, bytes]) => {
      const pct = (bytes / total * 100).toFixed(1);
      return `<span style="width:${pct}%;background:${langColor(lang)};height:100%;display:inline-block;" title="${lang} ${pct}%"></span>`;
    }).join('');
  const labels = Object.entries(langs)
    .sort((a, b) => b[1] - a[1])
    .map(([lang, bytes]) => {
      const pct = (bytes / total * 100).toFixed(1);
      return `<span class="tag lang" style="border-color:${langColor(lang)}33;color:${langColor(lang)}cc">
        <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${langColor(lang)};margin-right:4px;vertical-align:middle"></span>${lang} <span style="color:#444">${pct}%</span>
      </span>`;
    }).join('');
  return `
    <div style="width:100%;height:4px;border-radius:2px;overflow:hidden;display:flex;margin-bottom:8px;background:var(--langbar)">${segments}</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px">${labels}</div>`;
}

const CACHE_KEY = 'cp_repos_v1';
const CACHE_TTL = 30 * 60 * 1000;

function cardHTML(repo) {
  const status = getStatus(repo);
  const websiteUrl = WEBSITE_LINKS[repo.name] || repo.homepage || null;
  const topics = (repo.topics || []).filter(t => t !== 'wip');
  const langs = repo.langs || {};
  const created = repo.created_at ? new Date(repo.created_at).toLocaleDateString('en-US') : '—';

  return `
    <div class="project-card" onclick="window.open('${repo.html_url}','_blank')" style="cursor:pointer">
      <span class="project-name">${repo.name}</span>
      <span style="display:flex;align-items:center;gap:18px;grid-column:2;grid-row:1;justify-content:flex-end">
        ${websiteUrl
          ? `<a class="project-link" href="${websiteUrl}" target="_blank" onclick="event.stopPropagation()">${new URL(websiteUrl).hostname} ↗</a>`
          : ''
        }
        <span class="status-dot ${status}"></span>
      </span>
      <span style="font-family:'DM Mono',monospace;font-size:0.68rem;color:var(--muted);letter-spacing:0.04em;grid-column:2;grid-row:2;align-self:start;justify-self:end;white-space:nowrap">CREATED ${created}</span>
      <p class="project-desc">${repo.description ? linkifyDesc(repo.description) : '<span style="color:#333">NO DESCRIPTION</span>'}</p>
      <div class="project-meta">
        <div style="width:100%">${langBar(langs)}</div>
        ${topics.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
    </div>`;
}

function renderRepos(repos, grid) {
  grid.innerHTML = repos.map(cardHTML).join('');
}

function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); }
  catch { return null; }
}

async function loadRepos() {
  const grid = document.getElementById('grid');
  const cached = readCache();

  if (cached && cached.repos) renderRepos(cached.repos, grid);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return;

  try {
    let page = 1, repos = [];
    while (true) {
      const res = await fetch(`${API_BASE}/users/${GITHUB_USERNAME}/repos?per_page=100&page=${page}&sort=updated`);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      repos = repos.concat(data);
      if (data.length < 100) break;
      page++;
    }

    repos.sort((a, b) => {
      if (a.archived !== b.archived) return a.archived ? 1 : -1;
      return new Date(b.updated_at) - new Date(a.updated_at);
    });

    const langData = await Promise.all(
      repos.map(r =>
        fetch(`${API_BASE}/repos/${GITHUB_USERNAME}/${r.name}/languages`)
          .then(res => res.ok ? res.json() : {})
          .catch(() => ({}))
      )
    );

    const slim = repos.map((r, i) => ({
      name: r.name, html_url: r.html_url, archived: r.archived,
      topics: r.topics, homepage: r.homepage, description: r.description,
      created_at: r.created_at, langs: langData[i] || {},
    }));

    renderRepos(slim, grid);
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), repos: slim })); }
    catch {}

  } catch (e) {
    if (cached && cached.repos) return;
    grid.innerHTML = `<div class="project-card" style="color:#e55;font-family:'DM Mono',monospace;font-size:0.8rem">
      failed to load — github rate limit reached (60/h) or offline. (${e.message})
    </div>`;
  }
}

const BG_FADE_OUT = 460;
const BG_SWITCH_DELAY = 260;
let bgLoadedCount = 0;
['imgs/arch.jpg', 'imgs/ascnd.jpg'].forEach(src => {
  const img = new Image();
  img.onload = () => { bgLoadedCount++; maybeShowBg(); };
  img.src = src;
});

function maybeShowBg() {
  if (bgLoadedCount >= 2) document.documentElement.classList.add('bg-ready');
}

function toggleTheme() {
  const html = document.documentElement;
  const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
  if (document.getElementById('projects').classList.contains('open')) {
    html.dataset.theme = next;
    return;
  }
  html.classList.remove('bg-ready');
  setTimeout(() => {
    html.dataset.theme = next;
    setTimeout(maybeShowBg, BG_SWITCH_DELAY);
  }, BG_FADE_OUT);
}

async function fetchNowPlaying() {
  const el = document.querySelector('.spotify');
  if (!el) return;
  try {
    const res = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=alpwrk&api_key=6fbc18c8057df101241e83dc34760ac0&format=json&limit=1`
    );
    if (!res.ok) {
      console.error('[lastfm] HTTP error:', res.status);
      return;
    }
    const data = await res.json();
    if (data.error) {
      console.error('[lastfm] API error:', data.error, data.message);
      return;
    }
    const tracks = data.recenttracks?.track;
    const track = Array.isArray(tracks) ? tracks[0] : tracks;
    if (!track) {
      console.warn('[lastfm] No tracks found for user:', LASTFM_USER);
      return;
    }
    const nowPlaying = track['@attr']?.nowplaying === 'true';
    if (!nowPlaying) {
      el.textContent = 'do not disturb';
      return;
    }
    const artist = track.artist?.['#text'] ?? track.artist;
    const name = track.name;
    if (!artist || !name) {
      console.warn('[lastfm] Unexpected track format:', track);
      return;
    }
    el.textContent = `▶ ${artist} — ${name}`;
  } catch (err) {
    console.error('[lastfm] Fetch failed:', err);
  }
}

fetchNowPlaying();
maybeShowBg();