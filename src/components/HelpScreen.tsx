import { ChevronLeft, Video, Hand, Eye, Volume2, Shield, Smartphone } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

interface HelpScreenProps {
  onBack: () => void;
  onAbout?: () => void;
}

export default function HelpScreen({ onBack, onAbout }: HelpScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Header showMenu={true} onHome={onBack} onAbout={onAbout} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 sm:p-8 space-y-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-[#DA291C] transition-colors mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-lg">Volver</span>
          </button>

          <div className="text-center space-y-4 mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
              Centro de Ayuda
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Guía completa para usar nuestro sistema de atención accesible
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-4 border-l-4 border-[#DA291C]">
              <div className="flex items-start gap-4">
                <div className="bg-[#DA291C]/10 p-3 rounded-xl">
                  <Video className="w-8 h-8 text-[#DA291C]" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    ¿Cómo funciona el sistema?
                  </h2>
                  <p className="text-gray-700 text-lg leading-relaxed mb-3">
                    Nuestro sistema está diseñado para personas sordas y con discapacidad auditiva.
                    Utiliza tecnología de reconocimiento de lenguaje de señas para facilitar la comunicación.
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-3">
                      <span className="text-[#DA291C] font-bold">1.</span>
                      <span>La cámara captura tu lenguaje de señas en tiempo real</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#DA291C] font-bold">2.</span>
                      <span>El sistema traduce tus señas a texto y voz</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#DA291C] font-bold">3.</span>
                      <span>Las respuestas aparecen en texto grande y fácil de leer</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-4 border-l-4 border-blue-500">
              <div className="flex items-start gap-4">
                <div className="bg-blue-500/10 p-3 rounded-xl">
                  <Hand className="w-8 h-8 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Acciones Rápidas
                  </h2>
                  <p className="text-gray-700 text-lg leading-relaxed mb-3">
                    Usa los botones grandes para acceder rápidamente a los servicios más comunes:
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-semibold text-gray-900 mb-1">Ver catálogo</p>
                      <p className="text-gray-600 text-sm">Explora todos nuestros celulares disponibles</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-semibold text-gray-900 mb-1">Contratar plan</p>
                      <p className="text-gray-600 text-sm">Encuentra el plan perfecto para ti</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-semibold text-gray-900 mb-1">Ver promociones</p>
                      <p className="text-gray-600 text-sm">Descubre nuestras ofertas especiales</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-semibold text-gray-900 mb-1">Accesorios</p>
                      <p className="text-gray-600 text-sm">Fundas, cargadores y más</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-4 border-l-4 border-green-500">
              <div className="flex items-start gap-4">
                <div className="bg-green-500/10 p-3 rounded-xl">
                  <Eye className="w-8 h-8 text-green-500" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Opciones de Accesibilidad
                  </h2>
                  <p className="text-gray-700 text-lg leading-relaxed mb-3">
                    Personaliza tu experiencia según tus necesidades:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Eye className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Alto Contraste</p>
                        <p className="text-gray-600">Aumenta el contraste para mejor visibilidad</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Smartphone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Texto Grande</p>
                        <p className="text-gray-600">Agranda el texto para facilitar la lectura</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Modo Privado</p>
                        <p className="text-gray-600">Oculta información sensible en la pantalla</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-4 border-l-4 border-purple-500">
              <div className="flex items-start gap-4">
                <div className="bg-purple-500/10 p-3 rounded-xl">
                  <Volume2 className="w-8 h-8 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Respuestas con Voz
                  </h2>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    El sistema puede leer en voz alta las opciones y respuestas. Esto es útil si
                    hay personas oyentes acompañándote o si deseas usar audífonos.
                  </p>
                  <p className="text-gray-600 mt-2">
                    Las voces están configuradas en español latinoamericano neutral para mayor claridad.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#DA291C] to-[#B01F16] rounded-2xl shadow-lg p-6 sm:p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">
                Consejos para Mejor Experiencia
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <span className="text-lg">Asegúrate de tener buena iluminación para que la cámara capture bien tus señas</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">📱</span>
                  <span className="text-lg">Mantén tu dispositivo estable a la altura del pecho</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🖐️</span>
                  <span className="text-lg">Realiza las señas de forma clara y a una velocidad normal</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✅</span>
                  <span className="text-lg">Si necesitas repetir, el sistema está diseñado para darte múltiples intentos</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 sm:p-8 border-2 border-blue-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                ¿Necesitas más ayuda?
              </h2>
              <p className="text-gray-700 text-lg mb-4">
                Si tienes dudas o problemas técnicos, nuestro equipo está disponible para asistirte:
              </p>
              <div className="space-y-2 text-gray-700">
                <p className="flex items-center gap-2">
                  <span className="font-semibold">Línea de atención:</span>
                  <span>*611 desde tu celular Claro</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-semibold">WhatsApp:</span>
                  <span>Escríbenos para soporte en tiempo real</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-semibold">Tiendas físicas:</span>
                  <span>Visita cualquier punto Claro</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
