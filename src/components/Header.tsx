interface HeaderProps {
  title: string;
  onBack?: () => void;
}

export function Header({ title, onBack }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex items-center h-touch-lg px-4">
        {onBack && (
          <button
            onClick={onBack}
            className="
              -ml-2 mr-2
              w-touch h-touch min-h-touch
              flex items-center justify-center
              rounded-xl
              text-gray-700
              hover:bg-gray-100
              focus:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2
              transition-colors duration-200
            "
            aria-label="Go back"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}
        <h1 className="text-elderly-xl font-bold text-gray-900">{title}</h1>
      </div>
    </header>
  );
}
