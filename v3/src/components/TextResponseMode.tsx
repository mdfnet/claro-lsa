import { useEffect, useRef, useState } from 'react';
import { Keyboard, ArrowRight } from 'lucide-react';
import { useBackHandler } from '../hooks/useBackHandler';
import QuickTouchScreen from './QuickTouchScreen';

// FIX TECLADO VIRTUAL:
// IframeModal usa `fixed inset-0`. Cuando el teclado sube en Android/iOS,
// el contenedor `fixed` mantiene su altura original → el botón de envío queda
// tapado debajo del teclado.
//
// Solución: `window.visualViewport` siempre refleja el área visible real
// (restando el teclado). Calculamos keyboardHeight y lo aplicamos como
// padding-bottom en el área scrolleable → el botón sube con el teclado.
// Además, hacemos scroll al botón automáticamente cuando el teclado abre.

interface TextResponseModeProps {
  onSwitchToDillo?: () => void;
  isActive?: boolean;
  onMessage?: (msg: string) => void;
}

function useKeyboardPadding() {
  const [pad, setPad] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      // keyboardHeight = diferencia entre layout viewport y visual viewport
      const keyboard = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setPad(keyboard);
    };

    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  return pad;
}

export default function TextResponseMode({ onSwitchToDillo, isActive = true, onMessage }: TextResponseModeProps) {
  const [text, setText] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const keyboardPad = useKeyboardPadding();

  useEffect(() => {
    if (!isActive) { setMessage(null); setText(''); }
  }, [isActive]);

  // Re-aplica foco al textarea cada vez que el tab se vuelve activo.
  // autoFocus solo funciona en el primer mount; este effect cubre visitas posteriores.
  useEffect(() => {
    if (isActive && !message) {
      const t = setTimeout(() => textareaRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isActive, message]);

  useBackHandler(isActive && message !== null, () => { setMessage(null); setText(''); });

  // Cuando el teclado sube (keyboardPad > 0), hace scroll al botón de envío
  // para que quede visible justo por encima del teclado
  useEffect(() => {
    if (keyboardPad > 0 && btnRef.current) {
      // Pequeño delay para que el layout termine de ajustarse
      const t = setTimeout(() => {
        btnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 80);
      return () => clearTimeout(t);
    }
  }, [keyboardPad]);

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
    <div className="w-full h-full flex flex-col">

      {/* Header contextual — siempre visible arriba */}
      <div className="flex-shrink-0 bg-gray-50 border-b border-gray-100 px-5 py-4">
        <p className="text-base sm:text-lg font-black text-gray-900">Escribí tu mensaje</p>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Aparecerá en letras grandes y se reproducirá en voz alta para la persona que te atiende
        </p>
      </div>

      {/* Área scrolleable: textarea + botón juntos.
          padding-bottom = altura del teclado → el botón siempre queda
          por encima del teclado y es alcanzable con scroll. */}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          WebkitOverflowScrolling: 'touch',
          paddingBottom: keyboardPad > 0 ? `${keyboardPad + 16}px` : undefined,
        }}
      >
        <div className="px-5 py-5 flex flex-col gap-4">

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribí acá tu mensaje…"
            rows={5}
            className="w-full min-h-[160px] bg-white border-2 border-gray-200 focus:border-brand
                       rounded-2xl px-4 py-4 sm:px-5 sm:py-5
                       text-lg sm:text-2xl font-bold text-gray-900
                       outline-none placeholder-gray-300 resize-none transition-colors"
          />

          {/* Botón de envío — en el flujo del scroll, no en posición fija */}
          <button
            ref={btnRef}
            onClick={() => {
              if (!canSubmit) return;
              const trimmed = text.trim();
              onMessage?.(trimmed);
              setMessage(trimmed);
            }}
            disabled={!canSubmit}
            className={`w-full py-4 rounded-2xl text-base sm:text-lg font-black transition-all duration-150 touch-manipulation
                        flex items-center justify-center gap-2
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
              canSubmit
                ? 'bg-brand text-white shadow-lg active:bg-brand-dark active:scale-[0.98] focus-visible:ring-brand'
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

    </div>
  );
}
