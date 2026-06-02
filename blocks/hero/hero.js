/* semrush hero — headline + subhead + search bar + product media */
export default function decorate(block) {
  const picture = block.querySelector('picture');
  const heading = block.querySelector('h1, h2');
  const paras = [...block.querySelectorAll('p')].filter((p) => !p.querySelector('picture') && p.textContent.trim());
  const cta = block.querySelector('a');
  const ctaText = (cta && cta.textContent.trim()) || 'Get insights';
  const subhead = paras.find((p) => !p.querySelector('a'));

  const copy = document.createElement('div');
  copy.className = 'hero-copy';
  if (heading) copy.append(heading);
  if (subhead) { subhead.className = 'hero-sub'; copy.append(subhead); }

  const form = document.createElement('div');
  form.className = 'hero-search';
  form.innerHTML = `
    <span class="hero-search__field">
      <span class="hero-search__icon" aria-hidden="true"></span>
      <input type="text" placeholder="Enter your website" aria-label="Enter your website">
      <span class="hero-search__geo">US</span>
    </span>
    <button type="button" class="hero-search__btn">${ctaText}</button>`;
  copy.append(form);

  const media = document.createElement('div');
  media.className = 'hero-media';
  if (picture) media.append(picture);

  block.replaceChildren(copy, media);
}
