/* ranking — AI Visibility leaderboard: one row per brand: Brand | Share */
export default function decorate(block) {
  const rows = [...block.children].map((row) => {
    const cells = [...row.children];
    return { brand: (cells[0]?.textContent || '').trim(), share: parseFloat((cells[1]?.textContent || '').replace(/[^\d.]/g, '')) || 0 };
  }).filter((r) => r.brand);
  const max = Math.max(...rows.map((r) => r.share), 1);

  const list = document.createElement('ol');
  list.className = 'ranking-list';
  rows.forEach((r, i) => {
    const li = document.createElement('li');
    li.className = 'ranking-row';
    li.innerHTML = `
      <span class="ranking-rank">${String(i + 1).padStart(2, '0')}</span>
      <span class="ranking-brand">${r.brand}</span>
      <span class="ranking-bar"><span style="width:${(r.share / max) * 100}%"></span></span>
      <span class="ranking-share">${r.share}%</span>`;
    list.append(li);
  });
  block.replaceChildren(list);
}
