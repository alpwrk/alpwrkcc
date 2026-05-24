const projects = [
  { title: 'alpwrk.cc', url: 'https://alpwrk.cc', desc: 'My personal portfolio website with GitHub API integration.', tags: ['html', 'css', 'js', 'github-api'] },
  { title: 'wavr.cc infra', url: '#', desc: 'Self-hosted infrastructure: Vaultwarden, SearXNG, Cloudflare Tunnels & Access.', tags: ['docker', 'cloudflare', 'self-hosting', 'truenas'] },
  { title: 'AI data pipeline', url: '#', desc: 'Local AI pipeline using Ollama (qwen2.5) + OpenRouter API with Python preprocessing.', tags: ['python', 'ollama', 'ai', 'linux'] },
  { title: 'Minecraft modpack', url: '#', desc: 'Fabric modpack with Distant Horizons, C2ME, Tectonic on CachyOS.', tags: ['java', 'fabric', 'minecraft', 'linux'] },
  { title: 'dotfiles', url: 'https://github.com/alpwrk', desc: 'My CachyOS/Arch Linux configuration files. Zsh, Neovim, Hyprland.', tags: ['linux', 'zsh', 'shell', 'arch'] },
];

let activeTag = null;
const allTags = [...new Set(projects.flatMap(p => p.tags))].sort();

function renderTags() {
  const el = document.getElementById('tagFilter');
  if (!el) return;
  el.innerHTML = allTags.map(t =>
    `<span class="tag${activeTag === t ? ' active' : ''}" onclick="filterTag('${t}')">${t}</span>`
  ).join('');
}

function renderProjects() {
  const el = document.getElementById('projectsList');
  if (!el) return;
  const filtered = activeTag ? projects.filter(p => p.tags.includes(activeTag)) : projects;
  el.innerHTML = filtered.map(p => `
    <div class="project-card">
      <a class="project-title" href="${p.url}"${p.url !== '#' ? ' target="_blank" rel="noopener"' : ''}>${p.title}</a>
      <p class="project-desc">${p.desc}</p>
      <div class="project-tags">${p.tags.map(t => `<span class="project-tag" onclick="filterTag('${t}')">${t}</span>`).join('')}</div>
    </div>`).join('');
}

function filterTag(tag) {
  activeTag = activeTag === tag ? null : tag;
  renderTags();
  renderProjects();
}

function go(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(page).classList.add('active');
}

function toggleTheme() {
  const html = document.documentElement;
  html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
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

renderTags();
renderProjects();
fetchNowPlaying();