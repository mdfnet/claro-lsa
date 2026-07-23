import { useState } from 'react';
import { Hand, MessageCircle, Smartphone, CreditCard, Headphones, FileText, HelpCircle, Wifi, ShoppingCart, DollarSign, PhoneCall, Signal, Package, RefreshCw, AlertCircle } from 'lucide-react';
import Footer from './Footer';
import HelpModal from './HelpModal';
import IframeModal from './IframeModal';
import QuickTouchScreen from './QuickTouchScreen';

interface ServiceSelectionScreenProps {
  onSelectService: (service: string) => void;
}

export default function ServiceSelectionScreen({ onSelectService }: ServiceSelectionScreenProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [iframeModal, setIframeModal] = useState<{ url: string; title: string } | null>(null);
  const [activeQuickTouch, setActiveQuickTouch] = useState<{ title: string; speech: string; icon: any } | null>(null);

  const quickTouchServices = [
    {
      id: 'buy-phone',
      title: 'Comprar un celular',
      icon: Smartphone,
      speech: 'Quiero comprar un celular nuevo'
    },
    {
      id: 'upgrade-phone',
      title: 'Cambiar de equipo',
      icon: RefreshCw,
      speech: 'Quiero cambiar mi celular actual por uno nuevo'
    },
    {
      id: 'phone-plans',
      title: 'Ver planes',
      icon: ShoppingCart,
      speech: 'Quiero consultar los planes disponibles'
    },
    {
      id: 'pay-bill',
      title: 'Pagar mi factura',
      icon: CreditCard,
      speech: 'Necesito pagar mi factura de Claro'
    },
    {
      id: 'check-balance',
      title: 'Consultar saldo',
      icon: DollarSign,
      speech: 'Quiero consultar mi saldo disponible'
    },
    {
      id: 'recharge',
      title: 'Recargar saldo',
      icon: Package,
      speech: 'Necesito hacer una recarga de saldo'
    },
    {
      id: 'no-signal',
      title: 'Sin señal',
      icon: Signal,
      speech: 'No tengo señal en mi celular'
    },
    {
      id: 'internet-slow',
      title: 'Internet lento',
      icon: Wifi,
      speech: 'Mi internet está muy lento'
    },
    {
      id: 'phone-not-working',
      title: 'Teléfono no funciona',
      icon: PhoneCall,
      speech: 'Mi teléfono no está funcionando correctamente'
    },
    {
      id: 'technical-support',
      title: 'Soporte técnico',
      icon: Headphones,
      speech: 'Necesito soporte técnico especializado'
    },
    {
      id: 'billing-issue',
      title: 'Problema de facturación',
      icon: AlertCircle,
      speech: 'Tengo un problema con mi factura'
    },
    {
      id: 'other-procedure',
      title: 'Otro trámite',
      icon: FileText,
      speech: 'Quiero realizar otro trámite diferente'
    }
  ];

  return (
    <div className="h-screen bg-gray-50 flex flex-col animate-slide-in overflow-hidden">
      <header className="bg-white border-b border-gray-100 py-6 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <img
              src="https://www.claro.com.ar/static/claro-logo-red-atlas-2.svg"
              alt="Claro"
              className="h-8"
            />
            <button
              onClick={() => setShowHelp(true)}
              className="px-6 py-2.5 bg-[#DA291C] hover:bg-[#B01F16] text-white rounded-full text-sm font-medium transition-colors flex items-center gap-2 touch-manipulation"
            >
              <HelpCircle className="w-4 h-4" />
              ¿Cómo usar Dillo?
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-12" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <button
              onClick={() => setIframeModal({ url: 'https://entrenar.dillo.ar/#/traductor', title: 'Intérprete de Lengua de Señas' })}
              className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden md:hover:scale-[1.02] border-4 border-transparent hover:border-[#DA291C]/20 touch-manipulation"
            >
              <div className="p-12 flex flex-col items-center">
                <div className="w-48 h-48 mb-8 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-40 h-40 bg-gradient-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center">
                      <div className="relative">
                        <div className="w-24 h-24 bg-[#DA291C] rounded-full flex items-center justify-center">
                          <Hand className="w-12 h-12 text-white" strokeWidth={2.5} />
                        </div>
                        <div className="absolute -top-8 -right-2 w-16 h-16 bg-[#DA291C]/70 rounded-full opacity-30"></div>
                        <div className="absolute -bottom-6 -left-4 w-12 h-12 bg-[#DA291C]/50 rounded-full opacity-40"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#DA291C] group-hover:bg-[#B01F16] text-white rounded-2xl px-8 py-4 transition-colors inline-flex items-center gap-3 shadow-lg">
                  <Hand className="w-6 h-6" strokeWidth={2.5} />
                  <div className="text-left">
                    <div className="text-xl font-bold">Hablo con</div>
                    <div className="text-xl font-bold">mis manos</div>
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setIframeModal({ url: 'https://avatar.dillo.ai', title: 'Avatar Dillo' })}
              className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden md:hover:scale-[1.02] border-4 border-transparent hover:border-[#DA291C]/20 touch-manipulation"
            >
              <div className="p-12 flex flex-col items-center">
                <div className="w-48 h-48 mb-8 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-40 h-40 bg-gradient-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center">
                      <div className="relative">
                        <div className="w-24 h-24 bg-white border-4 border-[#DA291C] rounded-full flex items-center justify-center">
                          <MessageCircle className="w-10 h-10 text-[#DA291C]" strokeWidth={2.5} />
                        </div>
                        <div className="absolute -top-4 -right-4 w-10 h-10 bg-white border-4 border-[#DA291C]/70 rounded-full flex items-center justify-center opacity-60">
                          <div className="w-2 h-2 bg-[#DA291C] rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border-4 border-[#DA291C] group-hover:border-[#B01F16] text-[#DA291C] group-hover:text-[#B01F16] rounded-2xl px-8 py-4 transition-colors inline-flex items-center gap-3 shadow-lg">
                  <MessageCircle className="w-6 h-6" strokeWidth={2.5} />
                  <div className="text-left">
                    <div className="text-xl font-bold">Responder</div>
                    <div className="text-xl font-bold">con Dillo</div>
                  </div>
                </div>
              </div>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Toques Rápidos</h3>
              <p className="text-gray-600">Accede a los servicios con un toque</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {quickTouchServices.map((service) => {
                const Icon = service.icon;
                return (
                  <button
                    key={service.id}
                    onClick={() => {
                      setActiveQuickTouch({ title: service.title, speech: service.speech, icon: Icon });
                    }}
                    className="group bg-gray-50 hover:bg-[#DA291C] border-2 border-gray-200 hover:border-[#DA291C] rounded-xl p-6 transition-all duration-300 hover:shadow-lg md:hover:scale-[1.02] touch-manipulation"
                  >
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                        <Icon className="w-7 h-7 text-[#DA291C]" strokeWidth={2} />
                      </div>
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-white transition-colors">
                        {service.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <Footer />
      </div>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {activeQuickTouch && (
        <QuickTouchScreen
          title={activeQuickTouch.title}
          speech={activeQuickTouch.speech}
          icon={activeQuickTouch.icon}
          onClose={() => setActiveQuickTouch(null)}
        />
      )}
      {iframeModal && (
        <IframeModal
          url={iframeModal.url}
          title={iframeModal.title}
          onClose={() => setIframeModal(null)}
        />
      )}
    </div>
  );
}
