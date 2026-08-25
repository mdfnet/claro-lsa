# Contexto de trabajo — Claro LSA

**Última actualización:** 2026-08-25 (sesión 2 completada)

---

## Qué es el proyecto

PWA React/TypeScript para que personas sordas y agentes de Claro Argentina se comuniquen pasándose el teléfono en oficinas presenciales. Tres modos: Mis manos (señas LSA), Responder con Dillo (avatar), Responder con texto.

Stack: React 18 · TypeScript 5 · Vite 5 · Tailwind CSS 3 · PWA  
Deploy: https://dillo.ar/claro/  
Base path: `/claro/` (configurable via `BASE_PATH` env var)

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
| `src/components/IframeModal.tsx` | Hub de conversación con 3 tabs. Props: `zIndex`. Botones de "pasar turno" en cada tab. |
| `src/components/TextResponseMode.tsx` | Escribir texto → QTS (fullScreen=false). Props: `isActive`, `onSwitchToDillo`. |
| `src/components/HelpModal.tsx` | Modal de ayuda. Logos locales. Ítem 4 corregido. |
| `src/components/VolumeReminderScreen.tsx` | Sin cambios. |
| `src/data/catalogos.ts` | Catálogos hardcodeados. Sin cambios. |
| `src/hooks/useBackHandler.ts` | Stack LIFO de back handlers. Sin cambios. |
| `src/dilloTranslatorBubble.ts` | CSS inyectado en shadow DOM del plugin. Sin cambios. |
| `public/icons/` | Logos de Claro descargados localmente. |

---

## Bugs conocidos pendientes de validar
- El botón físico de atrás cuando se está en IframeModal con reply modal abierto puede tener edge cases — probar en dispositivo real.
- `#7` y `#8` (mic/audio por default en iframes) requieren confirmación del equipo de Dillo. Sin implementar.

## Limitaciones técnicas documentadas
- Mensajes del iframe de Dillo (señas traducidas) NO son capturables sin API postMessage de Dillo. El listener ya está en IframeModal.tsx — cuando Dillo implemente `parent.postMessage({ text: "..." }, "*")`, ajustar el selector en el handler y funciona automáticamente.
- Activar mic/audio por default en iframes depende de API que Dillo puede o no exponer
- Autoplay de audio bloqueado por browsers modernos sin interacción previa (especialmente iOS Safari)

## Notas de arquitectura
- Navegación por `useState` en App.tsx (sin router): `welcome` → `volume-reminder` → `services`
- Back button del celular manejado por stack LIFO de handlers (`useBackHandler`)
- Plugin `dillo-interpreter` en shadow DOM; FAB original oculto con CSS, disparado via `.click()` desde `DilloBubbleControl`
- Catálogos hardcodeados en `src/data/catalogos.ts` — editar ahí para cambiar opciones
- IframeModal monta AMBOS iframes al abrir (no los desmonta al cambiar tab) para evitar recargas
- TextResponseMode usa `isActive` prop para no interferir con back handlers cuando su tab está oculto
- Los logos de Claro están en `/claro/icons/` (path incluye base path)
