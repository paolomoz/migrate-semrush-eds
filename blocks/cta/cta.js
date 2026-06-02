/* cta — centered get-started band: heading + button(s) */
export default function decorate(block) {
  const heading = block.querySelector('h1, h2, h3');
  const links = [...block.querySelectorAll('a')];
  const inner = document.createElement('div');
  inner.className = 'cta-inner';
  if (heading) inner.append(heading);
  if (links.length) {
    const actions = document.createElement('div');
    actions.className = 'cta-actions';
    links.forEach((a, i) => {
      const wrap = document.createElement('p');
      wrap.className = 'button-wrapper';
      a.className = `button ${i === 0 ? 'primary' : 'secondary'}`;
      wrap.append(a);
      actions.append(wrap);
    });
    inner.append(actions);
  }
  block.replaceChildren(inner);
}
