import { X, MessageCircle, Keyboard, User, UserCheck, AlertCircle, Menu, Check } from 'lucide-react';
import { LSAHandIcon } from './LSAHandIcon';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useBackHandler } from '../hooks/useBackHandler';
import TextResponseMode from './TextResponseMode';

type ConversationMode = 'hands' | 'dillo' | 'text';

interface IframeModalProps {
  initialMode: ConversationMode;
  onClose: () => void;
  zIndex?: string;
  onClientMessage?: (msg: string) => void;
  onAgentMessage?: (msg: string) => void;
}

function getHandsUrl() {
  return `https://entrenar.dillo.ar/#/traductor?model=/models/Modelo_Claro_LSA_0709.json&t=${Date.now()}`;
}
const DILLO_URL = 'https://avatar.dillo.ai/?embed=1';

const TAB_OWNER: Record<ConversationMode, 'client' | 'agent'> = {
  hands: 'client',
  dillo: 'agent',
  text:  'client',
};

const TABS: { mode: ConversationMode; label: string; shortLabel: string; Icon: React.ComponentType<any> }[] = [
  { mode: 'hands', label: 'Mis señas',          shortLabel: 'Señas', Icon: LSAHandIcon },
  { mode: 'dillo', label: 'Con Dillo',          shortLabel: 'Dillo', Icon: MessageCircle },
  { mode: 'text',  label: 'Escribir',           shortLabel: 'Texto', Icon: Keyboard },
];

export default function IframeModal({
  initialMode, onClose, zIndex = 'z-50',
  onClientMessage, onAgentMessage,
}: IframeModalProps) {
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
  const [showTabMenu, setShowTabMenu] = useState(false);

  // BUG-03: URL regenerada en cada retry para forzar reload del iframe.
  const handsUrl = useMemo(() => getHandsUrl(), [handsRetryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // BUG-03: Fallback de cierre. Si `transitionend` no dispara (prefers-reduced-motion
  // extremo, cierre muy rápido, tab en segundo plano), este timeout garantiza que
  // onClose() se ejecuta. El flag closeFiredRef evita llamadas dobles.
  const closeFiredRef = useRef(false);
  const doClose = useCallback(() => {
    if (closeFiredRef.current) return;
    closeFiredRef.current = true;
    onClose();
  }, [onClose]);

  const requestClose = useCallback(() => setIsClosing(true), []);
  useBackHandler(true, requestClose);
  useBackHandler(showTabMenu, () => setShowTabMenu(false));

  useEffect(() => {
    if (!isClosing) return;
    const t = setTimeout(doClose, 250);
    return () => clearTimeout(t);
  }, [isClosing, doClose]);

  useEffect(() => {
    if (activeMode === 'hands') setHandsMounted(true);
    if (activeMode === 'dillo') setDilloMounted(true);
  }, [activeMode]);

  // Warm-up: monta el iframe de Dillo en segundo plano poco después de que IframeModal
  // abre, aunque el tab inicial sea otro. Usa requestIdleCallback para ceder la CPU
  // al iframe de "Mis señas" primero y evitar contención en gama de entrada.
  //
  // Chrome 100+ pausa requestAnimationFrame en iframes con display:none, por lo que el
  // loop 3D se suspende mientras está oculto (GPU ≈ 0). El modelo y los shaders sí
  // se cargan en memoria, así que al cambiar de tab el avatar está listo sin spinner.
  //
  // Fallback: si el warm-up no disparó cuando el asesor cambia al tab Dillo,
  // el useEffect de activeMode (arriba) lo monta on-demand con el spinner existente.
  useEffect(() => {
    if (initialMode === 'dillo') return; // ya montado por el useState inicial
    let cancelled = false;
    const mount = () => { if (!cancelled) setDilloMounted(true); };
    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(mount, { timeout: 2000 });
      return () => { cancelled = true; cancelIdleCallback(id); };
    }
    // Fallback para browsers sin requestIdleCallback (Safari < 16.4, algunos WebViews)
    const t = setTimeout(mount, 1500);
    return () => { cancelled = true; clearTimeout(t); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intencional: solo corre una vez al montar; initialMode y setDilloMounted son estables

  // BUG-01: Validación de origen con === exacto.
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
      className={`fixed inset-0 h-dvh bg-white ${zIndex} flex flex-col ${
        isClosing ? 'opacity-0 pointer-events-none' : 'animate-fade-in'
      } transition-opacity duration-150`}
      onTransitionEnd={() => { if (isClosing) doClose(); }}
    >
      {/* ── Header compacto ────────────────────────────────────────────────────── */}
      <div
        key={owner}
        className={`absolute top-0 left-0 right-0 z-20 flex items-center gap-2 px-2 py-2.5 animate-turn-in ${
          owner === 'client' ? 'bg-brand/8' : 'bg-gray-900'
        }`}
      >
        {owner === 'client'
          ? <User className="w-4 h-4 text-brand flex-shrink-0 ml-1" strokeWidth={2.5} />
          : <UserCheck className="w-4 h-4 text-white flex-shrink-0 ml-1" strokeWidth={2.5} />
        }
        <span className={`flex-1 text-sm font-black uppercase tracking-widest ${
          owner === 'client' ? 'text-brand' : 'text-white'
        }`}>
          {owner === 'client' ? 'Tu turno' : 'Turno del asesor'}
        </span>

        <button
          onClick={() => setShowTabMenu(true)}
          aria-label="Cambiar modo"
          className={`w-10 h-10 flex items-center justify-center rounded-xl touch-manipulation
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
            owner === 'client'
              ? 'bg-brand/10 active:bg-brand/20 focus-visible:ring-brand'
              : 'bg-white/10 active:bg-white/20 focus-visible:ring-white'
          }`}
        >
          <Menu className={`w-5 h-5 ${owner === 'client' ? 'text-brand' : 'text-white'}`} />
        </button>

        <button
          onClick={requestClose}
          aria-label="Volver al inicio"
          className={`w-10 h-10 flex items-center justify-center rounded-xl touch-manipulation
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
            owner === 'client'
              ? 'bg-brand/10 active:bg-brand/20 focus-visible:ring-brand'
              : 'bg-white/10 active:bg-white/20 focus-visible:ring-white'
          }`}
        >
          <X className={`w-5 h-5 ${owner === 'client' ? 'text-brand' : 'text-white'}`} />
        </button>
      </div>

      {/* ── Bottom sheet: selector de modo ─────────────────────────────────────── */}
      {showTabMenu && (
        <div
          className="absolute inset-0 z-30 bg-black/40 flex items-end animate-fade-in"
          onClick={() => setShowTabMenu(false)}
        >
          <div
            className="w-full bg-white rounded-t-3xl px-4 pt-5 pb-10 animate-sheet-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
              Comunicarse
            </p>
            <div className="space-y-2" role="tablist" aria-label="Modos de conversación">
              {TABS.map(({ mode, label, shortLabel: _s, Icon }) => {
                const isActive = activeMode === mode;
                return (
                  <button
                    key={mode}
                    role="tab"
                    id={`iframe-tab-${mode}`}
                    aria-controls={`iframe-panel-${mode}`}
                    aria-selected={isActive}
                    onClick={() => { setActiveMode(mode); setShowTabMenu(false); }}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl border-2 transition-all
                                touch-manipulation active:scale-[0.98]
                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                      isActive
                        ? mode === 'dillo'
                          ? 'bg-gray-900 border-gray-900 focus-visible:ring-gray-900'
                          : 'bg-brand border-brand focus-visible:ring-brand'
                        : 'bg-white border-gray-100 active:border-brand/30 focus-visible:ring-gray-400'
                    }`}
                  >
                    {/* BUG-04: overflow-hidden contiene scale-[1.8] del LSAHandIcon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden ${
                      isActive ? 'bg-white/20' : 'bg-brand/10'
                    }`}>
                      {mode === 'hands'
                        ? <Icon className="w-7 h-7" onDark={isActive} />
                        : <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-brand'}`} strokeWidth={2.5} />
                      }
                    </div>
                    <span className={`flex-1 text-left font-black text-base ${isActive ? 'text-white' : 'text-gray-900'}`}>
                      {label}
                    </span>
                    {isActive && <Check className="w-5 h-5 text-white flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Contenido ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden">

        {/* BUG-10: role="tabpanel" con id y aria-labelledby en cada panel */}
        <div
          id="iframe-panel-text"
          role="tabpanel"
          aria-labelledby="iframe-tab-text"
          className={`absolute top-[60px] inset-x-0 bottom-0 ${activeMode === 'text' ? 'block' : 'hidden'}`}
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
          className={`absolute top-[60px] inset-x-0 bottom-0 ${activeMode === 'hands' ? 'flex' : 'hidden'} flex-col`}
        >
          {handsMounted && !handsLoaded && !handsError && (
            <IframeLoader label="Cargando intérprete de señas…" />
          )}
          {handsMounted && handsError && (
            <IframeError
              label="No se pudo cargar el intérprete de señas"
              onRetry={() => {
                setHandsError(false);
                setHandsLoaded(false);
                setHandsRetryKey((k) => k + 1);
              }}
            />
          )}
          {handsMounted && !handsError && (
            <iframe
              key={handsRetryKey}
              src={handsUrl}
              className="w-full flex-1 border-0"
              allow="camera; microphone; fullscreen"
              title="Intérprete de Lengua de Señas Argentina"
              onLoad={() => setHandsLoaded(true)}
              onError={() => setHandsError(true)}
            />
          )}
          <HandoffBar
            label="Respondé con Dillo →"
            variant="dark"
            onClick={() => setActiveMode('dillo')}
          />
        </div>

        <div
          id="iframe-panel-dillo"
          role="tabpanel"
          aria-labelledby="iframe-tab-dillo"
          className={`absolute top-[60px] inset-x-0 bottom-0 ${activeMode === 'dillo' ? 'flex' : 'hidden'} flex-col`}
        >
          {dilloMounted && !dilloLoaded && !dilloError && (
            <IframeLoader label="Cargando avatar de señas…" />
          )}
          {dilloMounted && dilloError && (
            <IframeError
              label="No se pudo cargar el avatar de señas"
              onRetry={() => {
                setDilloError(false);
                setDilloLoaded(false);
                setDilloRetryKey((k) => k + 1);
              }}
            />
          )}
          {dilloMounted && !dilloError && (
            <iframe
              key={dilloRetryKey}
              src={DILLO_URL}
              className="w-full flex-1 border-0"
              allow="camera; microphone; fullscreen"
              title="Avatar Dillo — respuesta en señas"
              onLoad={() => setDilloLoaded(true)}
              onError={() => setDilloError(true)}
            />
          )}
          <HandoffBar
            label="El cliente responde →"
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
      <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-500 font-semibold">{label}</p>
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
        className="px-5 py-2.5 bg-brand text-white rounded-xl text-sm font-bold touch-manipulation
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        Reintentar
      </button>
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
    <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-3">
      <button
        onClick={onClick}
        className={`w-full py-4 rounded-2xl font-black text-sm transition-all touch-manipulation
                    flex items-center justify-center gap-2 shadow-md active:scale-[0.98]
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
          variant === 'dark'
            ? 'bg-gray-900 active:bg-black text-white focus-visible:ring-gray-900'
            : 'bg-brand active:bg-brand-dark text-white focus-visible:ring-brand'
        }`}
      >
        {label}
      </button>
    </div>
  );
}
