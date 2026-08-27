import { X, Hand, MessageCircle, Keyboard } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBackHandler } from '../hooks/useBackHandler';
import TextResponseMode from './TextResponseMode';

// v2 UX CHANGES:
// 1. Labels de tabs renovados para clarificar el ROL en cada tab:
//    "Mis señas" (cliente) | "El asesor responde" (asesor usa Dillo, cliente ve) | "Escribir" (cliente)
// 2. Indicador de turno contextual debajo de los tabs ("Tu turno" / "Turno del asesor")
// 3. Botones de handoff más prominentes — son el CTA principal de cada tab
// 4. Layout header más compacto para maximizar el espacio del iframe

type ConversationMode = 'hands' | 'dillo' | 'text';

interface IframeModalProps {
  initialMode: ConversationMode;
  onClose: () => void;
  zIndex?: string;
  onClientMessage?: (msg: string) => void;
  onAgentMessage?: (msg: string) => void;
  onAgentTurn?: () => void;
}

function getHandsUrl() {
  return `https://entrenar.dillo.ar/#/traductor?model=/models/Modelo_Claro_LSA.json&t=${Date.now()}`;
}
const DILLO_URL = 'https://avatar.dillo.ai/?embed=1';

// Quién controla el teléfono en cada tab
const TAB_OWNER: Record<ConversationMode, 'client' | 'agent'> = {
  hands: 'client',
  dillo: 'agent',
  text:  'client',
};

const TABS: { mode: ConversationMode; label: string; shortLabel: string; Icon: typeof Hand }[] = [
  { mode: 'hands', label: 'Mis señas',          shortLabel: 'Señas', Icon: Hand },
  { mode: 'dillo', label: 'El asesor responde', shortLabel: 'Dillo', Icon: MessageCircle },
  { mode: 'text',  label: 'Escribir',           shortLabel: 'Texto', Icon: Keyboard },
];

export default function IframeModal({ initialMode, onClose, zIndex = 'z-50', onClientMessage, onAgentMessage, onAgentTurn }: IframeModalProps) {
  const [activeMode, setActiveMode] = useState<ConversationMode>(initialMode);
  const [isClosing, setIsClosing] = useState(false);
  const [handsLoaded, setHandsLoaded] = useState(false);
  const [dilloLoaded, setDilloLoaded] = useState(false);
  const [handsMounted, setHandsMounted] = useState(initialMode === 'hands');
  const [dilloMounted, setDilloMounted] = useState(initialMode === 'dillo');

  const handsUrl = useRef(getHandsUrl()).current;
  const prevModeRef = useRef(initialMode);
  const requestClose = useCallback(() => setIsClosing(true), []);
  useBackHandler(true, requestClose);

  useEffect(() => {
    if (activeMode === 'hands') setHandsMounted(true);
    if (activeMode === 'dillo') setDilloMounted(true);
  }, [activeMode]);

  // Notifica al padre cuando el asesor CAMBIA al tab Dillo (no en el render inicial)
  useEffect(() => {
    if (activeMode === 'dillo' && prevModeRef.current !== 'dillo') {
      onAgentTurn?.();
    }
    prevModeRef.current = activeMode;
  }, [activeMode, onAgentTurn]);

  // avatar.dillo.ai = mensajes del asesor; entrenar.dillo.ar = transcripción del cliente.
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const knownOrigins = ['https://avatar.dillo.ai', 'https://entrenar.dillo.ar'];
      if (!knownOrigins.some((o) => e.origin.startsWith(o))) return;
      console.log('[Dillo postMessage]', e.origin, e.data);
      const text =
        typeof e.data === 'string' ? e.data :
        typeof e.data?.text === 'string' ? e.data.text :
        typeof e.data?.transcript === 'string' ? e.data.transcript :
        typeof e.data?.message === 'string' ? e.data.message :
        typeof e.data?.content === 'string' ? e.data.content :
        null;
      if (!text?.trim()) return;
      if (e.origin.startsWith('https://avatar.dillo.ai')) {
        onAgentMessage?.(text.trim());
      } else {
        onClientMessage?.(text.trim());
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onClientMessage, onAgentMessage]);

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

  const owner = TAB_OWNER[activeMode];

  return (
    <div
      className={`fixed inset-0 bg-white ${zIndex} flex flex-col ${
        isClosing ? 'opacity-0 pointer-events-none' : 'animate-fade-in'
      } transition-opacity duration-150`}
      onTransitionEnd={() => { if (isClosing) onClose(); }}
    >
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200">

        {/* Fila de tabs + cierre */}
        <div className="flex items-center justify-between px-2 py-2 sm:px-3 sm:py-2.5 gap-2">
          <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-0.5 min-w-0 overflow-x-auto flex-1">
            {TABS.map(({ mode, label, shortLabel, Icon }) => (
              <button
                key={mode}
                onClick={() => setActiveMode(mode)}
                aria-label={label}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 sm:px-4 rounded-lg
                            text-xs sm:text-sm font-bold transition-all touch-manipulation flex-shrink-0 ${
                  activeMode === mode
                    ? mode === 'dillo'
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'bg-[#DA291C] text-white shadow-sm'
                    : 'text-gray-500 active:bg-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{shortLabel}</span>
              </button>
            ))}
          </div>

          <button
            onClick={requestClose}
            aria-label="Volver al inicio"
            className="flex items-center gap-1.5 bg-gray-100 active:bg-gray-200 text-gray-700 font-semibold
                       px-3 py-2 sm:px-4 rounded-xl transition-colors touch-manipulation flex-shrink-0"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Inicio</span>
          </button>
        </div>

        {/* Indicador de turno */}
        <div className={`px-3 py-1.5 text-center text-xs font-bold uppercase tracking-widest ${
          owner === 'client'
            ? 'bg-[#DA291C]/8 text-[#DA291C]'
            : 'bg-gray-900 text-white'
        }`}>
          {owner === 'client' ? '👤 Tu turno' : '🧑‍💼 Turno del asesor'}
        </div>

      </div>

      {/* ── Contenido ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden">

        {/* Texto */}
        <div className={`absolute inset-0 ${activeMode === 'text' ? 'block' : 'hidden'}`}>
          <TextResponseMode
            isActive={activeMode === 'text'}
            onSwitchToDillo={() => setActiveMode('dillo')}
            onMessage={onClientMessage}
          />
        </div>

        {/* Mis señas */}
        <div className={`absolute inset-0 ${activeMode === 'hands' ? 'flex' : 'hidden'} flex-col`}>
          {handsMounted && !handsLoaded && <IframeLoader label="Cargando intérprete de señas…" />}
          {handsMounted && (
            <iframe
              src={handsUrl}
              className="w-full flex-1"
              allow="camera; microphone; fullscreen"
              title="Intérprete de Lengua de Señas"
              onLoad={() => setHandsLoaded(true)}
            />
          )}
          <HandoffBar
            label="Asesor: respondé con Dillo →"
            variant="dark"
            onClick={() => setActiveMode('dillo')}
          />
        </div>

        {/* Dillo */}
        <div className={`absolute inset-0 ${activeMode === 'dillo' ? 'flex' : 'hidden'} flex-col`}>
          {dilloMounted && !dilloLoaded && <IframeLoader label="Cargando avatar de señas…" />}
          {dilloMounted && (
            <iframe
              src={DILLO_URL}
              className="w-full flex-1"
              allow="camera; microphone; fullscreen"
              title="Avatar Dillo"
              onLoad={() => setDilloLoaded(true)}
            />
          )}
          <HandoffBar
            label="← El cliente responde"
            variant="red"
            onClick={() => setActiveMode('text')}
          />
        </div>

      </div>
    </div>
  );
}

function IframeLoader({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white z-10">
      <div className="w-10 h-10 border-4 border-[#DA291C] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-500 font-semibold">{label}</p>
    </div>
  );
}

function HandoffBar({
  label, variant, onClick,
}: {
  label: string;
  variant: 'dark' | 'red';
  onClick: () => void;
}) {
  return (
    <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-3 sm:px-5">
      <button
        onClick={onClick}
        className={`w-full py-4 sm:py-5 rounded-2xl font-black text-sm sm:text-base transition-all touch-manipulation
                    flex items-center justify-center gap-2 shadow-md active:scale-[0.98] ${
          variant === 'dark'
            ? 'bg-gray-900 active:bg-black text-white'
            : 'bg-[#DA291C] active:bg-[#A01E13] text-white'
        }`}
      >
        {label}
      </button>
    </div>
  );
}
