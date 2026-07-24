'use client';

import { submitReportAction, uploadReportImageAction } from '@/features/reporting/presentation/actions';
import { AlertTriangle, Camera, CheckCircle2, Construction, Droplets, Lightbulb, Link as LinkIcon, Loader2, LocateFixed, RefreshCw, Send, ShieldCheck, Trash2, Upload, WifiOff, Wrench, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { useLanguage } from '@/shared/presentation/i18n/i18nContext';

const CATEGORIES = [
  { id: 'pothole', label: 'Pothole or road hazard', icon: Construction },
  { id: 'broken_streetlight', label: 'Broken streetlight', icon: Lightbulb },
  { id: 'water_leak', label: 'Water leak or drainage', icon: Droplets },
  { id: 'illegal_dumping', label: 'Illegal waste dumping', icon: Trash2 },
  { id: 'other', label: 'Another civic issue', icon: Wrench },
];

export function SubmissionForm() {
  const router = useRouter();
  const { t } = useLanguage();
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

  // Cloudinary image upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadTab, setUploadTab] = useState<'upload' | 'url'>('upload');

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPEG, PNG, WEBP, GIF).');
      return;
    }
    setUploadError(null);
    setIsUploading(true);

    const localPreview = URL.createObjectURL(file);
    setImagePreview(localPreview);

    if (!navigator.onLine) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setEvidenceUrl(base64);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadReportImageAction(formData);
      if (res.success) {
        setEvidenceUrl(res.url);
        setImagePreview(res.url);
      } else {
        setUploadError(res.error);
        setImagePreview(null);
      }
    } catch {
      setUploadError('Upload failed. Please try again or use a direct image URL.');
      setImagePreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setEvidenceUrl('');
    setImagePreview(null);
    setUploadError(null);
  };

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
    formData.set('evidenceUrl', evidenceUrl);
    if (coords.lat) formData.set('latitude', coords.lat.toString());
    if (coords.lng) formData.set('longitude', coords.lng.toString());

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
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">{t('reportAnIssue')}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">{t('new_report_title')}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">A few clear details help your city understand the issue faster. We&apos;ll create a tracking code when you submit.</p>
      </header>

      {errorMsg && <div role="alert" className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><AlertTriangle className="mt-0.5 size-5 shrink-0" /><p>{errorMsg}</p></div>}

      <fieldset>
        <legend className="text-sm font-bold text-slate-800">{t('category_label')}</legend>
        <p className="mt-1 text-xs text-slate-500">Pick the closest match. Our review will confirm the final category.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = selectedCategory === cat.id;
            const localizedLabel = cat.id === 'pothole' ? t('catPothole') :
                                   cat.id === 'broken_streetlight' ? t('catBrokenStreetlight') :
                                   cat.id === 'water_leak' ? t('catWaterLeak') :
                                   cat.id === 'illegal_dumping' ? t('catIllegalDumping') :
                                   t('catOther');
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left text-sm font-semibold transition ${active ? 'border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-600/15' : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50/50'}`}
              >
                <Icon className="size-4 shrink-0 text-teal-700" />
                {localizedLabel}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <div className="flex items-baseline justify-between gap-4"><label htmlFor="description" className="text-sm font-bold text-slate-800">{t('issueDescription')} <span className="text-rose-600">*</span></label><span className={`text-xs ${description.length < 10 ? 'text-amber-700' : 'text-slate-500'}`}>{description.length} / 2000 · minimum 10</span></div>
        <textarea id="description" name="description" rows={5} value={description} onChange={(event) => setDescription(event.target.value)} aria-invalid={Boolean(fieldErrors.description)} placeholder="For example: A deep pothole outside the hospital gate is causing cars to swerve into traffic." className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10" />
        {fieldErrors.description && <p className="mt-2 text-xs font-medium text-rose-700">{fieldErrors.description}</p>}
      </div>

      <div>
        <label htmlFor="locationText" className="text-sm font-bold text-slate-800">{t('locationDetails')} <span className="text-rose-600">*</span></label>
        <p className="mt-1 text-xs text-slate-500">An address, intersection, or familiar landmark is enough.</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]"><input type="text" id="locationText" name="locationText" value={locationText} onChange={(event) => setLocationText(event.target.value)} aria-invalid={Boolean(fieldErrors.locationText)} placeholder="e.g. North gate of Dhanmondi Lake" className="min-w-0 rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10" /><button type="button" onClick={handleGeolocate} className="inline-flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-xs font-bold text-teal-800 transition hover:bg-teal-100"><LocateFixed className="size-4" /> {t('use_my_location')}</button></div>
        {geoStatus && <p className="mt-2 text-xs font-medium text-teal-800">{geoStatus}</p>}
        {fieldErrors.locationText && <p className="mt-2 text-xs font-medium text-rose-700">{fieldErrors.locationText}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Camera className="size-4 text-teal-700" /> Photo Evidence (Cloudinary Upload)
          </label>
          <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setUploadTab('upload')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition ${
                uploadTab === 'upload' ? 'bg-white text-teal-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="size-3.5" /> Upload File
            </button>
            <button
              type="button"
              onClick={() => setUploadTab('url')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition ${
                uploadTab === 'url' ? 'bg-white text-teal-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LinkIcon className="size-3.5" /> Image URL
            </button>
          </div>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Upload a photo of the damaged area for AI multimodal vision analysis.
        </p>

        {uploadTab === 'upload' ? (
          <div className="mt-3">
            {imagePreview ? (
              <div className="relative flex items-center gap-4 rounded-2xl border border-teal-200 bg-teal-50/50 p-3">
                <img
                  src={imagePreview}
                  alt="Evidence preview"
                  className="size-20 rounded-xl object-cover border border-slate-200 shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
                    {isUploading ? (
                      <>
                        <Loader2 className="size-4 animate-spin text-teal-600" />
                        <span>Uploading to Cloudinary...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-4 text-teal-600" />
                        <span>Photo uploaded to Cloudinary!</span>
                      </>
                    )}
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {evidenceUrl.startsWith('data:') ? 'Stored locally for offline sync' : evidenceUrl || 'Preparing upload...'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="rounded-xl border border-rose-200 bg-white p-2 text-rose-600 hover:bg-rose-50 transition"
                  title="Remove photo"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <label
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition ${
                  isUploading
                    ? 'border-teal-400 bg-teal-50/50'
                    : 'border-slate-300 bg-slate-50/50 hover:border-teal-500 hover:bg-teal-50/30'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) processFile(e.target.files[0]);
                  }}
                  className="hidden"
                  disabled={isUploading}
                />
                <div className="flex size-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                  {isUploading ? <Loader2 className="size-6 animate-spin" /> : <Upload className="size-6" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {isUploading ? 'Uploading photo...' : 'Click to select or drag & drop photo'}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">JPG, PNG, WEBP supported (Up to 10MB)</p>
                </div>
              </label>
            )}
            {uploadError && <p className="mt-2 text-xs font-medium text-rose-700">{uploadError}</p>}
          </div>
        ) : (
          <div className="mt-3">
            <input
              type="url"
              id="evidenceUrl"
              name="evidenceUrl"
              value={evidenceUrl}
              onChange={(e) => {
                setEvidenceUrl(e.target.value);
                setImagePreview(e.target.value || null);
              }}
              placeholder="https://example.com/images/pothole.jpg"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
            />
          </div>
        )}
      </div>

      <section className="rounded-2xl border border-teal-100 bg-teal-50/65 p-4">
        <div className="flex gap-3"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-teal-700" /><div><h2 className="text-sm font-bold text-teal-950">Contact details are optional and private</h2><p className="mt-1 text-xs leading-5 text-teal-900/75">Share them only if you&apos;d like an official to follow up. They never appear on the public tracking page.</p></div></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2"><input type="text" name="contactName" placeholder="Your name (optional)" className="rounded-xl border border-teal-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-600" /><input type="email" name="contactEmail" placeholder="Email address (optional)" className="rounded-xl border border-teal-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-600" /></div>
        <label className="mt-3 flex items-start gap-2 text-xs font-medium text-teal-950"><input type="checkbox" id="consentToContact" name="consentToContact" defaultChecked className="mt-0.5 size-4 rounded border-teal-300 text-teal-700 focus:ring-teal-600" />Officials may contact me about this report.</label>
      </section>

      <button type="submit" disabled={isPending || isUploading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-teal-900/15 transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60">{isPending ? 'Creating your report and checking the details…' : <><Send className="size-4" /> {t('submitBtn')}</>}</button>
    </form>
  );
}

