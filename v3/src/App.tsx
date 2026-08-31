import { useEffect, useState } from 'react';
import { useBackButtonNavigation, useBackHandler } from './hooks/useBackHandler';
import WelcomeScreen from './components/WelcomeScreen';
import VideoIntroScreen from './components/VideoIntroScreen';
import ServiceSelectionScreen from './components/ServiceSelectionScreen';
import { preloadVoices } from './components/QuickTouchScreen';

type Screen = 'welcome' | 'video-intro' | 'services';

function useThemeColor(color: string) {
  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
  }, [color]);
}

// iOS Safari requiere que speechSynthesis.speak() ocurra dentro del contexto
// de un gesto de usuario. El problema: cuando llamamos speak() desde useEffect
// en QuickTouchScreen, el contexto ya expiró (React renderiza async).
// Solución: en el PRIMER toque del usuario (antes de cualquier navegación),
// disparamos una utterance vacía con volume=0 que "desbloquea" el engine.
// Después de ese unlock, speak() funciona desde cualquier lugar incluyendo useEffect.
function useSpeechUnlock() {
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const unlock = () => {
      const u = new SpeechSynthesisUtterance('');
      u.volume = 0;
      window.speechSynthesis.speak(u);
      window.speechSynthesis.cancel();
    };

    window.addEventListener('pointerdown', unlock, { once: true, passive: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');

  useThemeColor(currentScreen === 'services' ? '#ffffff' : '#DA291C');
  useBackButtonNavigation();
  useBackHandler(currentScreen === 'video-intro', () => setCurrentScreen('welcome'));
  useBackHandler(currentScreen === 'services', () => setCurrentScreen('welcome'));
  useSpeechUnlock();

  // Precalienta la lista de voces TTS mientras el usuario ve WelcomeScreen,
  // así cuando llega a QuickTouchScreen getVoicesAsync() ya tiene caché → 0ms de espera.
  useEffect(() => { preloadVoices(); }, []);

  return (
    <div className="min-h-screen">
      {currentScreen === 'welcome' && (
        <WelcomeScreen onStart={() => setCurrentScreen('video-intro')} />
      )}
      {currentScreen === 'video-intro' && (
        <VideoIntroScreen
          onFinish={() => setCurrentScreen('services')}
          onSkip={() => setCurrentScreen('services')}
        />
      )}
      {currentScreen === 'services' && (
        <ServiceSelectionScreen />
      )}
    </div>
  );
}

export default App;
