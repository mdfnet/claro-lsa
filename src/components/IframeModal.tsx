import { X, Hand, MessageCircle, Keyboard } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
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

  // Escucha mensajes postMessage de los iframes de Dillo.
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

  return (
    <div
      className={`fixed inset-0 bg-white ${zIndex} flex flex-col ${isClosing ? 'opacity-0 pointer-events-none' : 'animate-fade-in'} transition-opacity duration-150`}
      onTransitionEnd={() => { if (isClosing) onClose(); }}
    >
      {/* Barra de tabs + botón de cierre */}
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
      <div className="flex-1 relative overflow-hidden">

        {/* Modo texto: componente nativo, sin iframe */}
        <div className={`absolute inset-0 ${activeMode === 'text' ? 'block' : 'hidden'}`}>
          <TextResponseMode
            isActive={activeMode === 'text'}
            onSwitchToDillo={() => setActiveMode('dillo')}
            onMessage={onClientMessage}
          />
        </div>

        {/* Iframe "Mis manos" — se monta al primer acceso, se oculta con CSS después */}
        <div className={`absolute inset-0 ${activeMode === 'hands' ? 'flex' : 'hidden'} flex-col`}>
          {handsMounted && !handsLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white z-10">
              <div className="w-10 h-10 border-4 border-[#DA291C] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500 font-medium">Cargando intérprete de señas…</p>
            </div>
          )}
          {handsMounted && (
            <iframe
              src={handsUrl}
              className="w-full flex-1"
              allow="camera; microphone; fullscreen"
              title="Intérprete de Lengua de Señas"
              onLoad={() => setHandsLoaded(true)}
            />
          )}
          {/* Botón para que el asesor tome el turno y responda con Dillo */}
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

        {/* Iframe "Responder con Dillo" — se monta al primer acceso, se oculta con CSS después */}
        <div className={`absolute inset-0 ${activeMode === 'dillo' ? 'flex' : 'hidden'} flex-col`}>
          {dilloMounted && !dilloLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white z-10">
              <div className="w-10 h-10 border-4 border-[#DA291C] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500 font-medium">Cargando avatar de señas…</p>
            </div>
          )}
          {dilloMounted && (
            <iframe
              src={DILLO_URL}
              className="w-full flex-1"
              allow="camera; microphone; fullscreen"
              title="Avatar Dillo"
              onLoad={() => setDilloLoaded(true)}
            />
          )}
          {/* Botón para devolver el turno al cliente sordo */}
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
