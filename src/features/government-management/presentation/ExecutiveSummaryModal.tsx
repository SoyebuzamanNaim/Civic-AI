'use client';

import React, { useState, useTransition } from 'react';
import { Download, FileText, Sparkles, X } from 'lucide-react';
import { exportReportsCsvAction, generateExecutiveSummaryAction } from './exportActions';

export function ExecutiveSummaryModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleGenerateSummary = () => {
    setIsOpen(true);
    startTransition(async () => {
      const text = await generateExecutiveSummaryAction();
      setSummaryText(text);
    });
  };

  const handleDownloadCsv = async () => {
    const csvContent = await exportReportsCsvAction();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `civicpulse_incidents_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDownloadCsv}
          className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-teal-700" /> Export CSV
        </button>
        <button
          type="button"
          onClick={handleGenerateSummary}
          className="px-3.5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-teal-900/15 transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-200" /> Executive Brief
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-teal-900 font-extrabold text-sm">
                <FileText className="w-5 h-5 text-teal-700" /> AI Municipal Executive Brief
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isPending ? (
              <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                <Sparkles className="w-8 h-8 mx-auto text-teal-700 animate-spin" />
                <p className="font-semibold text-slate-700">Synthesizing active incident data & AI severity trends...</p>
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-800 shadow-inner">
                {summaryText}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-sm transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
