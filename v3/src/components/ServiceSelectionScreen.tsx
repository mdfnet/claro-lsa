import { useCallback, useEffect, useState } from 'react';

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
  MessageCircle, Smartphone, CreditCard, Headphones,
  FileText, HelpCircle, ShoppingCart, DollarSign, Package,
  RefreshCw, AlertCircle, ChevronLeft, ChevronRight, Keyboard,
  History, X, Clock, Phone,
} from 'lucide-react';
import { LSAHandIcon } from './LSAHandIcon';
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
  icon: React.ComponentType<any>;
  speech?: string;
  suboptions?: Suboption[];
  goToModeSelector?: boolean;
  needsPhoneNumber?: boolean;
}

type PendingQuickTouch = {
  title: string;
  speech: string;
  icon: React.ComponentType<any>;
  parentTitle?: string;
};

// BUG-20: onSelectService prop eliminado — era dead code (nunca se llamaba).
export default function ServiceSelectionScreen() {
  const [showHelp, setShowHelp] = useState(false);
  const [iframeModal, setIframeModal] = useState<{ initialMode: ConversationMode } | null>(null);
  const [activeQuickTouch, setActiveQuickTouch] = useState<{
    title: string;
    speech: string;
    icon: React.ComponentType<any>;
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
  const [backSuboptions, setBackSuboptions] = useState<{ parentTitle: string; suboptions: Suboption[] } | null>(null);
  const [history, setHistory] = useState<ConversationEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [dilloPrewarmMounted, setDilloPrewarmMounted] = useState(false);

  // BUG-14: addEntry memoizado con useCallback — referencia estable entre renders.
  const addEntry = useCallback((role: ConversationEntry['role'], content: string) => {
    setHistory((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, timestamp: new Date(), role, content },
    ]);
  }, []);

  // BUG-14: Handlers estables para evitar re-registrar el postMessage listener en cada render.
  const handleClientMessage = useCallback((msg: string) => addEntry('client', msg), [addEntry]);
  const handleAgentMessage = useCallback((msg: string) => addEntry('agent', msg), [addEntry]);

  useEffect(() => {
    // BUG-12: localStorage envuelto en try/catch — puede lanzar en modo incógnito iOS.
    try {
      if (!localStorage.getItem('claro-lsa-help-shown')) {
        localStorage.setItem('claro-lsa-help-shown', '1');
        setShowHelp(true);
      }
    } catch {
      // Silently ignore storage errors
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!showModeSelector) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [showModeSelector]);

  // Cuando el usuario entra a QuickTouchScreen es muy probable que el asesor
  // necesite Dillo pronto. Montamos el iframe de Dillo oculto para que sus
  // assets (JS, modelos 3D, texturas) se cacheen en el browser antes de que
  // el asesor toque "Respondé con Dillo →". Al abrir IframeModal, todos los
  // assets vienen del caché → mucho menos tiempo de spinner. Ver render abajo.
  useEffect(() => {
    if (!activeQuickTouch || dilloPrewarmMounted) return;
    let cancelled = false;
    const mount = () => { if (!cancelled) setDilloPrewarmMounted(true); };
    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(mount, { timeout: 1500 });
      return () => { cancelled = true; cancelIdleCallback(id); };
    }
    const t = setTimeout(mount, 1000);
    return () => { cancelled = true; clearTimeout(t); };
  }, [activeQuickTouch, dilloPrewarmMounted]);

  useBackHandler(showHelp, () => setShowHelp(false));
  useBackHandler(showHistory, () => { setShowHistory(false); setConfirmClear(false); });
  useBackHandler(activeQuickTouch !== null, () => setActiveQuickTouch(null));
  useBackHandler(activeSuboptions !== null, () => setActiveSuboptions(null));
  useBackHandler(showModeSelector, () => setShowModeSelector(false));
  useBackHandler(amountInput !== null, () => { setAmountInput(null); setAmountValue(''); });
  useBackHandler(phoneInput !== null, () => { setPhoneInput(null); setPhoneValue(''); });

  const activateQuickTouch = (data: {
    title: string;
    speech: string;
    icon: React.ComponentType<any>;
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

  const handleSuboptionTap = (sub: Suboption) => {
    const parent = activeSuboptions?.parentTitle;
    const saved = activeSuboptions;
    setActiveSuboptions(null);
    if (sub.goToModeSelector) {
      setShowModeSelector(true);
    } else if (sub.needsAmountInput) {
      // BUG-08: backSuboptions también se setea en el path amountInput,
      // para que "Elegir otra opción" restaure subopciones correctamente.
      setBackSuboptions(saved);
      setAmountValue('');
      setAmountInput({ parentTitle: parent ?? '', needsPhoneNumber: sub.needsPhoneNumber ?? false });
    } else if (sub.speech) {
      setBackSuboptions(saved);
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
    setIframeModal({ initialMode: mode });
  };

  // OverlayHeader acepta titleId opcional para aria-labelledby en los role="dialog"
  const OverlayHeader = ({ title, onBack, titleId }: { title: string; onBack: () => void; titleId?: string }) => (
    <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 py-3 sm:px-5 sm:py-4 flex items-center gap-3">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 bg-gray-100 active:bg-gray-200 text-gray-800 font-bold
                   px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl transition-colors touch-manipulation flex-shrink-0
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="text-sm sm:text-base">Atrás</span>
      </button>
      <h2 id={titleId} className="text-base sm:text-xl font-black text-gray-900 truncate">{title}</h2>
    </div>
  );

  return (
    // BUG-17: eliminado h-screen (redundante con style={{ height: '100dvh' }})
    <div className="bg-gray-50 flex flex-col animate-slide-in overflow-hidden" style={{ height: '100dvh' }}>

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 py-3 sm:py-4 flex-shrink-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 flex items-center justify-between gap-3">
          <img
            src={`${import.meta.env.BASE_URL}icons/claro-logo-red-atlas-2.svg`}
            alt="Claro"
            className="h-6 sm:h-8"
          />
          <div className="flex items-center gap-2 flex-shrink-0">

            <button
              onClick={() => setShowHistory(true)}
              className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center
                         bg-gray-100 active:bg-gray-200 rounded-xl transition-colors touch-manipulation
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
              aria-label="Ver historial de atención"
            >
              <History className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              {history.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand text-white rounded-full
                                 text-[10px] font-black flex items-center justify-center">
                  {/* BUG-07: text-[9px] → text-[10px] */}
                  {history.length > 9 ? '9+' : history.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowHelp(true)}
              className="flex items-center gap-1.5 bg-brand active:bg-brand-dark text-white
                         px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold
                         transition-colors touch-manipulation
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
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
                      <div className="w-11 h-11 sm:w-12 sm:h-12 bg-brand/8 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-brand" strokeWidth={2} />
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
              <h2 className="text-base sm:text-lg font-black text-gray-900">También podés comunicarte directamente</h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Elegí cómo querés comunicarte con la persona que te atiende</p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <ModeCard
                icon={LSAHandIcon}
                label="Mis señas"
                description="Señas a la cámara"
                variant="primary"
                onClick={() => openIframe('hands')}
              />
              <ModeCard
                icon={MessageCircle}
                label="Con Dillo"
                description="El asesor te responde"
                variant="outlined"
                onClick={() => openIframe('dillo')}
              />
              <ModeCard
                icon={Keyboard}
                label="Escribir"
                description="Escribí y mostrá"
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
          onClose={() => { setActiveQuickTouch(null); setReplyModal(null); setBackSuboptions(null); }}
          onBack={() => {
            setActiveQuickTouch(null);
            setReplyModal(null);
            if (backSuboptions) { setActiveSuboptions(backSuboptions); setBackSuboptions(null); }
          }}
          showConversation
          onOpenReplyModal={() => setReplyModal('dillo')}
        />
      )}

      {replyModal && (
        <IframeModal
          initialMode={replyModal}
          onClose={() => { setReplyModal(null); setActiveQuickTouch(null); }}
          zIndex="z-[70]"
          onClientMessage={handleClientMessage}
          onAgentMessage={handleAgentMessage}
        />
      )}

      {iframeModal && (
        <IframeModal
          initialMode={iframeModal.initialMode}
          onClose={() => setIframeModal(null)}
          onClientMessage={handleClientMessage}
          onAgentMessage={handleAgentMessage}
        />
      )}

      {/* BUG-11: role="dialog" + aria-modal en pantalla de subopciones */}
      {activeSuboptions && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="suboptions-title"
          className="fixed inset-0 z-[60] bg-white flex flex-col animate-fade-in"
        >
          <OverlayHeader
            title={activeSuboptions.parentTitle}
            onBack={() => setActiveSuboptions(null)}
            titleId="suboptions-title"
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
                               active:bg-brand active:border-brand active:scale-[0.96]
                               transition-all duration-100 touch-manipulation
                               [@media(hover:hover)]:hover:border-brand/40
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
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

      {/* BUG-11: role="dialog" en el mode selector */}
      {showModeSelector && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center animate-fade-in"
          style={{ height: '100dvh' }}
          onClick={() => setShowModeSelector(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mode-selector-title"
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-5 sm:p-6 pb-8 animate-sheet-up sm:animate-fade-in overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 id="mode-selector-title" className="text-lg font-black text-gray-900">¿Cómo querés comunicarte?</h2>
              <button
                onClick={() => setShowModeSelector(false)}
                className="w-9 h-9 flex items-center justify-center bg-gray-100 active:bg-gray-200 rounded-full touch-manipulation
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="space-y-2.5">
              {([
                { mode: 'hands' as ConversationMode, label: 'Mis señas', desc: 'Señas a la cámara', Icon: LSAHandIcon, primary: true },
                { mode: 'dillo' as ConversationMode, label: 'El asesor responde con Dillo', desc: 'El asesor habla o escribe, vos ves la respuesta en señas', Icon: MessageCircle, primary: false },
                { mode: 'text'  as ConversationMode, label: 'Escribir mi respuesta', desc: 'Escribís tu respuesta y se reproduce en voz alta',  Icon: Keyboard, primary: false },
              ] as const).map(({ mode, label, desc, Icon, primary }) => (
                <button
                  key={mode}
                  onClick={() => openIframe(mode)}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl border-2 transition-all touch-manipulation active:scale-[0.98]
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                    primary
                      ? 'bg-brand border-brand active:bg-brand-dark focus-visible:ring-brand'
                      : 'bg-white border-gray-100 active:border-brand/30 focus-visible:ring-gray-400'
                  }`}
                >
                  {/* BUG-04: overflow-hidden en contenedor del ícono LSA */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden ${
                    primary ? 'bg-white/20' : 'bg-brand/10'
                  }`}>
                    <Icon className={`w-9 h-9 ${primary ? 'text-white' : 'text-brand'}`} strokeWidth={2.5} />
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

      {/* BUG-11: role="dialog" en phone input */}
      {phoneInput && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="phone-input-title"
          className="fixed inset-0 z-[60] bg-white flex flex-col animate-fade-in"
        >
          <OverlayHeader
            title="Número de línea"
            onBack={() => { setPhoneInput(null); setPhoneValue(''); }}
            titleId="phone-input-title"
          />

          <div className="flex-1 overflow-y-auto px-5 pt-6 pb-5 sm:px-6 sm:pt-10" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="flex flex-col gap-5 max-w-sm mx-auto">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-black text-gray-900">¿Cuál es tu número?</p>
                <p className="text-sm text-gray-500 mt-1">Para que el asesor pueda encontrar tu cuenta</p>
              </div>

              <div className="flex items-center bg-gray-50 border-2 border-gray-200 focus-within:border-brand rounded-2xl px-4 py-4 gap-3 transition-colors">
                <Phone className="w-6 h-6 text-gray-400 flex-shrink-0" strokeWidth={2} />
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

              {/* BUG-09: validación mínima 10 dígitos (número argentino completo) */}
              <button
                onClick={confirmPhone}
                disabled={phoneValue.replace(/\D/g, '').length < 10}
                className={`w-full py-4 rounded-2xl text-base sm:text-lg font-black transition-all touch-manipulation
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  phoneValue.replace(/\D/g, '').length >= 10
                    ? 'bg-brand text-white shadow-lg active:bg-brand-dark focus-visible:ring-brand'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {phoneValue.replace(/\D/g, '').length >= 10 ? 'Continuar' : 'Ingresá tu número (10 dígitos)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BUG-11: role="dialog" en amount input */}
      {amountInput && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="amount-input-title"
          className="fixed inset-0 z-[60] bg-white flex flex-col animate-fade-in"
        >
          <OverlayHeader
            title={amountInput.parentTitle}
            onBack={() => { setAmountInput(null); setAmountValue(''); }}
            titleId="amount-input-title"
          />

          <div className="flex-1 overflow-y-auto px-5 pt-6 pb-5 sm:px-6 sm:pt-10" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="flex flex-col gap-5 max-w-sm mx-auto">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-black text-gray-900">¿Cuánto querés recargar?</p>
                <p className="text-sm text-gray-500 mt-1">Escribí el monto en pesos</p>
              </div>

              <div className="flex items-center bg-gray-50 border-2 border-gray-200 focus-within:border-brand rounded-2xl px-5 py-4 transition-colors">
                <span className="text-3xl font-black text-gray-400 mr-2">$</span>
                {/* BUG-18: type="number" → type="text" con filtro de dígitos en onChange */}
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={amountValue}
                  onChange={(e) => setAmountValue(e.target.value.replace(/[^0-9]/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && confirmAmount()}
                  className="flex-1 text-3xl font-black text-gray-900 bg-transparent outline-none placeholder-gray-300"
                  autoFocus
                />
              </div>

              <button
                onClick={confirmAmount}
                disabled={!amountValue || Number(amountValue) <= 0}
                className={`w-full py-4 rounded-2xl text-base sm:text-lg font-black transition-all touch-manipulation
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  amountValue && Number(amountValue) > 0
                    ? 'bg-brand text-white shadow-lg active:bg-brand-dark focus-visible:ring-brand'
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

      {/* BUG-11: role="dialog" en historial */}
      {showHistory && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="history-title"
          className="fixed inset-0 z-[80] bg-white flex flex-col animate-fade-in"
        >
          <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between">
            <div>
              <h2 id="history-title" className="text-lg sm:text-xl font-black text-gray-900">Historial de atención</h2>
              {history.length > 0 && (
                <p className="text-xs text-gray-400">{history.length} mensaje{history.length !== 1 ? 's' : ''}</p>
              )}
            </div>
            <button
              onClick={() => { setShowHistory(false); setConfirmClear(false); }}
              aria-label="Cerrar"
              className="w-9 h-9 flex items-center justify-center bg-gray-100 active:bg-gray-200 rounded-full transition-colors touch-manipulation
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
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
                      ? 'bg-brand text-white rounded-br-sm'
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

          {/* BUG-15: confirmación en dos pasos antes de limpiar historial */}
          <div className="flex-shrink-0 border-t border-gray-100 px-4 py-3">
            {confirmClear ? (
              <div className="flex flex-col gap-2">
                <p className="text-center text-sm text-gray-700 font-semibold">¿Confirmás? Esta acción no se puede deshacer</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setHistory([]); setShowHistory(false); setConfirmClear(false); }}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-brand active:bg-brand-dark touch-manipulation
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                  >
                    Sí, limpiar
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-600 border border-gray-200 active:bg-gray-50 touch-manipulation
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="w-full py-3 rounded-xl text-sm font-bold text-gray-500 border border-gray-200 active:bg-gray-50 transition-colors touch-manipulation
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
              >
                Nueva atención — limpiar historial
              </button>
            )}
          </div>
        </div>
      )}

      {/* Pre-warm de Dillo para el flujo de Toques Rápidos.
          display:none → el JS ejecuta y los assets (JS, modelos 3D, texturas) se
          cachean en el browser; el browser pausa el render loop WebGL en viewports
          ocultos → GPU ≈ 0. Se monta solo cuando activeQuickTouch está activo,
          ya que en ese momento el asesor va a necesitar Dillo pronto. */}
      {dilloPrewarmMounted && (
        <iframe
          src="https://avatar.dillo.ai/?embed=1"
          style={{ display: 'none' }}
          title=""
          aria-hidden="true"
          tabIndex={-1}
          allow="camera; microphone"
        />
      )}

    </div>
  );
}

// ── Datos de servicios ────────────────────────────────────────────────────────

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

const CARD_CLASS =
  'bg-white border border-gray-100 rounded-2xl p-3 sm:p-4 md:p-5 shadow-sm ' +
  'active:scale-[0.95] active:shadow-none transition-all duration-100 touch-manipulation ' +
  '[@media(hover:hover)]:hover:border-brand/30 [@media(hover:hover)]:hover:shadow-md ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2';

// ── Componente tarjeta de modo ────────────────────────────────────────────────

function ModeCard({
  icon: Icon, label, description, variant, onClick,
}: {
  icon: React.ComponentType<any>;
  label: string;
  description: string;
  variant: 'primary' | 'outlined';
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl p-3 sm:p-4 transition-all duration-100 touch-manipulation
                  active:scale-[0.95] flex flex-col items-center text-center gap-2 min-h-[80px]
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
        variant === 'primary'
          ? 'bg-brand active:bg-brand-dark shadow-md focus-visible:ring-brand'
          : 'bg-white border-2 border-gray-100 shadow-sm active:border-brand/20 focus-visible:ring-gray-400'
      }`}
    >
      {/* BUG-04: overflow-hidden en contenedor del ícono LSA (scale-[1.8] sin contener) */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden ${
        variant === 'primary' ? 'bg-white/20' : 'bg-brand/10'
      }`}>
        <Icon
          className={`w-6 h-6 ${variant === 'primary' ? 'text-white' : 'text-brand'}`}
          strokeWidth={2.5}
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <p className={`text-xs font-black leading-tight ${
          variant === 'primary' ? 'text-white' : 'text-gray-900'
        }`}>{label}</p>
        <p className={`text-[10px] leading-snug line-clamp-2 ${
          variant === 'primary' ? 'text-white/70' : 'text-gray-400'
        }`}>{description}</p>
      </div>
    </button>
  );
}
