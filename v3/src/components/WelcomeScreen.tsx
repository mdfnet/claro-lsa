import { ChevronRight, Volume2, Camera, Mic, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

// CÁMARA/MIC en WelcomeScreen:
// - Solo consultamos el estado de permisos (Permissions API).
// - BUG-02: El fallback getUserMedia fue eliminado. Llamar getUserMedia sin gesto
//   del usuario abre el popup de permisos automáticamente en browsers sin
//   Permissions API (Samsung Internet, algunos WebViews). En esos casos,
//   mostramos 'prompt' por defecto — mejor que asustar al usuario con un popup.

type PermStatus = 'checking' | 'granted' | 'denied' | 'prompt' | 'unavailable';

const syncedPulse = (): React.CSSProperties => ({
  animationDelay: `-${(Date.now() % 2000) / 1000}s`,
});

function useDeviceStatus() {
  const [camera, setCamera] = useState<PermStatus>('checking');
  const [mic, setMic] = useState<PermStatus>('checking');

  useEffect(() => {
    let cancelled = false;

    const checkWithPermissionsAPI = async () => {
      try {
        const [cam, m] = await Promise.all([
          navigator.permissions.query({ name: 'camera' as PermissionName }),
          navigator.permissions.query({ name: 'microphone' as PermissionName }),
        ]);
        const toStatus = (s: PermissionState): PermStatus =>
          s === 'granted' ? 'granted' : s === 'denied' ? 'denied' : 'prompt';
        if (!cancelled) {
          setCamera(toStatus(cam.state));
          setMic(toStatus(m.state));
        }
      } catch {
        if (!cancelled) {
          setCamera('prompt');
          setMic('prompt');
        }
      }
    };

    if (navigator.permissions) {
      void checkWithPermissionsAPI();
    } else {
      // Permissions API no disponible — mostrar 'prompt' sin pedir getUserMedia.
      if (!cancelled) { setCamera('prompt'); setMic('prompt'); }
    }

    return () => { cancelled = true; };
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

function BlockedPermissionBanner({ camera, mic }: { camera: PermStatus; mic: PermStatus }) {
  const cameraBlocked = camera === 'denied';
  const micBlocked = mic === 'denied';
  if (!cameraBlocked && !micBlocked) return null;

  return (
    <div className="mx-6 mb-2 bg-white/20 border border-white/30 rounded-xl px-3 py-2.5 flex items-start gap-2.5">
      <AlertTriangle className="w-4 h-4 text-yellow-200 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-white font-bold text-xs leading-tight">Permisos bloqueados</p>
        {/* BUG-07: text-[11px] → text-xs (mínimo WCAG) */}
        <p className="text-white/80 text-xs mt-0.5 leading-snug">
          {cameraBlocked && micBlocked
            ? 'Cámara y micrófono bloqueados en este navegador.'
            : cameraBlocked
            ? 'Cámara bloqueada en este navegador.'
            : 'Micrófono bloqueado en este navegador.'}
          {' '}Entrá a Configuración del sitio para habilitarlos.
        </p>
        <div className="flex gap-1.5 mt-1.5 flex-wrap">
          {cameraBlocked && (
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
              <Camera className="w-3 h-3 text-white" />
              {/* BUG-07: text-[10px] → text-[11px] */}
              <span className="text-white text-[11px] font-bold">Cámara</span>
            </div>
          )}
          {micBlocked && (
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
              <Mic className="w-3 h-3 text-white" />
              <span className="text-white text-[11px] font-bold">Micrófono</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const { camera, mic } = useDeviceStatus();

  // BUG-21: "App lista" refleja el estado real de permisos.
  // Si cámara o mic están bloqueados, algunas funciones no estarán disponibles.
  const appStatus: PermStatus = (camera === 'denied' || mic === 'denied') ? 'prompt' : 'granted';
  const appLabel = appStatus === 'granted' ? 'App lista' : 'Funciones limitadas';

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-brand to-brand-dark flex flex-col animate-fade-in">

      {/* Logo */}
      <div className="flex-shrink-0 pt-6 sm:pt-10 px-6 flex justify-center">
        <img
          src={`${import.meta.env.BASE_URL}icons/claro-logo.svg`}
          alt="Claro"
          className="h-8 sm:h-11"
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 sm:py-6 text-center gap-4 sm:gap-7">

        <div className="w-20 h-20 sm:w-28 sm:h-28 bg-white/20 rounded-full flex items-center justify-center shadow-inner overflow-hidden">
          <img
            src={`${import.meta.env.BASE_URL}icons/lsa-hand.png`}
            alt="Lengua de Señas Argentina"
            className="w-full h-full object-contain mix-blend-screen -rotate-[30deg]"
          />
        </div>

        <div className="space-y-2 max-w-xs sm:max-w-sm">
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
            Bienvenido/a
          </h1>
          <p className="text-sm sm:text-xl text-white/85 leading-relaxed">
            Atención para personas sordas y para quienes no pueden hablar
          </p>
        </div>

        <button
          onClick={onStart}
          className="bg-white text-brand px-10 py-4 sm:px-14 sm:py-5
                     rounded-2xl text-xl sm:text-2xl font-black
                     shadow-2xl active:scale-95 transition-transform duration-150
                     flex items-center gap-3 touch-manipulation
                     focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
        >
          Comenzar
          <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>

        <div className="flex items-start gap-3 bg-white/15 rounded-2xl px-4 py-3 max-w-xs sm:max-w-sm text-left">
          <Volume2 className="w-5 h-5 text-white/90 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-base text-white/90 leading-snug">
            <strong className="font-bold text-white">Subí el volumen al máximo</strong> para que la persona que te atiende escuche los mensajes
          </p>
        </div>

      </div>

      <BlockedPermissionBanner camera={camera} mic={mic} />

      <div className="flex-shrink-0 pb-4 sm:pb-8 px-6">
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          <StatusPill status={appStatus} label={appLabel} />
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
