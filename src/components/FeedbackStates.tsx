import React from 'react';

export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs animate-pulse"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="space-y-2">
              <div className="h-3 w-14 bg-slate-200 rounded"></div>
              <div className="h-5 w-36 bg-slate-200 rounded"></div>
            </div>
            <div className="h-6 w-20 bg-slate-200 rounded"></div>
          </div>
          <div className="h-3 w-28 bg-slate-100 rounded mb-4"></div>
          <div className="h-2.5 w-full bg-slate-200 rounded-full"></div>
        </div>
      ))}
    </div>
  );
}

export function ErrorMessage({
  title = 'Something went wrong',
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md mx-auto my-6">
      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 text-red-600 font-bold text-base">
        !
      </div>
      <h3 className="text-sm font-bold text-red-900 mb-1">{title}</h3>
      <p className="text-xs text-red-700 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition cursor-pointer shadow-2xs"
        >
          Try again
        </button>
      )}
    </div>
  );
}
