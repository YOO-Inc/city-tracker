import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Entry } from '@/types';
import { t, translateTypeName, isRTL } from '@/lib/i18n';
import { getTypeColor } from '@/lib/storage';

// Create a colored SVG marker icon
function createColoredIcon(color: string): L.DivIcon {
  const svg = `
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 2.4.7 4.6 1.9 6.5L12.5 41l10.6-22c1.2-1.9 1.9-4.1 1.9-6.5C25 5.6 19.4 0 12.5 0z" fill="${color}" stroke="#fff" stroke-width="1.5"/>
      <circle cx="12.5" cy="12.5" r="5" fill="#fff"/>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: 'custom-marker-icon',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
}

// Cache for created icons by color
const iconCache = new Map<string, L.DivIcon>();

function getIconForColor(color: string): L.DivIcon {
  if (iconCache.has(color)) {
    return iconCache.get(color)!;
  }

  const icon = createColoredIcon(color);
  iconCache.set(color, icon);
  return icon;
}

interface EntriesMapViewProps {
  entries: Entry[];
  formatDate: (dateString: string) => string;
  formatTime: (dateString: string) => string;
  getEntryAddress: (address: string | null, address_he?: string | null) => { street: string | null; cityZip: string | null };
}

function fitMapToEntries(map: L.Map, entries: Entry[]) {
  const validEntries = entries.filter(
    (e) => e.latitude != null && e.longitude != null
  );

  if (validEntries.length === 0) return;

  if (validEntries.length === 1) {
    map.setView([validEntries[0].latitude!, validEntries[0].longitude!], 15);
  } else {
    const bounds = L.latLngBounds(
      validEntries.map((e) => [e.latitude!, e.longitude!])
    );
    map.fitBounds(bounds, { padding: [50, 50] });
  }
}

function FitBounds({ entries }: { entries: Entry[] }) {
  const map = useMap();
  const hasFitted = useRef(false);

  useEffect(() => {
    if (entries.length === 0 || hasFitted.current) return;
    fitMapToEntries(map, entries);
    hasFitted.current = true;
  }, [entries, map]);

  return null;
}

function RecenterButton({ entries }: { entries: Entry[] }) {
  const map = useMap();
  const rtl = isRTL();

  const handleRecenter = () => {
    fitMapToEntries(map, entries);
  };

  return (
    <button
      onClick={handleRecenter}
      className={`
        absolute top-3 z-[1000]
        w-11 h-11 min-h-0
        bg-white rounded-xl
        shadow-md border border-surface-200
        flex items-center justify-center
        hover:bg-surface-50 active:scale-95
        transition-transform
        ${rtl ? 'left-3' : 'right-3'}
      `}
      aria-label="Recenter map"
      title="Recenter map"
    >
      <svg
        className="w-5 h-5 text-gray-700"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
        />
      </svg>
    </button>
  );
}

export function EntriesMapView({
  entries,
  formatDate,
  formatTime,
  getEntryAddress,
}: EntriesMapViewProps) {
  const validEntries = entries.filter(
    (e) => e.latitude != null && e.longitude != null
  );

  if (validEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-surface-100 flex items-center justify-center mb-4">
          <svg
            className="w-10 h-10 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
            />
          </svg>
        </div>
        <p className="text-elderly-lg font-semibold text-gray-700">
          {t('entries.empty')}
        </p>
        <p className="text-gray-500 mt-1">{t('entries.emptyHint')}</p>
      </div>
    );
  }

  const defaultCenter: [number, number] = [
    validEntries[0].latitude!,
    validEntries[0].longitude!,
  ];

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-soft border border-surface-100 h-[calc(100vh-220px)] min-h-[400px]">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        className="w-full h-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds entries={validEntries} />
        <RecenterButton entries={validEntries} />
        {validEntries.map((entry) => {
          const color = getTypeColor(entry.type);
          return (
          <Marker
            key={entry.id}
            position={[entry.latitude!, entry.longitude!]}
            icon={getIconForColor(color)}
          >
            <Popup>
              <div className="min-w-[200px] max-w-[280px]">
                <div className="flex items-start gap-3">
                  {entry.photo_urls && entry.photo_urls.length > 0 && (
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={entry.photo_urls[0]}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span
                      className="inline-block px-2 py-0.5 rounded-md text-xs font-semibold text-white"
                      style={{ backgroundColor: color }}
                    >
                      {translateTypeName(entry.type)}
                    </span>
                    {(() => {
                      const addr = getEntryAddress(entry.address, entry.address_he);
                      return (
                        <div className="mt-1">
                          <p className="text-sm text-gray-700 font-medium truncate">
                            {addr.street}
                          </p>
                          {addr.cityZip && (
                            <p className="text-xs text-gray-400 truncate">
                              {addr.cityZip}
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
                {entry.description && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                    {entry.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <span>{formatDate(entry.created_at)}</span>
                  <span>&bull;</span>
                  <span>{formatTime(entry.created_at)}</span>
                </div>
              </div>
            </Popup>
          </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
