import { useCallback, useEffect, useState } from 'react';
import { Check, RotateCcw, Volume2, MessageSquare } from 'lucide-react';

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

interface QuickTouchScreenProps {
  title: string;
  speech: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClose: () => void;
  parentTitle?: string;
  phoneNumber?: string;
  // Personalización del botón principal (usado por TextResponseMode)
  closeLabel?: string;
  closeIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  // false cuando vive dentro de otra pantalla (ej: TextResponseMode dentro de IframeModal)
  fullScreen?: boolean;
  // true: agrega banner de turno y botón "Asesor respondé acá" (flujo de Toques Rápidos)
  showConversation?: boolean;
  // Abre el modal de respuesta del asesor encima de esta pantalla (sin cerrarla)
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

  // Solo prevenimos pull-to-refresh en modo fullscreen
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

  return (
    <div className={`${fullScreen ? 'fixed inset-0 z-[60]' : 'w-full h-full'} bg-white flex flex-col animate-fade-in`}>

      {/* Banner de turno — solo en flujo de conversación */}
      {showConversation && (
        <div className="bg-[#DA291C] text-white text-center py-2.5 px-4 text-sm sm:text-base font-semibold flex-shrink-0">
          Mostrá esta pantalla al asesor
        </div>
      )}

      {/*
        Patrón correcto para "centrado cuando entra, scrolleable cuando no":
        - Outer: overflow-y-auto (scroll solo si el contenido no entra)
        - Inner: min-h-full + justify-center
      */}
      <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="min-h-full flex flex-col items-center justify-center px-6 py-6 sm:px-10 sm:py-8 text-center gap-5 sm:gap-8">

          {parentTitle && (
            <p className="text-2xl sm:text-3xl font-bold text-[#DA291C]">{parentTitle}</p>
          )}

          {/* Mensaje principal */}
          <div className="bg-gray-50 border-4 border-[#DA291C] rounded-3xl px-6 py-7 sm:px-16 sm:py-14 max-w-3xl shadow-lg w-full">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 leading-tight">
              {title}
            </h1>
            {phoneNumber && (
              <div className="mt-5 pt-5 sm:mt-6 sm:pt-6 border-t-2 border-[#DA291C]/20 flex flex-col gap-1">
                <p className="text-sm sm:text-base font-medium text-gray-500">Número de línea</p>
                <p className="text-3xl sm:text-4xl font-black text-gray-900 tracking-wide">{phoneNumber}</p>
              </div>
            )}
          </div>

          {/* Indicador de audio */}
          <div className="flex flex-col items-center gap-2 sm:gap-3">
            <div
              className={`relative w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-colors duration-300 ${
                isSpeaking ? 'bg-[#DA291C]' : 'bg-gray-200'
              }`}
            >
              {isSpeaking && (
                <>
                  <span className="absolute inset-0 rounded-full bg-[#DA291C]/40 animate-ping" />
                  <span className="absolute -inset-2 rounded-full border-2 border-[#DA291C]/30 animate-pulse" />
                </>
              )}
              <Volume2
                className={`w-7 h-7 sm:w-9 sm:h-9 relative z-10 transition-colors duration-300 ${
                  isSpeaking ? 'text-white' : 'text-gray-500'
                }`}
              />
            </div>

            <div className="flex items-end gap-1 h-5 sm:h-7">
              {Array.from({ length: BAR_COUNT }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 sm:w-2 h-5 sm:h-7 rounded-full origin-bottom transition-colors duration-300 ${
                    isSpeaking ? 'bg-[#DA291C] animate-sound-wave' : 'bg-gray-300'
                  }`}
                  style={isSpeaking ? { animationDelay: `${i * 0.12}s` } : { transform: 'scaleY(0.25)' }}
                />
              ))}
            </div>

            <p className="text-sm sm:text-base text-gray-500 font-medium">
              {isSpeaking ? 'Reproduciendo…' : 'Mensaje reproducido'}
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col items-center gap-3 w-full max-w-md">
            <button
              onClick={playSpeech}
              className="w-full bg-white border-2 border-[#DA291C] text-[#DA291C] active:bg-[#DA291C]/10
                       py-3 sm:py-4 rounded-2xl text-base sm:text-lg font-semibold transition-colors
                       flex items-center justify-center gap-2 touch-manipulation"
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
              Volver a reproducir
            </button>

            {/* Botón para que el asesor responda — aparece siempre que haya callback,
                tanto en Toques Rápidos (fullscreen) como en Responder con texto (dentro de IframeModal) */}
            {onOpenReplyModal && (
              <button
                onClick={onOpenReplyModal}
                className="w-full bg-gray-800 active:bg-gray-900 text-white
                           py-3 sm:py-4 rounded-2xl text-base sm:text-lg font-bold transition-colors shadow-lg
                           flex items-center justify-center gap-2 touch-manipulation"
              >
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                Asesor: respondé con Dillo →
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full bg-[#DA291C] active:bg-[#B01F16] text-white
                       py-3 sm:py-4 rounded-2xl text-base sm:text-lg font-bold transition-colors shadow-lg
                       flex items-center justify-center gap-2 touch-manipulation"
            >
              <CloseIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              {showConversation ? 'Terminar atención' : closeLabel}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
