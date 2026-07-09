import { ChevronLeft, Heart, Users, Sparkles, ExternalLink, Globe } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

interface AboutScreenProps {
  onBack: () => void;
  onHelp?: () => void;
}

export default function AboutScreen({ onBack, onHelp }: AboutScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Header showMenu={true} onHome={onBack} onHelp={onHelp} />

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
              Acerca de
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Un proyecto de inclusión y accesibilidad
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-[#DA291C]/10 p-3 rounded-xl">
                  <Heart className="w-8 h-8 text-[#DA291C]" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Nuestra Misión
                  </h2>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    Este sistema de atención está diseñado para eliminar barreras de comunicación
                    y garantizar que todas las personas, sin importar su capacidad auditiva, puedan
                    acceder a nuestros servicios de manera autónoma y digna.
                  </p>
                  <p className="text-gray-700 text-lg leading-relaxed mt-3">
                    Creemos en la tecnología como herramienta de inclusión y estamos comprometidos
                    con crear experiencias accesibles para todos.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#DA291C] to-[#B01F16] rounded-2xl shadow-lg p-6 sm:p-8 text-white">
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-3">
                    Compromiso con la Comunidad Sorda
                  </h2>
                  <p className="text-lg leading-relaxed mb-4">
                    Trabajamos continuamente con la comunidad sorda para mejorar nuestros servicios
                    y asegurarnos de que responden a las necesidades reales de nuestros usuarios.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">✓</span>
                      <span>Diseñado con y para personas sordas</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">✓</span>
                      <span>Interfaz visual clara y accesible</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">✓</span>
                      <span>Sin barreras de comunicación</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">✓</span>
                      <span>Mejora continua basada en retroalimentación</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-blue-500/10 p-3 rounded-xl">
                  <Sparkles className="w-8 h-8 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Tecnología de Vanguardia
                  </h2>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    Utilizamos inteligencia artificial avanzada para el reconocimiento de lenguaje
                    de señas en tiempo real. Nuestro sistema aprende continuamente para ofrecer
                    traducciones cada vez más precisas y naturales.
                  </p>
                  <div className="mt-4 grid sm:grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-semibold text-gray-900 mb-1">Reconocimiento en tiempo real</p>
                      <p className="text-gray-600 text-sm">Traduce tus señas instantáneamente</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-semibold text-gray-900 mb-1">Interfaz intuitiva</p>
                      <p className="text-gray-600 text-sm">Fácil de usar sin capacitación previa</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-semibold text-gray-900 mb-1">Privacidad garantizada</p>
                      <p className="text-gray-600 text-sm">Tus datos están protegidos</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-semibold text-gray-900 mb-1">Disponible 24/7</p>
                      <p className="text-gray-600 text-sm">Atención cuando la necesites</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 sm:p-8 text-white">
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-3">
                    Desarrollado por Dillo
                  </h2>
                  <p className="text-lg leading-relaxed mb-4">
                    Este sistema ha sido desarrollado por Dillo, una empresa especializada en
                    soluciones de inteligencia artificial y accesibilidad digital.
                  </p>
                  <p className="text-lg leading-relaxed mb-4">
                    Dillo está comprometida con crear tecnología que mejore la vida de las personas
                    y construya un mundo más inclusivo.
                  </p>
                  <a
                    href="https://dillo.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg
                             font-semibold hover:bg-blue-50 transition-colors group"
                  >
                    <span>Visitar dillo.ai</span>
                    <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Información del Sistema
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 text-gray-700">
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Versión</p>
                  <p>1.0.0</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Última actualización</p>
                  <p>Febrero 2026</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Tecnología</p>
                  <p>IA de reconocimiento de lenguaje de señas</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Idioma</p>
                  <p>Español (Lenguaje de Señas)</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 rounded-2xl p-6 sm:p-8 border-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Agradecimientos
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                Agradecemos especialmente a la comunidad sorda que ha colaborado con nosotros
                en el desarrollo y mejora de este sistema. Sus aportes han sido fundamentales
                para crear una herramienta verdaderamente útil y accesible.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
