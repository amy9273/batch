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
    <header className="sticky top-0 z-40 bg-[#042F2E] text-white border-b border-teal-900/60 shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-2.5 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-md bg-teal-600 flex items-center justify-center font-mono font-black text-white text-xs tracking-wider shadow-inner group-hover:bg-teal-500 transition-colors">
              SS
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white block leading-tight">
                {title}
              </span>
              <p className="text-[11px] text-teal-200/80 font-medium">Shoe &amp; Bag Care</p>
            </div>
          </Link>

          {/* Simple Context Badges & PWA Action */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#022120] border border-teal-900/80 text-teal-100">
              <span className="text-[11px] text-teal-300/70">Worker:</span>
              <span className="font-bold text-white">Ana</span>
            </div>

            <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#022120] border border-teal-900/80 text-teal-100">
              <span className="text-[11px] text-teal-300/70">Date:</span>
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
