interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-20 h-20 rounded-full border-4 border-surface-200" />
        {/* Spinning arc */}
        <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-primary-500 animate-spin" />
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-primary-500 animate-pulse-soft" />
        </div>
      </div>
      {message && (
        <p className="mt-8 text-elderly-lg text-gray-600 font-medium animate-pulse-soft">
          {message}
        </p>
      )}
    </div>
  );
}
