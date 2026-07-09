import { X, Hand, MessageCircle, Smartphone, Volume2 } from 'lucide-react';

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
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Volume2 className="w-6 h-6 text-[#DA291C]" />
              Bienvenido a Dillo
            </h3>
            <p className="text-gray-700">
              Dillo es una herramienta de comunicación accesible diseñada para facilitar la interacción entre personas sordas y el personal de atención al cliente de Claro.
            </p>
          </div>

          <div className="space-y-4">
            <div className="border-l-4 border-[#DA291C] pl-4">
              <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Hand className="w-5 h-5 text-[#DA291C]" />
                Hablo con mis manos
              </h4>
              <p className="text-gray-700 text-sm">
                Presiona este botón para abrir el intérprete de lengua de señas. Podrás comunicarte mediante señas que serán interpretadas y convertidas a texto y voz.
              </p>
            </div>

            <div className="border-l-4 border-[#DA291C] pl-4">
              <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#DA291C]" />
                Responder con Dillo
              </h4>
              <p className="text-gray-700 text-sm">
                Presiona este botón para que el avatar de Dillo te responda. El avatar convertirá el texto en voz y señas para facilitar la comunicación.
              </p>
            </div>

            <div className="border-l-4 border-[#DA291C] pl-4">
              <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#DA291C]" />
                Toques Rápidos
              </h4>
              <p className="text-gray-700 text-sm">
                Los botones de toques rápidos te permiten acceder directamente a los servicios más comunes de Claro. Simplemente presiona el botón correspondiente y el sistema reproducirá un mensaje de voz describiendo tu solicitud.
              </p>
              <ul className="mt-2 space-y-1 text-sm text-gray-600 ml-4">
                <li>• <strong>Comprar un celular:</strong> Para consultas sobre nuevos equipos</li>
                <li>• <strong>Pagar mi factura:</strong> Para realizar pagos o consultar facturas</li>
                <li>• <strong>Soporte técnico:</strong> Para problemas técnicos con tu servicio</li>
                <li>• <strong>Otro trámite:</strong> Para cualquier otra consulta o gestión</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="font-bold text-gray-900 mb-3">Consejos útiles</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <span className="text-[#DA291C] font-bold">1.</span>
                <span>Asegúrate de tener tu cámara habilitada si vas a usar lengua de señas</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#DA291C] font-bold">2.</span>
                <span>Verifica que tu navegador tenga permisos de audio y video</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#DA291C] font-bold">3.</span>
                <span>Para mejor experiencia, usa una buena iluminación al hacer señas</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#DA291C] font-bold">4.</span>
                <span>Los toques rápidos te ahorran tiempo al comunicar necesidades comunes</span>
              </li>
            </ul>
          </div>

          <div className="text-center pt-4">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-[#DA291C] hover:bg-[#B01F16] text-white rounded-full font-medium transition-colors"
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
