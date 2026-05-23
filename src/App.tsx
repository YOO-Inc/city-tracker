import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router';
import { HomeScreen } from '@/screens/HomeScreen';
import { AddEntryScreen } from '@/screens/AddEntryScreen';
import { EntriesListScreen } from '@/screens/EntriesListScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { ContactsScreen } from '@/screens/ContactsScreen';
import { Snackbar } from '@/components/Snackbar';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useVersionCheck } from '@/hooks/useVersionCheck';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { t, initLanguage, subscribeToLanguageChange } from '@/lib/i18n';
import { seedDefaultContactsIfNeeded } from '@/lib/contacts';

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
  const { updateAvailable, refresh } = useVersionCheck();

  useEffect(() => {
    initLanguage();
    seedDefaultContactsIfNeeded();
    const unsubscribe = subscribeToLanguageChange(() => {
      setLanguageKey((k) => k + 1);
    });
    return unsubscribe;
  }, []);

  const fetchTypeCounts = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'entries'));
      const counts = snapshot.docs.reduce<Record<string, number>>((acc, doc) => {
        const type = doc.data().type as string;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      setTypeCounts(
        Object.entries(counts).map(([type, count]) => ({ type, count }))
      );
    } catch (err) {
      console.error('Error fetching type counts:', err);
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
            <SettingsScreen
              onBack={() => navigate(-1)}
              onOpenContacts={() => navigate('/contacts')}
            />
          }
        />
        <Route
          path="/contacts"
          element={
            <ContactsScreen onBack={() => navigate(-1)} />
          }
        />
      </Routes>
      {updateAvailable && (
        <div className="fixed bottom-20 start-4 end-4 bg-primary text-white p-4 rounded-lg shadow-lg flex items-center justify-between z-50">
          <span className="text-elderly-base">{t('update.available')}</span>
          <button
            onClick={refresh}
            className="bg-white text-primary px-4 py-2 rounded font-bold"
          >
            {t('update.refresh')}
          </button>
        </div>
      )}
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
