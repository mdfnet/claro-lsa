/// <reference types="vite/client" />

interface DilloInterpreterAPI {
  mount: (options?: { brandLogo?: string }) => void;
  unmount: () => void;
  sign: (payload: unknown) => void;
}

interface Window {
  DilloInterpreter?: DilloInterpreterAPI;
}

// Custom element del nuevo plugin de avatar (dillo-avatar-widget)
declare namespace JSX {
  interface IntrinsicElements {
    'dillo-avatar-widget': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & { lang?: string };
  }
}
