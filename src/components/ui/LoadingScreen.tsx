'use client';

import Image from 'next/image';
import logo from '@/assets/logo.png';
import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  /** Contextual message below spinner */
  message?: string;
  /** Show full-screen or inline */
  fullScreen?: boolean;
  /** Show retry button after timeout */
  onRetry?: () => void;
  /** Show error state */
  error?: string | null;
}

export function LoadingScreen({
  message = 'Carregando...',
  fullScreen = true,
  onRetry,
  error,
}: LoadingScreenProps) {
  const [showSlow, setShowSlow] = useState(false);

  useEffect(() => {
    if (error) return; // Don't show slow message if already in error state
    const timer = setTimeout(() => setShowSlow(true), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  const containerClass = fullScreen
    ? 'fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-50'
    : 'flex flex-col items-center justify-center py-20';

  if (error) {
    return (
      <div className={containerClass}>
        <div className="loading-screen-content flex flex-col items-center gap-6 text-center px-6">
          <div className="loading-logo-container">
            <Image
              src={logo}
              alt="Logo fluênciaCAP"
              width={180}
              height={72}
              className="w-auto h-14 object-contain"
              priority
            />
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 max-w-xs">{error}</p>
          </div>

          {onRetry && (
            <button
              onClick={onRetry}
              className="loading-retry-btn mt-2 inline-flex items-center gap-2 rounded-lg bg-primary-800 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-900 hover:shadow-md active:scale-95"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
              </svg>
              Tentar novamente
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className="loading-screen-content flex flex-col items-center gap-6">
        {/* Logo with fade-in animation */}
        <div className="loading-logo-container animate-loading-fade-in">
          <Image
            src={logo}
            alt="Logo fluênciaCAP"
            width={200}
            height={80}
            className="w-auto h-16 object-contain"
            priority
          />
        </div>

        {/* Premium spinner */}
        <div className="loading-spinner-container relative">
          <div className="loading-spinner h-10 w-10 rounded-full border-[3px] border-gray-200" />
          <div className="loading-spinner-gradient h-10 w-10 rounded-full border-[3px] border-transparent absolute inset-0 animate-spin" style={{
            borderTopColor: 'var(--color-primary-700)',
            borderRightColor: 'var(--color-primary-400)',
          }} />
        </div>

        {/* Progress bar */}
        <div className="loading-progress-track w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="loading-progress-bar h-full rounded-full animate-loading-progress" />
        </div>

        {/* Message */}
        <p className="text-sm text-gray-500 font-medium animate-loading-fade-in">{message}</p>

        {/* Slow loading warning */}
        {showSlow && (
          <div className="animate-loading-fade-in flex flex-col items-center gap-3 mt-2">
            <p className="text-xs text-gray-400">
              Está demorando mais que o esperado...
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="loading-retry-btn inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md active:scale-95"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                </svg>
                Recarregar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
