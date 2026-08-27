# Contexto de trabajo — Claro LSA

**Última actualización:** 2026-08-26 (sesión 5 — v3 activa)

> **VERSIÓN ACTIVA: `v3/`** — Es donde se trabaja ahora. v1 (`src/`) y v2 (`v2/`) quedan como referencia.

---

## Qué es el proyecto

PWA React/TypeScript para que personas sordas y agentes de Claro Argentina se comuniquen pasándose el teléfono en oficinas presenciales. Tres modos: Mis manos (señas LSA), Responder con Dillo (avatar), Responder con texto.

Stack: React 18 · TypeScript 5 · Vite 5 · Tailwind CSS 3 · PWA  
Deploy: https://dillo.ar/claro/  
Base path: `/claro/` (configurable via `BASE_PATH` env var)

**Versiones del proyecto:**
| Carpeta | Estado | Dev port |
|---------|--------|----------|
| `src/` | v1 — referencia, no tocar | 5173 |
| `v2/` | v2 — referencia, no tocar | 5174 |
| `v3/` | **VERSIÓN ACTIVA** — todo trabajo nuevo va acá | 5175 |

---

## Roles de los modos

- **Cliente (persona sorda):** "Mis manos" (señas → texto/voz) + "Responder con texto" (escribe → asesor lee)
- **Asesor:** "Responder con Dillo" (habla/escribe → avatar lo convierte a señas)

---

## Estado de sprints

### Sprint 0 — Deuda técnica ✅
- `backup/` y `build dev/` → removidos del repo, en .gitignore
- Widget del avatar (switch + estado) → eliminado de App.tsx y ServiceSelectionScreen
- Logos de Claro → descargados a `public/icons/` (claro-logo.svg, claro-logo-red-atlas-2.svg)
- Supabase → desinstalado
- `text-[11px]` → `text-xs` (WCAG AA)
- Título QuickTouchScreen → rojo → `text-gray-900`
- HelpModal ítem 4 → "Responder con texto" (antes decía "Traducir Página web")
- Props muertas limpias: `onHelp`, `onAbout` en WelcomeScreen; estado `avatarOn` en App.tsx

### Sprint 1 — UX crítica ✅
- Pinch-to-zoom deshabilitado → `index.html` viewport `user-scalable=no, maximum-scale=1.0`
- Scroll fix en QuickTouchScreen → patrón `overflow-y-auto` outer + `min-h-full justify-center` inner; eliminado `body.overflow=hidden`
- Doble iframe en IframeModal → ambos montados permanentemente, alternados con CSS display
- Loading state en iframes → spinner + onLoad
- Verificación real de cámara + micrófono en WelcomeScreen → `getUserMedia` al montar (sin popup si ya están dados); 3 estados: verde (granted), amarillo (prompt/disponible), rojo (denied)
- Puntos de estado sincronizados → `syncedPulse()` con animation-delay calculado sobre ciclo global de 2s

### Sprint 2 — Conversación bidireccional ✅
- QuickTouchScreen: banner rojo "Mostrá esta pantalla al asesor" + botón "Asesor: respondé con Dillo →"
- IframeModal: prop `zIndex` configurable (default z-50, z-[70] cuando se abre sobre QTS)
- Tab "Mis manos": botón "Asesor: respondé con Dillo →" que cambia al tab Dillo
- Tab "Dillo": botón "← El cliente responde" que cambia al tab texto
- Tab "Texto" → después de enviar mensaje → QuickTouchScreen (fullScreen=false) con botón "Asesor: respondé con Dillo →"
- Botón "Asesor: respondé con Dillo →" en card de Toques Rápidos (pantalla principal)
- `TextResponseMode`: prop `isActive` → back handler solo cuando tab visible (evita interferencia con back de IframeModal)
- Bug fix: "Volver al inicio" en reply modal (z-70) cierra AMBOS el IframeModal Y el QuickTouchScreen de abajo

---

## Sprint 3 — COMPLETADO ✅ (sesión 2)

| # | Tarea | Estado |
|---|-------|--------|
| 1 | #10 Historial de conversación por sesión | ✅ Hecho |
| 2 | #1 Video de bienvenida — Opción C: HelpModal auto en 1er uso | ✅ Hecho |
| 3 | #7+#8 Mic/audio por default en iframes | ⬜ Bloqueado (pendiente API Dillo) |
| 4 | Historial: capturar texto de iframes Dillo/manos | ⬜ Bloqueado (necesita postMessage de Dillo) |

### Detalles Sprint 3
- **Historial**: estado `ConversationEntry[]` en ServiceSelectionScreen. Captura: QuickTouch (por title/parentTitle), texto libre (via `onMessage` → `onClientMessage`), turno Dillo del asesor. Botón en header con badge contador, overlay chat-style (cliente derecha/rojo, asesor izquierda/gris), botón "Nueva atención" que limpia.
- **HelpModal 1er uso**: `localStorage` flag `claro-lsa-help-shown`. Se setea al montar ServiceSelectionScreen; si no está, abre HelpModal automáticamente.
- **Archivos tocados**: `TextResponseMode.tsx` (prop `onMessage`), `IframeModal.tsx` (prop `onClientMessage`), `ServiceSelectionScreen.tsx` (historial + auto-help).

---

## Sesión 3 — 2026-08-26 ✅

### Fixes al historial de conversación (v1 y v2)

**Problema:** el historial solo trackeaba el turno Dillo cuando el IframeModal abría directamente en modo 'dillo'. Si el asesor empezaba en otro tab y cambiaba a Dillo dentro del modal, no quedaba registrado. Además, los postMessages de los iframes se enrutaban todos a `onClientMessage` (rol 'client'), sin distinguir si el mensaje venía del avatar del asesor o del traductor de señas del cliente.

**Cambios en `IframeModal.tsx` (v1 y v2):**
- Nuevos props: `onAgentMessage?: (msg: string) => void` y `onAgentTurn?: () => void`
- `useEffect` con `prevModeRef` que llama `onAgentTurn` cuando el modo CAMBIA A 'dillo' (sin disparar en el render inicial, para no duplicar con el `addEntry` que ya hace `openIframe`)
- Routing correcto de postMessages por origin:
  - `avatar.dillo.ai` → `onAgentMessage` (rol asesor)
  - `entrenar.dillo.ar` → `onClientMessage` (rol cliente / transcripción de señas)
- Variante adicional `e.data?.content` en el parser de texto

**Cambios en `ServiceSelectionScreen.tsx` (v1 y v2):**
- Ambos `<IframeModal>` (el de `iframeModal` y el de `replyModal`) reciben los nuevos props:
  ```
  onAgentMessage={(msg) => addEntry('agent', msg)}
  onAgentTurn={() => addEntry('agent', 'Respondió con Dillo')}
  ```

**Fix en `TextResponseMode.tsx` (v1 y v2):**
- Al cambiar de tab (`isActive` pasa a `false`), se limpian `message` y `text` con un `useEffect`. Así, al volver al tab Texto después de que el asesor usó Dillo, el cliente ve el textarea vacío listo para un mensaje nuevo (antes quedaba el mensaje anterior).

### Qué falta del lado de Dillo para completar el historial
Para que los mensajes del asesor (lo que tipea en Dillo) aparezcan en el historial, el **frontend de `avatar.dillo.ai`** necesita agregar en su handler de "enviar":
```javascript
window.parent.postMessage({ text: 'mensaje del asesor' }, '*');
```
Nuestro listener ya está en su lugar y lo ruteará correctamente cuando Dillo lo implemente.

---

## Flujo de conversación implementado

```
[Pantalla principal]
  ├─ Toques Rápidos → QuickTouchScreen (mensaje grande + TTS)
  │    ├─ [Asesor: respondé con Dillo →] → IframeModal Dillo (z-70 sobre QTS)
  │    │    └─ [Volver al inicio] → cierra AMBOS, va al inicio
  │    └─ [Terminar atención] → cierra QTS, va al inicio
  │
  └─ Mis manos / Dillo / Texto → IframeModal (tabs)
       ├─ Tab Mis manos → [Asesor: respondé con Dillo →] → cambia a tab Dillo
       ├─ Tab Dillo → [← El cliente responde] → cambia a tab Texto
       └─ Tab Texto → escribe → mensaje grande → [Asesor: respondé con Dillo →] → tab Dillo

  Botón "Asesor: respondé con Dillo →" también en card Toques Rápidos (pantalla principal)
```

---

## Archivos clave y su estado actual

| Archivo | Qué hace |
|---------|----------|
| `src/App.tsx` | Navegación entre pantallas, DilloBubbleControl. Sin estado de avatar. |
| `src/components/WelcomeScreen.tsx` | Bienvenida + verificación real de cámara y mic (getUserMedia). |
| `src/components/ServiceSelectionScreen.tsx` | Pantalla principal. Tiene estado `replyModal` para IframeModal sobre QTS. |
| `src/components/QuickTouchScreen.tsx` | Mensaje grande + TTS. Props: `showConversation`, `onOpenReplyModal`. |
| `src/components/IframeModal.tsx` | Hub de conversación con 3 tabs. Props: `zIndex`, `onClientMessage`, `onAgentMessage`, `onAgentTurn`. Routing postMessage por origen. |
| `src/components/TextResponseMode.tsx` | Escribir texto → QTS (fullScreen=false). Props: `isActive`, `onSwitchToDillo`, `onMessage`. Limpia state al desactivarse. |
| `src/components/HelpModal.tsx` | Modal de ayuda. Logos locales. Ítem 4 corregido. |
| `src/components/VolumeReminderScreen.tsx` | Sin cambios. |
| `src/data/catalogos.ts` | Catálogos hardcodeados. Sin cambios. |
| `src/hooks/useBackHandler.ts` | Stack LIFO de back handlers. Sin cambios. |
| `src/dilloTranslatorBubble.ts` | CSS inyectado en shadow DOM del plugin. Sin cambios. |
| `public/icons/` | Logos de Claro descargados localmente. |

---

---

## v3 — Sesión 4 (2026-08-26)

### Directorio: `v3/` — evolución desde v2 con sistema de diseño y optimizaciones

**Stack idéntico a v2:** React 18 · TypeScript 5 · Vite 5 · Tailwind CSS 3 · port 5175

### Sistema de diseño v3
- **Font:** Atkinson Hyperlegible (Google Fonts) — diseñada para baja visión y dislexia. Import en `index.css` + preconnect en `index.html`.
- **Tokens de color en `tailwind.config.js`:**
  - `brand` = `#DA291C` (rojo Claro)
  - `brand-dark` = `#A01E13` (estado presionado)
  - `brand-muted` = `#FEF2F2` (tint suave)
  - Sin hex sueltos en ningún componente → todo pasa por `bg-brand`, `text-brand`, etc.
- **`prefers-reduced-motion`:** todas las animaciones CSS desactivadas para usuarios con sensibilidad al movimiento (WCAG 2.3.3).
- **Animación de cambio de turno:** `animate-turn-in` (transform+opacity, 0.28s, spring) en el TurnIndicator. `key={owner}` en React fuerza re-mount → animación se repite en cada cambio de turno.

### UX improvements v3 vs v2
1. **TurnIndicator:** sin emoji (👤 🧑‍💼) → íconos Lucide `User` / `UserCheck`. Mayor altura (py-3 vs py-1.5). Texto más grande (text-sm vs text-xs). Animado en cada cambio de turno.
2. **WelcomeScreen:** nuevo `BlockedPermissionBanner` — si cámara o mic están bloqueados, muestra aviso visual prominente (cliente sordo: todo por pantalla, sin dependencia de audio). Cleanup correcto de streams getUserMedia con flag `cancelled` para evitar setState en componente desmontado.
3. **QuickTouchScreen:** ícono `UserCheck` (sin emoji) en el banner "Para el asesor". Tokens brand.
4. **ServiceSelectionScreen:** `Phone` Lucide (vs emoji 📱) en el input de número de línea. Modo cards con descripciones cortas ("Señas del asesor" vs "El asesor responde en señas") + `line-clamp-2` para prevenir overflow a 360px. Touch targets mín. 80px de alto en mode cards.
5. **HelpModal:** hover states con `[@media(hover:hover)]` para no interferir en touch. Lista de 4 funciones refactorizada como array de objetos (menos repetición).
6. **IframeModal:** tabs ahora usan `flex-1` y `shortLabel` siempre visible (no `sm:hidden/inline`) para distribución uniforme en 360px. Botón de cierre `w-11 h-11` = 44px garantizado.
7. **Focus rings** en todos los elementos interactivos: `focus-visible:ring-2 focus-visible:ring-brand/ring-gray-400 focus-visible:ring-offset-2`.

### Decisiones de cámara / micrófono (gama de entrada)
- **WelcomeScreen:** solo consulta estado de permisos (Permissions API, sin adquisición de stream). Fallback getUserMedia detiene todos los tracks inmediatamente. Cleanup con flag `cancelled`.
- **IframeModal:** iframes son cross-origin → no podemos llamar `track.stop()` desde el padre. Arquitectura heredada de v2: lazy mount en primera visita, permanecer montado para evitar reload (~2s en gama de entrada). Al cerrar IframeModal, los iframes se desmontan del DOM → browser libera cámara/mic automáticamente.
- **Limitación documentada:** entre tabs, el iframe inactivo con `display:none` puede seguir corriendo internamente. Chrome 100+ tiende a pausar multimedia en iframes ocultos, pero no es garantizado.

### Performance (gama de entrada ~3GB RAM)
- Bundle gzipped: ~61KB total (15KB app JS + 45KB React vendor + 5.8KB CSS)
- Todas las animaciones: solo `transform` y `opacity` — 60fps en GPU, sin reflow
- `preconnect` a fonts.googleapis.com en index.html → LCP mejorado
- `will-change` solo en elementos que realmente animan (no en estáticos)
- Iframes: lazy mount (solo carga cuando primera visita al tab)

### Fixes TTS mobile (sesión 4 — probado en dispositivo real)

**Fix 1 — iOS Safari (App.tsx `useSpeechUnlock`):**
iOS requiere `speak()` dentro del contexto sincrónico de un gesto. React's `useEffect` llega un tick tarde. Solución: en el primer `pointerdown` del usuario se dispara una utterance vacía con `volume=0` → desbloquea el engine para toda la sesión.

**Fix 2 — Android Chrome — latencia y reinicio:**
Problema 1: retry de 2.5s tenía la condición invertida (`!speaking && !pending` → retornaba cuando stuck, disparaba cuando estaba hablando). Resultado: audio arrancaba y se reiniciaba solo. Solución: **se eliminó el retry** — era más dañino que útil.
Problema 2: delay de 100ms entre cancel y speak → latencia innecesaria. Solución: `setTimeout(0)` — un solo tick del event loop es suficiente.
Problema 3: `getVoicesAsync()` podía tardar hasta 1500ms esperando `voiceschanged` en primer use. Solución: cache de voces a nivel de módulo (`_voiceCache`) + `preloadVoices()` llamado en App.tsx al montar → cuando el usuario llega a QuickTouchScreen, las voces ya están en caché → `getVoicesAsync()` es instantáneo.

**Fix 3 — Teclado virtual tapa el botón de envío (TextResponseMode):**
Problema: IframeModal usa `fixed inset-0`. Cuando el teclado sube en Android/iOS, el contenedor `fixed` mantiene su altura original → el botón queda tapado.
Solución: hook `useKeyboardPadding()` que escucha `window.visualViewport.resize/scroll` y calcula `keyboardHeight = innerHeight - vv.height - vv.offsetTop`. Ese valor se aplica como `padding-bottom` en el área scrolleable → el botón sube con el teclado. Además `scrollIntoView` automático al botón cuando el teclado abre (80ms delay para que el layout termine).
El textarea y el botón ahora viven juntos en el flujo scrolleable (no sticky al fondo).

### Archivos v3 — estado final sesión 4
| Archivo | Cambios vs v2 |
|---------|--------------|
| `tailwind.config.js` | Tokens brand + fontFamily Atkinson Hyperlegible |
| `src/index.css` | Font import + prefers-reduced-motion + animate-turn-in keyframe |
| `index.html` | preconnect Google Fonts |
| `src/App.tsx` | `useSpeechUnlock()` (iOS fix) + `preloadVoices()` en mount |
| `src/components/IframeModal.tsx` | TurnIndicator sin emoji + animado, tabs flex-1, botón cierre 44px |
| `src/components/WelcomeScreen.tsx` | BlockedPermissionBanner, cleanup getUserMedia correcto |
| `src/components/QuickTouchScreen.tsx` | TTS: cache de voces, setTimeout(0), sin retry, abortRef. Export `preloadVoices` |
| `src/components/ServiceSelectionScreen.tsx` | Tokens, Phone icon, line-clamp-2, descripciones cortas, touch targets |
| `src/components/TextResponseMode.tsx` | Fix teclado virtual: useKeyboardPadding + scrollIntoView |
| `src/components/HelpModal.tsx` | Tokens, hover media query, array-driven items |
| `src/hooks/useBackHandler.ts` | Sin cambios vs v2 |
| `src/data/catalogos.ts` | Sin cambios vs v2 |

---

## Pendiente de probar en dispositivo real (próxima sesión)

### TTS — validar en teléfono
- [ ] **Toques Rápidos**: audio arranca al primer tap sin delay perceptible
- [ ] **Toques Rápidos**: audio NO se reinicia solo a los 2-3 segundos (era el bug del retry invertido)
- [ ] **Volver a reproducir**: funciona en todos los intentos
- [ ] **Responder con texto**: audio arranca al enviar el mensaje
- [ ] Probar en Android (Samsung A16 o similar) y en iOS si hay disponible

### Teclado virtual — validar en teléfono
- [ ] **Responder con texto**: al tocar el textarea, el botón "Mostrar y reproducir" sube con el teclado y queda visible
- [ ] El botón se puede tocar sin necesidad de cerrar el teclado primero
- [ ] Al cerrar el teclado, el layout vuelve a la posición original sin saltos

### Flujo completo de turnos
- [ ] Toques Rápidos → banner rojo "Para el asesor" → asesor toca "Respondé con Dillo" → IframeModal se abre en z-70
- [ ] TurnIndicator anima (slide+fade) al cambiar de tab en IframeModal
- [ ] "Volver al inicio" en IframeModal z-70 cierra AMBOS el modal Y el QuickTouchScreen
- [ ] Botón físico de atrás en IframeModal con replyModal abierto (posible edge case)

### Otros
- [ ] `#7` y `#8` (mic/audio por default en iframes) — requiere confirmación del equipo de Dillo. Sin implementar.
- [ ] Historial: captura de mensajes del iframe Dillo — requiere que Dillo implemente `window.parent.postMessage({ text: '...' }, '*')`

---

## Sesión 5 — 2026-08-26 ✅

### Fixes y features implementados

**Fix TTS doble reproducción (v1, v2, v3):**
- Causa: React StrictMode ejecuta effects dos veces. El `abortRef` se reseteaba antes de que los callbacks del `setTimeout` corrieran → ambas IIFEs hacían `speak()`.
- Solución: `genRef` (generation counter) que incrementa en cada call a `playSpeech()` y en cleanup. Cada IIFE captura su `myGen`; si `genRef.current !== myGen` al retomar ejecución, retorna sin llamar `speak()`.
- Archivo: `QuickTouchScreen.tsx` (v1, v2, v3)

**Botón "Elegir otra opción" en QuickTouchScreen (v1, v2, v3):**
- Prop `onBack?: () => void` agregada a QuickTouchScreen.
- Cuando se provee, aparece un botón "← Elegir otra opción" justo debajo del banner rojo "Para el asesor" (arriba a la izquierda, gris discreto).
- ServiceSelectionScreen lo usa para volver al listado sin terminar la sesión.

**WelcomeScreen compacta (v3):**
- `min-h-[100dvh]` en lugar de `min-h-screen` (100dvh cuenta el chrome del browser).
- Reducidos: `pt-6`, `gap-4 sm:gap-7`, `py-4 sm:py-6`, icono `w-16`, título `text-3xl`, botón `py-4`, `pb-4`.
- BlockedPermissionBanner más compacto.
- Todo entra sin scroll en pantallas con browser chrome visible.

**Ícono LSA (`public/icons/lsa-hand.png`) (v3):**
- Reemplaza el `<Hand>` de Lucide en todos los lugares donde aparecía.
- Imagen: mano blanca sobre negro, fondo transparente (glow style).
- Componente `LSAHandIcon.tsx`: PNG con `mix-blend-screen` (on dark bg) o `invert grayscale opacity-60` (on light bg, controlado por prop `onDark`).
- Transformaciones: `-rotate-[30deg]`, `scale-[1.8]`, `object-contain`.
- IframeModal tabs: `onDark={activeMode === mode}` → gris cuando inactivo, visible cuando activo.
- Gap entre ícono y texto en tabs: `gap-3`.
- Usado en: WelcomeScreen, IframeModal tabs, ServiceSelectionScreen ModeCard + mode selector, HelpModal.

**Base path v3 → `/clarodev3/`:**
- `vite.config.ts`: `base: process.env.BASE_PATH || '/clarodev3/'`
- Deploy target: `dillo.ar/clarodev3/`
- El `v3/dist/` va directo a esa carpeta en el server.

### Archivos modificados en sesión 5
| Archivo | Cambio |
|---------|--------|
| `v3/src/components/QuickTouchScreen.tsx` | genRef fix TTS, prop onBack |
| `v2/src/components/QuickTouchScreen.tsx` | genRef fix TTS, prop onBack |
| `src/components/QuickTouchScreen.tsx` | genRef fix TTS, prop onBack |
| `v3/src/components/WelcomeScreen.tsx` | Layout compacto, 100dvh, LSAHandIcon |
| `v3/src/components/IframeModal.tsx` | LSAHandIcon en tab, onDark, gap-3 |
| `v3/src/components/ServiceSelectionScreen.tsx` | LSAHandIcon en ModeCard y mode selector |
| `v3/src/components/HelpModal.tsx` | LSAHandIcon en ítem 1 |
| `v3/src/components/LSAHandIcon.tsx` | Componente nuevo: PNG con blend/filter/rotate/scale |
| `v3/vite.config.ts` | base → `/clarodev3/` |
| `public/icons/lsa-hand.png` | Imagen LSA (mano blanca sobre negro) |

---

## Sesión 6 — 2026-08-26 ✅

### Fixes implementados (v3)

**Fix historial — eliminación de entradas prematuras del asesor:**
- Problema: `addEntry('agent', 'Respondió con Dillo')` se disparaba inmediatamente al abrir el tab Dillo, sin que el asesor hubiera enviado nada.
- Solución: se eliminaron todos los llamados prematuros (`openIframe`, `onOpenReplyModal`, `onAgentTurn`). Ahora solo `onAgentMessage` registra entradas del asesor, que requiere un postMessage real del iframe.
- `onAgentTurn` prop eliminado de `IframeModal.tsx` y su `useEffect` asociado también.

**Integración postMessage de Dillo confirmada y activa:**
- Dillo implementó `window.parent.postMessage({ text }, 'https://dillo.ar')` en `src/components/Chat/index.tsx`.
- El listener en `IframeModal.tsx` ya soportaba el formato `.text` → funciona sin cambios en nuestro lado.
- `targetOrigin: 'https://dillo.ar'` es correcto para producción (`dillo.ar/clarodev3/`). En dev local (localhost) los mensajes no llegarán — es esperado.

**Fix "Elegir otra opción" volvía al inicio en vez de a las subopciones:**
- Causa: `handleSuboptionTap` limpiaba `activeSuboptions` antes de abrir QuickTouchScreen; al presionar "Elegir otra opción", `setActiveQuickTouch(null)` no tenía subopciones para restaurar.
- Solución: estado `backSuboptions` en ServiceSelectionScreen. `handleSuboptionTap` guarda las subopciones antes de limpiarlas. `onBack` de QuickTouchScreen las restaura vía `setActiveSuboptions(backSuboptions)`.

**Fix selector de modo (bottom sheet) — scroll/URL bar/escape:**
- Problema: scroll de la pantalla de fondo se filtraba al overlay; URL bar dinámica del browser tapaba el sheet; sin forma de cerrar si el X quedaba oculto.
- Fixes:
  - `style={{ height: '100dvh' }}` en el backdrop para compensar la URL bar dinámica.
  - `onClick` en backdrop para cerrar tocando afuera (escape de emergencia).
  - `onClick={(e) => e.stopPropagation()}` en el sheet para no cerrar al tocar las opciones.
  - `overscroll-contain` en el sheet para evitar scroll bleed.
  - `useEffect` que aplica `document.body.style.overflow = 'hidden'` mientras el selector está abierto.
  - `pb-8` extra en el sheet para que las opciones no queden pegadas al borde.

**Fix logos e íconos de la PWA:**
- Problema: favicon hardcodeado a `/claro/icons/...` (v1); no había `<link rel="manifest">`; `start_url` del manifest apuntaba a `/claro/`.
- Fixes en `v3/index.html`:
  - Favicon: `icon-32x32.png` y `icon-16x16.png` con `%BASE_URL%` → Vite los convierte a `/clarodev3/icons/...`
  - Apple touch icon: `icon-180x180.png`
  - `<link rel="manifest" href="%BASE_URL%manifest.json" />` agregado
- Fix en `public/manifest.json` (compartido):
  - `start_url: "."` (relativo al manifest) — funciona para v1 (`/claro/`) y v3 (`/clarodev3/`) sin hardcodear

### Archivos modificados en sesión 6
| Archivo | Cambio |
|---------|--------|
| `v3/src/components/IframeModal.tsx` | Eliminado `onAgentTurn` prop y useEffect. Sin `prevModeRef`. |
| `v3/src/components/ServiceSelectionScreen.tsx` | Eliminadas entradas prematuras del asesor; estado `backSuboptions` para fix del back; fixes del mode selector bottom sheet (100dvh, onClick backdrop, overscroll-contain, body overflow lock, pb-8) |
| `v3/index.html` | Favicon con `%BASE_URL%`, apple-touch-icon, `<link rel="manifest">` |
| `public/manifest.json` | `start_url: "."` en lugar de URL hardcodeada |

---

## Sesión 7 — 2026-08-27 — Auditoría QA y corrección de 22 bugs

Auditoría adversarial completa de v3. 22 bugs encontrados y corregidos en la misma sesión.

### Críticos corregidos (3)

| Bug | Descripción | Fix |
|-----|-------------|-----|
| BUG-01 | `postMessage` validaba origen con `startsWith` → cualquier dominio prefijado podía inyectar mensajes en el historial | `===` exacto en `IframeModal.tsx` |
| BUG-02 | Fallback `getUserMedia` en `WelcomeScreen` disparaba popup de permisos sin gesto del usuario (Samsung Internet, WebViews sin Permissions API) | Eliminado; fallback muestra `'prompt'` directamente |
| BUG-03 | `IframeModal` se quedaba atascado si `transitionend` no disparaba (prefers-reduced-motion, tab en segundo plano) | Fallback `setTimeout(doClose, 250)` + flag `closeFiredRef` anti-doble-cierre |

### Altos corregidos (7)

| Bug | Descripción | Fix |
|-----|-------------|-----|
| BUG-04 | `LSAHandIcon` con `scale-[1.8]` desbordaba contenedores sin `overflow-hidden` → solapamiento visual | `overflow-hidden` en ModeCard, mode selector; wrapper `div` en tabs de IframeModal |
| BUG-05 | `AudioIndicator` mostraba "Mensaje reproducido" antes de que TTS empezara | Estado tri-value `'pending'/'speaking'/'done'`; label inicial "Preparando audio…" |
| BUG-06 | `autoFocus` en textarea de `TextResponseMode` no re-aplicaba al cambiar de tab (solo funciona en mount) | `useEffect` con `isActive` → `textarea.focus()` con delay 50ms |
| BUG-07 | `text-[9px]` (badge historial) y `text-[10px]` (BlockedPermissionBanner) bajo WCAG AA | Badge → `text-[10px]`; Banner body → `text-xs`; chips → `text-[11px]` |
| BUG-08 | "Elegir otra opción" volvía al inicio en el flujo `amountInput` (backSuboptions no se seteaba) | `setBackSuboptions(saved)` agregado en la rama `needsAmountInput` |
| BUG-09 | Validación mínima de teléfono: 8 dígitos (número argentino completo = 10 dígitos) | Umbral cambiado a `>= 10` |
| BUG-10 | ARIA incorrecto en tabs: `aria-pressed` en lugar del patrón Tabs | `role="tablist"`, `role="tab"`, `aria-selected`, `role="tabpanel"`, `id`/`aria-labelledby`/`aria-controls` |

### Medios corregidos (9)

| Bug | Descripción | Fix |
|-----|-------------|-----|
| BUG-11 | HelpModal, subopciones, mode selector, phoneInput, amountInput, historial sin `role="dialog"` | Agregado `role="dialog" aria-modal="true" aria-labelledby` a todos |
| BUG-12 | `localStorage.setItem` sin try/catch → lanza en modo incógnito iOS | Envuelto en try/catch |
| BUG-13 | HelpModal con `max-h-[90vh]` → recortado en mobile con URL bar | Cambiado a `max-h-[90dvh]` |
| BUG-14 | `addEntry` y handlers `onClientMessage`/`onAgentMessage` inline → re-registraban listener en cada render | `addEntry` memoizado con `useCallback([], [])`; `handleClientMessage`/`handleAgentMessage` estables |
| BUG-15 | "Nueva atención — limpiar historial" sin confirmación (acción destructiva irreversible) | Estado `confirmClear`; confirmación inline en 2 pasos (Sí / Cancelar) |
| BUG-16 | `LSAHandIcon` con `alt="LSA"` críptico; en contextos de botón con texto es decorativo | Prop `decorative` (default `true`) → `alt=""`; `alt="Lengua de Señas Argentina"` si `decorative={false}` |
| BUG-17 | `h-screen` + `style={{ height: '100dvh' }}` duplicados en `ServiceSelectionScreen` | Eliminado `h-screen` del className |
| BUG-18 | `type="number"` en amountInput acepta negativos, decimales y notación científica | `type="text" inputMode="numeric"` con filtro `replace(/[^0-9]/g, '')` en onChange |
| BUG-19 | Spinner infinito si iframes de Dillo/entrenar no cargan (onLoad nunca dispara en error) | `onError` en ambos iframes; componente `IframeError` con botón Reintentar; estado `handsError`/`dilloError`; `handsRetryKey`/`dilloRetryKey` para forzar remount |

### Bajos corregidos (3)

| Bug | Descripción | Fix |
|-----|-------------|-----|
| BUG-20 | `onSelectService` prop dead code (siempre `() => {}`, nunca llamado) | Eliminado de `ServiceSelectionScreen` y `App.tsx` |
| BUG-21 | "App lista" pill siempre verde aunque cámara/mic estén bloqueados | `appStatus` derivado de permisos; muestra "Funciones limitadas" (amarillo) si alguno está denegado |
| BUG-22 | `QuickTouchScreen fullScreen=false` sin altura explícita | Verificado: el contenedor `absolute inset-0` de IframeModal lo contiene; no requiere cambio |

### Bug adicional encontrado durante testing con Playwright

| Bug | Descripción | Fix |
|-----|-------------|-----|
| BUG-23 | `onDark` prop se pasaba a íconos Lucide (MessageCircle, Keyboard) en los tabs de IframeModal → React warning "Unknown event handler property" | Render condicional: `onDark` solo se pasa al tab `hands` (que usa `LSAHandIcon`); Lucide tabs sin esa prop |

### Archivos modificados en sesión 7
| Archivo | Bugs corregidos |
|---------|----------------|
| `v3/src/components/LSAHandIcon.tsx` | BUG-16 |
| `v3/src/App.tsx` | BUG-20 |
| `v3/src/components/HelpModal.tsx` | BUG-04 (overflow-hidden), BUG-11, BUG-13 |
| `v3/src/components/TextResponseMode.tsx` | BUG-06 |
| `v3/src/components/QuickTouchScreen.tsx` | BUG-05 |
| `v3/src/components/WelcomeScreen.tsx` | BUG-02, BUG-07, BUG-21 |
| `v3/src/components/IframeModal.tsx` | BUG-01, BUG-03, BUG-04, BUG-10, BUG-19, BUG-23 |
| `v3/src/components/ServiceSelectionScreen.tsx` | BUG-04, BUG-07, BUG-08, BUG-09, BUG-11, BUG-12, BUG-14, BUG-15, BUG-17, BUG-18, BUG-20 |

### Validación Playwright (headless Chromium 390px + 360px)
Todos los checks en verde. Sin errores de consola al finalizar.

---

## Bugs conocidos sin resolver
- El botón físico de atrás cuando se está en IframeModal con reply modal abierto puede tener edge cases — probar en dispositivo real.

## Limitaciones técnicas documentadas
- Activar mic/audio por default en iframes depende de API que Dillo puede o no exponer.
- Autoplay de audio bloqueado por browsers modernos sin interacción previa (especialmente iOS Safari).
- Mensajes del asesor en Dillo ahora se capturan via postMessage. En dev local (localhost) no llegarán por el `targetOrigin: 'https://dillo.ar'` — solo funciona en producción.

## Notas de arquitectura
- Navegación por `useState` en App.tsx (sin router): `welcome` → `services`
- Back button del celular manejado por stack LIFO de handlers (`useBackHandler`)
- Plugin `dillo-interpreter` en shadow DOM; FAB original oculto con CSS, disparado via `.click()` desde `DilloBubbleControl`
- Catálogos hardcodeados en `src/data/catalogos.ts` — editar ahí para cambiar opciones
- IframeModal monta AMBOS iframes al abrir (no los desmonta al cambiar tab) para evitar recargas; iframes liberados al cerrar el modal
- TextResponseMode usa `isActive` prop para no interferir con back handlers cuando su tab está oculto; además re-enfoca el textarea vía `useEffect` al activarse
- Logos e íconos en `public/icons/` (root), disponibles en v3 vía `publicDir: '../public'` en vite.config.ts
- v3 deploy en `dillo.ar/clarodev3/` — base path configurado en `vite.config.ts`
- `LSAHandIcon` usa PNG blanco-sobre-negro con `mix-blend-screen` (fondos oscuros) o `invert grayscale` (fondos claros), controlado por prop `onDark`. Prop `decorative` (default `true`) controla el `alt`: vacío si decorativo, descriptivo si `decorative={false}`
- Historial de asesor: solo se registra cuando `avatar.dillo.ai` envía postMessage con `{ text }` al parent. `onAgentTurn` fue eliminado (causaba entradas falsas).
- `IframeModal`: IframeError con botón Reintentar si `onError` dispara en los iframes; `handsRetryKey`/`dilloRetryKey` fuerzan remount con URL fresca
- Validación de origen en postMessage: `===` exacto (no `startsWith`) para evitar dominios prefijados maliciosos
- `QuickTouchScreen` AudioIndicator: estado `'pending'/'speaking'/'done'` — "Preparando audio…" al montar, "Reproduciendo…" en `onstart`, "Mensaje reproducido" en `onend`
- HelpModal auto-open: flag `claro-lsa-help-shown` en localStorage (con try/catch para modo incógnito)
