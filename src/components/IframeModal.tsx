import { X, Hand, MessageCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface IframeModalProps {
  initialMode: 'hands' | 'dillo';
  onClose: () => void;
}

// URLs de los dos modos. El timestamp en la URL de señas fuerza una sesión nueva cada vez.
function getHandsUrl() {
  return `https://entrenar.dillo.ar/#/traductor?model=/models/Modelo_Claro_LSA.json&t=${Date.now()}`;
}
const DILLO_URL = 'https://avatar.dillo.ai';

export default function IframeModal({ initialMode, onClose }: IframeModalProps) {
  const [activeMode, setActiveMode] = useState<'hands' | 'dillo'>(initialMode);
  // Generamos la URL de señas una sola vez al montar, para no regenerar el timestamp al cambiar de modo.
  const handsUrl = useRef(getHandsUrl()).current;

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
  const iframeTitle = activeMode === 'hands' ? 'Intérprete de Lengua de Señas' : 'Avatar Dillo';

  return (
    <div className="fixed inset-0 bg-white z-50 animate-fade-in flex flex-col">
      {/* Barra superior con toggle de modo y botón de cierre */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-4 py-3 gap-4">

        {/* Toggle: Mis manos / Dillo */}
        <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => setActiveMode('hands')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all touch-manipulation ${
              activeMode === 'hands'
                ? 'bg-[#DA291C] text-white shadow-sm'
                : 'text-gray-600 active:bg-gray-200'
            }`}
          >
            <Hand className="w-4 h-4" strokeWidth={2.5} />
            Mis manos
          </button>
          <button
            onClick={() => setActiveMode('dillo')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all touch-manipulation ${
              activeMode === 'dillo'
                ? 'bg-[#DA291C] text-white shadow-sm'
                : 'text-gray-600 active:bg-gray-200'
            }`}
          >
            <MessageCircle className="w-4 h-4" strokeWidth={2.5} />
            Dillo
          </button>
        </div>

        {/* Botón de cierre */}
        <button
          onClick={onClose}
          aria-label="Volver al inicio"
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 font-semibold px-4 py-2.5 rounded-xl transition-colors touch-manipulation"
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">Volver al inicio</span>
          <span className="sm:hidden">Inicio</span>
        </button>
      </div>

      {/* Iframe — ocupa el resto de la pantalla */}
      <div className="flex-1">
        <iframe
          key={iframeSrc}
          src={iframeSrc}
          className="w-full h-full"
          allow="camera; microphone; fullscreen"
          title={iframeTitle}
        />
      </div>
    </div>
  );
}
