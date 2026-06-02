/* promo — large feature card: media + (heading, body, cta).
 * Variant class (semrush-one / enterprise) drives the surface. */
export default function decorate(block) {
  const picture = block.querySelector('picture');
  const heading = block.querySelector('h2, h3');
  const body = [...block.querySelectorAll('p')].find((p) => !p.querySelector('picture, a') && p.textContent.trim());
  const cta = block.querySelector('a');

  const copy = document.createElement('div');
  copy.className = 'promo-copy';
  if (heading) copy.append(heading);
  if (body) copy.append(body);
  if (cta) {
    const wrap = document.createElement('p');
    wrap.className = 'button-wrapper';
    cta.className = 'button primary';
    wrap.append(cta);
    copy.append(wrap);
  }

  const media = document.createElement('div');
  media.className = 'promo-media';
  if (picture) media.append(picture);

  block.replaceChildren(copy, media);
}
