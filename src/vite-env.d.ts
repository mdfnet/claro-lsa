/// <reference types="vite/client" />

interface DilloInterpreterAPI {
  mount: (options?: { brandLogo?: string }) => void;
  unmount: () => void;
  sign: (payload: unknown) => void;
}

interface Window {
  DilloInterpreter?: DilloInterpreterAPI;
}
