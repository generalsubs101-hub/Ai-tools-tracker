const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data.json');
const allData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const data = allData.filter(d => !d.installed);
const installedCount = allData.length - data.length;

const today = new Date().toISOString().slice(0, 10);

const html = `<h2 class="sr-only">AI tools tracker: a filterable table of trending MCP servers, plugins, skills, and connectors, with install buttons.</h2>
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
<div style="overflow-x:auto;">
<table style="width:100%; border-collapse:collapse; font-size:13px;">
  <thead>
    <tr style="border-bottom:0.5px solid var(--border);">
      <th style="text-align:left; padding:6px 8px; font-weight:500; color:var(--text-secondary);">Name</th>
      <th style="text-align:left; padding:6px 8px; font-weight:500; color:var(--text-secondary); min-width:180px;">Description</th>
      <th style="text-align:left; padding:6px 8px; font-weight:500; color:var(--text-secondary); min-width:180px;">How to use</th>
      <th style="text-align:left; padding:6px 8px; font-weight:500; color:var(--text-secondary);">API</th>
      <th style="text-align:left; padding:6px 8px; font-weight:500; color:var(--text-secondary);">Type</th>
      <th style="text-align:left; padding:6px 8px; font-weight:500; color:var(--text-secondary);">Stars</th>
      <th style="text-align:center; padding:6px 8px; font-weight:500; color:var(--text-secondary);">Link</th>
      <th style="text-align:center; padding:6px 8px; font-weight:500; color:var(--text-secondary);">Install</th>
    </tr>
  </thead>
  <tbody id="rows"></tbody>
</table>
</div>
<script>
const DATA = ${JSON.stringify(data)};
const TODAY = ${JSON.stringify(today)};
const INSTALLED_COUNT = ${installedCount};

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
  });

  const groups = new Map();
  for (const d of filtered) {
    const key = d.dateAdded + '|' + (d.source || '');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(d);
  }
  const keys = Array.from(groups.keys()).sort().reverse();

  const rowsEl = document.getElementById('rows');
  rowsEl.innerHTML = '';

  for (const key of keys) {
    const [dateAdded, source] = key.split('|');
    const groupRow = document.createElement('tr');
    groupRow.innerHTML = '<td colspan="8" style="padding:10px 8px 4px; font-size:12px; color:var(--text-muted);">Added ' + esc(dateAdded) + (source ? ' (' + esc(source) + ')' : '') + '</td>';
    rowsEl.appendChild(groupRow);

    for (const d of groups.get(key)) {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '0.5px solid var(--border)';
      tr.innerHTML =
        '<td style="padding:8px; font-weight:500; vertical-align:top;">' + esc(d.name) + '</td>' +
        '<td style="padding:8px; color:var(--text-secondary); vertical-align:top;">' + esc(d.description) + '</td>' +
        '<td style="padding:8px; color:var(--text-secondary); vertical-align:top;">' + esc(d.howToUse) + '</td>' +
        '<td style="padding:8px; vertical-align:top;"><span style="color:' + apiColor(d.needsApi) + '; font-weight:500;">' + esc(d.needsApi) + '</span><br/><span style="font-size:11px; color:var(--text-muted);">' + esc(d.apiNote || '') + '</span></td>' +
        '<td style="padding:8px; vertical-align:top;">' + esc(d.nature) + '</td>' +
        '<td style="padding:8px; vertical-align:top;">' + fmtStars(d.stars) + ' <i class="ti ti-star" style="font-size:12px;" aria-hidden="true"></i></td>';

      const linkTd = document.createElement('td');
      linkTd.style.padding = '8px';
      linkTd.style.textAlign = 'center';
      linkTd.style.verticalAlign = 'top';
      const linkBtn = document.createElement('button');
      linkBtn.setAttribute('aria-label', 'Open link');
      linkBtn.style.padding = '4px 8px';
      linkBtn.innerHTML = '<i class="ti ti-external-link" style="font-size:16px;" aria-hidden="true"></i>';
      linkBtn.addEventListener('click', () => openLink(d.link));
      linkTd.appendChild(linkBtn);
      tr.appendChild(linkTd);

      const installTd = document.createElement('td');
      installTd.style.padding = '8px';
      installTd.style.textAlign = 'center';
      installTd.style.verticalAlign = 'top';
      const installBtn = document.createElement('button');
      installBtn.innerHTML = '<i class="ti ti-download" style="font-size:14px; margin-right:4px;" aria-hidden="true"></i>Install ↗';
      installBtn.addEventListener('click', () => sendPrompt('Install ' + d.name + ' for me: ' + (d.installCommand || d.link)));
      installTd.appendChild(installBtn);
      tr.appendChild(installTd);

      rowsEl.appendChild(tr);
    }
  }

  document.getElementById('summary').textContent = filtered.length + ' of ' + DATA.length + ' not yet installed \\u00b7 ' + INSTALLED_COUNT + ' installed (hidden) \\u00b7 last run ' + TODAY;
}

document.getElementById('q').addEventListener('input', render);
document.getElementById('typeFilter').addEventListener('change', render);
document.getElementById('apiFilter').addEventListener('change', render);
render();
</script>`;

process.stdout.write(html);
