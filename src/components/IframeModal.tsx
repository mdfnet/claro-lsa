import { X } from 'lucide-react';

interface IframeModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

export default function IframeModal({ url, title, onClose }: IframeModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 relative">
          <iframe
            src={url}
            className="absolute inset-0 w-full h-full rounded-b-2xl"
            allow="camera; microphone; fullscreen"
            title={title}
          />
        </div>
      </div>
    </div>
  );
}
