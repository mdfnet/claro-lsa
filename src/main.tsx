import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { setupTranslatorBubble } from './dilloTranslatorBubble';
import './index.css';

setupTranslatorBubble();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
