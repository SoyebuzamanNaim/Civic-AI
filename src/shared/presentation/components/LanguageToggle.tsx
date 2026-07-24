'use client';

import { Globe } from 'lucide-react';
import { useLanguage } from '../i18n/i18nContext';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  return (
    <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1 text-xs shadow-sm">
      <Globe className="ml-1.5 size-3.5 text-teal-700" />
      <button type="button" onClick={() => setLanguage('en')} className={`rounded-lg px-2.5 py-1 font-bold transition ${language === 'en' ? 'bg-teal-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>EN</button>
      <button type="button" onClick={() => setLanguage('bn')} className={`rounded-lg px-2.5 py-1 font-bold transition ${language === 'bn' ? 'bg-teal-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>BN</button>
    </div>
  );
}
