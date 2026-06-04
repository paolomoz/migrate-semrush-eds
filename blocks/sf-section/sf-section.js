/**
 * sf-section — static-to-EDS (snowflake) block.
 *
 * Each Semrush section is one block instance. The block injects that section's
 * captured real markup (mp-* classes), which the global Semrush CSS
 * (styles/snowflake.css) styles verbatim — so the page is pixel-identical to
 * the source while remaining a composable set of EDS blocks.
 *
 * Authoring rows (positional):
 *   1. section name — which /semrush/sections/<name>.html to load
 *   2. (optional) headline override — replaces the section's primary heading
 */
export default async function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const name = (cells[0]?.textContent || '').trim();
  if (!name) return;

  let html;
  try {
    const resp = await fetch(`${window.hlx.codeBasePath}/semrush/sections/${name}.html`);
    if (!resp.ok) return;
    html = await resp.text();
  } catch (e) {
    return;
  }

  const tpl = document.createElement('template');
  tpl.innerHTML = html;

  // optional field-level authoring: a 2nd cell overrides the primary heading
  const override = (cells[1]?.textContent || '').trim();
  if (override) {
    const h = tpl.content.querySelector('h1, h2, .mp-title, .mp-hero__title');
    if (h) h.textContent = override;
  }

  block.replaceChildren(tpl.content);
  block.classList.add(`sf-${name}`);
}
