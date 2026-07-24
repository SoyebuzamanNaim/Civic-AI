'use client';

import { ArrowUpRight, Landmark, MapPin, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '../i18n/i18nContext';

export function PublicNavigation() {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <BrandLogo href="/" />

        {/* Desktop Navigation */}
        <nav className="flex items-center gap-1.5 text-sm font-semibold">
          <LanguageToggle />
          <Link href="/track" className="hidden rounded-xl px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:inline-flex">
            {t('trackReport')}
          </Link>
          <Link href="/government/login" className="hidden items-center gap-1 rounded-xl px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 md:inline-flex">
            <Landmark className="size-4" />
            {t('officialPortal')}
          </Link>
          <Link href="/report/new" className="hidden items-center gap-1.5 rounded-xl bg-teal-700 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm shadow-teal-900/20 transition hover:bg-teal-800 sm:inline-flex sm:text-sm">
            {t('reportAnIssue')} <ArrowUpRight className="size-4" />
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-700 hover:bg-slate-100 sm:hidden"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </nav>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white/95 px-4 pb-5 pt-3 shadow-xl backdrop-blur-xl sm:hidden">
          <div className="flex flex-col gap-2 font-semibold">
            <Link
              href="/report/new"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white shadow-sm"
            >
              <span>{t('reportAnIssue')}</span>
              <ArrowUpRight className="size-4" />
            </Link>
            <Link
              href="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 hover:bg-slate-100"
            >
              <MapPin className="size-4 text-teal-700" />
              <span>{t('trackReport')}</span>
            </Link>
            <Link
              href="/government/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 hover:bg-slate-100"
            >
              <Landmark className="size-4 text-amber-700" />
              <span>{t('officialPortal')}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>Built for quicker action on everyday civic issues.</p>
        <p>Public tracking never shows your contact details.</p>
      </div>
    </footer>
  );
}

