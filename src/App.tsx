import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router';
import { HomeScreen } from '@/screens/HomeScreen';
import { AddEntryScreen } from '@/screens/AddEntryScreen';
import { EntriesListScreen } from '@/screens/EntriesListScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { Snackbar } from '@/components/Snackbar';
import { useSnackbar } from '@/hooks/useSnackbar';
import { supabase } from '@/lib/supabase';
import { t, initLanguage, subscribeToLanguageChange } from '@/lib/i18n';

export interface TypeCount {
  type: string;
  count: number;
}

function AppRoutes() {
  const navigate = useNavigate();
  const [typeCounts, setTypeCounts] = useState<TypeCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setLanguageKey] = useState(0);
  const { snackbar, showSuccess, showError, hide } = useSnackbar();

  useEffect(() => {
    initLanguage();
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

  const handleSaved = () => {
    navigate('/');
    showSuccess(t('snackbar.saved'));
    fetchTypeCounts();
  };

  const handleError = () => {
    showError(t('snackbar.error'));
  };

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <HomeScreen
              onAddEntry={() => navigate('/add')}
              onViewEntries={() => navigate('/entries')}
              onOpenSettings={() => navigate('/settings')}
              typeCounts={typeCounts}
              loading={loading}
            />
          }
        />
        <Route
          path="/add"
          element={
            <AddEntryScreen
              onBack={() => navigate(-1)}
              onSaved={handleSaved}
              onError={handleError}
            />
          }
        />
        <Route
          path="/entries"
          element={
            <EntriesListScreen
              onBack={() => navigate(-1)}
              onAddEntry={() => navigate('/add')}
              showSuccess={showSuccess}
              showError={showError}
            />
          }
        />
        <Route
          path="/settings"
          element={
            <SettingsScreen onBack={() => navigate(-1)} />
          }
        />
      </Routes>
      <Snackbar snackbar={snackbar} onClose={hide} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
