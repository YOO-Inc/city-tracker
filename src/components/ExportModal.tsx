import { useState, useEffect } from 'react';
import { t, getExportSuccessMessage } from '@/lib/i18n';
import {
  fetchUniqueDates,
  fetchEntriesForExport,
  generateCSV,
  downloadCSV,
  generateFilename,
  formatDateOption,
  type DateWithCount,
} from '@/lib/csvExport';

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  totalCount: number;
}

export function ExportModal({
  visible,
  onClose,
  showSuccess,
  showError,
  totalCount,
}: ExportModalProps) {
  const [availableDates, setAvailableDates] = useState<DateWithCount[]>([]);
  const [exportMode, setExportMode] = useState<'all' | 'date'>('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [exporting, setExporting] = useState(false);
  const [loadingDates, setLoadingDates] = useState(true);

  useEffect(() => {
    if (visible) {
      setLoadingDates(true);
      setExportMode('all');
      setSelectedDate('');
      fetchUniqueDates().then((dates) => {
        setAvailableDates(dates);
        setLoadingDates(false);
      });
    }
  }, [visible]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const date = exportMode === 'date' ? selectedDate : undefined;
      const entries = await fetchEntriesForExport(date ? { date } : undefined);

      if (entries.length === 0) {
        showError(t('settings.noEntriesExport'));
        return;
      }

      const csv = generateCSV(entries);
      downloadCSV(csv, generateFilename(date));
      showSuccess(getExportSuccessMessage(entries.length));
      onClose();
    } catch (err) {
      console.error('Export failed:', err);
      showError(t('settings.noEntriesExport'));
    } finally {
      setExporting(false);
    }
  };

  const canExport =
    totalCount > 0 &&
    !exporting &&
    !loadingDates &&
    (exportMode === 'all' || (exportMode === 'date' && selectedDate));

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl shadow-xl animate-slide-up transition-all duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-surface-300 rounded-full" />
        </div>

        {/* Content */}
        <div className="px-6 pt-2 safe-bottom">
          {/* Title */}
          <h2 className="text-elderly-xl font-bold text-gray-900 text-center mb-8">
            {t('settings.exportTitle')}
          </h2>

          {/* Options */}
          <div className="space-y-4 mb-6 transition-all duration-300 ease-out">
            {/* All data option */}
            <label className="flex items-center gap-4 cursor-pointer">
              <div
                className={`
                  w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                  ${exportMode === 'all'
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-gray-300 bg-white'
                  }
                `}
              >
                {exportMode === 'all' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                )}
              </div>
              <input
                type="radio"
                name="exportMode"
                checked={exportMode === 'all'}
                onChange={() => setExportMode('all')}
                className="sr-only"
              />
              <span className="text-elderly-lg text-gray-900">
                {t('settings.exportAll')} ({totalCount} {totalCount === 1 ? t('home.location') : t('home.locations')})
              </span>
            </label>

            {/* Specific date option */}
            <label className="flex items-center gap-4 cursor-pointer">
              <div
                className={`
                  w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                  ${exportMode === 'date'
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-gray-300 bg-white'
                  }
                `}
              >
                {exportMode === 'date' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                )}
              </div>
              <input
                type="radio"
                name="exportMode"
                checked={exportMode === 'date'}
                onChange={() => setExportMode('date')}
                className="sr-only"
              />
              <span className="text-elderly-lg text-gray-900">
                {t('settings.exportByDate')}
              </span>
            </label>

            {/* Date dropdown with smooth height transition */}
            <div
              className={`
                overflow-hidden transition-all duration-300 ease-out
                ${exportMode === 'date' ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}
              `}
            >
              <div className="me-11">
                {loadingDates ? (
                  <div className="flex py-3">
                    <div className="w-5 h-5 border-2 border-surface-300 border-t-primary-500 rounded-full animate-spin" />
                  </div>
                ) : availableDates.length === 0 ? (
                  <p className="text-gray-400 py-2">
                    {t('settings.noDatesAvailable')}
                  </p>
                ) : (
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="
                      w-full h-12 px-4
                      bg-white border border-gray-200
                      rounded-xl
                      text-elderly-base text-gray-900
                      focus:outline-none focus:border-primary-400
                      appearance-none
                    "
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1.25rem',
                    }}
                  >
                    <option value="">{t('settings.selectDate')}</option>
                    {availableDates.map(({ date, count }) => (
                      <option key={date} value={date}>
                        {formatDateOption(date, count)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={onClose}
              className="
                flex-1 h-14
                rounded-xl
                bg-surface-100 text-gray-600
                font-semibold text-elderly-base
                active:bg-surface-200
              "
            >
              {t('settings.cancel')}
            </button>
            <button
              onClick={handleExport}
              disabled={!canExport}
              className="
                flex-1 h-14
                rounded-xl
                bg-primary-500 text-white
                font-semibold text-elderly-base
                active:bg-primary-600
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {exporting ? t('settings.exporting') : t('entries.export')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
