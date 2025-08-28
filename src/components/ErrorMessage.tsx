interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  title?: string;
}

export default function ErrorMessage({ 
  message, 
  onRetry, 
  title = 'エラーが発生しました' 
}: ErrorMessageProps) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0">
          <svg 
            className="h-6 w-6 text-red-600 dark:text-red-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
        </div>
        <h3 className="ml-3 text-lg font-medium text-red-800 dark:text-red-200">
          {title}
        </h3>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-red-700 dark:text-red-300">
          {message}
        </p>
      </div>

      {onRetry && (
        <div className="flex justify-center">
          <button
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            再試行
          </button>
        </div>
      )}
    </div>
  );
}