'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export interface MapReportItem {
  id: string;
  trackingCode: string;
  description: string;
  category: string;
  severityLevel: string;
  severityScore: number;
  locationText: string;
  status: string;
  departmentName?: string;
  latitude?: number;
  longitude?: number;
}

interface InteractiveMapProps {
  reports: MapReportItem[];
  height?: string;
}

export function InteractiveMap({ reports, height = 'h-[500px]' }: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  const [selectedReport, setSelectedReport] = useState<MapReportItem | null>(null);

  // Helper to derive lat/lng for reports missing coordinates
  const getCoordinates = (report: MapReportItem): [number, number] => {
    if (report.latitude && report.longitude) {
      return [report.latitude, report.longitude];
    }
    // Deterministic hash based around Dhaka default center [23.8103, 90.4125]
    let hash = 0;
    const str = report.id + report.locationText;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const latOffset = ((Math.abs(hash) % 100) - 50) / 2500;
    const lngOffset = ((Math.abs(hash >> 3) % 100) - 50) / 2500;
    return [23.8103 + latOffset, 90.4125 + lngOffset];
  };

  useEffect(() => {
    // Inject Leaflet stylesheet dynamically if not present
    if (!document.getElementById('leaflet-stylesheet')) {
      const link = document.createElement('link');
      link.id = 'leaflet-stylesheet';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;
      const L = (await import('leaflet')).default;

      if (!isMounted) return;

      // Calculate initial map center from report coordinates or default to Dhaka center
      let centerLat = 23.8103;
      let centerLng = 90.4125;
      if (reports.length > 0) {
        const coords = reports.map(getCoordinates);
        centerLat = coords.reduce((acc, c) => acc + c[0], 0) / coords.length;
        centerLng = coords.reduce((acc, c) => acc + c[1], 0) / coords.length;
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      mapInstanceRef.current = map;

      // Standard OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Draw Heatmap Density Circles & Dispatch Pin Markers
      reports.forEach((report) => {
        const [lat, lng] = getCoordinates(report);
        const score = Math.round(report.severityScore);

        // Heatmap circle color based on severity
        let heatColor = '#3b82f6';
        let pinBgClass = 'bg-blue-600 border-blue-200 text-white';

        if (report.severityLevel === 'critical') {
          heatColor = '#f43f5e';
          pinBgClass = 'bg-rose-600 border-rose-200 text-white animate-pulse';
        } else if (report.severityLevel === 'high') {
          heatColor = '#f59e0b';
          pinBgClass = 'bg-amber-600 border-amber-200 text-white';
        } else if (report.severityLevel === 'medium') {
          heatColor = '#eab308';
          pinBgClass = 'bg-yellow-500 border-yellow-100 text-slate-950';
        }

        // Render Heatmap overlay circle
        L.circle([lat, lng], {
          color: heatColor,
          fillColor: heatColor,
          fillOpacity: 0.25,
          radius: 120 + score * 3, // Heat intensity radius
          stroke: false,
        }).addTo(map);

        // Create Custom HTML Pin Icon
        const iconHtml = `
          <div class="relative group cursor-pointer">
            <div class="w-8 h-8 rounded-full border-2 shadow-lg flex items-center justify-center font-bold text-xs ${pinBgClass}">
              ${score}
            </div>
            <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block px-2 py-1 bg-slate-900 text-white text-[10px] rounded shadow-md whitespace-nowrap z-50">
              ${report.trackingCode}
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-map-pin',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        marker.on('click', () => {
          setSelectedReport(report);
        });
      });
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [reports]);

  return (
    <div className={`relative w-full ${height} bg-slate-100 border border-slate-200 rounded-2xl overflow-hidden shadow-xl flex flex-col`}>
      {/* Map Header Toolbar */}
      <div className="relative z-10 p-3.5 border-b border-slate-200 bg-white/95 backdrop-blur flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-teal-700" />
          <span className="font-extrabold text-sm text-slate-900">Geographic Incident Heatmap & Live Dispatch</span>
          <span className="text-xs px-2.5 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-md font-bold">
            {reports.length} Pins Rendered
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-bold">
          <span className="flex items-center gap-1 text-rose-700">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> Critical
          </span>
          <span className="flex items-center gap-1 text-amber-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600" /> High
          </span>
          <span className="flex items-center gap-1 text-yellow-700">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Medium
          </span>
          <span className="flex items-center gap-1 text-blue-700">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Low
          </span>
        </div>
      </div>

      {/* Real OpenStreetMap Leaflet Container */}
      <div ref={mapContainerRef} className="relative flex-1 w-full h-full z-0 min-h-[380px]" />

      {/* Selected Marker Detail Overlay Card */}
      {selectedReport && (
        <div className="absolute bottom-4 right-4 z-20 max-w-sm w-full bg-white/95 backdrop-blur border border-slate-200 rounded-2xl p-4 shadow-2xl text-xs space-y-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {selectedReport.trackingCode}
              </span>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 capitalize">
                {selectedReport.severityLevel} ({Math.round(selectedReport.severityScore)}/100)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedReport(null)}
              className="text-slate-400 hover:text-slate-700 font-bold p-1"
            >
              ✕
            </button>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 capitalize text-sm">{selectedReport.category.replace('_', ' ')}</h4>
            <p className="text-slate-600 text-[11px] line-clamp-2 mt-1 leading-relaxed">{selectedReport.description}</p>
          </div>

          <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-medium">Location:</span>
            <span className="font-bold text-slate-800 truncate max-w-[180px]">{selectedReport.locationText}</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold capitalize border border-slate-200">
              Status: {selectedReport.status.replace('_', ' ')}
            </span>
            <Link
              href={`/government/reports/${selectedReport.id}`}
              className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl flex items-center gap-1 text-[11px] transition shadow-md"
            >
              Inspect <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
