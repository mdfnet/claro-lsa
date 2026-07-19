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
              Ayuda
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Guía para usar nuestra aplicación de atención
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
                    ¿Cómo Funciona?
                  </h2>
                  <p className="text-gray-700 text-lg leading-relaxed mb-3">
                    Esta aplicación es para personas sordas y personas que no pueden hablar.
                    Usa inteligencia artificial e intérprete de señas para la comunicación.
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-3">
                      <span className="text-[#DA291C] font-bold">1.</span>
                      <span>La cámara mira tu seña ahora mismo</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#DA291C] font-bold">2.</span>
                      <span>La aplicación convierte tu seña en texto y voz</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#DA291C] font-bold">3.</span>
                      <span>La respuesta aparece en texto grande y fácil de leer</span>
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
                    Usa los botones grandes para tus servicios más usados:
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-semibold text-gray-900 mb-1">Ver catálogo</p>
                      <p className="text-gray-600 text-sm">Mira todos nuestros teléfonos</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-semibold text-gray-900 mb-1">Contratar plan</p>
                      <p className="text-gray-600 text-sm">Encuentra el plan perfecto para ti</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-semibold text-gray-900 mb-1">Ver promociones</p>
                      <p className="text-gray-600 text-sm">Mira nuestras ofertas especiales</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-semibold text-gray-900 mb-1">Accesorios</p>
                      <p className="text-gray-600 text-sm">Todo para tu teléfono</p>
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
                    Ayuda Visual
                  </h2>
                  <p className="text-gray-700 text-lg leading-relaxed mb-3">
                    Elige lo que necesitas:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Eye className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Alto Contraste</p>
                        <p className="text-gray-600">Todo más claro para ver mejor</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Smartphone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Texto Grande</p>
                        <p className="text-gray-600">Texto grande para leer mejor</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Modo Privado</p>
                        <p className="text-gray-600">Oculta lo que no querés mostrar</p>
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
                    Escuchar las Respuestas
                  </h2>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    La aplicación puede leer las respuestas en voz alta. Esto es útil si hay
                    personas oyentes contigo o si quieres usar auriculares.
                  </p>
                  <p className="text-gray-600 mt-2">
                    Hablamos claro para que entiendas mejor.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#DA291C] to-[#B01F16] rounded-2xl shadow-lg p-6 sm:p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">
                Para Ayudarte Mejor
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <span className="text-lg">Busca brillo para que la cámara vea bien tu seña</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">📱</span>
                  <span className="text-lg">Mantén tu teléfono estable a la altura del tórax</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🖐️</span>
                  <span className="text-lg">Haz tu seña de forma clara y normal</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✅</span>
                  <span className="text-lg">Si necesitas, puedes empezar de nuevo las veces que quieras</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 sm:p-8 border-2 border-blue-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                ¿Necesitas Ayuda?
              </h2>
              <p className="text-gray-700 text-lg mb-4">
                Si tienes un problema técnico, podemos asistirte:
              </p>
              <div className="space-y-2 text-gray-700">
                <p className="flex items-center gap-2">
                  <span className="font-semibold">Línea de atención:</span>
                  <span>*611 desde tu teléfono Claro</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-semibold">WhatsApp:</span>
                  <span>Escríbenos ahora mismo</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-semibold">Tiendas físicas:</span>
                  <span>Visita nuestra tienda Claro</span>
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
