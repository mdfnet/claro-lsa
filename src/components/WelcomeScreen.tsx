import { ChevronRight, Play } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
  onHelp: () => void;
  onAbout: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);

  useEffect(() => {
    if (videoRef.current && !hasPlayedOnce) {
      videoRef.current.play();
      setIsPlaying(true);
      setHasPlayedOnce(true);
    }
  }, [hasPlayedOnce]);

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DA291C] to-[#B01F16] flex flex-col animate-fade-in relative overflow-hidden">
      <div className="absolute top-8 right-8 sm:top-12 sm:right-12 md:top-16 md:right-16 z-10">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 w-32 sm:w-40 md:w-48 shadow-2xl">
          <video
            ref={videoRef}
            muted
            playsInline
            onEnded={handleVideoEnded}
            className="w-full h-auto rounded-xl"
          >
            <source src="https://dillo.ai/videos/Iniciar-avatar.mp4" type="video/mp4" />
          </video>
        </div>

        {!isPlaying && (
          <button
            onClick={handlePlayVideo}
            className="mt-2 w-full bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-xl
                     flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105
                     backdrop-blur-sm shadow-lg"
          >
            <Play className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-medium">Reproducir</span>
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="text-center space-y-8 sm:space-y-12 max-w-4xl w-full px-4">
        <div className="space-y-6 sm:space-y-8">
          <img
            src="https://www.claro.com.ar/static/claro-logo.svg"
            alt="Claro"
            className="h-24 sm:h-32 md:h-40 mx-auto"
          />

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white tracking-tight">
            Bienvenidos
          </h1>

          <p className="text-xl sm:text-2xl md:text-3xl text-white/90 font-light px-4 max-w-3xl mx-auto">
            Atención accesible para todas las personas con discapacidad en el habla
          </p>
        </div>

        <button
          onClick={onStart}
          className="group relative bg-white text-[#DA291C] px-8 py-5 sm:px-12 sm:py-6 md:px-16 md:py-8
                   rounded-2xl text-xl sm:text-2xl md:text-3xl font-semibold
                   hover:bg-white/95 active:bg-white/90 transition-all duration-300 hover:scale-105 active:scale-95
                   shadow-2xl hover:shadow-3xl flex items-center gap-3 sm:gap-4 mx-auto"
        >
          <span>Comenzar</span>
          <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 group-hover:translate-x-2 transition-transform" />
        </button>

        <div className="pt-8 sm:pt-12">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-white/80">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-base sm:text-lg md:text-xl">Cámara activa</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-white/50 rounded-full"></div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-base sm:text-lg md:text-xl">Sistema listo</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
