interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white/90 flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
      {message && (
        <p className="mt-6 text-elderly-lg text-gray-700 font-medium">
          {message}
        </p>
      )}
    </div>
  );
}
