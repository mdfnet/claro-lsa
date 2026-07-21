import { useState, useEffect } from 'react';
import { ChevronLeft, Lock, Unlock, Type, Contrast, Smartphone, Package, Percent, Gift, ChevronRight, MessageCircle, Video } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

interface InterpreterModeProps {
  service: string;
  onBack: () => void;
  onHelp?: () => void;
  onAbout?: () => void;
}

interface QuickAction {
  id: string;
  label: string;
  icon: any;
}

export default function InterpreterMode({ service, onBack, onHelp, onAbout }: InterpreterModeProps) {
  const [privateMode, setPrivateMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [expandedAction, setExpandedAction] = useState<string | null>('purchases');
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setVoicesLoaded(true);
      }
    };

    if ('speechSynthesis' in window) {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const quickActions: QuickAction[] = [
    { id: 'catalog', label: 'Ver catálogo de celulares', icon: Smartphone },
    { id: 'plan', label: 'Contratar plan', icon: Package },
    { id: 'promotions', label: 'Ver promociones', icon: Percent },
    { id: 'accessories', label: 'Accesorios', icon: Gift }
  ];

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

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

      const fallbackVoice = neutralSpanishVoice || voices.find(voice =>
        voice.lang.startsWith('es')
      );

      if (fallbackVoice) {
        utterance.voice = fallbackVoice;
      }

      utterance.lang = 'es-419';
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.volume = 1;

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleActionClick = (actionId: string, label: string) => {
    speakText(label);
    console.log(`Action selected: ${actionId}`);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-500 ${
      privateMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'
    } ${highContrast ? 'high-contrast' : ''}`}>

      <Header showMenu={true} onHelp={onHelp} onAbout={onAbout} />

      <div className={`flex-1 overflow-y-auto relative transition-all duration-500 ${
        privateMode ? 'opacity-40' : 'opacity-100'
      }`}>
        <div className="absolute top-4 sm:top-6 md:top-8 left-2 sm:left-4 md:left-6 z-50 pointer-events-none">
          <button
            onClick={onBack}
            className="pointer-events-auto bg-white/90 backdrop-blur-sm text-gray-700 px-4 py-3 sm:px-5 sm:py-3.5 md:px-6 md:py-4 rounded-lg sm:rounded-xl
                     hover:bg-white active:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl
                     flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl font-medium"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="hidden sm:inline">Volver</span>
            <span className="sm:hidden">Atrás</span>
          </button>
        </div>

        <div className="absolute top-4 sm:top-6 md:top-8 right-2 sm:right-4 md:right-6 z-50 flex gap-2 sm:gap-3 md:gap-4 pointer-events-none">
          <button
            onClick={() => setPrivateMode(!privateMode)}
            className="pointer-events-auto bg-white/90 backdrop-blur-sm text-gray-700 p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl
                     hover:bg-white active:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl"
            title={privateMode ? "Desactivar modo privado" : "Activar modo privado"}
          >
            {privateMode ? <Unlock className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" /> : <Lock className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />}
          </button>

          <button
            onClick={() => setHighContrast(!highContrast)}
            className="pointer-events-auto hidden sm:flex bg-white/90 backdrop-blur-sm text-gray-700 p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl
                     hover:bg-white active:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl"
            title="Alto contraste"
          >
            <Contrast className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
          </button>

          <button
            onClick={() => setLargeText(!largeText)}
            className="pointer-events-auto hidden sm:flex bg-white/90 backdrop-blur-sm text-gray-700 p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl
                     hover:bg-white active:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl"
            title="Aumentar tamaño de texto"
          >
            <Type className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
          </button>
        </div>
        <div className="pt-20 sm:pt-24 md:pt-28 pb-8 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-[200px] bg-gradient-to-br from-[#DA291C] to-[#B01F16] flex flex-col items-center justify-center p-5">
                <div className="absolute inset-0 bg-white/10"></div>

                <div className="relative z-10 flex flex-col items-center justify-center space-y-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 shadow-lg">
                    <MessageCircle className="w-10 h-10 text-white" strokeWidth={2} />
                  </div>

                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-1.5">
                      <Smartphone className="w-5 h-5 text-white" strokeWidth={2} />
                      <span className="text-2xl font-black text-white tracking-tight drop-shadow-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                        Claro
                      </span>
                    </div>

                    <h2 className={`font-bold text-white leading-tight drop-shadow-md ${largeText ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'}`}>
                      Me comunico con señas
                    </h2>

                    <p className="text-white text-sm max-w-xs mx-auto drop-shadow-sm">
                      Haz tu seña y nosotros te entendemos
                    </p>
                  </div>

                  <button
                    onClick={() => window.open('https://app.dillo.ai/interprete', '_blank')}
                    className="mt-2 bg-white text-[#DA291C] px-5 py-2.5 rounded-lg font-bold text-sm
                             hover:bg-gray-50 active:bg-gray-100 transition-all duration-200
                             shadow-md hover:shadow-lg hover:scale-105 active:scale-95
                             flex items-center gap-2"
                  >
                    <Video className="w-4 h-4" />
                    <span>Iniciar</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-[200px] bg-gradient-to-br from-[#0066CC] to-[#0055AA] flex flex-col items-center justify-center p-5">
                <div className="absolute inset-0 bg-white/10"></div>

                <div className="relative z-10 flex flex-col items-center justify-center space-y-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 shadow-lg">
                    <Video className="w-10 h-10 text-white" strokeWidth={2} />
                  </div>

                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-1.5">
                      <Smartphone className="w-5 h-5 text-white" strokeWidth={2} />
                      <span className="text-2xl font-black text-white tracking-tight drop-shadow-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                        Claro
                      </span>
                    </div>

                    <h2 className={`font-bold text-white leading-tight drop-shadow-md ${largeText ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'}`}>
                      Respondo con señas
                    </h2>

                    <p className="text-white text-sm max-w-xs mx-auto drop-shadow-sm">
                      Nuestra respuesta en señas
                    </p>
                  </div>

                  <button
                    onClick={() => window.open('https://avatar.dillo.ai/', '_blank')}
                    className="mt-2 bg-white text-[#0066CC] px-5 py-2.5 rounded-lg font-bold text-sm
                             hover:bg-gray-50 active:bg-gray-100 transition-all duration-200
                             shadow-md hover:shadow-lg hover:scale-105 active:scale-95
                             flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Ver respuesta</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#DA291C] to-[#B01F16] p-4 sm:p-5 md:p-6">
              <h2 className={`text-white font-bold ${largeText ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
                Toques Rápidos
              </h2>
            </div>
            <div className="p-4 sm:p-5 md:p-6">
              <div className="border-2 border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedAction(expandedAction === 'purchases' ? null : 'purchases')}
                  className="w-full bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200
                           active:from-gray-200 active:to-gray-300 p-4 sm:p-5 md:p-6 flex items-center justify-between transition-all duration-300"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm">
                      <Smartphone className="w-6 h-6 sm:w-7 sm:h-7 text-[#DA291C]" strokeWidth={2} />
                    </div>
                    <span className={`font-semibold text-gray-800 ${largeText ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'}`}>
                      Compras
                    </span>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-400 transition-transform duration-300
                              ${expandedAction === 'purchases' ? 'rotate-90' : ''}`}
                  />
                </button>

                <div
                  className={`transition-all duration-300 ease-out overflow-hidden
                            ${expandedAction === 'purchases' ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="p-3 sm:p-4 space-y-2 bg-white">
                    {quickActions.map((action) => {
                      const ActionIcon = action.icon;
                      return (
                        <button
                          key={action.id}
                          onClick={() => handleActionClick(action.id, action.label)}
                          className="w-full bg-white hover:bg-[#DA291C]/5 active:bg-[#DA291C]/10 border-2 border-gray-100
                                   hover:border-[#DA291C]/30 p-4 sm:p-5 rounded-lg sm:rounded-xl
                                   transition-all duration-200 flex items-center gap-3 sm:gap-4
                                   hover:scale-[1.02] active:scale-[0.98] hover:shadow-md group"
                        >
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 group-hover:bg-[#DA291C]/10
                                        rounded-lg flex items-center justify-center transition-colors">
                            <ActionIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#DA291C]" strokeWidth={2} />
                          </div>
                          <span className={`font-medium text-gray-700 text-left ${
                            largeText ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
                          }`}>
                            {action.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
