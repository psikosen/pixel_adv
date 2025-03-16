import React from 'react';

interface FeedbackProps {
  isLoading: boolean;
  loadingMessage?: string;
  error?: string | null;
  onDismissError?: () => void;
}

const Feedback: React.FC<FeedbackProps> = ({
  isLoading,
  loadingMessage = 'Loading...',
  error = null,
  onDismissError = () => {}
}) => {
  if (!isLoading && !error) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        {isLoading && (
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <div className="text-lg font-medium text-center">{loadingMessage}</div>
            <div className="mt-2 text-sm text-gray-500 text-center">
              This may take a few moments
            </div>
          </div>
        )}
        
        {error && (
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="text-lg font-medium text-center text-red-600">Error</div>
            <div className="mt-2 text-sm text-gray-700 text-center">
              {error}
            </div>
            <button 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              onClick={onDismissError}
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedback;
