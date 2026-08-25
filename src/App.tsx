import { useEffect, useState } from 'react';
import { useBackButtonNavigation, useBackHandler } from './hooks/useBackHandler';
import WelcomeScreen from './components/WelcomeScreen';
import VolumeReminderScreen from './components/VolumeReminderScreen';
import ServiceSelectionScreen from './components/ServiceSelectionScreen';

type Screen = 'welcome' | 'volume-reminder' | 'services';


function useThemeColor(color: string) {
  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
  }, [color]);
}

// ─────────────────────────────────────────────────────────────────────────────

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');

  useThemeColor(currentScreen === 'welcome' ? '#DA291C' : '#ffffff');

  useBackButtonNavigation();

  useBackHandler(currentScreen !== 'welcome', () => {
    setCurrentScreen(currentScreen === 'services' ? 'volume-reminder' : 'welcome');
  });

  return (
    <div className="min-h-screen">
      {currentScreen === 'welcome' && (
        <WelcomeScreen onStart={() => setCurrentScreen('volume-reminder')} />
      )}

      {currentScreen === 'volume-reminder' && (
        <VolumeReminderScreen onContinue={() => setCurrentScreen('services')} />
      )}

      {currentScreen === 'services' && (
        <ServiceSelectionScreen onSelectService={() => {}} />
      )}

    </div>
  );
}

export default App;
