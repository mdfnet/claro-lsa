import { useState } from 'react';
import { Keyboard, ArrowRight } from 'lucide-react';
import { useBackHandler } from '../hooks/useBackHandler';
import QuickTouchScreen from './QuickTouchScreen';

interface TextResponseModeProps {
  onSwitchToDillo?: () => void;
  isActive?: boolean;
  onMessage?: (msg: string) => void;
}

export default function TextResponseMode({ onSwitchToDillo, isActive = true, onMessage }: TextResponseModeProps) {
  const [text, setText] = useState('');
  const [message, setMessage] = useState<string | null>(null);

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
    <div
      className="w-full h-full overflow-y-auto flex flex-col"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* Header contextual */}
      <div className="flex-shrink-0 bg-gray-50 border-b border-gray-100 px-5 py-4">
        <p className="text-base sm:text-lg font-black text-gray-900">Escribí tu mensaje</p>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Aparecerá en letras grandes y se reproducirá en voz alta para la persona que te atiende
        </p>
      </div>

      {/* Área de texto */}
      <div className="flex-1 px-5 py-5">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribí acá tu mensaje…"
          rows={5}
          autoFocus
          className="w-full h-full min-h-[160px] bg-white border-2 border-gray-200 focus:border-[#DA291C]
                     rounded-2xl px-4 py-4 sm:px-5 sm:py-5
                     text-lg sm:text-2xl font-bold text-gray-900
                     outline-none placeholder-gray-300 resize-none transition-colors"
        />
      </div>

      {/* Botón de envío */}
      <div className="flex-shrink-0 px-5 pb-5">
        <button
          onClick={() => {
            if (!canSubmit) return;
            const trimmed = text.trim();
            onMessage?.(trimmed);
            setMessage(trimmed);
          }}
          disabled={!canSubmit}
          className={`w-full py-4 rounded-2xl text-base sm:text-lg font-black transition-all duration-150 touch-manipulation
                      flex items-center justify-center gap-2 ${
            canSubmit
              ? 'bg-[#DA291C] text-white shadow-lg active:bg-[#A01E13] active:scale-[0.98]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {canSubmit ? (
            <>
              Mostrar y reproducir
              <ArrowRight className="w-5 h-5" />
            </>
          ) : (
            'Escribí tu mensaje primero'
          )}
        </button>
      </div>
    </div>
  );
}
