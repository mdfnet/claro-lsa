import { useState } from 'react';
import { Keyboard } from 'lucide-react';
import { useBackHandler } from '../hooks/useBackHandler';
import QuickTouchScreen from './QuickTouchScreen';

interface TextResponseModeProps {
  onSwitchToDillo?: () => void;
  isActive?: boolean;
  // Notifica al padre cuando el usuario confirma un mensaje (para historial)
  onMessage?: (msg: string) => void;
}

// "Responder con texto": el usuario sordo escribe su mensaje y lo confirma; recién
// ahí se muestra en letras grandes y se reproduce por voz, igual que un Toque
// Rápido. Separar tipeo y resultado en dos pantallas evita que el teclado tape el
// mensaje cuando hay que mostrarle la pantalla a la persona que atiende.
export default function TextResponseMode({ onSwitchToDillo, isActive = true, onMessage }: TextResponseModeProps) {
  const [text, setText] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  // Solo registra el back handler cuando este tab está visible.
  // Si está oculto (CSS display:none pero montado), no debe interceptar el back del IframeModal.
  useBackHandler(isActive && message !== null, () => { setMessage(null); setText(''); });

  if (message) {
    return (
      <QuickTouchScreen
        title={message}
        speech={message}
        icon={Keyboard}
        onClose={() => { setMessage(null); setText(''); }}
        closeLabel="Escribir otro mensaje"
        closeIcon={Keyboard}
        fullScreen={false}
        onOpenReplyModal={onSwitchToDillo}
      />
    );
  }

  const canSubmit = text.trim().length > 0;

  return (
    <div className="w-full h-full overflow-y-auto flex flex-col items-center justify-center px-6 py-8" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="flex flex-col items-center gap-4 sm:gap-6 max-w-xl w-full">
        <div className="text-center space-y-1">
          <p className="text-lg sm:text-2xl font-bold text-gray-900">¿Qué le querés decir?</p>
          <p className="text-xs sm:text-sm text-gray-500">
            Escribí tu mensaje. Se va a mostrar en letras grandes y se va a reproducir por el parlante.
          </p>
        </div>

        <div className="w-full">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribí acá tu mensaje..."
            rows={4}
            autoFocus
            className="w-full bg-gray-50 border-2 border-gray-200 focus:border-[#DA291C] rounded-2xl px-4 py-3 sm:px-5 sm:py-4 text-lg sm:text-2xl font-bold text-gray-900 outline-none placeholder-gray-300 resize-none transition-colors"
          />
        </div>

        <button
          onClick={() => {
            if (!canSubmit) return;
            const trimmed = text.trim();
            onMessage?.(trimmed);
            setMessage(trimmed);
          }}
          disabled={!canSubmit}
          className={`w-full py-3 sm:py-4 rounded-2xl text-base sm:text-lg font-bold transition-all duration-200 touch-manipulation ${
            canSubmit
              ? 'bg-[#DA291C] text-white shadow-lg active:bg-[#B01F16]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {canSubmit ? 'Mostrar y reproducir' : 'Escribí tu mensaje'}
        </button>
      </div>
    </div>
  );
}
