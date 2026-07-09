import { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import ServiceSelectionScreen from './components/ServiceSelectionScreen';
import InterpreterMode from './components/InterpreterMode';
import HelpScreen from './components/HelpScreen';
import AboutScreen from './components/AboutScreen';

type Screen = 'welcome' | 'services' | 'interpreter' | 'help' | 'about';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [selectedService, setSelectedService] = useState<string>('');

  const handleStart = () => {
    setCurrentScreen('services');
  };

  const handleSelectService = (service: string) => {
    setSelectedService(service);
    setCurrentScreen('interpreter');
  };

  const handleHelp = () => {
    setCurrentScreen('help');
  };

  const handleAbout = () => {
    setCurrentScreen('about');
  };

  const handleBack = () => {
    setCurrentScreen('services');
  };

  const handleBackToWelcome = () => {
    setCurrentScreen('welcome');
  };

  return (
    <div className="min-h-screen">
      {currentScreen === 'welcome' && (
        <WelcomeScreen
          onStart={handleStart}
          onHelp={handleHelp}
          onAbout={handleAbout}
        />
      )}

      {currentScreen === 'services' && (
        <ServiceSelectionScreen
          onSelectService={handleSelectService}
        />
      )}

      {currentScreen === 'interpreter' && (
        <InterpreterMode
          service={selectedService}
          onBack={handleBack}
          onHelp={handleHelp}
          onAbout={handleAbout}
        />
      )}

      {currentScreen === 'help' && (
        <HelpScreen onBack={handleBackToWelcome} onAbout={handleAbout} />
      )}

      {currentScreen === 'about' && (
        <AboutScreen onBack={handleBackToWelcome} onHelp={handleHelp} />
      )}
    </div>
  );
}

export default App;
