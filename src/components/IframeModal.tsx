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
    const hadWidget = widget !== null;
    widget?.remove();

    return () => {
      if (hadWidget && !document.querySelector('dillo-interpreter')) {
        document.body.appendChild(document.createElement('dillo-interpreter'));
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
