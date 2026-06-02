import {
  buildBlock,
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  getMetadata,
} from './aem.js';

/**
 * ── stardust:aem-import overlay engine ──────────────────────────────────
 * Two modes, driven by whether /templates/<template>.html exists:
 *   - overlay mode (HTML present): the template's markup replaces the
 *     authored content; [data-slot] markers are filled from the DA block
 *     tables; main.dataset.overlay is set so loadSections is skipped
 *     (the template is the visual spec — a pixel-faithful clone).
 *   - blocks mode (HTML 404): authored DA content stays and gets standard
 *     EDS decoration; only the template CSS + chrome theme are activated.
 * In both modes main.dataset.theme is set (chrome fragment selector).
 */

/** Read the authored DA block tables into a flat slot map: name -> value cell. */
function readBlockSlots(main) {
  const slots = new Map();
  main.querySelectorAll(':scope > div > div').forEach((block) => {
    [...block.children].forEach((row) => {
      const cells = [...row.children];
      if (cells.length === 2) {
        const name = cells[0].textContent.trim();
        if (name) slots.set(name, cells[1]);
      }
    });
  });
  return slots;
}

/** Write a DA cell value into a template [data-slot] element, element-typed. */
function writeSlot(el, cell) {
  if (!el || !cell) return;
  const img = cell.querySelector('img');
  const link = cell.querySelector('a');
  if (el.tagName === 'IMG' && img) {
    el.src = img.getAttribute('src');
    if (img.alt) el.alt = img.alt;
    el.removeAttribute('srcset');
    return;
  }
  if (el.tagName === 'A') {
    const txt = cell.textContent.trim();
    if (txt) el.textContent = txt;
    if (link) el.setAttribute('href', link.getAttribute('href'));
    return;
  }
  const txt = cell.textContent.trim();
  if (txt) el.textContent = txt;
}

/**
 * Apply the static-page overlay to main.
 * Returns true if the overlay ran, false otherwise.
 */
async function applyTemplateOverlay(main) {
  const templateName = getMetadata('template');
  if (!templateName) return false;

  // Always activate the theme — per-theme CSS loads regardless of mode.
  main.dataset.theme = templateName;
  const cssLoaded = loadCSS(`${window.hlx.codeBasePath}/styles/${templateName}.css`);

  const slots = readBlockSlots(main);

  let resp;
  try {
    resp = await fetch(`${window.hlx.codeBasePath}/templates/${templateName}.html`);
  } catch (e) {
    resp = null;
  }
  if (!resp || !resp.ok) {
    // eslint-disable-next-line no-console
    console.info(`[overlay] no template HTML for "${templateName}" — blocks mode (CSS + chrome only)`);
    await cssLoaded;
    return false;
  }

  const html = await resp.text();
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  tpl.content.querySelectorAll('[data-slot]').forEach((el) => {
    const name = el.getAttribute('data-slot');
    if (slots.has(name)) writeSlot(el, slots.get(name));
  });

  main.replaceChildren(tpl.content);
  main.dataset.overlay = templateName;
  await cssLoaded;
  return true;
}

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    // Check if h1 or picture is already inside a hero block
    if (h1.closest('.hero') || picture.closest('.hero')) {
      return; // Don't create a duplicate hero block
    }
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // auto load `*/fragments/*` references
    const fragments = [...main.querySelectorAll('a[href*="/fragments/"]')].filter((f) => !f.closest('.fragment'));
    if (fragments.length > 0) {
      // eslint-disable-next-line import/no-cycle
      import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
        fragments.forEach(async (fragment) => {
          try {
            const { pathname } = new URL(fragment.href);
            const frag = await loadFragment(pathname);
            fragment.parentElement.replaceWith(...frag.children);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Fragment loading failed', error);
          }
        });
      });
    }

    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates formatted links to style them as buttons.
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    // quick structural checks
    if (a.querySelector('img') || p.textContent.trim() !== text) return;

    // skip URL display links
    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch { /* continue */ }

    // require authored formatting for buttonization
    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) return;

    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) { // high-impact call-to-action
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else {
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateButtons(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    const overlaid = await applyTemplateOverlay(main);
    if (overlaid) {
      // template is the visual spec — only decorate icons, skip block pipeline
      decorateIcons(main);
      document.body.classList.add('appear');
      await waitForFirstImage(main);
    } else {
      decorateMain(main);
      document.body.classList.add('appear');
      await loadSection(main.querySelector('.section'), waitForFirstImage);
    }
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('header'));

  const main = doc.querySelector('main');
  // overlay mode inlines its own chrome + sections; skip standard decoration
  if (!main.dataset.overlay) await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
