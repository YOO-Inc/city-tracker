import { useState, useEffect } from 'react';
import { HomeScreen } from '@/screens/HomeScreen';
import { AddEntryScreen } from '@/screens/AddEntryScreen';
import { EntriesListScreen } from '@/screens/EntriesListScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { Snackbar } from '@/components/Snackbar';
import { useSnackbar } from '@/hooks/useSnackbar';
import { supabase } from '@/lib/supabase';
import { t, initLanguage, subscribeToLanguageChange } from '@/lib/i18n';
import type { Screen } from '@/types';

export interface TypeCount {
  type: string;
  count: number;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [typeCounts, setTypeCounts] = useState<TypeCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setLanguageKey] = useState(0); // Force re-render on language change
  const { snackbar, showSuccess, showError, hide } = useSnackbar();

  // Initialize language on mount
  useEffect(() => {
    initLanguage();

    // Subscribe to language changes to trigger re-render
    const unsubscribe = subscribeToLanguageChange(() => {
      setLanguageKey((k) => k + 1);
    });

    return unsubscribe;
  }, []);

  const fetchTypeCounts = async () => {
    const { data } = await supabase
      .from('entries')
      .select('type');

    if (data) {
      const counts = data.reduce<Record<string, number>>((acc, entry) => {
        acc[entry.type] = (acc[entry.type] || 0) + 1;
        return acc;
      }, {});

      setTypeCounts(
        Object.entries(counts).map(([type, count]) => ({ type, count }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTypeCounts();
  }, []);

  const handleAddEntry = () => {
    setCurrentScreen('add');
  };

  const handleViewEntries = () => {
    setCurrentScreen('entries');
  };

  const handleOpenSettings = () => {
    setCurrentScreen('settings');
  };

  const handleBack = () => {
    setCurrentScreen('home');
  };

  const handleSaved = () => {
    setCurrentScreen('home');
    showSuccess(t('snackbar.saved'));
    fetchTypeCounts();
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
          onOpenSettings={handleOpenSettings}
          typeCounts={typeCounts}
          loading={loading}
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

      {currentScreen === 'settings' && (
        <SettingsScreen onBack={handleBack} />
      )}

      <Snackbar snackbar={snackbar} onClose={hide} />
    </>
  );
}
