import { useEffect, useRef, useState } from 'react';
import { useBackButtonNavigation, useBackHandler } from './hooks/useBackHandler';
import WelcomeScreen from './components/WelcomeScreen';
import VolumeReminderScreen from './components/VolumeReminderScreen';
import ServiceSelectionScreen from './components/ServiceSelectionScreen';

type Screen = 'welcome' | 'volume-reminder' | 'services';

// ── Botón "Traductor" pegado al borde derecho ─────────────────────────────────
// El FAB original del plugin está oculto con CSS (opacity:0, width:0, height:0).
// Este botón dispara .click() sobre él para abrir/cerrar el panel de Dillo.
// Desaparece cuando IframeModal quita el <dillo-interpreter> del DOM.
function DilloBubbleControl() {
  const [inDom, setInDom] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  // Cantidad de elementos en el shadow root con el panel cerrado. Se captura justo
  // antes de abrir el panel; cuando el conteo vuelve a ese nivel sabemos que cerró.
  const closedCountRef = useRef(0);

  // Detecta cuando IframeModal agrega/quita el custom element del DOM.
  useEffect(() => {
    const check = () => setInDom(!!document.querySelector('dillo-interpreter'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.body, { childList: true });
    return () => obs.disconnect();
  }, []);

  // Detecta cierre del panel comparando cantidad de elementos en el shadow root.
  // offsetHeight era poco confiable (el FAB puede seguir teniendo border-height > 0
  // aunque esté visualmente oculto, lo que hacía que isPanelGone() nunca fuera true).
  useEffect(() => {
    if (!panelOpen) return;
    const host = document.querySelector('dillo-interpreter');
    const root = host?.shadowRoot;
    if (!root) return;

    const baseline = closedCountRef.current;
    let interval: ReturnType<typeof setInterval>;
    let obs: MutationObserver;

    const tryClose = () => {
      if (root.querySelectorAll('*').length <= baseline) setPanelOpen(false);
    };

    // Espera a que el panel termine de abrirse antes de empezar a vigilar,
    // para no confundir el estado "abriendo" con un cierre.
    const startTimer = setTimeout(() => {
      interval = setInterval(tryClose, 400);
      obs = new MutationObserver(tryClose);
      obs.observe(root, { childList: true, subtree: true });
    }, 600);

    return () => {
      clearTimeout(startTimer);
      clearInterval(interval);
      obs?.disconnect();
    };
  }, [panelOpen]);

  const openPanel = () => {
    const host = document.querySelector('dillo-interpreter');
    const fab = host?.shadowRoot?.querySelector('.dillo-fab') as HTMLElement | null;
    if (!fab) return;
    // Snapshot del estado cerrado antes de abrir
    closedCountRef.current = host!.shadowRoot!.querySelectorAll('*').length;
    fab.click();
    setPanelOpen(true);
  };

  if (!inDom || panelOpen) return null;

  return (
    <button
      onClick={openPanel}
      aria-label="Abrir traductor de lengua de señas"
      className="fixed right-0 top-1/2 -translate-y-1/2 z-[9998] bg-[#DA291C] active:bg-[#B01F16]
                 text-white rounded-l-2xl shadow-xl px-2 py-5
                 flex flex-col items-center gap-2 touch-manipulation"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
      </svg>
      <span
        className="text-[11px] font-bold tracking-wide leading-none"
        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
      >
        Traductor
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');

  useBackButtonNavigation();

  useBackHandler(currentScreen !== 'welcome', () => {
    setCurrentScreen(currentScreen === 'services' ? 'volume-reminder' : 'welcome');
  });

  return (
    <div className="min-h-screen">
      {currentScreen === 'welcome' && (
        <WelcomeScreen
          onStart={() => setCurrentScreen('volume-reminder')}
          onHelp={() => {}}
          onAbout={() => {}}
        />
      )}

      {currentScreen === 'volume-reminder' && (
        <VolumeReminderScreen onContinue={() => setCurrentScreen('services')} />
      )}

      {currentScreen === 'services' && (
        <ServiceSelectionScreen onSelectService={() => {}} />
      )}

      <DilloBubbleControl />
    </div>
  );
}

export default App;
