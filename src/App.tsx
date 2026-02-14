import { useState } from 'react';
import { HomeScreen } from '@/screens/HomeScreen';
import { AddEntryScreen } from '@/screens/AddEntryScreen';
import { Snackbar } from '@/components/Snackbar';
import { useSnackbar } from '@/hooks/useSnackbar';
import { t } from '@/lib/i18n';
import type { Screen } from '@/types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const { snackbar, showSuccess, showError, hide } = useSnackbar();

  const handleAddEntry = () => {
    setCurrentScreen('add');
  };

  const handleBack = () => {
    setCurrentScreen('home');
  };

  const handleSaved = () => {
    setCurrentScreen('home');
    showSuccess(t('snackbar.saved'));
  };

  const handleError = () => {
    showError(t('snackbar.error'));
  };

  return (
    <>
      {currentScreen === 'home' && (
        <HomeScreen onAddEntry={handleAddEntry} />
      )}

      {currentScreen === 'add' && (
        <AddEntryScreen
          onBack={handleBack}
          onSaved={handleSaved}
          onError={handleError}
        />
      )}

      <Snackbar snackbar={snackbar} onClose={hide} />
    </>
  );
}
