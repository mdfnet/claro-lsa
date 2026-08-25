import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

// 'prompt' = permiso no pedido aún (estado neutro, visible mientras aparece el popup)
// 'unavailable' = la API no existe en este browser (se oculta el indicador)
type PermStatus = 'checking' | 'granted' | 'denied' | 'prompt' | 'unavailable';

// animate-pulse de Tailwind dura 2s. Con un delay negativo = -(Date.now() % 2000) ms
// todos los puntos entran al mismo punto de fase del ciclo, estén o no en el DOM al mismo tiempo.
const syncedPulse = (): React.CSSProperties => ({
  animationDelay: `-${(Date.now() % 2000) / 1000}s`,
});

function useDeviceStatus() {
  const [camera, setCamera] = useState<PermStatus>('checking');
  const [mic, setMic] = useState<PermStatus>('checking');

  useEffect(() => {
    // Usamos permissions.query() si está disponible: no activa hardware (sin spike de CPU/cámara).
    // Fallback a getUserMedia solo en browsers que no soportan la Permissions API.
    if (navigator.permissions) {
      Promise.all([
        navigator.permissions.query({ name: 'camera' as PermissionName }),
        navigator.permissions.query({ name: 'microphone' as PermissionName }),
      ])
        .then(([cam, mic]) => {
          const toStatus = (s: PermissionState): PermStatus =>
            s === 'granted' ? 'granted' : s === 'denied' ? 'denied' : 'prompt';
          setCamera(toStatus(cam.state));
          setMic(toStatus(mic.state));
        })
        .catch(() => {
          // permissions.query() falló (ej: browser viejo) — marcamos como disponibles
          setCamera('prompt');
          setMic('prompt');
        });
      return;
    }

    // Fallback: getUserMedia (activa hardware brevemente, pero solo en browsers sin Permissions API)
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamera('unavailable');
      setMic('unavailable');
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        stream.getTracks().forEach((t) => t.stop());
        setCamera('granted');
        setMic('granted');
      })
      .catch((err: DOMException) => {
        if (err.name === 'NotAllowedError') {
          navigator.mediaDevices.getUserMedia({ video: true })
            .then((s) => { s.getTracks().forEach((t) => t.stop()); setCamera('granted'); })
            .catch(() => setCamera('denied'));
          navigator.mediaDevices.getUserMedia({ audio: true })
            .then((s) => { s.getTracks().forEach((t) => t.stop()); setMic('granted'); })
            .catch(() => setMic('denied'));
        } else {
          setCamera('unavailable');
          setMic('unavailable');
        }
      });
  }, []);

  return { camera, mic };
}

interface StatusDotProps {
  status: PermStatus;
  labelGranted: string;
  labelDenied: string;
  labelPrompt: string;
  labelChecking?: string;
}

function StatusDot({ status, labelGranted, labelDenied, labelPrompt, labelChecking = 'Verificando…' }: StatusDotProps) {
  if (status === 'unavailable') return null;

  const pulse = syncedPulse();
  const dot: Record<PermStatus, React.ReactNode> = {
    checking:    <div className="w-3 h-3 bg-white/50 rounded-full animate-pulse flex-shrink-0" style={pulse} />,
    granted:     <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse flex-shrink-0" style={pulse} />,
    denied:      <div className="w-3 h-3 bg-red-400 rounded-full flex-shrink-0" />,
    prompt:      <div className="w-3 h-3 bg-yellow-300 rounded-full flex-shrink-0" />,
    unavailable: null,
  };

  const label: Record<PermStatus, string> = {
    checking:    labelChecking,
    granted:     labelGranted,
    denied:      labelDenied,
    prompt:      labelPrompt,
    unavailable: '',
  };

  return (
    <div className="flex items-center gap-2 text-white/80">
      {dot[status]}
      <span className="text-base sm:text-lg md:text-xl">{label[status]}</span>
    </div>
  );
}

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const { camera, mic } = useDeviceStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DA291C] to-[#B01F16] flex flex-col animate-fade-in relative overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="text-center space-y-8 sm:space-y-12 max-w-4xl w-full px-4">
        <div className="space-y-6 sm:space-y-8">
          <img
            src="/claro/icons/claro-logo.svg"
            alt="Claro"
            className="h-24 sm:h-32 md:h-40 mx-auto"
          />

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white tracking-tight">
            Bienvenido/a
          </h1>

          <p className="text-xl sm:text-2xl md:text-3xl text-white/90 font-light px-4 max-w-3xl mx-auto">
            Atención para personas sordas y para personas que no pueden hablar
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

        <div className="pt-8 sm:pt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-6">
          {/* Aplicación: siempre lista */}
          <div className="flex items-center gap-2 text-white/80">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse flex-shrink-0" style={syncedPulse()} />
            <span className="text-base sm:text-lg md:text-xl">Aplicación lista</span>
          </div>

          <StatusDot
            status={camera}
            labelGranted="Cámara lista"
            labelPrompt="Cámara disponible"
            labelDenied="Cámara bloqueada — activala en el navegador"
            labelChecking="Verificando cámara…"
          />

          <StatusDot
            status={mic}
            labelGranted="Micrófono listo"
            labelPrompt="Micrófono disponible"
            labelDenied="Micrófono bloqueado — activalo en el navegador"
            labelChecking="Verificando micrófono…"
          />
        </div>
      </div>
      </div>
    </div>
  );
}
