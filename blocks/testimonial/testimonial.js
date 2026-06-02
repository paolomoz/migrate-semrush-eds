/* testimonial — Quote | Attribution */
export default function decorate(block) {
  const cells = [...(block.firstElementChild?.children || [])];
  const quote = (cells[0]?.innerHTML || '').trim();
  const author = (cells[1]?.textContent || '').trim();
  const fig = document.createElement('figure');
  fig.className = 'testimonial-fig';
  fig.innerHTML = `
    <blockquote class="testimonial-quote">${quote}</blockquote>
    ${author ? `<figcaption class="testimonial-author">${author}</figcaption>` : ''}`;
  block.replaceChildren(fig);
}
