/**
 * Ajustes de la burbuja del plugin de Dillo para que se entienda que es un
 * traductor, en vez de mostrar solo el logo de la marca.
 *
 * El ícono se cambia desde index.html con `data-brand-logo`, que es la vía
 * oficial del plugin. Para el texto no alcanza: hay que agregarlo acá, porque el
 * plugin no expone ninguna opción para eso. Lo hacemos inyectando una hoja de
 * estilos en su shadow root (que es `open`) y escribiendo la palabra con un
 * `::after`, no con un nodo del DOM: React es dueño de ese árbol y borraría
 * cualquier hijo que le agreguemos al re-renderizar, pero los pseudo-elementos
 * de CSS quedan intactos.
 *
 * A propósito no tocamos public/dillo-plugin.js: ese archivo lo sincroniza sola
 * una GitHub Action desde el repo plugin-handsign y cualquier edición se pierde.
 */

const TAG = 'dillo-interpreter';
const STYLE_ID = 'claro-traductor-bubble';

/** El aria-label del plugin no menciona "Traductor". Lo alineamos con el texto
 *  visible para que quien navegue por voz pueda pedir el botón por su nombre
 *  (WCAG 2.5.3, "Label in Name"). */
const ARIA_LABEL = 'Traductor de lengua de señas Dillo';

const STYLES = `
.dillo-fab {
  width: auto;
  height: 56px;
  padding: 0 20px 0 16px;
  gap: 10px;
  border-radius: 28px;
}

.dillo-fab img {
  height: 24px;
}

.dillo-fab::after {
  content: "Traductor";
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
  color: #fff;
  white-space: nowrap;
}
`;

function enhance(host: Element) {
  const root = host.shadowRoot;
  if (!root) return;

  if (!root.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = STYLES;
    root.appendChild(style);
  }

  const fab = root.querySelector('.dillo-fab');
  if (fab && fab.getAttribute('aria-label') !== ARIA_LABEL) {
    fab.setAttribute('aria-label', ARIA_LABEL);
  }
}

export function setupTranslatorBubble() {
  const watched = new WeakSet<Element>();

  const attach = () => {
    const host = document.querySelector(TAG);
    if (!host?.shadowRoot) return;

    enhance(host);

    // El plugin recrea el botón cada vez que se abre y se cierra el panel, así
    // que volvemos a corregir el aria-label cuando eso pasa.
    if (!watched.has(host)) {
      watched.add(host);
      new MutationObserver(() => enhance(host)).observe(host.shadowRoot, {
        childList: true,
        subtree: true,
      });
    }
  };

  attach();

  // IframeModal quita y vuelve a crear el <dillo-interpreter>, y el plugin lo
  // monta después del DOMContentLoaded: en los dos casos hay que reaplicar todo.
  new MutationObserver(attach).observe(document.body, { childList: true });
}
