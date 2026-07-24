'use client';

import { submitReportAction } from '@/features/reporting/presentation/actions';
import { AlertTriangle, Camera, Construction, Droplets, Lightbulb, LocateFixed, RefreshCw, Send, ShieldCheck, Trash2, WifiOff, Wrench } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

const CATEGORIES = [
  { id: 'pothole', label: 'Pothole or road hazard', icon: Construction },
  { id: 'broken_streetlight', label: 'Broken streetlight', icon: Lightbulb },
  { id: 'water_leak', label: 'Water leak or drainage', icon: Droplets },
  { id: 'illegal_dumping', label: 'Illegal waste dumping', icon: Trash2 },
  { id: 'other', label: 'Another civic issue', icon: Wrench },
];

export function SubmissionForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('pothole');
  const [locationText, setLocationText] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({});
  const [geoStatus, setGeoStatus] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isOffline, setIsOffline] = useState(() => (typeof window !== 'undefined' ? !navigator.onLine : false));
  const [offlineStatusMsg, setOfflineStatusMsg] = useState<string | null>(null);

  const syncOfflineQueue = async () => {
    try {
      const saved = localStorage.getItem('civicpulse_offline_reports');
      if (!saved) return;
      const queue: Array<Record<string, string>> = JSON.parse(saved);
      if (!queue.length) return;

      setOfflineStatusMsg(`Syncing ${queue.length} offline report(s) to server…`);

      for (const item of queue) {
        const formData = new FormData();
        Object.entries(item).forEach(([k, v]) => formData.set(k, v));
        const res = await submitReportAction(null, formData);
        if (res.success) {
          console.info('Offline report synced successfully:', res.data.trackingCode);
        }
      }

      localStorage.removeItem('civicpulse_offline_reports');
      setOfflineStatusMsg('Offline reports successfully synced to server!');
      setTimeout(() => setOfflineStatusMsg(null), 5000);
    } catch (e) {
      console.warn('Offline sync error:', e);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      syncOfflineQueue();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check for pending queue on mount
    if (typeof window !== 'undefined' && navigator.onLine) {
      setTimeout(() => {
        syncOfflineQueue();
      }, 0);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleGeolocate = () => {
    if (!navigator.geolocation) { setGeoStatus('Your browser cannot share location. Please enter a landmark or address.'); return; }
    setGeoStatus('Finding your location…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus('Location added. You can still edit the address below.');
        if (!locationText) setLocationText(`GPS coordinates: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
      },
      (err) => setGeoStatus(`We could not get your location: ${err.message}`)
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg(null); setFieldErrors({});
    const formData = new FormData(event.currentTarget);
    formData.set('citizenCategory', selectedCategory);
    if (coords.lat) formData.set('latitude', coords.lat.toString());
    if (coords.lng) formData.set('longitude', coords.lng.toString());

    // Offline handling fallback
    if (!navigator.onLine) {
      const formObject: Record<string, string> = {};
      formData.forEach((val, key) => { formObject[key] = val.toString(); });

      const existing = localStorage.getItem('civicpulse_offline_reports');
      const queue = existing ? JSON.parse(existing) : [];
      queue.push(formObject);
      localStorage.setItem('civicpulse_offline_reports', JSON.stringify(queue));

      setOfflineStatusMsg('Network offline. Report saved locally in PWA queue. It will auto-submit when connection is restored.');
      return;
    }

    startTransition(async () => {
      const res = await submitReportAction(null, formData);
      if (!res.success) { setErrorMsg(res.error); if (res.fieldErrors) setFieldErrors(res.fieldErrors); }
      else router.push(`/report/success/${res.data.trackingCode}`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="public-panel flex max-w-3xl flex-col gap-7 rounded-3xl border border-slate-200 p-5 text-slate-900 sm:p-8">
      {isOffline && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs font-bold text-amber-900 shadow-sm">
          <WifiOff className="size-5 shrink-0 text-amber-700" />
          <span>You are currently offline. Reports will be saved locally and auto-synced when connection returns.</span>
        </div>
      )}

      {offlineStatusMsg && (
        <div className="flex items-center gap-3 rounded-2xl border border-teal-300 bg-teal-50 p-4 text-xs font-bold text-teal-900 shadow-sm">
          <RefreshCw className="size-5 shrink-0 text-teal-700 animate-spin" />
          <span>{offlineStatusMsg}</span>
        </div>
      )}
      <header className="border-b border-slate-200 pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">New civic report</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Tell us what needs attention.</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">A few clear details help your city understand the issue faster. We&apos;ll create a tracking code when you submit.</p>
      </header>

      {errorMsg && <div role="alert" className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><AlertTriangle className="mt-0.5 size-5 shrink-0" /><p>{errorMsg}</p></div>}

      <fieldset>
        <legend className="text-sm font-bold text-slate-800">What kind of issue is it?</legend>
        <p className="mt-1 text-xs text-slate-500">Pick the closest match. Our review will confirm the final category.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {CATEGORIES.map((cat) => { const Icon = cat.icon; const active = selectedCategory === cat.id; return <button key={cat.id} type="button" onClick={() => setSelectedCategory(cat.id)} className={`flex items-center gap-3 rounded-xl border p-3 text-left text-sm font-semibold transition ${active ? 'border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-600/15' : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50/50'}`}><Icon className="size-4 shrink-0 text-teal-700" />{cat.label}</button>; })}
        </div>
      </fieldset>

      <div>
        <div className="flex items-baseline justify-between gap-4"><label htmlFor="description" className="text-sm font-bold text-slate-800">Describe what you&apos;re seeing <span className="text-rose-600">*</span></label><span className={`text-xs ${description.length < 10 ? 'text-amber-700' : 'text-slate-500'}`}>{description.length} / 2000 · minimum 10</span></div>
        <textarea id="description" name="description" rows={5} value={description} onChange={(event) => setDescription(event.target.value)} aria-invalid={Boolean(fieldErrors.description)} placeholder="For example: A deep pothole outside the hospital gate is causing cars to swerve into traffic." className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10" />
        {fieldErrors.description && <p className="mt-2 text-xs font-medium text-rose-700">{fieldErrors.description}</p>}
      </div>

      <div>
        <label htmlFor="locationText" className="text-sm font-bold text-slate-800">Where is it? <span className="text-rose-600">*</span></label>
        <p className="mt-1 text-xs text-slate-500">An address, intersection, or familiar landmark is enough.</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]"><input type="text" id="locationText" name="locationText" value={locationText} onChange={(event) => setLocationText(event.target.value)} aria-invalid={Boolean(fieldErrors.locationText)} placeholder="e.g. North gate of Dhanmondi Lake" className="min-w-0 rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10" /><button type="button" onClick={handleGeolocate} className="inline-flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-xs font-bold text-teal-800 transition hover:bg-teal-100"><LocateFixed className="size-4" /> Use my location</button></div>
        {geoStatus && <p className="mt-2 text-xs font-medium text-teal-800">{geoStatus}</p>}
        {fieldErrors.locationText && <p className="mt-2 text-xs font-medium text-rose-700">{fieldErrors.locationText}</p>}
      </div>

      <div>
        <label htmlFor="evidenceUrl" className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Camera className="size-4 text-teal-700" /> Photo or Image Evidence <span className="text-xs font-normal text-slate-500">(Optional)</span>
        </label>
        <p className="mt-1 text-xs text-slate-500">Provide an image URL showing the damaged area for AI multimodal vision assessment.</p>
        <input
          type="url"
          id="evidenceUrl"
          name="evidenceUrl"
          value={evidenceUrl}
          onChange={(e) => setEvidenceUrl(e.target.value)}
          placeholder="https://example.com/images/pothole.jpg"
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
        />
      </div>

      <section className="rounded-2xl border border-teal-100 bg-teal-50/65 p-4">
        <div className="flex gap-3"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-teal-700" /><div><h2 className="text-sm font-bold text-teal-950">Contact details are optional and private</h2><p className="mt-1 text-xs leading-5 text-teal-900/75">Share them only if you&apos;d like an official to follow up. They never appear on the public tracking page.</p></div></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2"><input type="text" name="contactName" placeholder="Your name (optional)" className="rounded-xl border border-teal-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-600" /><input type="email" name="contactEmail" placeholder="Email address (optional)" className="rounded-xl border border-teal-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-600" /></div>
        <label className="mt-3 flex items-start gap-2 text-xs font-medium text-teal-950"><input type="checkbox" id="consentToContact" name="consentToContact" defaultChecked className="mt-0.5 size-4 rounded border-teal-300 text-teal-700 focus:ring-teal-600" />Officials may contact me about this report.</label>
      </section>

      <button type="submit" disabled={isPending} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-teal-900/15 transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60">{isPending ? 'Creating your report and checking the details…' : <><Send className="size-4" /> Submit report and get a tracking code</>}</button>
    </form>
  );
}
