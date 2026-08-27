import { useEffect, useRef } from 'react';

type BackHandler = () => void;

const handlers: BackHandler[] = [];

function runTopHandler(): boolean {
  const handler = handlers[handlers.length - 1];
  if (!handler) return false;
  handler();
  return true;
}

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
      window.history.back();
      window.setTimeout(armTrap, 150);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
}
