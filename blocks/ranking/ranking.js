/* ranking — AI Visibility leaderboard: one row per brand: Brand | Share */
export default function decorate(block) {
  const rows = [...block.children].map((row) => {
    const cells = [...row.children];
    return { brand: (cells[0]?.textContent || '').trim(), share: parseFloat((cells[1]?.textContent || '').replace(/[^\d.]/g, '')) || 0 };
  }).filter((r) => r.brand);
  const max = Math.max(...rows.map((r) => r.share), 1);

  const table = document.createElement('div');
  table.className = 'ranking-table';
  table.innerHTML = `<div class="ranking-head">
      <span>Brand</span>
      <span>% Share of Voice</span>
      <span class="ranking-meta">AI Platform: ChatGPT, April 2026</span>
    </div>`;
  rows.forEach((r, i) => {
    const tone = i % 2 === 0 ? 'teal' : 'lav';
    const row = document.createElement('div');
    row.className = 'ranking-row';
    row.innerHTML = `
      <span class="ranking-brand">${r.brand}</span>
      <span class="ranking-share">${r.share}</span>
      <span class="ranking-bar ${tone}"><span style="width:${(r.share / max) * 100}%"></span></span>`;
    table.append(row);
  });
  block.replaceChildren(table);
}
