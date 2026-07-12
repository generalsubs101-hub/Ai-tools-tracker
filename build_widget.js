const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data.json');
const allData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const data = allData.filter(d => !d.installed);
const installedCount = allData.length - data.length;

const today = new Date().toISOString().slice(0, 10);

const html = `<h2 class="sr-only">AI tools tracker: a filterable, paginated table of trending MCP servers, plugins, skills, and connectors, sorted by stars, with install buttons.</h2>
<div style="display:flex; gap:8px; align-items:center; margin-bottom:12px; flex-wrap:wrap;">
  <input id="q" type="text" placeholder="Search name or description" style="flex:1; min-width:180px;" />
  <select id="typeFilter" style="width:130px;">
    <option value="">All types</option>
    <option value="MCP">MCP</option>
    <option value="Plugin">Plugin</option>
    <option value="Skill">Skill</option>
    <option value="Connector">Connector</option>
  </select>
  <select id="apiFilter" style="width:130px;">
    <option value="">API: any</option>
    <option value="No API">No API</option>
    <option value="Needs API">Needs API</option>
  </select>
</div>
<div id="summary" style="font-size:13px; color:var(--text-secondary); margin-bottom:12px;"></div>
<table style="width:100%; table-layout:fixed; border-collapse:collapse; font-size:12px;">
  <colgroup>
    <col style="width:11%;" />
    <col style="width:23%;" />
    <col style="width:21%;" />
    <col style="width:13%;" />
    <col style="width:8%;" />
    <col style="width:8%;" />
    <col style="width:8%;" />
    <col style="width:8%;" />
  </colgroup>
  <thead>
    <tr style="border-bottom:0.5px solid var(--border);">
      <th style="text-align:left; padding:6px; font-weight:500; color:var(--text-secondary);">Name</th>
      <th style="text-align:left; padding:6px; font-weight:500; color:var(--text-secondary);">Description</th>
      <th style="text-align:left; padding:6px; font-weight:500; color:var(--text-secondary);">How to use</th>
      <th style="text-align:left; padding:6px; font-weight:500; color:var(--text-secondary);">API</th>
      <th style="text-align:left; padding:6px; font-weight:500; color:var(--text-secondary);">Type</th>
      <th style="text-align:left; padding:6px; font-weight:500; color:var(--text-secondary);">Stars</th>
      <th style="text-align:center; padding:6px; font-weight:500; color:var(--text-secondary);">Link</th>
      <th style="text-align:center; padding:6px; font-weight:500; color:var(--text-secondary);">Install</th>
    </tr>
  </thead>
  <tbody id="rows"></tbody>
</table>
<div style="display:flex; align-items:center; gap:12px; margin-top:12px; justify-content:center;">
  <button id="prevPage" style="padding:4px 10px;">Prev</button>
  <span id="pageInfo" style="font-size:12px; color:var(--text-secondary);"></span>
  <button id="nextPage" style="padding:4px 10px;">Next</button>
</div>
<script>
const DATA = ${JSON.stringify(data)};
const TODAY = ${JSON.stringify(today)};
const INSTALLED_COUNT = ${installedCount};
const PAGE_SIZE = 8;
let currentPage = 1;

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function fmtStars(n) {
  return Number(n).toLocaleString();
}

function apiColor(v) {
  return v === 'No API' ? 'var(--text-success)' : 'var(--text-warning)';
}

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
    tr.style.borderBottom = '0.5px solid var(--border)';
    const wrap = 'padding:6px; vertical-align:top; overflow-wrap:break-word; word-break:break-word;';
    tr.innerHTML =
      '<td style="' + wrap + ' font-weight:500;">' + esc(d.name) + '</td>' +
      '<td style="' + wrap + ' color:var(--text-secondary);">' + esc(d.description) + '</td>' +
      '<td style="' + wrap + ' color:var(--text-secondary);">' + esc(d.howToUse) + '</td>' +
      '<td style="' + wrap + '"><span style="color:' + apiColor(d.needsApi) + '; font-weight:500;">' + esc(d.needsApi) + '</span><br/><span style="font-size:11px; color:var(--text-muted);">' + esc(d.apiNote || '') + '</span></td>' +
      '<td style="' + wrap + '">' + esc(d.nature) + '</td>' +
      '<td style="' + wrap + '">' + fmtStars(d.stars) + ' <i class="ti ti-star" style="font-size:12px;" aria-hidden="true"></i></td>';

    const linkTd = document.createElement('td');
    linkTd.style.padding = '6px';
    linkTd.style.textAlign = 'center';
    linkTd.style.verticalAlign = 'top';
    const linkBtn = document.createElement('button');
    linkBtn.setAttribute('aria-label', 'Open link');
    linkBtn.style.padding = '4px 6px';
    linkBtn.innerHTML = '<i class="ti ti-external-link" style="font-size:16px;" aria-hidden="true"></i>';
    linkBtn.addEventListener('click', () => openLink(d.link));
    linkTd.appendChild(linkBtn);
    tr.appendChild(linkTd);

    const installTd = document.createElement('td');
    installTd.style.padding = '6px';
    installTd.style.textAlign = 'center';
    installTd.style.verticalAlign = 'top';
    const installBtn = document.createElement('button');
    installBtn.setAttribute('aria-label', 'Install ' + d.name);
    installBtn.style.padding = '4px 6px';
    installBtn.innerHTML = '<i class="ti ti-download" style="font-size:14px;" aria-hidden="true"></i>';
    installBtn.addEventListener('click', () => sendPrompt('Install ' + d.name + ' for me: ' + (d.installCommand || d.link)));
    installTd.appendChild(installBtn);
    tr.appendChild(installTd);

    rowsEl.appendChild(tr);
  }

  document.getElementById('summary').textContent = filtered.length + ' of ' + DATA.length + ' not yet installed, sorted by stars \\u00b7 ' + INSTALLED_COUNT + ' installed (hidden) \\u00b7 last run ' + TODAY;
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
</script>`;

process.stdout.write(html);
