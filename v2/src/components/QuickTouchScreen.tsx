import { useCallback, useEffect, useState } from 'react';
import { Check, RotateCcw, Volume2, MessageSquare, X } from 'lucide-react';

// Android Chrome carga las voces TTS de forma asíncrona. Llamar getVoices()
// en el primer render devuelve array vacío en Samsung/Motorola → speak() falla
// silenciosamente. Esperamos el evento voiceschanged con fallback de 1.5s.
function getVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) return Promise.resolve(voices);
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.speechSynthesis.removeEventListener('voiceschanged', finish);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener('voiceschanged', finish);
    // Algunos engines Android nunca disparan voiceschanged — fallback para no colgar
    setTimeout(finish, 1500);
  });
}

// Elige la mejor voz española disponible priorizando acento latinoamericano.
// Si no hay ninguna, devuelve null y el browser usa su voz por defecto
// (mejor que silencio en algunos engines Android).
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

// v2 DESIGN CHANGES:
// showConversation=true → layout dramaticamente distinto para el pase de teléfono.
// El fondo superior es rojo ("ASESOR, leé esto"), la caja del mensaje es más prominente.
// Clarifica visualmente quién debe leer qué.

interface QuickTouchScreenProps {
  title: string;
  speech: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClose: () => void;
  parentTitle?: string;
  phoneNumber?: string;
  closeLabel?: string;
  closeIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  fullScreen?: boolean;
  showConversation?: boolean;
  onOpenReplyModal?: () => void;
}

const BAR_COUNT = 5;

export default function QuickTouchScreen({
  title, speech, icon: _Icon, onClose,
  parentTitle, phoneNumber,
  closeLabel = 'Listo', closeIcon: CloseIcon = Check,
  fullScreen = true,
  showConversation = false,
  onOpenReplyModal,
}: QuickTouchScreenProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

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

    void (async () => {
      const voices = await getVoicesAsync();
      const picked = pickSpanishVoice(voices);

      const utterance = new SpeechSynthesisUtterance(speech);
      if (picked) utterance.voice = picked;
      // Usamos el lang de la voz encontrada: 'es-419' no lo reconocen todos los
      // engines Android (Samsung, Motorola), lo que provoca silencio en campo.
      utterance.lang = picked?.lang ?? 'es-AR';
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.volume = 1;

      // Bug de Chrome Android: speechSynthesis.speak() se pausa silenciosamente
      // después de ~15s. Workaround: hacer resume() cada 5s mientras habla.
      let resumeTimer: ReturnType<typeof setInterval> | null = null;

      utterance.onstart = () => {
        setIsSpeaking(true);
        resumeTimer = setInterval(() => {
          if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        }, 5000);
      };
      const cleanup = () => {
        setIsSpeaking(false);
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
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    };
  }, [playSpeech]);

  // ── Modo conversación (Toques Rápidos): layout "pasa el teléfono" ────────────
  if (showConversation) {
    return (
      <div className={`${fullScreen ? 'fixed inset-0 z-[60]' : 'w-full h-full'} bg-white flex flex-col animate-fade-in`}>

        {/* Zona del asesor — rojo, arriba */}
        <div className="bg-[#DA291C] flex-shrink-0 px-5 py-4 sm:py-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-white/70 font-semibold uppercase tracking-wide">Para el asesor</p>
              <p className="text-white font-black text-sm sm:text-base leading-tight">Leé el mensaje de abajo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="w-9 h-9 bg-white/20 active:bg-white/30 rounded-full flex items-center justify-center flex-shrink-0 touch-manipulation"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Mensaje principal */}
        <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="min-h-full flex flex-col items-center justify-center px-5 py-6 sm:px-8 sm:py-10 text-center gap-5">

            {parentTitle && (
              <p className="text-xl sm:text-2xl font-black text-[#DA291C]">{parentTitle}</p>
            )}

            {/* Caja del mensaje */}
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

            {/* Indicador de audio */}
            <AudioIndicator isSpeaking={isSpeaking} />

          </div>
        </div>

        {/* Acciones — zona inferior */}
        <div className="flex-shrink-0 bg-white border-t border-gray-100 px-5 py-4 sm:px-6 space-y-2.5">
          <button
            onClick={playSpeech}
            className="w-full bg-gray-100 active:bg-gray-200 text-gray-700
                       py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-bold transition-colors
                       flex items-center justify-center gap-2 touch-manipulation"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            Volver a reproducir
          </button>

          {onOpenReplyModal && (
            <button
              onClick={onOpenReplyModal}
              className="w-full bg-gray-900 active:bg-black text-white
                         py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-black transition-colors shadow-lg
                         flex items-center justify-center gap-2 touch-manipulation"
            >
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              Asesor: respondé con Dillo →
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full bg-[#DA291C] active:bg-[#A01E13] text-white
                       py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-black transition-colors
                       flex items-center justify-center gap-2 touch-manipulation"
          >
            <CloseIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            Terminar atención
          </button>
        </div>

      </div>
    );
  }

  // ── Modo texto (TextResponseMode): layout limpio sin zona del asesor ─────────
  return (
    <div className={`${fullScreen ? 'fixed inset-0 z-[60]' : 'w-full h-full'} bg-white flex flex-col animate-fade-in`}>

      <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="min-h-full flex flex-col items-center justify-center px-5 py-8 sm:px-8 sm:py-12 text-center gap-5 sm:gap-7">

          {parentTitle && (
            <p className="text-xl sm:text-2xl font-black text-[#DA291C]">{parentTitle}</p>
          )}

          <div className="w-full max-w-2xl bg-gray-50 border-4 border-[#DA291C] rounded-3xl px-6 py-8 sm:px-12 sm:py-14 shadow-lg">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 leading-tight">
              {title}
            </h1>
          </div>

          <AudioIndicator isSpeaking={isSpeaking} />

        </div>
      </div>

      <div className="flex-shrink-0 bg-white border-t border-gray-100 px-5 py-4 sm:px-6 space-y-2.5">
        <button
          onClick={playSpeech}
          className="w-full bg-gray-100 active:bg-gray-200 text-gray-700
                     py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-bold transition-colors
                     flex items-center justify-center gap-2 touch-manipulation"
        >
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          Volver a reproducir
        </button>

        {onOpenReplyModal && (
          <button
            onClick={onOpenReplyModal}
            className="w-full bg-gray-900 active:bg-black text-white
                       py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-black transition-colors shadow-lg
                       flex items-center justify-center gap-2 touch-manipulation"
          >
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            Asesor: respondé con Dillo →
          </button>
        )}

        <button
          onClick={onClose}
          className="w-full bg-[#DA291C] active:bg-[#A01E13] text-white
                     py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-black transition-colors
                     flex items-center justify-center gap-2 touch-manipulation"
        >
          <CloseIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          {closeLabel}
        </button>
      </div>

    </div>
  );
}

function AudioIndicator({ isSpeaking }: { isSpeaking: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-colors duration-300 ${
        isSpeaking ? 'bg-[#DA291C]' : 'bg-gray-100'
      }`}>
        {isSpeaking && (
          <>
            <span className="absolute inset-0 rounded-full bg-[#DA291C]/30 animate-ping" />
            <span className="absolute -inset-2 rounded-full border-2 border-[#DA291C]/20 animate-pulse" />
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
              isSpeaking ? 'bg-[#DA291C] animate-sound-wave' : 'bg-gray-200'
            }`}
            style={isSpeaking ? { animationDelay: `${i * 0.12}s` } : { transform: 'scaleY(0.25)' }}
          />
        ))}
      </div>

      <p className="text-xs sm:text-sm text-gray-400 font-medium">
        {isSpeaking ? 'Reproduciendo…' : 'Mensaje reproducido'}
      </p>
    </div>
  );
}
