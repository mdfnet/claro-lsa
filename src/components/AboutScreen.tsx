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
              Conocer Dillo
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comunicación y respeto para todos
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
                    Qué Queremos
                  </h2>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    Esta aplicación ayuda a personas sordas y a personas que no pueden hablar.
                    Queremos que todos puedan usar nuestro servicio solos, con respeto.
                  </p>
                  <p className="text-gray-700 text-lg leading-relaxed mt-3">
                    Creemos que la tecnología puede unir a todos. Trabajamos todos los días
                    para mejorar.
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
                    Trabajamos con Personas Sordas
                  </h2>
                  <p className="text-lg leading-relaxed mb-4">
                    Escuchamos a personas sordas para mejorar nuestro servicio. Queremos
                    responder a su necesidad real.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">✓</span>
                      <span>Hecho para personas sordas</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">✓</span>
                      <span>Todo visual y claro</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">✓</span>
                      <span>Comunicación clara para todos</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">✓</span>
                      <span>Mejoramos todos los días</span>
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
                    Tecnología Nueva
                  </h2>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    Usamos inteligencia artificial para ser tu intérprete de señas ahora mismo.
                    Aprendemos todos los días para traducir mejor.
                  </p>
                  <div className="mt-4 grid sm:grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-semibold text-gray-900 mb-1">Ahora Mismo</p>
                      <p className="text-gray-600 text-sm">Tu intérprete, ahora</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-semibold text-gray-900 mb-1">Todo Claro</p>
                      <p className="text-gray-600 text-sm">Aprendé y usá ahora</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-semibold text-gray-900 mb-1">Todo Privado</p>
                      <p className="text-gray-600 text-sm">Todo seguro para ti</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-semibold text-gray-900 mb-1">Todos los Días</p>
                      <p className="text-gray-600 text-sm">Acá para tu necesidad</p>
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
                    Hecho por Dillo
                  </h2>
                  <p className="text-lg leading-relaxed mb-4">
                    Dillo hizo esta aplicación. Dillo trabaja con inteligencia artificial y
                    tecnología digital.
                  </p>
                  <p className="text-lg leading-relaxed mb-4">
                    Dillo quiere mejorar la vida de las personas. Dillo quiere un mundo mejor
                    para todos.
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
                Sobre la Aplicación
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 text-gray-700">
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Versión</p>
                  <p>1.0.0</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Actualización</p>
                  <p>Febrero 2026</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Aplicación</p>
                  <p>Inteligencia artificial e intérprete de señas</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Idioma</p>
                  <p>Español y Señas</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 rounded-2xl p-6 sm:p-8 border-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Gracias
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                Gracias a las personas sordas que trabajaron con nosotros en esta aplicación.
                Su ayuda fue muy útil para hacer una herramienta buena para todos.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
