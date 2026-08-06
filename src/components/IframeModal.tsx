import { X } from 'lucide-react';
import { useEffect } from 'react';

interface IframeModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

export default function IframeModal({ url, title, onClose }: IframeModalProps) {
  useEffect(() => {
    const widget = document.querySelector('dillo-interpreter');
    // Guardamos la configuración del plugin (por ejemplo brand-logo, el ícono de
    // la burbuja) porque al recrearlo hay que devolvérsela: el plugin lee sus
    // atributos una sola vez, en connectedCallback, y sin ellos vuelve a los
    // valores por defecto.
    const attributes = widget
      ? Array.from(widget.attributes).map((attr) => [attr.name, attr.value] as const)
      : null;
    widget?.remove();

    return () => {
      if (attributes && !document.querySelector('dillo-interpreter')) {
        const restored = document.createElement('dillo-interpreter');
        attributes.forEach(([name, value]) => restored.setAttribute(name, value));
        document.body.appendChild(restored);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-white z-50 animate-fade-in">
      <button
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute top-4 right-4 z-10 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
      >
        <X className="w-6 h-6 text-gray-900" />
      </button>

      <iframe
        src={url}
        className="w-full h-full"
        allow="camera; microphone; fullscreen"
        title={title}
      />
    </div>
  );
}
