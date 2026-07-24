'use client';

import { submitReportAction } from '@/features/reporting/presentation/actions';
import { AlertTriangle, MapPin, Send, ShieldCheck, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

const CATEGORIES = [
  { id: 'pothole', label: 'Pothole & Road Hazard', icon: '🛣️' },
  { id: 'broken_streetlight', label: 'Broken Streetlight', icon: '💡' },
  { id: 'water_leak', label: 'Water Leak & Drainage', icon: '💧' },
  { id: 'illegal_dumping', label: 'Illegal Waste Dumping', icon: '🗑️' },
  { id: 'other', label: 'Other Civic Issue', icon: '🔧' },
];

export function SubmissionForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('pothole');
  const [locationText, setLocationText] = useState('');
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({});
  const [geoStatus, setGeoStatus] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setGeoStatus('Geolocation is not supported by your browser.');
      return;
    }
    setGeoStatus('Acquiring precise location...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus(`Location acquired (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        if (!locationText) {
          setLocationText(`GPS Coordinates: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        }
      },
      (err) => {
        setGeoStatus(`Could not acquire location: ${err.message}`);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    formData.set('citizenCategory', selectedCategory);
    if (coords.lat) formData.set('latitude', coords.lat.toString());
    if (coords.lng) formData.set('longitude', coords.lng.toString());

    startTransition(async () => {
      const res = await submitReportAction(null, formData);
      if (!res.success) {
        setErrorMsg(res.error);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
      } else {
        router.push(`/report/success/${res.data.trackingCode}`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100">
      {/* Header Banner */}
      <div className="border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full mb-3 border border-emerald-500/20">
          <Sparkles className="w-3.5 h-3.5" /> AI-Powered Civic Reporting
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Report a Civic Infrastructure Issue</h1>
        <p className="text-slate-400 text-sm mt-1">
          Submit details below to generate an instant tracking code and trigger AI automated category & severity assessment.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 flex items-start gap-3 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Category Selector */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-200">Select Issue Category</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-3 p-3.5 rounded-xl border text-left text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-2 ring-blue-500/30'
                  : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
              }`}
            >
              <span className="text-xl">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Description Input */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="description" className="block text-sm font-medium text-slate-200">
            Problem Description <span className="text-rose-400">*</span>
          </label>
          <span className={`text-xs ${description.length < 10 ? 'text-amber-400' : 'text-slate-400'}`}>
            {description.length} / 2000 chars (min 10)
          </span>
        </div>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue in detail (e.g. Deep pothole causing heavy traffic slowdown near the hospital gate)..."
          className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
        {fieldErrors.description && (
          <p className="text-rose-400 text-xs mt-1">{fieldErrors.description}</p>
        )}
      </div>

      {/* Location Input */}
      <div className="space-y-3">
        <label htmlFor="locationText" className="block text-sm font-medium text-slate-200">
          Location & Address <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            id="locationText"
            name="locationText"
            value={locationText}
            onChange={(e) => setLocationText(e.target.value)}
            placeholder="Street address, landmark, or intersection..."
            className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3.5 pr-28 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <button
            type="button"
            onClick={handleGeolocate}
            className="absolute right-2 top-2 bottom-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-400" /> Auto-GPS
          </button>
        </div>
        {geoStatus && <p className="text-xs text-blue-400">{geoStatus}</p>}
        {fieldErrors.locationText && (
          <p className="text-rose-400 text-xs mt-1">{fieldErrors.locationText}</p>
        )}
      </div>

      {/* Optional Contact Section */}
      <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Citizen Contact Details (Optional)
        </div>
        <p className="text-xs text-slate-400">
          Your contact information is strictly private. It is never displayed publicly and is accessible only to official dispatchers for clarification.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
            <input
              type="text"
              name="contactName"
              placeholder="Jane Doe"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 p-2.5 text-xs text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
            <input
              type="email"
              name="contactEmail"
              placeholder="jane@example.com"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 p-2.5 text-xs text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="consentToContact"
            name="consentToContact"
            defaultChecked
            className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="consentToContact" className="text-xs text-slate-300">
            Allow officials to contact me with resolution updates regarding this issue.
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-base rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition"
        >
          {isPending ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing & Persisting Report...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Submit Report & Generate Tracking Code</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
