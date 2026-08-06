# Claro · Estación de Atención Inclusiva

Aplicación web de atención para personas sordas y personas que no pueden hablar,
pensada para usarse en el mostrador de un local de Claro: la persona elige lo que
necesita, la app lo muestra en pantalla grande y lo reproduce en voz para quien
atiende. La traducción a lengua de señas la aporta el plugin de
[Dillo](https://dillo.ai).

## Estado de los pedidos

Numerados igual que la lista que pasó Pedro, para poder cruzarlos.

| # | Pedido | Estado |
| --- | --- | --- |
| 1 | Grabación de audio en el avatar | Pendiente — **no es de este repo** |
| 2 | Toques rápidos antes de los accesos a Dillo | ✅ Hecho |
| 3 | Botón para cambiar entre modos sin volver atrás | Pendiente |
| 4 | Botón "atrás" del celular | ✅ Hecho |
| 5 | Subopciones dentro de los toques rápidos | Pendiente |
| 6 | Analytics | Pendiente — falta definir qué medir |
| 7 | Ícono de la burbuja del plugin | ✅ Hecho |

Aclaraciones sobre los pendientes:

- **(1)** La grabación de audio vive en el avatar y en el panel del plugin, no en
  esta app. Hay que pedirlo del lado de `plugin-handsign` / avatar.
- **(3)** Los dos modos son iframes que abre `IframeModal`. Cambiar entre uno y
  otro es cambiar la URL del iframe, así que se resuelve dentro de ese componente.
- **(5)** El toque rápido **"Ver planes" ya existe** (junto con "Cambiar de
  equipo"). Lo que falta son las subopciones adentro de cada uno, no el acceso.

Además, sin estar en la lista:

- Se arregló que `IframeModal` perdiera la configuración del plugin al cerrarse
  (ver más abajo).
- Se actualizaron dependencias transitivas con `npm audit fix`.

## Cómo correrlo

```bash
npm install
npm run dev
```

La app queda en `http://localhost:5173/claro/` (el `base` es `/claro/`, no la
raíz).

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción en `dist/` |
| `npm run build:dev` | Build para `/claro/dev/` en `dist-dev/` (ver Publicación) |
| `npm run preview` | Sirve el build ya generado |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## Publicación

> El `base` queda **clavado dentro de los assets** al compilar. Si subís un build
> a una carpeta distinta de la que se compiló, el navegador pide los archivos en
> la ruta vieja y la página queda en blanco (o peor: carga los assets de
> producción).

Producción, en `claro/`:

```bash
npm run build          # deja todo en dist/
```

Copia de prueba, en `claro/dev/`, para mostrar cambios sin tocar producción:

```bash
npm run build:dev      # deja todo en dist-dev/
```

En los dos casos se sube **el contenido** de la carpeta, no la carpeta. Para
cualquier otra ruta:

```bash
BASE_PATH=/la/ruta/ npm run build
```

**El sitio tiene que servirse por HTTPS.** El intérprete usa la cámara, y los
navegadores la bloquean si la página que contiene el iframe viaja por HTTP
plano, aunque el iframe venga de un origen seguro.

## Estructura

```
public/dillo-plugin.js          Plugin de Dillo (generado — ver abajo)
src/
  App.tsx                       Pantallas y navegación
  main.tsx                      Punto de entrada
  dilloTranslatorBubble.ts      Ajustes de la burbuja del plugin
  hooks/useBackHandler.ts       Botón "atrás" del celular
  components/
    WelcomeScreen.tsx           Pantalla inicial
    ServiceSelectionScreen.tsx  Toques rápidos + accesos a Dillo
    QuickTouchScreen.tsx        Mensaje a pantalla completa + voz
    IframeModal.tsx             Intérprete y avatar de Dillo embebidos
    HelpModal.tsx               "¿Cómo usar Dillo?"
```

### Navegación

```
Bienvenida ──"Comenzar"──▶ Servicios ──┬──▶ Toque rápido (pantalla completa)
                                       ├──▶ Intérprete / Avatar (iframe)
                                       └──▶ ¿Cómo usar Dillo? (modal)
```

No hay router: `App.tsx` mantiene la pantalla actual en estado y cada pantalla
maneja sus propias capas.

## El plugin de Dillo

> **No edites `public/dillo-plugin.js`.**

Es un bundle minificado que una GitHub Action sincroniza desde el repo
`plugin-handsign` (los commits `chore: update dillo-plugin from plugin-handsign`).
Cualquier cambio hecho a mano ahí se pierde en el próximo sync.

El plugin se monta solo gracias al atributo `data-auto` del `<script>` en
`index.html`, crea un elemento `<dillo-interpreter>` al final del `<body>` y
dibuja todo dentro de un shadow root abierto.

### Cómo configurarlo

Vía atributos del `<script>`, que es la forma soportada:

```html
<script src="/dillo-plugin.js" data-auto data-brand-logo="…"></script>
```

- `data-auto` — monta el plugin automáticamente.
- `data-brand-logo` — imagen de la burbuja. Hoy lleva un ícono de traducción
  embebido como data URI. El plugin la pinta de blanco por CSS, así que el color
  del SVG no importa.

### La burbuja "Traductor"

Claro pidió que la burbuja se entendiera sin conocer la marca Dillo. Quedó como
una píldora celeste con ícono de traducción y la palabra **Traductor**.

El ícono sale de `data-brand-logo`. El texto no: el plugin no expone ninguna
opción para eso, así que `src/dilloTranslatorBubble.ts` inyecta una hoja de
estilos en el shadow root y lo escribe con un `::after`.

Se usa un pseudo-elemento y **no** un nodo del DOM a propósito: React es dueño de
ese árbol y borraría cualquier hijo agregado al re-renderizar; el CSS queda
intacto.

Ese módulo también corrige el `aria-label` del botón, que decía "Intérprete de
señas Dillo" y no incluía la palabra visible. Sin eso, quien navega por voz no
puede pedir el botón por su nombre (WCAG 2.5.3, *Label in Name*).

**Punto frágil:** el CSS depende del nombre de clase interno `.dillo-fab`. Si un
sync futuro lo renombra, la píldora vuelve a ser un círculo y hay que reajustar
el selector. El ícono no se ve afectado, porque usa la vía oficial.

Lo durable sería que el equipo de `plugin-handsign` parametrice el texto del
botón, igual que ya hicieron con `brand-logo`.

### Al recrear el elemento

`IframeModal` quita el `<dillo-interpreter>` mientras el iframe está abierto y lo
vuelve a crear al cerrarlo. Hay que **devolverle sus atributos**: el plugin los
lee una sola vez, en `connectedCallback`, y sin ellos vuelve a los valores por
defecto (se pierde el ícono configurado).

## Botón "atrás" del celular

Los botones táctiles o capacitivos del teléfono sacaban al usuario de la página,
porque la app navega con estado de React y nunca generaba entradas de historial.

`src/hooks/useBackHandler.ts` lo resuelve con dos piezas:

- **`useBackHandler(activo, onBack)`** — cada capa (pantalla o modal) registra qué
  cerrar. Atiende siempre la última registrada, así un modal se cierra antes que
  la pantalla de abajo.
- **`useBackButtonNavigation()`** — mantiene una entrada "centinela" en el
  historial: el atrás la consume, se cierra la capa de arriba y se vuelve a armar.

Comportamiento resultante:

| Dónde está el usuario | El atrás lo lleva a |
| --- | --- |
| Toque rápido abierto | Servicios |
| Modal "¿Cómo usar Dillo?" | Servicios |
| Intérprete / avatar en iframe | Servicios |
| Servicios | Bienvenida |
| Bienvenida | Sale de la app |

Si la app se abre sin página previa (kiosco, pestaña nueva), el atrás no tiene a
dónde ir: en ese caso el centinela se rearma solo, para no dejar el botón muerto.

Para agregar una capa nueva, alcanza con registrarla:

```ts
useBackHandler(modalAbierto, () => setModalAbierto(false));
```

## Cosas a tener en cuenta

- **`npm run lint` y `npm run typecheck` fallan** con errores preexistentes en
  `InterpreterMode.tsx`, `QuickAccessPanel.tsx`, `AboutScreen.tsx` y
  `HelpScreen.tsx` (props inexistentes, variables sin usar, `any`). `npm run
  build` sí pasa, porque Vite no corre el chequeo de tipos.
- **`InterpreterMode.tsx` y `QuickAccessPanel.tsx` son código muerto.**
  `ServiceSelectionScreen` recibe `onSelectService` pero nunca lo llama, así que
  a esa pantalla no se llega. Tiene su propia copia de los accesos a Dillo y de
  los toques rápidos, desincronizada de la que se usa.
