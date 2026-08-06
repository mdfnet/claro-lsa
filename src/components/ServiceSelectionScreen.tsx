import { useState } from 'react';

// Códigos de área de 3 dígitos (capitales de provincia y grandes ciudades)
// Todo lo que no esté acá se trata como área de 4 dígitos.
const THREE_DIGIT_AREA_CODES = new Set([
  // Buenos Aires provincia
  '220','221','223','230','236','249',
  // Cuyo
  '261','264','266',
  // Patagonia / Sur
  '280','281','291','293','294','296','297','298','299',
  // Centro / Litoral
  '341','342','343','345','351','353','354','358',
  // NOA / NEA
  '362','370','376','380','381','383','385','387','388','389',
]);

// Formatea un número de celular argentino mientras el usuario tipea.
// Todos los números son 10 dígitos (área + abonado):
//   11 XXXX-XXXX  → AMBA (área 2 dígitos)
//   XXX XXX-XXXX  → ciudades principales (área 3 dígitos)
//   XXXX XX-XXXX  → interior (área 4 dígitos)
//   15 XXXX-XXXX  → legacy móvil local CABA (9 dígitos sin área)
function formatArgentinePhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 10);
  if (!d) return '';

  if (d.startsWith('15')) {
    if (d.length <= 2) return d;
    if (d.length <= 6) return `15 ${d.slice(2, 6)}`;
    return `15 ${d.slice(2, 6)}-${d.slice(6)}`;
  }

  if (d.startsWith('11')) {
    if (d.length <= 2) return d;
    if (d.length <= 6) return `11 ${d.slice(2, 6)}`;
    return `11 ${d.slice(2, 6)}-${d.slice(6)}`;
  }

  if (d.length >= 3 && THREE_DIGIT_AREA_CODES.has(d.slice(0, 3))) {
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3, 6)}`;
    return `${d.slice(0, 3)} ${d.slice(3, 6)}-${d.slice(6)}`;
  }

  // 4-digit area code (interior)
  if (d.length <= 4) return d;
  if (d.length <= 6) return `${d.slice(0, 4)} ${d.slice(4, 6)}`;
  return `${d.slice(0, 4)} ${d.slice(4, 6)}-${d.slice(6)}`;
}
import {
  Hand, MessageCircle, Smartphone, CreditCard, Headphones,
  FileText, HelpCircle, ShoppingCart, DollarSign, Package,
  RefreshCw, AlertCircle, ChevronLeft,
} from 'lucide-react';
import { useBackHandler } from '../hooks/useBackHandler';
import HelpModal from './HelpModal';
import IframeModal from './IframeModal';
import QuickTouchScreen from './QuickTouchScreen';
import {
  type Suboption,
  MARCAS_PARA_COMPRA,
  MARCAS_PARA_CAMBIO,
  SUBOPCIONES_PLANES,
  SUBOPCIONES_RECARGA,
  SUBOPCIONES_FACTURA,
  SUBOPCIONES_PROBLEMA_FACTURA,
  SUBOPCIONES_SOPORTE,
} from '../data/catalogos';

interface QuickTouchService {
  id: string;
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  speech?: string;
  suboptions?: Suboption[];
  goToModeSelector?: boolean;
  needsPhoneNumber?: boolean;
}

type PendingQuickTouch = {
  title: string;
  speech: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  parentTitle?: string;
};

interface ServiceSelectionScreenProps {
  onSelectService: (service: string) => void;
}

// Hover solo en dispositivos con puntero real → no queda "pegado" en touch.
// Feedback táctil inmediato con active:.
const CARD_CLASS =
  'group bg-gray-50 [@media(hover:hover)]:hover:bg-[#DA291C] ' +
  'border-2 border-gray-200 [@media(hover:hover)]:hover:border-[#DA291C] ' +
  'rounded-xl p-3 sm:p-4 md:p-5 transition-all duration-200 ' +
  '[@media(hover:hover)]:hover:shadow-lg [@media(hover:hover)]:hover:scale-[1.02] ' +
  'active:scale-[0.97] active:bg-gray-100 active:border-gray-300 touch-manipulation';

export default function ServiceSelectionScreen({ onSelectService: _onSelectService }: ServiceSelectionScreenProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [iframeModal, setIframeModal] = useState<{ initialMode: 'hands' | 'dillo' } | null>(null);
  const [activeQuickTouch, setActiveQuickTouch] = useState<{
    title: string;
    speech: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    parentTitle?: string;
    phoneNumber?: string;
  } | null>(null);
  const [activeSuboptions, setActiveSuboptions] = useState<{
    parentTitle: string;
    suboptions: Suboption[];
  } | null>(null);
  const [selectedSuboption, setSelectedSuboption] = useState<Suboption | null>(null);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [amountInput, setAmountInput] = useState<{ parentTitle: string; needsPhoneNumber: boolean } | null>(null);
  const [amountValue, setAmountValue] = useState('');
  const [phoneInput, setPhoneInput] = useState<{ pending: PendingQuickTouch } | null>(null);
  const [phoneValue, setPhoneValue] = useState('');

  useBackHandler(showHelp, () => setShowHelp(false));
  useBackHandler(iframeModal !== null, () => setIframeModal(null));
  useBackHandler(activeQuickTouch !== null, () => setActiveQuickTouch(null));
  useBackHandler(activeSuboptions !== null, () => setActiveSuboptions(null));
  useBackHandler(showModeSelector, () => setShowModeSelector(false));
  useBackHandler(amountInput !== null, () => { setAmountInput(null); setAmountValue(''); });
  useBackHandler(phoneInput !== null, () => { setPhoneInput(null); setPhoneValue(''); });

  const quickTouchServices: QuickTouchService[] = [
    { id: 'buy-phone',         title: 'Comprar un celular',      icon: Smartphone,   suboptions: MARCAS_PARA_COMPRA },
    { id: 'upgrade-phone',     title: 'Cambiar de equipo',       icon: RefreshCw,    suboptions: MARCAS_PARA_CAMBIO },
    { id: 'phone-plans',       title: 'Ver planes',              icon: ShoppingCart, suboptions: SUBOPCIONES_PLANES },
    { id: 'recharge',          title: 'Recargar saldo',          icon: Package,      suboptions: SUBOPCIONES_RECARGA },
    { id: 'check-balance',     title: 'Consultar saldo',         icon: DollarSign,   speech: 'Quiero consultar mi saldo disponible', needsPhoneNumber: true },
    { id: 'pay-bill',          title: 'Pagar mi factura',        icon: CreditCard,   suboptions: SUBOPCIONES_FACTURA },
    { id: 'billing-issue',     title: 'Problema de facturación', icon: AlertCircle,  suboptions: SUBOPCIONES_PROBLEMA_FACTURA },
    { id: 'technical-support', title: 'Soporte técnico',         icon: Headphones,   suboptions: SUBOPCIONES_SOPORTE },
    { id: 'other-procedure',   title: 'Otro trámite',            icon: FileText,     goToModeSelector: true },
  ];

  // Si el flujo necesita número de línea, guarda el QuickTouch como pendiente y
  // abre la pantalla de teléfono. Si no, abre QuickTouchScreen directo.
  const openQuickTouchOrPhone = (data: PendingQuickTouch, needsPhone: boolean) => {
    if (needsPhone) {
      setPhoneValue('');
      setPhoneInput({ pending: data });
    } else {
      setActiveQuickTouch(data);
    }
  };

  const handleTouchTap = (service: QuickTouchService) => {
    if (service.suboptions) {
      setSelectedSuboption(null);
      setActiveSuboptions({ parentTitle: service.title, suboptions: service.suboptions });
    } else if (service.goToModeSelector) {
      setShowModeSelector(true);
    } else if (service.speech) {
      openQuickTouchOrPhone(
        { title: service.title, speech: service.speech, icon: service.icon },
        service.needsPhoneNumber ?? false,
      );
    }
  };

  const handleSuboptionTap = (sub: Suboption) => {
    const parent = activeSuboptions?.parentTitle;
    setActiveSuboptions(null);
    setSelectedSuboption(null);
    if (sub.goToModeSelector) {
      setShowModeSelector(true);
    } else if (sub.needsAmountInput) {
      setAmountValue('');
      setAmountInput({ parentTitle: parent ?? '', needsPhoneNumber: sub.needsPhoneNumber ?? false });
    } else if (sub.speech) {
      openQuickTouchOrPhone(
        { title: sub.title, speech: sub.speech, icon: MessageCircle, parentTitle: parent },
        sub.needsPhoneNumber ?? false,
      );
    }
  };

  const confirmAmount = () => {
    if (!amountValue || !amountInput) return;
    const formatted = Number(amountValue).toLocaleString('es-AR');
    const pending: PendingQuickTouch = {
      title: `$${formatted}`,
      speech: `Quiero recargar ${amountValue} pesos de saldo`,
      icon: MessageCircle,
      parentTitle: amountInput.parentTitle,
    };
    setAmountInput(null);
    openQuickTouchOrPhone(pending, amountInput.needsPhoneNumber);
  };

  const confirmPhone = () => {
    if (!phoneValue || !phoneInput) return;
    const { pending } = phoneInput;
    setPhoneInput(null);
    setActiveQuickTouch({
      ...pending,
      speech: `${pending.speech}. Mi número de línea es ${phoneValue}`,
      phoneNumber: phoneValue,
    });
  };

  const openIframe = (mode: 'hands' | 'dillo') => {
    setShowModeSelector(false);
    setIframeModal({ initialMode: mode });
  };

  // ── Shared header bar ────────────────────────────────────────────────────────
  const OverlayHeader = ({ title, onBack }: { title: string; onBack: () => void }) => (
    <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 flex items-center gap-3">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 bg-gray-100 active:bg-gray-300 text-gray-800 font-semibold px-3 py-2.5 sm:px-5 sm:py-3 rounded-xl transition-colors touch-manipulation flex-shrink-0"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="text-sm sm:text-base">Atrás</span>
      </button>
      <h2 className="text-base sm:text-xl font-bold text-gray-900 truncate">{title}</h2>
    </div>
  );

  // ── Mode button — usado en pantalla principal y en selector ──────────────────
  const ModeButton = ({ mode, label, showIllustration = true }: {
    mode: 'hands' | 'dillo';
    label: string;
    showIllustration?: boolean;
  }) => {
    const isHands = mode === 'hands';
    return (
      <button
        onClick={() => openIframe(mode)}
        className="group bg-white rounded-2xl sm:rounded-3xl shadow-md sm:shadow-lg active:shadow-sm
                   transition-all duration-200 overflow-hidden border-2 sm:border-4 border-transparent
                   [@media(hover:hover)]:hover:border-[#DA291C]/20 [@media(hover:hover)]:hover:shadow-xl
                   active:scale-[0.98] touch-manipulation w-full"
      >
        <div className="p-4 sm:p-7 md:p-10 flex flex-col items-center gap-3 sm:gap-5">
          {/* Ícono compacto mobile / ilustración decorativa sm+ */}
          <div className={`${showIllustration ? '' : 'hidden'}`}>
            {/* Mobile: círculo simple */}
            <div className={`sm:hidden w-14 h-14 rounded-full flex items-center justify-center shadow-md ${
              isHands ? 'bg-[#DA291C]' : 'bg-white border-4 border-[#DA291C]'
            }`}>
              {isHands
                ? <Hand className="w-7 h-7 text-white" strokeWidth={2.5} />
                : <MessageCircle className="w-7 h-7 text-[#DA291C]" strokeWidth={2.5} />}
            </div>
            {/* Tablet+: ilustración decorativa */}
            <div className="hidden sm:block relative w-32 h-32 md:w-44 md:h-44">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-28 h-28 md:w-36 md:h-36 bg-gradient-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center">
                  {isHands ? (
                    <div className="relative">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-[#DA291C] rounded-full flex items-center justify-center">
                        <Hand className="w-8 h-8 md:w-10 md:h-10 text-white" strokeWidth={2.5} />
                      </div>
                      <div className="absolute -top-5 -right-1 w-10 h-10 bg-[#DA291C]/70 rounded-full opacity-30" />
                      <div className="absolute -bottom-4 -left-3 w-8 h-8 bg-[#DA291C]/50 rounded-full opacity-40" />
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-white border-4 border-[#DA291C] rounded-full flex items-center justify-center">
                        <MessageCircle className="w-8 h-8 md:w-9 md:h-9 text-[#DA291C]" strokeWidth={2.5} />
                      </div>
                      <div className="absolute -top-3 -right-3 w-7 h-7 bg-white border-4 border-[#DA291C]/70 rounded-full flex items-center justify-center opacity-60">
                        <div className="w-1.5 h-1.5 bg-[#DA291C] rounded-full" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Label */}
          {isHands ? (
            <div className="bg-[#DA291C] [@media(hover:hover)]:group-hover:bg-[#B01F16] text-white rounded-xl sm:rounded-2xl px-4 sm:px-7 py-2.5 sm:py-3.5 transition-colors inline-flex items-center gap-2 sm:gap-3 shadow-md">
              <Hand className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" strokeWidth={2.5} />
              <span className="text-sm sm:text-lg md:text-xl font-bold leading-tight">{label}</span>
            </div>
          ) : (
            <div className="bg-white border-2 sm:border-4 border-[#DA291C] [@media(hover:hover)]:group-hover:border-[#B01F16] text-[#DA291C] [@media(hover:hover)]:group-hover:text-[#B01F16] rounded-xl sm:rounded-2xl px-4 sm:px-7 py-2.5 sm:py-3.5 transition-colors inline-flex items-center gap-2 sm:gap-3 shadow-md">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" strokeWidth={2.5} />
              <span className="text-sm sm:text-lg md:text-xl font-bold leading-tight">{label}</span>
            </div>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col animate-slide-in overflow-hidden">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 py-3 sm:py-4 md:py-5 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <img
              src="https://www.claro.com.ar/static/claro-logo-red-atlas-2.svg"
              alt="Claro"
              className="h-6 sm:h-8"
            />
            <button
              onClick={() => setShowHelp(true)}
              className="px-3 py-2 sm:px-5 sm:py-2.5 bg-[#DA291C] active:bg-[#B01F16] text-white rounded-full text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 touch-manipulation flex-shrink-0"
            >
              <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden xs:inline sm:inline">¿Cómo usar Dillo?</span>
              <span className="xs:hidden sm:hidden">Ayuda</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Contenido scrolleable ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-6 md:px-6 md:py-8" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">

          {/* Grilla de Toques Rápidos */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8">
            <div className="text-center mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1">Toques Rápidos</h3>
              <p className="text-xs sm:text-sm text-gray-500">Accedé a los servicios con un toque</p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
              {quickTouchServices.map((service) => {
                const Icon = service.icon;
                return (
                  <button
                    key={service.id}
                    onClick={() => handleTouchTap(service)}
                    className={CARD_CLASS}
                  >
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center [@media(hover:hover)]:group-hover:scale-110 transition-transform shadow-sm flex-shrink-0">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#DA291C]" strokeWidth={2} />
                      </div>
                      <p className="text-[11px] sm:text-xs md:text-sm font-semibold text-gray-900 [@media(hover:hover)]:group-hover:text-white transition-colors leading-tight">
                        {service.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botones de modo de conversación */}
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:gap-8">
            <ModeButton mode="hands" label="Hablo con mis manos" />
            <ModeButton mode="dillo" label="Responder con Dillo" />
          </div>

        </div>
      </div>

      {/* ── Modales y overlays ───────────────────────────────────────────────── */}

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {activeQuickTouch && (
        <QuickTouchScreen
          title={activeQuickTouch.title}
          speech={activeQuickTouch.speech}
          icon={activeQuickTouch.icon}
          parentTitle={activeQuickTouch.parentTitle}
          phoneNumber={activeQuickTouch.phoneNumber}
          onClose={() => setActiveQuickTouch(null)}
        />
      )}

      {iframeModal && (
        <IframeModal initialMode={iframeModal.initialMode} onClose={() => setIframeModal(null)} />
      )}

      {/* Pantalla de subopciones */}
      {activeSuboptions && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-fade-in">
          <OverlayHeader
            title={activeSuboptions.parentTitle}
            onBack={() => { setActiveSuboptions(null); setSelectedSuboption(null); }}
          />

          <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-6" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="max-w-3xl mx-auto">
              <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 text-center">
                Elegí una opción para que la persona que te atiende entienda mejor lo que necesitás
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {activeSuboptions.suboptions.map((sub) => {
                  const isSelected = selectedSuboption?.id === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSuboption(sub)}
                      className={
                        isSelected
                          ? 'bg-[#DA291C] border-2 border-[#DA291C] rounded-xl p-4 sm:p-5 shadow-lg scale-[1.02] transition-all duration-200 touch-manipulation'
                          : CARD_CLASS
                      }
                    >
                      <div className="flex flex-col items-center text-center gap-2">
                        <p className={`text-sm sm:text-base md:text-lg font-semibold transition-colors leading-tight ${
                          isSelected ? 'text-white' : 'text-gray-900 [@media(hover:hover)]:group-hover:text-white'
                        }`}>
                          {sub.title}
                        </p>
                        {sub.goToModeSelector && (
                          <span className={`text-xs sm:text-sm transition-colors ${
                            isSelected ? 'text-white/80' : 'text-gray-400 [@media(hover:hover)]:group-hover:text-white/70'
                          }`}>
                            Elegir modo →
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
            <div className="max-w-3xl mx-auto">
              <button
                onClick={() => selectedSuboption && handleSuboptionTap(selectedSuboption)}
                disabled={!selectedSuboption}
                className={`w-full py-4 rounded-2xl text-base sm:text-lg font-bold transition-all duration-200 touch-manipulation ${
                  selectedSuboption
                    ? 'bg-[#DA291C] text-white shadow-lg active:bg-[#B01F16]'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {selectedSuboption ? `Continuar con "${selectedSuboption.title}"` : 'Seleccioná una opción'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pantalla de selección de modo */}
      {showModeSelector && (
        <div className="fixed inset-0 z-[60] bg-gray-50 flex flex-col animate-fade-in">
          <OverlayHeader title="¿Cómo querés comunicarte?" onBack={() => setShowModeSelector(false)} />

          <div className="flex-1 flex items-center justify-center px-4 py-6 sm:px-6 sm:py-8">
            <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-2xl w-full">
              <ModeButton mode="hands" label="Hablo con mis manos" showIllustration={false} />
              <ModeButton mode="dillo" label="Responder con Dillo" showIllustration={false} />
            </div>
          </div>
        </div>
      )}

      {/* Pantalla de número de línea */}
      {phoneInput && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-fade-in">
          <OverlayHeader
            title="Número de línea"
            onBack={() => { setPhoneInput(null); setPhoneValue(''); }}
          />

          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 sm:px-6 sm:pt-8 sm:pb-8" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="flex flex-col items-center gap-4 sm:gap-6 max-w-sm mx-auto">
              <div className="text-center space-y-1">
                <p className="text-lg sm:text-2xl font-bold text-gray-900">¿Cuál es tu número de celular?</p>
                <p className="text-xs sm:text-sm text-gray-500">Ingresalo para que la persona que te atiende pueda encontrar tu cuenta</p>
              </div>

              <div className="w-full">
                <div className="flex items-center bg-gray-50 border-2 border-gray-200 focus-within:border-[#DA291C] rounded-2xl px-4 py-3 sm:px-5 sm:py-4 transition-colors gap-3">
                  <span className="text-xl sm:text-2xl">📱</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="Ej: 351 432-5546"
                    value={phoneValue}
                    onChange={(e) => setPhoneValue(formatArgentinePhone(e.target.value))}
                    onKeyDown={(e) => e.key === 'Enter' && confirmPhone()}
                    className="flex-1 text-xl sm:text-2xl font-bold text-gray-900 bg-transparent outline-none placeholder-gray-300"
                    autoFocus
                  />
                </div>
              </div>

              <button
                onClick={confirmPhone}
                disabled={phoneValue.replace(/\D/g, '').length < 8}
                className={`w-full py-3 sm:py-4 rounded-2xl text-base sm:text-lg font-bold transition-all duration-200 touch-manipulation ${
                  phoneValue.replace(/\D/g, '').length >= 8
                    ? 'bg-[#DA291C] text-white shadow-lg active:bg-[#B01F16]'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {phoneValue.replace(/\D/g, '').length >= 8 ? 'Continuar' : 'Ingresá tu número'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pantalla de monto libre */}
      {amountInput && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-fade-in">
          <OverlayHeader
            title={amountInput.parentTitle}
            onBack={() => { setAmountInput(null); setAmountValue(''); }}
          />

          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 sm:px-6 sm:pt-8 sm:pb-8" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="flex flex-col items-center gap-4 sm:gap-6 max-w-sm mx-auto">
              <div className="text-center space-y-1">
                <p className="text-lg sm:text-2xl font-bold text-gray-900">¿Cuánto querés recargar?</p>
                <p className="text-xs sm:text-sm text-gray-500">Escribí el monto en pesos</p>
              </div>

              <div className="w-full">
                <div className="flex items-center bg-gray-50 border-2 border-gray-200 focus-within:border-[#DA291C] rounded-2xl px-4 py-3 sm:px-5 sm:py-4 transition-colors">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-400 mr-2">$</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={amountValue}
                    onChange={(e) => setAmountValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && confirmAmount()}
                    className="flex-1 text-2xl sm:text-3xl font-bold text-gray-900 bg-transparent outline-none placeholder-gray-300"
                    autoFocus
                  />
                </div>
              </div>

              <button
                onClick={confirmAmount}
                disabled={!amountValue || Number(amountValue) <= 0}
                className={`w-full py-3 sm:py-4 rounded-2xl text-base sm:text-lg font-bold transition-all duration-200 touch-manipulation ${
                  amountValue && Number(amountValue) > 0
                    ? 'bg-[#DA291C] text-white shadow-lg active:bg-[#B01F16]'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {amountValue && Number(amountValue) > 0
                  ? `Recargar $${Number(amountValue).toLocaleString('es-AR')}`
                  : 'Ingresá un monto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
