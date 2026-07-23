import { X, Hand, MessageCircle, Smartphone, Eye, EarOff, Camera, Sun, Languages } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export default function HelpModal({ onClose }: HelpModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <img
            src="https://www.claro.com.ar/static/claro-logo-red-atlas-2.svg"
            alt="Claro"
            className="h-8"
          />
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="p-3 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors touch-manipulation"
          >
            <X className="w-7 h-7 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div className="bg-gradient-to-br from-[#DA291C] to-[#B01F16] rounded-2xl p-6 sm:p-8 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
              <EarOff className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={2} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
              No necesitás hablar ni escuchar
            </h3>
            <p className="text-white/90 text-base sm:text-lg">
              Todo en Dillo es visual: seña, texto grande y mensaje para la persona que te atiende.
            </p>
          </div>

          <div className="space-y-5">
            <h4 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">4 formas de usar Dillo</h4>

            <div className="flex items-start gap-4 bg-gray-50 rounded-2xl p-5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#DA291C] rounded-xl flex items-center justify-center flex-shrink-0">
                <Hand className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2} />
              </div>
              <div>
                <h5 className="font-bold text-gray-900 text-lg mb-1">1. Hablo con mis manos</h5>
                <p className="text-gray-700 text-base leading-relaxed">
                  Accedé y hace tu seña a la cámara. Tu seña se convierte en texto y voz para la persona que te atiende.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-gray-50 rounded-2xl p-5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#DA291C] rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2} />
              </div>
              <div>
                <h5 className="font-bold text-gray-900 text-lg mb-1">2. Responder con Dillo</h5>
                <p className="text-gray-700 text-base leading-relaxed">
                  Accedé para ver la respuesta de la persona hecha en seña por Dillo.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-gray-50 rounded-2xl p-5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#DA291C] rounded-xl flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2} />
              </div>
              <div>
                <h5 className="font-bold text-gray-900 text-lg mb-1">3. Toques Rápidos</h5>
                <p className="text-gray-700 text-base leading-relaxed">
                  Tocá el servicio que necesitás (pagar factura, comprar un celular, etc.). Aparece en letras grandes en la pantalla, lista para la persona que te atiende.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-gray-50 rounded-2xl p-5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#DA291C] rounded-xl flex items-center justify-center flex-shrink-0">
                <Languages className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2} />
              </div>
              <div>
                <h5 className="font-bold text-gray-900 text-lg mb-1">4. Traducir Página web</h5>
                <p className="text-gray-700 text-base leading-relaxed">
                  Podés tocar abajo o seleccionar el texto de la pagina web. Dillo lo convierte a lengua de señas.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-[#DA291C]/5 border-2 border-[#DA291C]/20 rounded-2xl p-5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white border-2 border-[#DA291C] rounded-xl flex items-center justify-center flex-shrink-0">
                <Eye className="w-6 h-6 sm:w-7 sm:h-7 text-[#DA291C]" strokeWidth={2} />
              </div>
              <div>
                <h5 className="font-bold text-gray-900 text-lg mb-1">Mostrale la pantalla</h5>
                <p className="text-gray-700 text-base leading-relaxed">
                  Luego de un toque rápido mostrale la pantalla a la persona que te atiende para que vea el mensaje en pantalla grande.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6">
            <h4 className="font-bold text-gray-900 text-lg mb-4">Consejos útiles</h4>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <Camera className="w-6 h-6 text-[#DA291C] flex-shrink-0" strokeWidth={2} />
                <span className="text-base text-gray-700">Activá la cámara para poder hacer tu seña</span>
              </li>
              <li className="flex gap-3">
                <Sun className="w-6 h-6 text-[#DA291C] flex-shrink-0" strokeWidth={2} />
                <span className="text-base text-gray-700">Busca brillo para que tu seña se vea clara</span>
              </li>
              <li className="flex gap-3">
                <Smartphone className="w-6 h-6 text-[#DA291C] flex-shrink-0" strokeWidth={2} />
                <span className="text-base text-gray-700">Los toques rápidos ahorran tiempo. un solo toque y listo para mostrar la pantalla</span>
              </li>
            </ul>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={onClose}
              className="px-10 py-4 bg-[#DA291C] hover:bg-[#B01F16] active:bg-[#8f1811] text-white rounded-2xl text-lg font-bold transition-colors touch-manipulation shadow-lg"
            >
              Entendido
            </button>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 rounded-b-2xl">
          <div className="flex items-center justify-center">
            <img
              src="https://www.claro.com.ar/static/claro-logo-red-atlas-2.svg"
              alt="Claro"
              className="h-6 opacity-60"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
