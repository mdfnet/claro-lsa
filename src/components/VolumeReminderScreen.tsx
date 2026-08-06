import { Volume2, ChevronRight } from 'lucide-react';

interface VolumeReminderScreenProps {
  onContinue: () => void;
}

export default function VolumeReminderScreen({ onContinue }: VolumeReminderScreenProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="max-w-lg w-full text-center space-y-10">

        {/* Ícono con anillos animados */}
        <div className="flex justify-center">
          <div className="relative">
            <span className="absolute inset-0 rounded-full bg-[#DA291C]/15 animate-ping" />
            <span className="absolute -inset-4 rounded-full border-2 border-[#DA291C]/20 animate-pulse" />
            <div className="relative w-28 h-28 bg-[#DA291C] rounded-full flex items-center justify-center shadow-xl">
              <Volume2 className="w-14 h-14 text-white" strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* Texto */}
        <div className="space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Subí el volumen al máximo
          </h2>
          <p className="text-lg sm:text-xl text-gray-500 leading-relaxed">
            La app le va a hablar en voz alta a la persona que te atiende.
            Para que pueda escuchar bien, <strong className="text-gray-700">el volumen tiene que estar al máximo</strong>.
          </p>
        </div>

        {/* Botón continuar */}
        <button
          onClick={onContinue}
          className="group w-full bg-[#DA291C] hover:bg-[#B01F16] active:bg-[#8f1811] text-white
                     px-8 py-5 rounded-2xl text-xl font-bold transition-all duration-200
                     shadow-lg hover:shadow-xl flex items-center justify-center gap-3 touch-manipulation"
        >
          <span>Listo, empezar</span>
          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>

      </div>
    </div>
  );
}
