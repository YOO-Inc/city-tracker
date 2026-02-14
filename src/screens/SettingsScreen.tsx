import { Header } from '@/components/Header';

interface SettingsScreenProps {
  onBack: () => void;
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header title="Settings" onBack={onBack} />
      <main className="flex-1 p-6">
        <p className="text-elderly-base text-gray-600">
          Settings will be available in a future update.
        </p>
      </main>
    </div>
  );
}
