import { X, Hand, MessageCircle, Keyboard, AlertCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useBackHandler } from '../hooks/useBackHandler';
import TextResponseMode from './TextResponseMode';

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

const MODE_TOGGLES: { mode: ConversationMode; label: string; Icon: typeof Hand }[] = [
  { mode: 'hands', label: 'Mis manos', Icon: Hand },
  { mode: 'dillo', label: 'Responder con Dillo', Icon: MessageCircle },
  { mode: 'text', label: 'Responder con texto', Icon: Keyboard },
];

export default function IframeModal({ initialMode, onClose, zIndex = 'z-50', onClientMessage, onAgentMessage, onAgentTurn }: IframeModalProps) {
  const [activeMode, setActiveMode] = useState<ConversationMode>(initialMode);
  const [isClosing, setIsClosing] = useState(false);
  const [handsLoaded, setHandsLoaded] = useState(false);
  const [dilloLoaded, setDilloLoaded] = useState(false);
  const [handsError, setHandsError] = useState(false);
  const [dilloError, setDilloError] = useState(false);
  const [handsRetryKey, setHandsRetryKey] = useState(0);
  const [dilloRetryKey, setDilloRetryKey] = useState(0);
  const [handsMounted, setHandsMounted] = useState(initialMode === 'hands');
  const [dilloMounted, setDilloMounted] = useState(initialMode === 'dillo');

  // BUG-19: URL regenerada en cada retry para forzar recarga del iframe.
  const handsUrl = useMemo(() => getHandsUrl(), [handsRetryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const prevModeRef = useRef(initialMode);

  // BUG-03: Flag anti-doble-cierre. Si transitionend no dispara (prefers-reduced-motion,
  // tab en segundo plano), el timeout garantiza que onClose() se ejecuta igualmente.
  const closeFiredRef = useRef(false);
  const doClose = useCallback(() => {
    if (closeFiredRef.current) return;
    closeFiredRef.current = true;
    onClose();
  }, [onClose]);

  const requestClose = useCallback(() => setIsClosing(true), []);
  useBackHandler(true, requestClose);

  useEffect(() => {
    if (!isClosing) return;
    const t = setTimeout(doClose, 250);
    return () => clearTimeout(t);
  }, [isClosing, doClose]);

  useEffect(() => {
    if (activeMode === 'hands') setHandsMounted(true);
    if (activeMode === 'dillo') setDilloMounted(true);
  }, [activeMode]);

  useEffect(() => {
    if (activeMode === 'dillo' && prevModeRef.current !== 'dillo') {
      onAgentTurn?.();
    }
    prevModeRef.current = activeMode;
  }, [activeMode, onAgentTurn]);

  // BUG-01: Validación con === exacto.
  // startsWith('https://avatar.dillo.ai') matchearía 'https://avatar.dillo.ai.atacante.com'.
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.origin !== 'https://avatar.dillo.ai' && e.origin !== 'https://entrenar.dillo.ar') return;
      const text =
        typeof e.data === 'string' ? e.data :
        typeof e.data?.text === 'string' ? e.data.text :
        typeof e.data?.transcript === 'string' ? e.data.transcript :
        typeof e.data?.message === 'string' ? e.data.message :
        typeof e.data?.content === 'string' ? e.data.content :
        null;
      if (!text?.trim()) return;
      if (e.origin === 'https://avatar.dillo.ai') {
        onAgentMessage?.(text.trim());
      } else {
        onClientMessage?.(text.trim());
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onClientMessage, onAgentMessage]);

  return (
    <div
      className={`fixed inset-0 bg-white ${zIndex} flex flex-col ${isClosing ? 'opacity-0 pointer-events-none' : 'animate-fade-in'} transition-opacity duration-150`}
      onTransitionEnd={() => { if (isClosing) doClose(); }}
    >
      {/* BUG-10: Barra de tabs con ARIA Tabs correcto */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-2 py-2 sm:px-4 sm:py-3 gap-2 sm:gap-4">
        <div
          role="tablist"
          aria-label="Modos de conversación"
          className="flex items-center bg-gray-100 rounded-xl p-1 gap-1 min-w-0 overflow-x-auto"
        >
          {MODE_TOGGLES.map(({ mode, label, Icon }) => (
            <button
              key={mode}
              role="tab"
              id={`iframe-tab-${mode}`}
              aria-controls={`iframe-panel-${mode}`}
              aria-selected={activeMode === mode}
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

      {/* Contenido */}
      <div className="flex-1 relative overflow-hidden">

        <div
          id="iframe-panel-text"
          role="tabpanel"
          aria-labelledby="iframe-tab-text"
          className={`absolute inset-0 ${activeMode === 'text' ? 'block' : 'hidden'}`}
        >
          <TextResponseMode
            isActive={activeMode === 'text'}
            onSwitchToDillo={() => setActiveMode('dillo')}
            onMessage={onClientMessage}
          />
        </div>

        {/* BUG-19: onError muestra IframeError con botón Reintentar */}
        <div
          id="iframe-panel-hands"
          role="tabpanel"
          aria-labelledby="iframe-tab-hands"
          className={`absolute inset-0 ${activeMode === 'hands' ? 'flex' : 'hidden'} flex-col`}
        >
          {handsMounted && !handsLoaded && !handsError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white z-10">
              <div className="w-10 h-10 border-4 border-[#DA291C] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500 font-medium">Cargando intérprete de señas…</p>
            </div>
          )}
          {handsMounted && handsError && (
            <IframeError
              label="No se pudo cargar el intérprete de señas"
              onRetry={() => { setHandsError(false); setHandsLoaded(false); setHandsRetryKey((k) => k + 1); }}
            />
          )}
          {handsMounted && !handsError && (
            <iframe
              key={handsRetryKey}
              src={handsUrl}
              className="w-full flex-1 border-0"
              allow="camera; microphone; fullscreen"
              title="Intérprete de Lengua de Señas"
              onLoad={() => setHandsLoaded(true)}
              onError={() => setHandsError(true)}
            />
          )}
          <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-3 sm:px-6">
            <button
              onClick={() => setActiveMode('dillo')}
              className="w-full bg-gray-800 active:bg-gray-900 text-white py-3 sm:py-4 rounded-2xl
                         text-sm sm:text-base font-bold transition-colors touch-manipulation
                         flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              Asesor: respondé con Dillo →
            </button>
          </div>
        </div>

        <div
          id="iframe-panel-dillo"
          role="tabpanel"
          aria-labelledby="iframe-tab-dillo"
          className={`absolute inset-0 ${activeMode === 'dillo' ? 'flex' : 'hidden'} flex-col`}
        >
          {dilloMounted && !dilloLoaded && !dilloError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white z-10">
              <div className="w-10 h-10 border-4 border-[#DA291C] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500 font-medium">Cargando avatar de señas…</p>
            </div>
          )}
          {dilloMounted && dilloError && (
            <IframeError
              label="No se pudo cargar el avatar de señas"
              onRetry={() => { setDilloError(false); setDilloLoaded(false); setDilloRetryKey((k) => k + 1); }}
            />
          )}
          {dilloMounted && !dilloError && (
            <iframe
              key={dilloRetryKey}
              src={DILLO_URL}
              className="w-full flex-1 border-0"
              allow="camera; microphone; fullscreen"
              title="Avatar Dillo"
              onLoad={() => setDilloLoaded(true)}
              onError={() => setDilloError(true)}
            />
          )}
          <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-3 sm:px-6">
            <button
              onClick={() => setActiveMode('text')}
              className="w-full bg-[#DA291C] active:bg-[#B01F16] text-white py-3 sm:py-4 rounded-2xl
                         text-sm sm:text-base font-bold transition-colors touch-manipulation
                         flex items-center justify-center gap-2"
            >
              <Keyboard className="w-4 h-4 sm:w-5 sm:h-5" />
              ← El cliente responde
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function IframeError({ label, onRetry }: { label: string; onRetry: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white z-10 px-6 text-center">
      <AlertCircle className="w-10 h-10 text-gray-300" />
      <p className="text-sm text-gray-500 font-semibold">{label}</p>
      <button
        onClick={onRetry}
        className="px-5 py-2.5 bg-[#DA291C] text-white rounded-xl text-sm font-bold touch-manipulation"
      >
        Reintentar
      </button>
    </div>
  );
}
