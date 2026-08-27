import { X, MessageCircle, Smartphone, Eye, EarOff, Camera, Sun, Languages } from 'lucide-react';
import { LSAHandIcon } from './LSAHandIcon';

interface HelpModalProps {
  onClose: () => void;
}

export default function HelpModal({ onClose }: HelpModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90dvh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <img
            src={`${import.meta.env.BASE_URL}icons/claro-logo-red-atlas-2.svg`}
            alt="Claro"
            className="h-8"
          />
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="p-3 active:bg-gray-100 rounded-full transition-colors touch-manipulation
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2
                       [@media(hover:hover)]:hover:bg-gray-100"
          >
            <X className="w-7 h-7 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div className="bg-gradient-to-br from-brand to-brand-dark rounded-2xl p-6 sm:p-8 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
              <EarOff className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={2} />
            </div>
            <h3 id="help-modal-title" className="text-2xl sm:text-3xl font-black text-white mb-2">
              No necesitás hablar ni escuchar
            </h3>
            <p className="text-white/90 text-base sm:text-lg">
              Todo es visual: señas, texto y mensajes listos para comunicarte con quien te atiende.
            </p>
          </div>

          <div className="space-y-5">
            <h4 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">4 formas de usar Dillo</h4>

            {[
              { Icon: LSAHandIcon,  title: '1. Hablo con mis manos',    body: 'Apuntá la cámara hacia vos y hacé tus señas. El sistema las reconoce y las convierte en texto y voz para la persona que te atiende.' },
              { Icon: MessageCircle, title: '2. Responder con Dillo',   body: 'El asesor escribe o habla, y Dillo te muestra su respuesta en Lengua de Señas Argentina.' },
              { Icon: Smartphone,   title: '3. Toques Rápidos',         body: 'Tocá el servicio que necesitás: pagar una factura, comprar un celular, recargar saldo y más. El mensaje aparece en pantalla grande para que la persona que te atiende lo vea de inmediato.' },
              { Icon: Languages,    title: '4. Responder con texto',    body: 'Escribí tu mensaje y aparece en letras grandes. La app lo reproduce por el parlante para que la persona que te atiende lo escuche.' },
            ].map(({ Icon, title, body }) => (
              <div key={title} className="flex items-start gap-4 bg-gray-50 rounded-2xl p-5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-brand rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h5 className="font-bold text-gray-900 text-lg mb-1">{title}</h5>
                  <p className="text-gray-700 text-base leading-relaxed">{body}</p>
                </div>
              </div>
            ))}

            <div className="flex items-start gap-4 bg-brand/5 border-2 border-brand/20 rounded-2xl p-5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white border-2 border-brand rounded-xl flex items-center justify-center flex-shrink-0">
                <Eye className="w-6 h-6 sm:w-7 sm:h-7 text-brand" strokeWidth={2} />
              </div>
              <div>
                <h5 className="font-bold text-gray-900 text-lg mb-1">Mostrale la pantalla</h5>
                <p className="text-gray-700 text-base leading-relaxed">
                  Después de elegir un servicio, mostrále la pantalla al asesor. El mensaje queda en letras grandes para que lo vea de inmediato.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6">
            <h4 className="font-bold text-gray-900 text-lg mb-4">Consejos útiles</h4>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <Camera className="w-6 h-6 text-brand flex-shrink-0" strokeWidth={2} />
                <span className="text-base text-gray-700">Activá la cámara para que el sistema pueda reconocer tus señas</span>
              </li>
              <li className="flex gap-3">
                <Sun className="w-6 h-6 text-brand flex-shrink-0" strokeWidth={2} />
                <span className="text-base text-gray-700">Buscá buena luz para que tu seña se vea clara</span>
              </li>
              <li className="flex gap-3">
                <Smartphone className="w-6 h-6 text-brand flex-shrink-0" strokeWidth={2} />
                <span className="text-base text-gray-700">Los toques rápidos ahorran tiempo: un solo toque y listo para mostrar la pantalla</span>
              </li>
            </ul>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={onClose}
              className="px-10 py-4 bg-brand active:bg-brand-dark text-white rounded-2xl text-lg font-bold
                         transition-colors touch-manipulation shadow-lg
                         [@media(hover:hover)]:hover:bg-brand-dark
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Entendido
            </button>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 rounded-b-2xl">
          <div className="flex items-center justify-center">
            <img
              src={`${import.meta.env.BASE_URL}icons/claro-logo-red-atlas-2.svg`}
              alt="Claro"
              className="h-6 opacity-60"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
