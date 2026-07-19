export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-gray-400 mt-auto">
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <img
                src="https://www.claro.com.ar/static/claro-logo.svg"
                alt="Claro"
                className="h-8 mb-4 opacity-70"
              />
              <p className="text-sm text-gray-500 mb-4">
                Aplicación de comunicación hecha por Dillo, para personas sordas y personas que no pueden hablar.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white mb-3">Qué Tenemos</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#DA291C] rounded-full"></span>
                  Aplicación que habla
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#DA291C] rounded-full"></span>
                  Aplicación que escucha
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#DA291C] rounded-full"></span>
                  Intérprete de señas
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#DA291C] rounded-full"></span>
                  Avatar que habla
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-3">Para Ti</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#DA291C] rounded-full"></span>
                  Todos los días para ti
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#DA291C] rounded-full"></span>
                  Hecho para personas sordas
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#DA291C] rounded-full"></span>
                  Aplicación Dillo.ai
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600">
            <div>
              © {new Date().getFullYear()} Dillo.ai - Todos los derechos reservados.
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white transition-colors">Sitio web</a>
              <span>|</span>
              <a href="#" className="hover:text-white transition-colors">Contacto</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
