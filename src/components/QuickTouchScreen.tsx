import { useCallback, useEffect, useState } from 'react';
import { Check, RotateCcw, Volume2 } from 'lucide-react';

interface QuickTouchScreenProps {
  title: string;
  speech: string;
  icon: any;
  onClose: () => void;
}

const BAR_COUNT = 5;

export default function QuickTouchScreen({ title, speech, icon: Icon, onClose }: QuickTouchScreenProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const { body, documentElement: html } = document;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = html.style.overflow;
    const prevOverscroll = html.style.overscrollBehavior;

    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'none';

    return () => {
      body.style.overflow = prevBodyOverflow;
      html.style.overflow = prevHtmlOverflow;
      html.style.overscrollBehavior = prevOverscroll;
    };
  }, []);

  const playSpeech = useCallback(() => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(speech);
    const voices = window.speechSynthesis.getVoices();

    const latinAmericanVoice = voices.find(voice =>
      (voice.lang.startsWith('es-419') ||
       voice.lang.startsWith('es-MX') ||
       voice.lang.startsWith('es-AR') ||
       voice.lang.startsWith('es-CO') ||
       voice.lang.startsWith('es-CL') ||
       voice.lang.startsWith('es-VE') ||
       voice.lang.startsWith('es-PE') ||
       voice.lang.startsWith('es-UY')) &&
      !voice.name.toLowerCase().includes('spain') &&
      !voice.name.toLowerCase().includes('españa')
    );

    const neutralSpanishVoice = latinAmericanVoice || voices.find(voice =>
      voice.lang.startsWith('es') &&
      !voice.lang.startsWith('es-ES') &&
      !voice.name.toLowerCase().includes('spain') &&
      !voice.name.toLowerCase().includes('españa')
    );

    const fallbackVoice = neutralSpanishVoice || voices.find(voice => voice.lang.startsWith('es'));

    if (fallbackVoice) {
      utterance.voice = fallbackVoice;
    }

    utterance.lang = 'es-419';
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [speech]);

  useEffect(() => {
    playSpeech();

    return () => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    };
  }, [playSpeech]);

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-fade-in">
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 text-center gap-8 sm:gap-10">
        <div className="flex items-center gap-3 text-gray-500">
          {Icon && <Icon className="w-6 h-6 sm:w-7 sm:h-7" />}
          <p className="text-lg sm:text-xl font-medium">
            Mostrale la pantalla a la persona que te atiende
          </p>
        </div>

        <div className="bg-gray-50 border-4 border-[#DA291C] rounded-3xl px-8 py-10 sm:px-16 sm:py-14 max-w-3xl shadow-lg">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#DA291C] leading-tight">
            {title}
          </h1>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div
            className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-colors duration-300 ${
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
              className={`w-9 h-9 sm:w-10 sm:h-10 relative z-10 transition-colors duration-300 ${
                isSpeaking ? 'text-white' : 'text-gray-500'
              }`}
            />
          </div>

          <div className="flex items-end gap-1 h-8">
            {Array.from({ length: BAR_COUNT }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 sm:w-2 h-8 rounded-full origin-bottom transition-colors duration-300 ${
                  isSpeaking ? 'bg-[#DA291C] animate-sound-wave' : 'bg-gray-300'
                }`}
                style={isSpeaking ? { animationDelay: `${i * 0.12}s` } : { transform: 'scaleY(0.25)' }}
              />
            ))}
          </div>

          <p className="text-sm sm:text-base text-gray-500 font-medium">
            {isSpeaking ? 'Escuchando...' : 'Mensaje reproducido'}
          </p>

          <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={playSpeech}
              className="bg-white border-2 border-[#DA291C] text-[#DA291C] hover:bg-[#DA291C]/5 active:bg-[#DA291C]/10
                       px-6 py-4 sm:px-8 sm:py-5 rounded-2xl text-lg sm:text-xl font-semibold transition-colors duration-200
                       flex items-center gap-2 sm:gap-3 touch-manipulation"
            >
              <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Volver a reproducir</span>
            </button>

            <button
              onClick={onClose}
              className="bg-[#DA291C] hover:bg-[#B01F16] active:bg-[#8f1811] text-white px-8 py-4 sm:px-10 sm:py-5
                       rounded-2xl text-lg sm:text-xl font-semibold transition-colors duration-200
                       shadow-lg hover:shadow-xl flex items-center gap-2 sm:gap-3 touch-manipulation"
            >
              <Check className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Listo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
