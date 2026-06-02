/* cards — keeps plain <img> (code-bus assets aren't on the media bus, so the
 * boilerplate's createOptimizedPicture would 404 them). Makes a card that
 * contains exactly one link fully clickable. */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    const links = li.querySelectorAll('a');
    if (links.length === 1) {
      const href = links[0].getAttribute('href');
      li.classList.add('cards-card-linked');
      li.addEventListener('click', () => { if (href) window.location.href = href; });
    }
    ul.append(li);
  });
  block.replaceChildren(ul);
}
