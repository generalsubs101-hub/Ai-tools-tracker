const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const today = new Date().toISOString().slice(0, 10);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>AI Tools Tracker</title>
<meta name="description" content="Auto-updating tracker of trending Claude/AI coding tools, MCP servers, plugins and skills." />
<style>
  :root {
    color-scheme: light dark;
    --bg: #ffffff;
    --surface: #f7f7f5;
    --border: #e3e2dd;
    --text: #1a1a18;
    --text-secondary: #5f5e5a;
    --text-muted: #888780;
    --accent: #185fa5;
    --success: #3b6d11;
    --warning: #854f0b;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #16160f;
      --surface: #201f18;
      --border: #3a3930;
      --text: #f1efe8;
      --text-secondary: #b4b2a9;
      --text-muted: #888780;
      --accent: #85b7eb;
      --success: #97c459;
      --warning: #fac775;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 2rem 1.5rem 4rem;
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 14px;
    line-height: 1.6;
  }
  .wrap { max-width: 1100px; margin: 0 auto; }
  h1 { font-size: 22px; font-weight: 500; margin: 0 0 4px; }
  .subtitle { color: var(--text-secondary); font-size: 14px; margin: 0 0 4px; }
  .meta { color: var(--text-muted); font-size: 12px; margin: 0 0 24px; }
  .controls { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; flex-wrap: wrap; }
  input, select {
    height: 36px;
    padding: 0 10px;
    border: 0.5px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
    color: var(--text);
    font-size: 13px;
  }
  #q { flex: 1; min-width: 200px; }
  #typeFilter, #apiFilter { width: 140px; }
  #summary { font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; }
  .table-wrap { overflow-x: auto; border: 0.5px solid var(--border); border-radius: 12px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th {
    text-align: left;
    padding: 10px 12px;
    font-weight: 500;
    color: var(--text-secondary);
    border-bottom: 0.5px solid var(--border);
    background: var(--surface);
    white-space: nowrap;
  }
  td { padding: 10px 12px; vertical-align: top; border-bottom: 0.5px solid var(--border); }
  tr:last-child td { border-bottom: none; }
  .group-row td {
    padding: 10px 12px 4px;
    font-size: 11px;
    color: var(--text-muted);
    border-bottom: none;
    background: transparent;
  }
  .name { font-weight: 500; }
  .desc, .howto { color: var(--text-secondary); min-width: 200px; }
  .api-good { color: var(--success); font-weight: 500; }
  .api-warn { color: var(--warning); font-weight: 500; }
  .note { font-size: 11px; color: var(--text-muted); display: block; margin-top: 2px; }
  .added-note { font-size: 11px; color: var(--text-muted); display: block; margin-top: 2px; }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }
  .icon-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    border: 0.5px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
    color: var(--text);
    font-size: 12px;
    cursor: pointer;
    white-space: nowrap;
  }
  .icon-btn:hover { border-color: var(--text-muted); }
  .icon-btn:active { transform: scale(0.98); }
  .icon-btn:disabled { opacity: 0.4; cursor: default; }
  .pagination { display: flex; align-items: center; gap: 12px; margin-top: 12px; justify-content: center; }
  .pagination span { font-size: 12px; color: var(--text-secondary); }
  .badge {
    display: inline-block;
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 999px;
    background: var(--surface);
    border: 0.5px solid var(--border);
    color: var(--text-secondary);
  }
  footer { margin-top: 24px; font-size: 12px; color: var(--text-muted); }
</style>
</head>
<body>
<div class="wrap">
  <h1>AI Tools Tracker</h1>
  <p class="subtitle">Trending MCP servers, Claude Code plugins, skills, and connectors.</p>
  <p class="meta">Last updated ${today} &middot; <a href="https://github.com/generalsubs101-hub/Ai-tools-tracker" target="_blank" rel="noopener">source</a> &middot; <a href="./data.json" target="_blank" rel="noopener">raw data.json</a></p>

  <div class="controls">
    <input id="q" type="text" placeholder="Search name or description" />
    <select id="typeFilter">
      <option value="">All types</option>
      <option value="MCP">MCP</option>
      <option value="Plugin">Plugin</option>
      <option value="Skill">Skill</option>
      <option value="Connector">Connector</option>
    </select>
    <select id="apiFilter">
      <option value="">API: any</option>
      <option value="No API">No API</option>
      <option value="Needs API">Needs API</option>
    </select>
  </div>
  <div id="summary"></div>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th>How to use</th>
          <th>API</th>
          <th>Type</th>
          <th>Stars</th>
          <th>Link</th>
          <th>Install command</th>
        </tr>
      </thead>
      <tbody id="rows"></tbody>
    </table>
  </div>
  <div class="pagination">
    <button class="icon-btn" id="prevPage">Prev</button>
    <span id="pageInfo"></span>
    <button class="icon-btn" id="nextPage">Next</button>
  </div>
  <footer>Auto-updated daily by a scheduled agent run. Entries are appended, never removed. Sorted by stars, highest first.</footer>
</div>

<script>
const DATA = ${JSON.stringify(data)};

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function fmtStars(n) {
  return Number(n).toLocaleString();
}

function copyCmd(btn, cmd) {
  navigator.clipboard.writeText(cmd).then(() => {
    const original = btn.textContent;
    btn.textContent = 'Copied';
    setTimeout(() => { btn.textContent = original; }, 1500);
  });
}

const PAGE_SIZE = 10;
let currentPage = 1;

function render() {
  const q = document.getElementById('q').value.trim().toLowerCase();
  const type = document.getElementById('typeFilter').value;
  const api = document.getElementById('apiFilter').value;

  const filtered = DATA.filter(d => {
    if (type && d.nature !== type) return false;
    if (api && d.needsApi !== api) return false;
    if (q && !(d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q))) return false;
    return true;
  }).slice().sort((a, b) => b.stars - a.stars);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  currentPage = Math.min(Math.max(1, currentPage), totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const rowsEl = document.getElementById('rows');
  rowsEl.innerHTML = '';

  for (const d of pageItems) {
    const tr = document.createElement('tr');
    const apiClass = d.needsApi === 'No API' ? 'api-good' : 'api-warn';
    tr.innerHTML =
      '<td class="name">' + esc(d.name) + (d.installed ? ' <span class="badge">installed</span>' : '') + '<span class="added-note">Added ' + esc(d.dateAdded) + '</span></td>' +
      '<td class="desc">' + esc(d.description) + '</td>' +
      '<td class="howto">' + esc(d.howToUse) + '</td>' +
      '<td><span class="' + apiClass + '">' + esc(d.needsApi) + '</span><span class="note">' + esc(d.apiNote || '') + '</span></td>' +
      '<td>' + esc(d.nature) + '</td>' +
      '<td>' + fmtStars(d.stars) + '</td>' +
      '<td><a href="' + esc(d.link) + '" target="_blank" rel="noopener">Open</a></td>';

    const installTd = document.createElement('td');
    const btn = document.createElement('button');
    btn.className = 'icon-btn';
    btn.textContent = 'Copy command';
    btn.addEventListener('click', () => copyCmd(btn, d.installCommand || d.link));
    installTd.appendChild(btn);
    tr.appendChild(installTd);

    rowsEl.appendChild(tr);
  }

  document.getElementById('summary').textContent = filtered.length + ' of ' + DATA.length + ' tools shown, sorted by stars';
  document.getElementById('pageInfo').textContent = 'Page ' + currentPage + ' of ' + totalPages;
  document.getElementById('prevPage').disabled = currentPage <= 1;
  document.getElementById('nextPage').disabled = currentPage >= totalPages;
}

document.getElementById('q').addEventListener('input', () => { currentPage = 1; render(); });
document.getElementById('typeFilter').addEventListener('change', () => { currentPage = 1; render(); });
document.getElementById('apiFilter').addEventListener('change', () => { currentPage = 1; render(); });
document.getElementById('prevPage').addEventListener('click', () => { currentPage -= 1; render(); });
document.getElementById('nextPage').addEventListener('click', () => { currentPage += 1; render(); });
render();
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log('Wrote index.html');
