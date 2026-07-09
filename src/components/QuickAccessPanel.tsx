import { useState } from 'react';
import {
  X, ChevronRight, Smartphone, CreditCard, Radio, FileText,
  MapPin, Wifi, WifiOff, Package, DollarSign, Calendar,
  Settings, HelpCircle, MessageSquare, ShoppingCart,
  Percent, Gift, Wrench, AlertCircle
} from 'lucide-react';

interface QuickAccessPanelProps {
  isOpen: boolean;
  onClose: () => void;
  largeText: boolean;
}

interface QuickAction {
  id: string;
  label: string;
  icon: any;
}

interface Category {
  id: string;
  title: string;
  icon: any;
  actions: QuickAction[];
}

export default function QuickAccessPanel({ isOpen, onClose, largeText }: QuickAccessPanelProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const categories: Category[] = [
    {
      id: 'purchases',
      title: 'Compras',
      icon: Smartphone,
      actions: [
        { id: 'buy-phone', label: 'Ver catálogo de celulares', icon: Smartphone },
        { id: 'buy-plan', label: 'Contratar plan', icon: Package },
        { id: 'promotions', label: 'Ver promociones', icon: Percent },
        { id: 'accessories', label: 'Accesorios', icon: Gift }
      ]
    },
    {
      id: 'billing',
      title: 'Facturación',
      icon: CreditCard,
      actions: [
        { id: 'pay-bill', label: 'Pagar factura', icon: CreditCard },
        { id: 'view-bill', label: 'Ver última factura', icon: FileText },
        { id: 'billing-info', label: 'Información de facturación', icon: DollarSign },
        { id: 'payment-plan', label: 'Plan de pagos', icon: Calendar }
      ]
    },
    {
      id: 'technical',
      title: 'Servicio Técnico',
      icon: Radio,
      actions: [
        { id: 'no-service', label: 'No tengo señal', icon: WifiOff },
        { id: 'internet-slow', label: 'Internet lento', icon: Wifi },
        { id: 'phone-config', label: 'Configurar celular', icon: Settings },
        { id: 'technical-issue', label: 'Otro problema técnico', icon: Wrench }
      ]
    },
    {
      id: 'procedures',
      title: 'Trámites',
      icon: FileText,
      actions: [
        { id: 'change-plan', label: 'Cambiar de plan', icon: Package },
        { id: 'port-number', label: 'Portabilidad numérica', icon: Smartphone },
        { id: 'cancel-service', label: 'Dar de baja servicio', icon: AlertCircle },
        { id: 'update-data', label: 'Actualizar datos', icon: FileText }
      ]
    },
    {
      id: 'branch',
      title: 'Sucursal',
      icon: MapPin,
      actions: [
        { id: 'bathroom', label: '¿Dónde está el baño?', icon: MapPin },
        { id: 'wait-time', label: '¿Cuánto demora?', icon: HelpCircle },
        { id: 'advisor', label: 'Hablar con asesor', icon: MessageSquare },
        { id: 'store-info', label: 'Información de la tienda', icon: ShoppingCart }
      ]
    }
  ];

  const handleActionClick = (categoryId: string, actionId: string) => {
    console.log(`Action selected: ${categoryId}/${actionId}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      <div
        className="fixed right-0 top-0 h-full w-full sm:w-[500px] md:w-[600px] bg-white shadow-2xl z-50
                   transform transition-transform duration-300 ease-out translate-x-0"
      >
        <div className="flex flex-col h-full">
          <div className="bg-gradient-to-r from-[#DA291C] to-[#B01F16] p-4 sm:p-6 md:p-8 flex items-center justify-between">
            <h2 className={`text-white font-bold ${largeText ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'}`}>
              Toques Rápidos
            </h2>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 active:bg-white/40 p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl transition-colors"
            >
              <X className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 space-y-2.5 sm:space-y-3">
            {categories.map((category) => {
              const CategoryIcon = category.icon;
              const isExpanded = expandedCategory === category.id;

              return (
                <div key={category.id} className="border-2 border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                    className="w-full bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200
                             active:from-gray-200 active:to-gray-300 p-4 sm:p-5 md:p-6 flex items-center justify-between transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm">
                        <CategoryIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[#DA291C]" strokeWidth={2} />
                      </div>
                      <span className={`font-semibold text-gray-800 ${largeText ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'}`}>
                        {category.title}
                      </span>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-400 transition-transform duration-300
                                ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </button>

                  <div
                    className={`transition-all duration-300 ease-out overflow-hidden
                              ${isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="p-3 sm:p-4 space-y-2 bg-white">
                      {category.actions.map((action) => {
                        const ActionIcon = action.icon;
                        return (
                          <button
                            key={action.id}
                            onClick={() => handleActionClick(category.id, action.id)}
                            className="w-full bg-white hover:bg-[#DA291C]/5 active:bg-[#DA291C]/10 border-2 border-gray-100
                                     hover:border-[#DA291C]/30 p-4 sm:p-5 rounded-lg sm:rounded-xl
                                     transition-all duration-200 flex items-center gap-3 sm:gap-4
                                     hover:scale-[1.02] active:scale-[0.98] hover:shadow-md group"
                          >
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 group-hover:bg-[#DA291C]/10
                                          rounded-lg flex items-center justify-center transition-colors">
                              <ActionIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#DA291C]" strokeWidth={2} />
                            </div>
                            <span className={`font-medium text-gray-700 text-left ${
                              largeText ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
                            }`}>
                              {action.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
