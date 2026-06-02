/* logos — trust strip. Collects all images into a marquee track. */
export default function decorate(block) {
  const imgs = [...block.querySelectorAll('picture, img')].map((el) => (el.tagName === 'IMG' ? el.closest('picture') || el : el));
  const uniq = [...new Set(imgs)];
  const track = document.createElement('div');
  track.className = 'logos-track';
  uniq.forEach((el) => {
    const item = document.createElement('span');
    item.className = 'logos-item';
    item.append(el);
    track.append(item);
  });
  // duplicate for a seamless marquee
  const clone = track.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  const viewport = document.createElement('div');
  viewport.className = 'logos-viewport';
  viewport.append(track, clone);
  block.replaceChildren(viewport);
}
