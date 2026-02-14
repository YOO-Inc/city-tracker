import { useState, useEffect } from 'react';
import { HomeScreen } from '@/screens/HomeScreen';
import { AddEntryScreen } from '@/screens/AddEntryScreen';
import { EntriesListScreen } from '@/screens/EntriesListScreen';
import { Snackbar } from '@/components/Snackbar';
import { useSnackbar } from '@/hooks/useSnackbar';
import { supabase } from '@/lib/supabase';
import { t } from '@/lib/i18n';
import type { Screen } from '@/types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [entryCount, setEntryCount] = useState(0);
  const { snackbar, showSuccess, showError, hide } = useSnackbar();

  const fetchEntryCount = async () => {
    const { count } = await supabase
      .from('entries')
      .select('*', { count: 'exact', head: true });
    setEntryCount(count || 0);
  };

  useEffect(() => {
    fetchEntryCount();
  }, []);

  const handleAddEntry = () => {
    setCurrentScreen('add');
  };

  const handleViewEntries = () => {
    setCurrentScreen('entries');
  };

  const handleBack = () => {
    setCurrentScreen('home');
  };

  const handleSaved = () => {
    setCurrentScreen('home');
    showSuccess(t('snackbar.saved'));
    fetchEntryCount();
  };

  const handleError = () => {
    showError(t('snackbar.error'));
  };

  return (
    <>
      {currentScreen === 'home' && (
        <HomeScreen
          onAddEntry={handleAddEntry}
          onViewEntries={handleViewEntries}
          entryCount={entryCount}
        />
      )}

      {currentScreen === 'add' && (
        <AddEntryScreen
          onBack={handleBack}
          onSaved={handleSaved}
          onError={handleError}
        />
      )}

      {currentScreen === 'entries' && (
        <EntriesListScreen
          onBack={handleBack}
          onAddEntry={handleAddEntry}
        />
      )}

      <Snackbar snackbar={snackbar} onClose={hide} />
    </>
  );
}
