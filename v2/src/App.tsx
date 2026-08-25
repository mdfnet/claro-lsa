import { useEffect, useState } from 'react';
import { useBackButtonNavigation, useBackHandler } from './hooks/useBackHandler';
import WelcomeScreen from './components/WelcomeScreen';
import ServiceSelectionScreen from './components/ServiceSelectionScreen';

// v2: eliminamos la pantalla de volumen como paso bloqueante.
// El recordatorio de volumen vive inline en WelcomeScreen.
type Screen = 'welcome' | 'services';

function useThemeColor(color: string) {
  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
  }, [color]);
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');

  useThemeColor(currentScreen === 'welcome' ? '#DA291C' : '#ffffff');
  useBackButtonNavigation();
  useBackHandler(currentScreen === 'services', () => setCurrentScreen('welcome'));

  return (
    <div className="min-h-screen">
      {currentScreen === 'welcome' && (
        <WelcomeScreen onStart={() => setCurrentScreen('services')} />
      )}
      {currentScreen === 'services' && (
        <ServiceSelectionScreen onSelectService={() => {}} />
      )}
    </div>
  );
}

export default App;
