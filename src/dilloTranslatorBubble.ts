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

// El FAB original queda invisible pero en el DOM para poder clickearlo por JS.
// El panel y sus botones se repintan con el rojo Claro sobreescribiendo el azul.
// Los selectores son amplios porque no tenemos acceso a los nombres internos.
const STYLES = `
.dillo-fab {
  opacity: 0 !important;
  pointer-events: none !important;
  width: 0 !important;
  height: 0 !important;
  min-width: 0 !important;
  min-height: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
  overflow: hidden !important;
  position: absolute !important;
}

/* Override azul de Dillo → rojo Claro */
button:not(.dillo-fab),
[class*="button"]:not(.dillo-fab),
[class*="btn"]:not(.dillo-fab),
[class*="send"],
[class*="submit"],
[class*="primary"],
[class*="action"] {
  background-color: #DA291C !important;
  border-color: #DA291C !important;
  color: #fff !important;
}

[class*="header"],
[class*="toolbar"],
[class*="topbar"],
[class*="navbar"] {
  background-color: #DA291C !important;
  color: #fff !important;
}

a, [class*="link"] {
  color: #DA291C !important;
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
