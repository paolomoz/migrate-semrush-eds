/* stats — one row per stat: Number | Label | Description */
export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'stats-list';
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const li = document.createElement('li');
    li.className = 'stats-item';
    const num = (cells[0]?.textContent || '').trim();
    const label = (cells[1]?.textContent || '').trim();
    const desc = (cells[2]?.textContent || '').trim();
    li.innerHTML = `
      <div class="stats-num"><span class="stats-arrow" aria-hidden="true"></span><b>${num}</b></div>
      <p class="stats-label">${label}</p>
      ${desc ? `<p class="stats-desc">${desc}</p>` : ''}`;
    ul.append(li);
  });
  block.replaceChildren(ul);
}
