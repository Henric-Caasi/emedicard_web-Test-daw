// src/components/ErrorMessage.tsx
'use client';

import React from 'react';

// Define the props the component will accept
interface ErrorMessageProps {
  title: string;
  message: string;
  onCloseAction: () => void; // A function to close the message
  onRetry?: () => void; // An optional function for a retry button
}

export default function ErrorMessage({ title, message, onCloseAction, onRetry }: ErrorMessageProps) {
  return (
    // This is the main card container.
    <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 shadow-md" role="alert">
      <div className="flex">
        {/* The Warning Icon */}
        <div className="py-1">
          <svg className="h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        
        {/* The Title and Message */}
        <div className="flex-grow">
          <h3 className="font-bold text-red-800">{title}</h3>
          <p className="text-sm text-red-700">{message}</p>
          
          {/* Action Buttons */}
          <div className="mt-3 flex gap-4">
            {onRetry && (
              <button
                onClick={onRetry}
                className="bg-red-600 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-red-700"
              >
                Retry
              </button>
            )}
            <button
              onClick={onCloseAction}
              className="bg-transparent text-red-800 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-red-100"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}