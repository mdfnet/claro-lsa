import { ChevronRight, Volume2, Hand } from 'lucide-react';
import { useEffect, useState } from 'react';

// UX CHANGE v2: Eliminamos VolumeReminderScreen como pantalla separada.
// El recordatorio de volumen va inline acá, como tip no-bloqueante.
// Justificación: cada usuario pierde 1 tap + 1 screen render en cada sesión.
// El dato (subir el volumen) es igualmente efectivo como nota secundaria junto al CTA.

type PermStatus = 'checking' | 'granted' | 'denied' | 'prompt' | 'unavailable';

const syncedPulse = (): React.CSSProperties => ({
  animationDelay: `-${(Date.now() % 2000) / 1000}s`,
});

function useDeviceStatus() {
  const [camera, setCamera] = useState<PermStatus>('checking');
  const [mic, setMic] = useState<PermStatus>('checking');

  useEffect(() => {
    if (navigator.permissions) {
      Promise.all([
        navigator.permissions.query({ name: 'camera' as PermissionName }),
        navigator.permissions.query({ name: 'microphone' as PermissionName }),
      ])
        .then(([cam, m]) => {
          const toStatus = (s: PermissionState): PermStatus =>
            s === 'granted' ? 'granted' : s === 'denied' ? 'denied' : 'prompt';
          setCamera(toStatus(cam.state));
          setMic(toStatus(m.state));
        })
        .catch(() => {
          setCamera('prompt');
          setMic('prompt');
        });
      return;
    }

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

function StatusPill({ status, label }: { status: PermStatus; label: string }) {
  if (status === 'unavailable') return null;

  const pulse = syncedPulse();

  const dot = {
    checking:    <span className="w-2 h-2 bg-white/50 rounded-full animate-pulse flex-shrink-0" style={pulse} />,
    granted:     <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" style={pulse} />,
    denied:      <span className="w-2 h-2 bg-red-300 rounded-full flex-shrink-0" />,
    prompt:      <span className="w-2 h-2 bg-yellow-300 rounded-full flex-shrink-0" />,
    unavailable: null,
  }[status];

  return (
    <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5">
      {dot}
      <span className="text-xs sm:text-sm text-white/90 font-medium">{label}</span>
    </div>
  );
}

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const { camera, mic } = useDeviceStatus();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#DA291C] to-[#A01E13] flex flex-col animate-fade-in">

      {/* Logo */}
      <div className="flex-shrink-0 pt-10 sm:pt-14 px-6 flex justify-center">
        <img
          src={`${import.meta.env.BASE_URL}icons/claro-logo.svg`}
          alt="Claro"
          className="h-9 sm:h-12"
        />
      </div>

      {/* Main content — centrado verticalmente */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center gap-7 sm:gap-9">

        {/* Ilustración */}
        <div className="w-20 h-20 sm:w-28 sm:h-28 bg-white/20 rounded-full flex items-center justify-center shadow-inner">
          <Hand className="w-10 h-10 sm:w-14 sm:h-14 text-white" strokeWidth={1.5} />
        </div>

        {/* Título */}
        <div className="space-y-3 max-w-xs sm:max-w-sm">
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight">
            Bienvenido/a
          </h1>
          <p className="text-base sm:text-xl text-white/85 leading-relaxed">
            Atención para personas sordas y para quienes no pueden hablar
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={onStart}
          className="bg-white text-[#DA291C] px-10 py-5 sm:px-14 sm:py-6
                     rounded-2xl text-xl sm:text-2xl font-black
                     shadow-2xl active:scale-95 transition-transform duration-150
                     flex items-center gap-3 touch-manipulation"
        >
          Comenzar
          <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>

        {/* Recordatorio de volumen — inline, sin bloquear
            En v1 esto era una pantalla separada (VolumeReminderScreen).
            Acá es información contextual junto al CTA. */}
        <div className="flex items-start gap-3 bg-white/15 rounded-2xl px-5 py-4 max-w-xs sm:max-w-sm text-left">
          <Volume2 className="w-5 h-5 text-white/90 flex-shrink-0 mt-0.5" />
          <p className="text-sm sm:text-base text-white/90 leading-snug">
            <strong className="font-bold text-white">Subí el volumen al máximo</strong> para que la persona que te atiende escuche los mensajes
          </p>
        </div>

      </div>

      {/* Estado de dispositivos — zona inferior */}
      <div className="flex-shrink-0 pb-8 sm:pb-12 px-6">
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          <StatusPill status="granted" label="App lista" />
          <StatusPill
            status={camera}
            label={
              camera === 'granted' ? 'Cámara lista' :
              camera === 'denied'  ? 'Cámara bloqueada' :
              camera === 'prompt'  ? 'Cámara disponible' : 'Verificando…'
            }
          />
          <StatusPill
            status={mic}
            label={
              mic === 'granted' ? 'Micrófono listo' :
              mic === 'denied'  ? 'Micrófono bloqueado' :
              mic === 'prompt'  ? 'Micrófono disponible' : 'Verificando…'
            }
          />
        </div>
      </div>

    </div>
  );
}
