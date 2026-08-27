import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, RotateCcw, Volume2, MessageSquare, X, UserCheck } from 'lucide-react';

// Cache de voces a nivel de módulo — se resuelve una sola vez por sesión.
let _voiceCache: SpeechSynthesisVoice[] | null = null;

function getVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
  if (_voiceCache && _voiceCache.length > 0) return Promise.resolve(_voiceCache);
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) { _voiceCache = voices; return Promise.resolve(voices); }
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.speechSynthesis.removeEventListener('voiceschanged', finish);
      _voiceCache = window.speechSynthesis.getVoices();
      resolve(_voiceCache);
    };
    window.speechSynthesis.addEventListener('voiceschanged', finish);
    setTimeout(finish, 1500);
  });
}

export function preloadVoices() {
  if ('speechSynthesis' in window) void getVoicesAsync();
}

function pickSpanishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;
  const latam = voices.find((v) =>
    (v.lang.startsWith('es-AR') || v.lang.startsWith('es-MX') ||
     v.lang.startsWith('es-CO') || v.lang.startsWith('es-CL') ||
     v.lang.startsWith('es-419') || v.lang.startsWith('es-UY') ||
     v.lang.startsWith('es-VE') || v.lang.startsWith('es-PE')) &&
    !v.name.toLowerCase().includes('spain') &&
    !v.name.toLowerCase().includes('españa')
  );
  if (latam) return latam;
  const nonSpain = voices.find((v) =>
    v.lang.startsWith('es') &&
    !v.lang.startsWith('es-ES') &&
    !v.name.toLowerCase().includes('spain') &&
    !v.name.toLowerCase().includes('españa')
  );
  return nonSpain ?? voices.find((v) => v.lang.startsWith('es')) ?? null;
}

interface QuickTouchScreenProps {
  title: string;
  speech: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClose: () => void;
  onBack?: () => void;
  parentTitle?: string;
  phoneNumber?: string;
  closeLabel?: string;
  closeIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  fullScreen?: boolean;
  showConversation?: boolean;
  onOpenReplyModal?: () => void;
}

const BAR_COUNT = 5;

// BUG-05: Estado tri-value en lugar de booleano.
// 'pending' = TTS en proceso de inicialización (async).
// 'speaking' = utterance.onstart disparó, audio activo.
// 'done' = utterance.onend/onerror disparó, audio terminado.
// Evita mostrar "Mensaje reproducido" antes de que el audio haya empezado.
type SpeechState = 'pending' | 'speaking' | 'done';

export default function QuickTouchScreen({
  title, speech, icon: _Icon, onClose, onBack,
  parentTitle, phoneNumber,
  closeLabel = 'Listo', closeIcon: CloseIcon = Check,
  fullScreen = true,
  showConversation = false,
  onOpenReplyModal,
}: QuickTouchScreenProps) {
  const [speechState, setSpeechState] = useState<SpeechState>('pending');
  const genRef = useRef(0);

  useEffect(() => {
    if (!fullScreen) return;
    const { documentElement: html } = document;
    const prev = html.style.overscrollBehavior;
    html.style.overscrollBehavior = 'none';
    return () => { html.style.overscrollBehavior = prev; };
  }, [fullScreen]);

  const playSpeech = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setSpeechState('pending');

    const myGen = ++genRef.current;

    void (async () => {
      await new Promise<void>((r) => setTimeout(r, 0));
      if (genRef.current !== myGen) return;

      const voices = await getVoicesAsync();
      if (genRef.current !== myGen) return;

      const picked = pickSpanishVoice(voices);
      const utterance = new SpeechSynthesisUtterance(speech);
      if (picked) utterance.voice = picked;
      utterance.lang = picked?.lang ?? 'es-AR';
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.volume = 1;

      let resumeTimer: ReturnType<typeof setInterval> | null = null;

      utterance.onstart = () => {
        if (genRef.current !== myGen) return;
        setSpeechState('speaking');
        // Workaround Chrome Android: speechSynthesis se pausa silenciosamente ~15s
        resumeTimer = setInterval(() => {
          if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        }, 5000);
      };

      const cleanup = () => {
        setSpeechState('done');
        if (resumeTimer) { clearInterval(resumeTimer); resumeTimer = null; }
      };
      utterance.onend = cleanup;
      utterance.onerror = cleanup;

      window.speechSynthesis.speak(utterance);
    })();
  }, [speech]);

  useEffect(() => {
    playSpeech();
    return () => {
      genRef.current++;
      window.speechSynthesis.cancel();
      setSpeechState('pending');
    };
  }, [playSpeech]);

  // ── Modo conversación (pass-the-phone) ────────────────────────────────────────
  if (showConversation) {
    return (
      <div className={`${fullScreen ? 'fixed inset-0 z-[60]' : 'w-full h-full'} bg-white flex flex-col animate-fade-in`}>

        <div className="bg-brand flex-shrink-0 px-5 py-5 sm:py-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest leading-none mb-0.5">Para el asesor</p>
              <p className="text-white font-black text-base sm:text-lg leading-tight">Leé el mensaje de abajo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="w-10 h-10 bg-white/20 active:bg-white/35 rounded-full flex items-center justify-center flex-shrink-0 touch-manipulation
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {onBack && (
          <div className="flex-shrink-0 px-4 py-2 border-b border-gray-100 bg-white">
            <button
              onClick={onBack}
              aria-label="Volver a elegir"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 active:text-gray-700
                         py-1 px-2 rounded-lg touch-manipulation
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
            >
              <ArrowLeft className="w-4 h-4" />
              Elegir otra opción
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="min-h-full flex flex-col items-center justify-center px-5 py-6 sm:px-8 sm:py-10 text-center gap-5">

            {parentTitle && (
              <p className="text-xl sm:text-2xl font-black text-brand">{parentTitle}</p>
            )}

            <div className="w-full max-w-2xl bg-gray-50 border-4 border-gray-900 rounded-3xl px-6 py-8 sm:px-12 sm:py-14 shadow-xl">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 leading-tight">
                {title}
              </h1>
              {phoneNumber && (
                <div className="mt-6 pt-6 border-t-2 border-gray-200 flex flex-col gap-1">
                  <p className="text-sm sm:text-base font-semibold text-gray-400 uppercase tracking-wide">
                    Número de línea
                  </p>
                  <p className="text-3xl sm:text-4xl font-black text-gray-900 tracking-wide">{phoneNumber}</p>
                </div>
              )}
            </div>

            <AudioIndicator speechState={speechState} />

          </div>
        </div>

        <div className="flex-shrink-0 bg-white border-t border-gray-100 px-5 py-4 sm:px-6 space-y-2.5">
          <button
            onClick={playSpeech}
            className="w-full bg-gray-100 active:bg-gray-200 text-gray-700
                       py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-bold transition-colors
                       flex items-center justify-center gap-2 touch-manipulation
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            Volver a reproducir
          </button>

          {onOpenReplyModal && (
            <button
              onClick={onOpenReplyModal}
              className="w-full bg-gray-900 active:bg-black text-white
                         py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-black transition-colors shadow-lg
                         flex items-center justify-center gap-2 touch-manipulation
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
            >
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              Respondé con Dillo
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full bg-brand active:bg-brand-dark text-white
                       py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-black transition-colors
                       flex items-center justify-center gap-2 touch-manipulation
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            <CloseIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            Terminar atención
          </button>
        </div>

      </div>
    );
  }

  // ── Modo texto (TextResponseMode) ─────────────────────────────────────────────
  return (
    <div className={`${fullScreen ? 'fixed inset-0 z-[60]' : 'w-full h-full'} bg-white flex flex-col animate-fade-in`}>

      <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="min-h-full flex flex-col items-center justify-center px-5 py-8 sm:px-8 sm:py-12 text-center gap-5 sm:gap-7">

          {parentTitle && (
            <p className="text-xl sm:text-2xl font-black text-brand">{parentTitle}</p>
          )}

          <div className="w-full max-w-2xl bg-gray-50 border-4 border-brand rounded-3xl px-6 py-8 sm:px-12 sm:py-14 shadow-lg">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 leading-tight">
              {title}
            </h1>
          </div>

          <AudioIndicator speechState={speechState} />

        </div>
      </div>

      <div className="flex-shrink-0 bg-white border-t border-gray-100 px-5 py-4 sm:px-6 space-y-2.5">
        <button
          onClick={playSpeech}
          className="w-full bg-gray-100 active:bg-gray-200 text-gray-700
                     py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-bold transition-colors
                     flex items-center justify-center gap-2 touch-manipulation
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
        >
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          Volver a reproducir
        </button>

        {onOpenReplyModal && (
          <button
            onClick={onOpenReplyModal}
            className="w-full bg-gray-900 active:bg-black text-white
                       py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-black transition-colors shadow-lg
                       flex items-center justify-center gap-2 touch-manipulation
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            Respondé con Dillo
          </button>
        )}

        <button
          onClick={onClose}
          className="w-full bg-brand active:bg-brand-dark text-white
                     py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-black transition-colors
                     flex items-center justify-center gap-2 touch-manipulation
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          <CloseIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          {closeLabel}
        </button>
      </div>

    </div>
  );
}

function AudioIndicator({ speechState }: { speechState: SpeechState }) {
  const isSpeaking = speechState === 'speaking';
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-colors duration-300 ${
        isSpeaking ? 'bg-brand' : 'bg-gray-100'
      }`}>
        {isSpeaking && (
          <>
            <span className="absolute inset-0 rounded-full bg-brand/30 animate-ping" />
            <span className="absolute -inset-2 rounded-full border-2 border-brand/20 animate-pulse" />
          </>
        )}
        <Volume2
          className={`w-6 h-6 sm:w-8 sm:h-8 relative z-10 transition-colors duration-300 ${
            isSpeaking ? 'text-white' : 'text-gray-400'
          }`}
        />
      </div>

      <div className="flex items-end gap-1 h-4 sm:h-5">
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 sm:w-2 h-4 sm:h-5 rounded-full origin-bottom transition-colors duration-300 ${
              isSpeaking ? 'bg-brand animate-sound-wave' : 'bg-gray-200'
            }`}
            style={isSpeaking ? { animationDelay: `${i * 0.12}s` } : { transform: 'scaleY(0.25)' }}
          />
        ))}
      </div>

      <p className="text-xs sm:text-sm text-gray-400 font-medium">
        {speechState === 'pending'
          ? 'Preparando audio…'
          : speechState === 'speaking'
          ? 'Reproduciendo…'
          : 'Mensaje reproducido'}
      </p>
    </div>
  );
}
