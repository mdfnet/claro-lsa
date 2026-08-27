import { useEffect, useState } from 'react';

// UX CHANGES v2:
// 1. Grid de Quick Touch: 2 columnas en mobile (targets táctiles más grandes)
// 2. Subopciones: tap directo navega sin paso de "Continuar" intermedio
//    → elimina 1 tap de cada flujo secundario (antes: tap → seleccionar → Continuar → navegar)
// 3. Botón "Asesor: respondé con Dillo →" eliminado de la pantalla principal
//    → solo aparece en contexto (QuickTouchScreen, IframeModal tabs)
//    → la pantalla principal es del CLIENTE, no del asesor
// 4. Historial siempre visible en el header (no condicionado a que haya items)
// 5. Modos de comunicación: fila compacta horizontal al pie de la grilla

const THREE_DIGIT_AREA_CODES = new Set([
  '220','221','223','230','236','249',
  '261','264','266',
  '280','281','291','293','294','296','297','298','299',
  '341','342','343','345','351','353','354','358',
  '362','370','376','380','381','383','385','387','388','389',
]);

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
  if (d.length <= 4) return d;
  if (d.length <= 6) return `${d.slice(0, 4)} ${d.slice(4, 6)}`;
  return `${d.slice(0, 4)} ${d.slice(4, 6)}-${d.slice(6)}`;
}

import {
  Hand, MessageCircle, Smartphone, CreditCard, Headphones,
  FileText, HelpCircle, ShoppingCart, DollarSign, Package,
  RefreshCw, AlertCircle, ChevronLeft, ChevronRight, Keyboard,
  History, X, Clock,
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

type ConversationMode = 'hands' | 'dillo' | 'text';

type ConversationEntry = {
  id: string;
  timestamp: Date;
  role: 'client' | 'agent';
  content: string;
};

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

const QUICK_TOUCH_SERVICES: QuickTouchService[] = [
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

// Card táctil: sin hover effects en touch, solo active: para feedback inmediato
const CARD_CLASS =
  'bg-white border border-gray-100 rounded-2xl p-3 sm:p-4 md:p-5 shadow-sm ' +
  'active:scale-[0.95] active:shadow-none transition-all duration-100 touch-manipulation ' +
  '[@media(hover:hover)]:hover:border-[#DA291C]/30 [@media(hover:hover)]:hover:shadow-md';

export default function ServiceSelectionScreen({
  onSelectService: _onSelectService,
}: ServiceSelectionScreenProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [iframeModal, setIframeModal] = useState<{ initialMode: ConversationMode } | null>(null);
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
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [amountInput, setAmountInput] = useState<{ parentTitle: string; needsPhoneNumber: boolean } | null>(null);
  const [amountValue, setAmountValue] = useState('');
  const [phoneInput, setPhoneInput] = useState<{ pending: PendingQuickTouch } | null>(null);
  const [phoneValue, setPhoneValue] = useState('');
  const [replyModal, setReplyModal] = useState<ConversationMode | null>(null);
  const [history, setHistory] = useState<ConversationEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const addEntry = (role: ConversationEntry['role'], content: string) => {
    setHistory((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, timestamp: new Date(), role, content },
    ]);
  };

  useEffect(() => {
    if (!localStorage.getItem('claro-lsa-help-shown')) {
      localStorage.setItem('claro-lsa-help-shown', '1');
      setShowHelp(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useBackHandler(showHelp, () => setShowHelp(false));
  useBackHandler(showHistory, () => setShowHistory(false));
  useBackHandler(activeQuickTouch !== null, () => setActiveQuickTouch(null));
  useBackHandler(activeSuboptions !== null, () => setActiveSuboptions(null));
  useBackHandler(showModeSelector, () => setShowModeSelector(false));
  useBackHandler(amountInput !== null, () => { setAmountInput(null); setAmountValue(''); });
  useBackHandler(phoneInput !== null, () => { setPhoneInput(null); setPhoneValue(''); });

  const activateQuickTouch = (data: {
    title: string;
    speech: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    parentTitle?: string;
    phoneNumber?: string;
  }) => {
    setActiveQuickTouch(data);
    const label = data.parentTitle ? `${data.parentTitle}: ${data.title}` : data.title;
    addEntry('client', label);
  };

  const openQuickTouchOrPhone = (data: PendingQuickTouch, needsPhone: boolean) => {
    if (needsPhone) {
      setPhoneValue('');
      setPhoneInput({ pending: data });
    } else {
      activateQuickTouch(data);
    }
  };

  const handleTouchTap = (service: QuickTouchService) => {
    if (service.suboptions) {
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

  // v2: tap directo en subopción → navega inmediatamente (sin paso "Continuar")
  const handleSuboptionTap = (sub: Suboption) => {
    const parent = activeSuboptions?.parentTitle;
    setActiveSuboptions(null);
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
    activateQuickTouch({
      ...pending,
      speech: `${pending.speech}. Mi número de línea es ${phoneValue}`,
      phoneNumber: phoneValue,
    });
  };

  const openIframe = (mode: ConversationMode) => {
    setShowModeSelector(false);
    if (mode === 'dillo') addEntry('agent', 'Respondió con Dillo');
    setIframeModal({ initialMode: mode });
  };

  // ── Header compartido para overlays ─────────────────────────────────────────
  const OverlayHeader = ({ title, onBack }: { title: string; onBack: () => void }) => (
    <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 py-3 sm:px-5 sm:py-4 flex items-center gap-3">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 bg-gray-100 active:bg-gray-200 text-gray-800 font-bold
                   px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl transition-colors touch-manipulation flex-shrink-0"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="text-sm sm:text-base">Atrás</span>
      </button>
      <h2 className="text-base sm:text-xl font-black text-gray-900 truncate">{title}</h2>
    </div>
  );

  return (
    <div className="h-screen bg-gray-50 flex flex-col animate-slide-in overflow-hidden" style={{ height: '100dvh' }}>

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 py-3 sm:py-4 flex-shrink-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 flex items-center justify-between gap-3">
          <img
            src={`${import.meta.env.BASE_URL}icons/claro-logo-red-atlas-2.svg`}
            alt="Claro"
            className="h-6 sm:h-8"
          />
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Historial — siempre visible en v2 (en v1 solo aparecía si había items) */}
            <button
              onClick={() => setShowHistory(true)}
              className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center
                         bg-gray-100 active:bg-gray-200 rounded-xl transition-colors touch-manipulation"
              aria-label="Ver historial de atención"
            >
              <History className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              {history.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#DA291C] text-white rounded-full
                                 text-[9px] font-black flex items-center justify-center">
                  {history.length > 9 ? '9+' : history.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowHelp(true)}
              className="flex items-center gap-1.5 bg-[#DA291C] active:bg-[#A01E13] text-white
                         px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold
                         transition-colors touch-manipulation"
            >
              <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">¿Cómo usar?</span>
              <span className="sm:hidden">Ayuda</span>
            </button>

          </div>
        </div>
      </header>

      {/* ── Contenido principal scrolleable ───────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="max-w-6xl mx-auto px-3 py-4 sm:px-5 sm:py-6 md:px-6 md:py-8 space-y-5 sm:space-y-7">

          {/* ── Toques Rápidos ────────────────────────────────────────────────── */}
          <section className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

            <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-50">
              <h2 className="text-lg sm:text-xl font-black text-gray-900">¿Qué necesitás hacer hoy?</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Tocá el servicio para comunicárselo al asesor</p>
            </div>

            {/* Grid: 2 columnas en mobile, 3 en sm, 4 en lg */}
            <div className="p-3 sm:p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {QUICK_TOUCH_SERVICES.map((service) => {
                const Icon = service.icon;
                return (
                  <button
                    key={service.id}
                    onClick={() => handleTouchTap(service)}
                    className={CARD_CLASS}
                  >
                    <div className="flex flex-col items-center text-center gap-2.5 sm:gap-3">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 bg-[#DA291C]/8 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#DA291C]" strokeWidth={2} />
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                        {service.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

          </section>

          {/* ── Modos de comunicación directa ─────────────────────────────────── */}
          <section>
            <div className="text-center mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-black text-gray-900">O comunicarte directamente</h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Elegí cómo querés hablar con la persona que te atiende</p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <ModeCard
                icon={Hand}
                label="Mis señas"
                description="Señas a la cámara"
                variant="primary"
                onClick={() => openIframe('hands')}
              />
              <ModeCard
                icon={MessageCircle}
                label="Con Dillo"
                description="El asesor responde en señas"
                variant="outlined"
                onClick={() => openIframe('dillo')}
              />
              <ModeCard
                icon={Keyboard}
                label="Escribir"
                description="Escribí tu respuesta"
                variant="outlined"
                onClick={() => openIframe('text')}
              />
            </div>
          </section>

        </div>
      </div>

      {/* ── Modales y overlays ────────────────────────────────────────────────── */}

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {activeQuickTouch && (
        <QuickTouchScreen
          title={activeQuickTouch.title}
          speech={activeQuickTouch.speech}
          icon={activeQuickTouch.icon}
          parentTitle={activeQuickTouch.parentTitle}
          phoneNumber={activeQuickTouch.phoneNumber}
          onClose={() => { setActiveQuickTouch(null); setReplyModal(null); }}
          onBack={() => { setActiveQuickTouch(null); setReplyModal(null); }}
          showConversation
          onOpenReplyModal={() => { addEntry('agent', 'Respondió con Dillo'); setReplyModal('dillo'); }}
        />
      )}

      {replyModal && (
        <IframeModal
          initialMode={replyModal}
          onClose={() => { setReplyModal(null); setActiveQuickTouch(null); }}
          zIndex="z-[70]"
          onClientMessage={(msg) => addEntry('client', msg)}
          onAgentMessage={(msg) => addEntry('agent', msg)}
          onAgentTurn={() => addEntry('agent', 'Respondió con Dillo')}
        />
      )}

      {iframeModal && (
        <IframeModal
          initialMode={iframeModal.initialMode}
          onClose={() => setIframeModal(null)}
          onClientMessage={(msg) => addEntry('client', msg)}
          onAgentMessage={(msg) => addEntry('agent', msg)}
          onAgentTurn={() => addEntry('agent', 'Respondió con Dillo')}
        />
      )}

      {/* Pantalla de subopciones — v2: tap directo sin "Continuar" */}
      {activeSuboptions && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-fade-in">
          <OverlayHeader
            title={activeSuboptions.parentTitle}
            onBack={() => setActiveSuboptions(null)}
          />

          <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-6" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="max-w-2xl mx-auto">
              <p className="text-sm text-gray-400 mb-4 text-center">
                Tocá la opción para comunicársela al asesor
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {activeSuboptions.suboptions.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => handleSuboptionTap(sub)}
                    className="group bg-white border-2 border-gray-100 rounded-2xl p-4 sm:p-5
                               active:bg-[#DA291C] active:border-[#DA291C] active:scale-[0.96]
                               transition-all duration-100 touch-manipulation
                               [@media(hover:hover)]:hover:border-[#DA291C]/40"
                  >
                    <div className="flex flex-col items-center text-center gap-1.5">
                      <p className="text-sm sm:text-base font-black text-gray-900 leading-tight
                                    group-active:text-white">
                        {sub.title}
                      </p>
                      {sub.goToModeSelector && (
                        <span className="text-xs text-gray-400 group-active:text-white/70">Elegir modo →</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selector de modo */}
      {showModeSelector && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center animate-fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-5 sm:p-6 animate-sheet-up sm:animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-gray-900">¿Cómo querés comunicarte?</h2>
              <button
                onClick={() => setShowModeSelector(false)}
                className="w-9 h-9 flex items-center justify-center bg-gray-100 active:bg-gray-200 rounded-full touch-manipulation"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="space-y-2.5">
              {([
                { mode: 'hands' as ConversationMode, label: 'Mis señas', desc: 'Señas a la cámara', Icon: Hand, primary: true },
                { mode: 'dillo' as ConversationMode, label: 'El asesor responde con Dillo', desc: 'El asesor habla/escribe, vos ves señas', Icon: MessageCircle, primary: false },
                { mode: 'text'  as ConversationMode, label: 'Escribir mi respuesta', desc: 'Texto → pantalla grande + voz',  Icon: Keyboard, primary: false },
              ] as const).map(({ mode, label, desc, Icon, primary }) => (
                <button
                  key={mode}
                  onClick={() => openIframe(mode)}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl border-2 transition-all touch-manipulation active:scale-[0.98] ${
                    primary
                      ? 'bg-[#DA291C] border-[#DA291C] active:bg-[#A01E13]'
                      : 'bg-white border-gray-100 active:border-[#DA291C]/30'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    primary ? 'bg-white/20' : 'bg-[#DA291C]/10'
                  }`}>
                    <Icon className={`w-5 h-5 ${primary ? 'text-white' : 'text-[#DA291C]'}`} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-black text-sm sm:text-base leading-tight ${primary ? 'text-white' : 'text-gray-900'}`}>{label}</p>
                    <p className={`text-xs mt-0.5 ${primary ? 'text-white/70' : 'text-gray-400'}`}>{desc}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 ${primary ? 'text-white/60' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Número de línea */}
      {phoneInput && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-fade-in">
          <OverlayHeader
            title="Número de línea"
            onBack={() => { setPhoneInput(null); setPhoneValue(''); }}
          />

          <div className="flex-1 overflow-y-auto px-5 pt-6 pb-5 sm:px-6 sm:pt-10" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="flex flex-col gap-5 max-w-sm mx-auto">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-black text-gray-900">¿Cuál es tu número?</p>
                <p className="text-sm text-gray-500 mt-1">Para que el asesor pueda encontrar tu cuenta</p>
              </div>

              <div className="flex items-center bg-gray-50 border-2 border-gray-200 focus-within:border-[#DA291C] rounded-2xl px-4 py-4 gap-3 transition-colors">
                <span className="text-2xl">📱</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="Ej: 351 432-5546"
                  value={phoneValue}
                  onChange={(e) => setPhoneValue(formatArgentinePhone(e.target.value))}
                  onKeyDown={(e) => e.key === 'Enter' && confirmPhone()}
                  className="flex-1 text-2xl sm:text-3xl font-black text-gray-900 bg-transparent outline-none placeholder-gray-300"
                  autoFocus
                />
              </div>

              <button
                onClick={confirmPhone}
                disabled={phoneValue.replace(/\D/g, '').length < 8}
                className={`w-full py-4 rounded-2xl text-base sm:text-lg font-black transition-all touch-manipulation ${
                  phoneValue.replace(/\D/g, '').length >= 8
                    ? 'bg-[#DA291C] text-white shadow-lg active:bg-[#A01E13]'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {phoneValue.replace(/\D/g, '').length >= 8 ? 'Continuar' : 'Ingresá tu número'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Monto libre */}
      {amountInput && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-fade-in">
          <OverlayHeader
            title={amountInput.parentTitle}
            onBack={() => { setAmountInput(null); setAmountValue(''); }}
          />

          <div className="flex-1 overflow-y-auto px-5 pt-6 pb-5 sm:px-6 sm:pt-10" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="flex flex-col gap-5 max-w-sm mx-auto">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-black text-gray-900">¿Cuánto querés recargar?</p>
                <p className="text-sm text-gray-500 mt-1">Escribí el monto en pesos</p>
              </div>

              <div className="flex items-center bg-gray-50 border-2 border-gray-200 focus-within:border-[#DA291C] rounded-2xl px-5 py-4 transition-colors">
                <span className="text-3xl font-black text-gray-400 mr-2">$</span>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={amountValue}
                  onChange={(e) => setAmountValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && confirmAmount()}
                  className="flex-1 text-3xl font-black text-gray-900 bg-transparent outline-none placeholder-gray-300"
                  autoFocus
                />
              </div>

              <button
                onClick={confirmAmount}
                disabled={!amountValue || Number(amountValue) <= 0}
                className={`w-full py-4 rounded-2xl text-base sm:text-lg font-black transition-all touch-manipulation ${
                  amountValue && Number(amountValue) > 0
                    ? 'bg-[#DA291C] text-white shadow-lg active:bg-[#A01E13]'
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

      {/* Historial de atención */}
      {showHistory && (
        <div className="fixed inset-0 z-[80] bg-white flex flex-col animate-fade-in">
          <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-gray-900">Historial de atención</h2>
              {history.length > 0 && (
                <p className="text-xs text-gray-400">{history.length} mensaje{history.length !== 1 ? 's' : ''}</p>
              )}
            </div>
            <button
              onClick={() => setShowHistory(false)}
              aria-label="Cerrar"
              className="w-9 h-9 flex items-center justify-center bg-gray-100 active:bg-gray-200 rounded-full transition-colors touch-manipulation"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3" style={{ WebkitOverflowScrolling: 'touch' }}>
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-6">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                  <Clock className="w-7 h-7 text-gray-400" />
                </div>
                <p className="text-gray-400 font-semibold text-base">Sin mensajes aún</p>
                <p className="text-gray-300 text-sm">Los mensajes de esta atención aparecerán acá</p>
              </div>
            ) : (
              history.map((entry) => (
                <div key={entry.id} className={`flex ${entry.role === 'client' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[82%] rounded-2xl px-4 py-3 ${
                    entry.role === 'client'
                      ? 'bg-[#DA291C] text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}>
                    <p className={`text-[10px] font-bold mb-0.5 uppercase tracking-wide ${
                      entry.role === 'client' ? 'text-white/60' : 'text-gray-400'
                    }`}>
                      {entry.role === 'client' ? 'Vos' : 'Asesor'}
                    </p>
                    <p className="text-sm sm:text-base font-semibold leading-snug">{entry.content}</p>
                    <p className={`text-[10px] mt-1 ${
                      entry.role === 'client' ? 'text-white/50 text-right' : 'text-gray-400'
                    }`}>
                      {entry.timestamp.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex-shrink-0 border-t border-gray-100 px-4 py-3">
            <button
              onClick={() => { setHistory([]); setShowHistory(false); }}
              className="w-full py-3 rounded-xl text-sm font-bold text-gray-500 border border-gray-200 active:bg-gray-50 transition-colors touch-manipulation"
            >
              Nueva atención — limpiar historial
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// ── Componente tarjeta de modo ───────────────────────────────────────────────

function ModeCard({
  icon: Icon, label, description, variant, onClick,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  description: string;
  variant: 'primary' | 'outlined';
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl p-3 sm:p-4 transition-all duration-100 touch-manipulation
                  active:scale-[0.95] flex flex-col items-center text-center gap-2 ${
        variant === 'primary'
          ? 'bg-[#DA291C] active:bg-[#A01E13] shadow-md'
          : 'bg-white border-2 border-gray-100 shadow-sm active:border-[#DA291C]/20'
      }`}
    >
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${
        variant === 'primary' ? 'bg-white/20' : 'bg-[#DA291C]/10'
      }`}>
        <Icon
          className={`w-5 h-5 sm:w-6 sm:h-6 ${variant === 'primary' ? 'text-white' : 'text-[#DA291C]'}`}
          strokeWidth={2.5}
        />
      </div>
      <div>
        <p className={`text-xs sm:text-sm font-black leading-tight ${
          variant === 'primary' ? 'text-white' : 'text-gray-900'
        }`}>{label}</p>
        <p className={`text-[10px] sm:text-xs mt-0.5 leading-snug ${
          variant === 'primary' ? 'text-white/70' : 'text-gray-400'
        }`}>{description}</p>
      </div>
    </button>
  );
}
