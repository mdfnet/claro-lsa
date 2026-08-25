import { X, Hand, MessageCircle, Smartphone, Eye, EarOff, Camera, Sun, Languages } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export default function HelpModal({ onClose }: HelpModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 animate-fade-in">
      {/* v2: bottom sheet en mobile, modal centrado en tablet+ */}
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto flex flex-col animate-sheet-up sm:animate-fade-in">

        {/* Header sticky */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-3xl z-10">
          <img
            src={`${import.meta.env.BASE_URL}icons/claro-logo-red-atlas-2.svg`}
            alt="Claro"
            className="h-7"
          />
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="w-10 h-10 flex items-center justify-center bg-gray-100 active:bg-gray-200 rounded-full transition-colors touch-manipulation"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="px-5 py-6 space-y-6">

          {/* Hero */}
          <div className="bg-gradient-to-br from-[#DA291C] to-[#A01E13] rounded-2xl p-6 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <EarOff className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mb-1.5">
              No necesitás hablar ni escuchar
            </h3>
            <p className="text-white/90 text-sm sm:text-base leading-relaxed">
              Todo es visual: señas, texto grande y mensajes en pantalla para la persona que te atiende.
            </p>
          </div>

          {/* 4 formas */}
          <div>
            <h4 className="text-lg font-black text-gray-900 mb-4">4 formas de comunicarte</h4>
            <div className="space-y-3">

              <HelpItem
                icon={<Smartphone className="w-5 h-5 text-white" strokeWidth={2} />}
                title="Toques Rápidos"
                desc="Tocá el servicio que necesitás. Aparece en pantalla grande para que la persona que te atiende lo lea."
                num="1"
              />

              <HelpItem
                icon={<Hand className="w-5 h-5 text-white" strokeWidth={2} />}
                title="Mis señas"
                desc="Hacé tu seña a la cámara. Se convierte en texto y voz para la persona que te atiende."
                num="2"
              />

              <HelpItem
                icon={<Languages className="w-5 h-5 text-white" strokeWidth={2} />}
                title="Escribir mi respuesta"
                desc="Escribí tu mensaje. Se muestra en letras grandes y se reproduce en voz alta."
                num="3"
              />

              <HelpItem
                icon={<MessageCircle className="w-5 h-5 text-white" strokeWidth={2} />}
                title="El asesor responde con Dillo"
                desc="La persona que te atiende escribe o habla. Un avatar lo traduce a señas para que vos lo veas."
                num="4"
              />

            </div>
          </div>

          {/* Tip de pantalla */}
          <div className="flex items-start gap-4 bg-[#DA291C]/8 border border-[#DA291C]/20 rounded-2xl p-5">
            <div className="w-10 h-10 bg-white border-2 border-[#DA291C] rounded-xl flex items-center justify-center flex-shrink-0">
              <Eye className="w-5 h-5 text-[#DA291C]" strokeWidth={2} />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base mb-0.5">Mostrá la pantalla</p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Después de tocar un servicio, dale el celular a la persona que te atiende para que vea tu mensaje.
              </p>
            </div>
          </div>

          {/* Consejos */}
          <div className="bg-gray-50 rounded-2xl p-5">
            <h4 className="font-bold text-gray-900 text-base mb-4">Consejos</h4>
            <ul className="space-y-3">
              <li className="flex gap-3 items-start">
                <Camera className="w-5 h-5 text-[#DA291C] flex-shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-sm text-gray-700">Activá la cámara para poder hacer señas</span>
              </li>
              <li className="flex gap-3 items-start">
                <Sun className="w-5 h-5 text-[#DA291C] flex-shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-sm text-gray-700">Buscá buena iluminación para que la cámara vea tus señas</span>
              </li>
              <li className="flex gap-3 items-start">
                <Smartphone className="w-5 h-5 text-[#DA291C] flex-shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-sm text-gray-700">Los Toques Rápidos son lo más rápido. Un toque y listo para mostrar la pantalla</span>
              </li>
            </ul>
          </div>

          {/* CTA cierre */}
          <button
            onClick={onClose}
            className="w-full py-4 bg-[#DA291C] active:bg-[#A01E13] text-white rounded-2xl text-base font-black transition-colors touch-manipulation"
          >
            Entendido
          </button>

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-3 flex justify-center">
          <img src={`${import.meta.env.BASE_URL}icons/claro-logo-red-atlas-2.svg`} alt="Claro" className="h-5 opacity-50" />
        </div>

      </div>
    </div>
  );
}

function HelpItem({
  icon, title, desc, num,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  num: string;
}) {
  return (
    <div className="flex items-start gap-4 bg-gray-50 rounded-2xl p-4">
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 bg-[#DA291C] rounded-xl flex items-center justify-center">
          {icon}
        </div>
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-[#DA291C] rounded-full flex items-center justify-center text-[9px] font-black text-[#DA291C]">
          {num}
        </span>
      </div>
      <div className="min-w-0">
        <p className="font-bold text-gray-900 text-sm sm:text-base mb-0.5">{title}</p>
        <p className="text-gray-600 text-sm leading-snug">{desc}</p>
      </div>
    </div>
  );
}
