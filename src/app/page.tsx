import { FileText, Search, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              C
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">CivicPulse AI</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/track" className="text-slate-300 hover:text-white transition">
              Track Report
            </Link>
            <Link
              href="/government/login"
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl transition"
            >
              Official Portal
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center space-y-8 flex-1 flex flex-col justify-center items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/20 shadow-inner">
          <Sparkles className="w-4 h-4 text-blue-400" /> Next-Generation AI Civic Infrastructure Platform
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl leading-tight">
          Transforming Citizen Reports into <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">Actionable Solutions</span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
          Report potholes, broken streetlights, water leaks, and illegal waste dumping in seconds. AI categorizes, rates severity, and detects duplicate reports automatically.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full max-w-md">
          <Link
            href="/report/new"
            className="w-full sm:w-1/2 py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition"
          >
            <FileText className="w-5 h-5" />
            <span>Report an Issue</span>
          </Link>

          <Link
            href="/track"
            className="w-full sm:w-1/2 py-4 px-6 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition"
          >
            <Search className="w-5 h-5 text-blue-400" />
            <span>Track Progress</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 max-w-4xl text-left">
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 font-bold">
              ⚡
            </div>
            <h3 className="font-bold text-slate-200 text-sm">Instant AI Categorization</h3>
            <p className="text-xs text-slate-400">
              Structured LLM evaluation computes issue severity, summary, and department routing automatically.
            </p>
          </div>

          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 font-bold">
              🔍
            </div>
            <h3 className="font-bold text-slate-200 text-sm">Multi-Signal Duplicates</h3>
            <p className="text-xs text-slate-400">
              Combines text embeddings, geographic radius, time proximity, and category similarity to link duplicates without dropping submissions.
            </p>
          </div>

          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 font-bold">
              🔒
            </div>
            <h3 className="font-bold text-slate-200 text-sm">Strict Privacy Guard</h3>
            <p className="text-xs text-slate-400">
              Citizen contact details are isolated behind Row Level Security. Public tracking views redact all PII and internal notes.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        Civic Infrastructure AI Platform &copy; 2026. Built with Next.js App Router, Supabase Postgres, and Google Gemini AI.
      </footer>
    </div>
  );
}
