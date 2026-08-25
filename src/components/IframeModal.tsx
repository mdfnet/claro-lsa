import { X, Hand, MessageCircle, Keyboard } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBackHandler } from '../hooks/useBackHandler';
import TextResponseMode from './TextResponseMode';

type ConversationMode = 'hands' | 'dillo' | 'text';

interface IframeModalProps {
  initialMode: ConversationMode;
  onClose: () => void;
}

// URLs de los modos con iframe. El timestamp en la URL de señas fuerza una sesión nueva cada vez.
function getHandsUrl() {
  return `https://entrenar.dillo.ar/#/traductor?model=/models/Modelo_Claro_LSA.json&t=${Date.now()}`;
}
const DILLO_URL = 'https://avatar.dillo.ai/?embed=1';

const MODE_TOGGLES: { mode: ConversationMode; label: string; Icon: typeof Hand }[] = [
  { mode: 'hands', label: 'Mis manos', Icon: Hand },
  { mode: 'dillo', label: 'Responder con Dillo', Icon: MessageCircle },
  { mode: 'text', label: 'Responder con texto', Icon: Keyboard },
];

export default function IframeModal({ initialMode, onClose }: IframeModalProps) {
  const [activeMode, setActiveMode] = useState<ConversationMode>(initialMode);
  const [isClosing, setIsClosing] = useState(false);
  // Generamos la URL de señas una sola vez al montar, para no regenerar el timestamp al cambiar de modo.
  const handsUrl = useRef(getHandsUrl()).current;

  const requestClose = useCallback(() => {
    setIsClosing(true);
  }, []);

  useBackHandler(true, requestClose);

  useEffect(() => {
    const widget = document.querySelector('dillo-interpreter');
    const attributes = widget
      ? Array.from(widget.attributes).map((attr) => [attr.name, attr.value] as const)
      : null;
    widget?.remove();

    return () => {
      if (attributes && !document.querySelector('dillo-interpreter')) {
        const restored = document.createElement('dillo-interpreter');
        attributes.forEach(([name, value]) => restored.setAttribute(name, value));
        document.body.appendChild(restored);
      }
    };
  }, []);

  const iframeSrc = activeMode === 'hands' ? handsUrl : DILLO_URL;
  const iframeTitle = activeMode === 'hands'
    ? 'Intérprete de Lengua de Señas'
    : activeMode === 'dillo'
      ? 'Avatar Dillo'
      : 'Responder con texto';

  return (
    <div
      className={`fixed inset-0 bg-white z-50 flex flex-col ${isClosing ? 'opacity-0 pointer-events-none' : 'animate-fade-in'} transition-opacity duration-150`}
      onTransitionEnd={() => { if (isClosing) onClose(); }}
    >
      {/* Barra superior con toggle de modo y botón de cierre. En mobile el toggle
          muestra sólo íconos (con aria-label) para que el botón de cierre nunca
          quede tapado; el texto completo aparece desde sm+. */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-2 py-2 sm:px-4 sm:py-3 gap-2 sm:gap-4">

        <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1 min-w-0 overflow-x-auto">
          {MODE_TOGGLES.map(({ mode, label, Icon }) => (
            <button
              key={mode}
              onClick={() => setActiveMode(mode)}
              aria-label={label}
              className={`flex items-center justify-center gap-2 p-2.5 sm:px-4 sm:py-2.5 rounded-lg text-sm font-semibold transition-all touch-manipulation flex-shrink-0 ${
                activeMode === mode
                  ? 'bg-[#DA291C] text-white shadow-sm'
                  : 'text-gray-600 active:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Botón de cierre */}
        <button
          onClick={requestClose}
          aria-label="Volver al inicio"
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 font-semibold px-3 py-2.5 sm:px-4 rounded-xl transition-colors touch-manipulation flex-shrink-0"
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">Volver al inicio</span>
          <span className="sm:hidden">Inicio</span>
        </button>
      </div>

      {/* Contenido — ocupa el resto de la pantalla */}
      <div className="flex-1">
        {activeMode === 'text' ? (
          <TextResponseMode />
        ) : (
          <iframe
            key={iframeSrc}
            src={iframeSrc}
            className="w-full h-full"
            allow="camera; microphone; fullscreen"
            title={iframeTitle}
          />
        )}
      </div>
    </div>
  );
}
