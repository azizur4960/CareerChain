import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ message = 'An error occurred while loading content.', onRetry = null }) => {
  return (
    <div role="alert" className="my-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-800">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-rose-900">We couldn’t complete that</h4>
          <p className="mt-1 text-sm text-rose-800">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-md border border-rose-300 bg-white px-3 text-sm font-semibold text-rose-800 hover:bg-rose-100 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
