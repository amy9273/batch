'use client';

import React from 'react';
import Link from 'next/link';
import { Download } from 'lucide-react';
import { usePWA } from '@/components/PWAProvider';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
}

export function Header({ title = 'Sole Surgeon' }: HeaderProps) {
  const { isInstallable, installPWA } = usePWA();

  return (
    <header className="sticky top-0 z-30 bg-slate-950 text-white border-b border-slate-800/80 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Workshop Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center font-bold text-white text-sm tracking-wider shadow-inner group-hover:bg-teal-500 transition-colors">
              SS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight text-white">
                  {title}
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-slate-800 text-teal-400 border border-slate-700">
                  PCS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Restoration Workshop</p>
            </div>
          </Link>

          {/* Worker Context & PWA Install */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
              <span className="text-slate-400">Worker:</span>
              <span className="font-semibold text-white">Ana</span>
            </div>

            <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
              <span className="text-slate-400">Schedule:</span>
              <span className="font-semibold text-white">Oct 22, 2026</span>
            </div>

            {isInstallable && (
              <button
                onClick={installPWA}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-teal-600 text-white hover:bg-teal-500 active:bg-teal-700 transition shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Install app</span>
                <span className="sm:hidden">Install</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
