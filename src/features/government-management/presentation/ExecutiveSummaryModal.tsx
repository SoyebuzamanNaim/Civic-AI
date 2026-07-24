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
          className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
        >
          <Download className="w-3.5 h-3.5 text-teal-400" /> Export CSV
        </button>
        <button
          type="button"
          onClick={handleGenerateSummary}
          className="px-3 py-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-teal-500/20 transition"
        >
          <Sparkles className="w-3.5 h-3.5" /> Executive Brief
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-teal-400 font-extrabold text-sm">
                <FileText className="w-5 h-5 text-teal-400" /> AI Municipal Executive Brief
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isPending ? (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <Sparkles className="w-8 h-8 mx-auto text-teal-400 animate-spin" />
                <p>Synthesizing active incident data & AI severity trends...</p>
              </div>
            ) : (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-200">
                {summaryText}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl"
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
