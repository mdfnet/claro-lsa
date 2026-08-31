import { Play, SkipForward } from 'lucide-react';
import { useState, useRef } from 'react';

const VIDEO_URL = 'https://dillo.ar/videos/Intro-Claro_1.mp4';

interface VideoIntroScreenProps {
  onFinish: () => void;
  onSkip: () => void;
}

export default function VideoIntroScreen({ onFinish, onSkip }: VideoIntroScreenProps) {
  const [phase, setPhase] = useState<'preview' | 'playing'>('preview');
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    setPhase('playing');
    setTimeout(() => videoRef.current?.play(), 100);
  };

  if (phase === 'preview') {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-b from-brand to-brand-dark flex flex-col items-center justify-center px-6 py-10 text-center gap-6 animate-fade-in">

        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center shadow-inner">
          <Play className="w-9 h-9 text-white fill-white" />
        </div>

        <div className="space-y-3 max-w-xs sm:max-w-sm">
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            Video introductorio
          </h2>
          <p className="text-sm sm:text-lg text-white/85 leading-relaxed">
            Antes de comenzar, te recomendamos ver este breve video.
            Te explicamos cómo usar la app para comunicarte fácilmente con el personal de Claro.
          </p>
          <p className="text-xs sm:text-sm text-white/60 leading-snug">
            Duración aproximada: 1 minuto
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={handlePlay}
            className="bg-white text-brand px-8 py-4 rounded-2xl text-lg sm:text-xl font-black
                       shadow-2xl active:scale-95 transition-transform duration-150
                       flex items-center justify-center gap-3 touch-manipulation
                       focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
          >
            <Play className="w-5 h-5 fill-brand" />
            Ver video
          </button>

          <button
            onClick={onSkip}
            className="bg-white/15 text-white px-8 py-3.5 rounded-2xl text-base sm:text-lg font-bold
                       active:scale-95 transition-transform duration-150
                       flex items-center justify-center gap-2 touch-manipulation
                       focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
          >
            <SkipForward className="w-5 h-5" />
            Saltar
          </button>
        </div>

      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-black relative animate-fade-in">
      <video
        ref={videoRef}
        src={VIDEO_URL}
        className="w-full h-[100dvh] object-contain"
        controls
        playsInline
        onEnded={onFinish}
      />
      <div className="absolute bottom-6 right-4 z-10">
        <button
          onClick={onFinish}
          className="bg-black/50 backdrop-blur-sm text-white px-6 py-3 rounded-xl text-base font-bold
                     border border-white/20
                     active:scale-95 transition-transform duration-150
                     flex items-center gap-2 touch-manipulation"
        >
          Saltar
          <SkipForward className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
