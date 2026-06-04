/* testimonial — two cards: a dark quote card + a light metric card.
 * Cell 1: brand · quote · author(strong) · role.  Cell 2: metric · caption. */
export default function decorate(block) {
  const cells = [...(block.firstElementChild?.children || [])];
  const qc = cells[0];
  const mc = cells[1];

  const ps = qc ? [...qc.querySelectorAll('p')] : [];
  const brand = ps[0]?.textContent.trim() || '';
  const quote = qc?.querySelector('blockquote')?.textContent.trim() || '';
  const authorP = qc?.querySelector('p strong')?.closest('p');
  const author = qc?.querySelector('p strong')?.textContent.trim() || '';
  const role = authorP?.nextElementSibling?.textContent.trim() || ps[ps.length - 1]?.textContent.trim() || '';

  const mps = mc ? [...mc.querySelectorAll('p')] : [];
  const metric = mps[0]?.textContent.trim() || '';
  const caption = mps.slice(1).map((p) => p.textContent.trim()).join(' ');

  const quoteCard = document.createElement('figure');
  quoteCard.className = 'tm-quote';
  quoteCard.innerHTML = `
    <div class="tm-brand">${brand}</div>
    <blockquote class="tm-text">${quote}</blockquote>
    <figcaption class="tm-author">
      <span class="tm-avatar" aria-hidden="true"></span>
      <span class="tm-who"><b>${author}</b><br>${role}</span>
    </figcaption>`;

  const metricCard = document.createElement('div');
  metricCard.className = 'tm-metric';
  metricCard.innerHTML = `<div class="tm-figure">${metric}</div><p class="tm-caption">${caption}</p>`;

  block.replaceChildren(quoteCard, metricCard);
}
