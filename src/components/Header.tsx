'use client';

import React from 'react';
import Link from 'next/link';
import { Download } from 'lucide-react';
import { usePWA } from '@/components/PWAProvider';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
}

export function Header({ title = 'SOLE SURGEON' }: HeaderProps) {
  const { isInstallable, installPWA } = usePWA();

  return (
    <header className="sticky top-0 z-40 bg-[#042F2E] text-white border-b border-teal-900/60 shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-2.5 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-md bg-teal-600 flex items-center justify-center font-mono font-black text-white text-xs tracking-wider shadow-inner group-hover:bg-teal-500 transition-colors">
              SS
            </div>
            <div>
              <div className="flex items-center gap-2 leading-tight">
                <span className="text-sm font-black tracking-wider uppercase text-white">
                  {title}
                </span>
                <span className="text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded bg-teal-950/80 text-teal-300 border border-teal-800">
                  PH • LAB
                </span>
              </div>
              <p className="text-[10px] text-teal-200/80 font-medium">Production Control System</p>
            </div>
          </Link>

          {/* Context Badges & PWA Action */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#022120] border border-teal-900/80 text-teal-100">
              <span className="text-[11px] text-teal-300/70">Surgeon:</span>
              <span className="font-bold text-white">Ana</span>
            </div>

            <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#022120] border border-teal-900/80 text-teal-100">
              <span className="text-[11px] text-teal-300/70">Sched:</span>
              <span className="font-bold text-white">Oct 22, 2026</span>
            </div>

            {isInstallable && (
              <button
                onClick={installPWA}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-teal-500 text-slate-950 hover:bg-teal-400 active:bg-teal-600 transition shadow-xs cursor-pointer"
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
