import { useEffect, useRef } from 'react';

type BackHandler = () => void;

const handlers: BackHandler[] = [];

function runTopHandler(): boolean {
  const handler = handlers[handlers.length - 1];
  if (!handler) return false;
  handler();
  return true;
}

/**
 * Registra qué hay que cerrar cuando el usuario toca el botón "atrás" del celular,
 * mientras `active` sea true. Atiende siempre el último registrado, es decir la
 * capa que el usuario está viendo arriba de todo (un modal antes que la pantalla).
 */
export function useBackHandler(active: boolean, onBack: BackHandler) {
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  useEffect(() => {
    if (!active) return;

    const handler = () => onBackRef.current();
    handlers.push(handler);

    return () => {
      const index = handlers.lastIndexOf(handler);
      if (index !== -1) handlers.splice(index, 1);
    };
  }, [active]);
}

/**
 * Mantiene una entrada "centinela" en el historial del navegador. Cada vez que el
 * usuario toca atrás consumimos esa entrada, cerramos la capa de arriba y la
 * volvemos a armar. Cuando no queda ninguna capa abierta dejamos pasar el gesto,
 * así desde la pantalla inicial el atrás sigue saliendo de la app como siempre.
 */
export function useBackButtonNavigation() {
  useEffect(() => {
    const armTrap = () => {
      if (!window.history.state?.dilloBackTrap) {
        window.history.pushState({ dilloBackTrap: true }, '');
      }
    };

    armTrap();

    const handlePopState = () => {
      if (runTopHandler()) {
        armTrap();
        return;
      }

      // No queda ninguna capa abierta: dejamos que el gesto siga su curso para
      // que el usuario salga de la app, como espera en la pantalla inicial.
      window.history.back();

      // Si la app se abrió sin página previa (kiosco, pestaña nueva) no hay a
      // dónde volver y seguimos acá: rearmamos el centinela para no dejar el
      // botón atrás muerto de ahí en más.
      window.setTimeout(armTrap, 150);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
}
