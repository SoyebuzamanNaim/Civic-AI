import { Search, ShieldCheck } from 'lucide-react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Track Report Progress | Infrastructure AI Platform',
  description: 'Search for public infrastructure reports using your unique tracking code.',
};

export default function TrackSearchPage() {
  async function searchAction(formData: FormData) {
    'use server';
    const code = formData.get('trackingCode')?.toString().trim();
    if (code) {
      redirect(`/track/${encodeURIComponent(code)}`);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8 text-center">
        <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-2xl flex items-center justify-center mx-auto">
          <Search className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Track Your Report</h1>
          <p className="text-slate-400 text-sm mt-2">
            Enter your high-entropy public tracking code (e.g. TRK-8K9P-2X4M) to view real-time status and resolution updates.
          </p>
        </div>

        <form action={searchAction} className="space-y-4">
          <div>
            <input
              type="text"
              name="trackingCode"
              required
              placeholder="TRK-XXXX-XXXX"
              className="w-full text-center text-xl font-mono tracking-wider py-4 px-4 bg-slate-950 border border-slate-700 rounded-2xl text-slate-100 placeholder-slate-600 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition"
          >
            <Search className="w-4 h-4" />
            <span>Search Report Status</span>
          </button>
        </form>

        <div className="pt-2 text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>No login or personal identification required for public lookup.</span>
        </div>
      </div>
    </div>
  );
}
