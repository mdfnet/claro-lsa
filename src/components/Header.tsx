import { Mic, Volume2, Moon, Settings } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold">
              <span className="text-amber-500">fly</span>
              <span className="text-gray-800">bondi</span>
            </div>
            <p className="text-sm text-gray-600 hidden md:block">Comunicación accesible con tecnología Dillo</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-amber-400 text-gray-900 rounded-lg text-sm font-medium hover:bg-amber-500 transition-colors">
              ES
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Mic className="w-5 h-5 text-gray-700" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Volume2 className="w-5 h-5 text-green-500" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Moon className="w-5 h-5 text-gray-700" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
