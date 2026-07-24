'use client';

import React, { useState } from 'react';
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

export function InteractiveMap({ reports, height = 'h-[480px]' }: InteractiveMapProps) {
  const [selectedReport, setSelectedReport] = useState<MapReportItem | null>(null);

  // Generate deterministic relative map positions from location text or id if lat/long absent
  const getCoordinates = (report: MapReportItem) => {
    if (report.latitude && report.longitude) {
      // Map Dhaka bounding box lat [23.7, 23.9], long [90.3, 90.5] to 5%-95% x,y
      const x = ((report.longitude - 90.3) / 0.2) * 90 + 5;
      const y = (1 - (report.latitude - 23.7) / 0.2) * 90 + 5;
      return {
        x: Math.min(Math.max(x, 8), 92),
        y: Math.min(Math.max(y, 8), 92),
      };
    }
    // Hash string into grid position
    let hash = 0;
    const str = report.id + report.locationText;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const x = Math.abs(hash % 80) + 10;
    const y = Math.abs((hash >> 3) % 80) + 10;
    return { x, y };
  };

  const getMarkerColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical':
        return 'bg-rose-500 text-rose-100 ring-rose-500/50 shadow-rose-500/40';
      case 'high':
        return 'bg-amber-500 text-amber-100 ring-amber-500/50 shadow-amber-500/40';
      case 'medium':
        return 'bg-yellow-500 text-yellow-950 ring-yellow-500/50 shadow-yellow-500/40';
      default:
        return 'bg-blue-500 text-blue-100 ring-blue-500/50 shadow-blue-500/40';
    }
  };

  return (
    <div className={`relative w-full ${height} bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col`}>
      {/* Map Grid Background Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-transparent to-blue-950/20" />

      {/* Map Header Toolbar */}
      <div className="relative z-10 p-4 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-400" />
          <span className="font-bold text-sm text-slate-100">Live issue map</span>
          <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md font-semibold">
            {reports.length} reports
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-semibold">
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Critical
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> High
          </span>
          <span className="flex items-center gap-1 text-yellow-400">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Medium
          </span>
          <span className="flex items-center gap-1 text-blue-400">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Low
          </span>
        </div>
      </div>

      {/* Interactive Map Area */}
      <div className="relative flex-1 w-full h-full overflow-hidden cursor-crosshair">
        {/* District grid overlay lines */}
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 border-slate-900/50 pointer-events-none">
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} className="border border-slate-800/20" />
          ))}
        </div>

        {/* Map Markers */}
        {reports.map((report) => {
          const { x, y } = getCoordinates(report);
          const isSelected = selectedReport?.id === report.id;
          return (
            <button
              key={report.id}
              type="button"
              onClick={() => setSelectedReport(report)}
              style={{ left: `${x}%`, top: `${y}%` }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 z-20 ${
                isSelected ? 'scale-125 z-30' : 'hover:scale-110'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] ring-4 shadow-lg transition ${getMarkerColor(
                  report.severityLevel
                )}`}
              >
                {Math.round(report.severityScore)}
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2.5 py-1 bg-slate-900 border border-slate-700 text-slate-200 text-[10px] rounded-lg whitespace-nowrap shadow-xl pointer-events-none">
                {report.trackingCode}: {report.category.replace('_', ' ')}
              </div>
            </button>
          );
        })}

        {/* Selected Marker Detail Card Popup */}
        {selectedReport && (
          <div className="absolute bottom-4 right-4 z-40 max-w-sm w-full bg-slate-900/95 backdrop-blur border border-slate-700 rounded-xl p-4 shadow-2xl text-xs space-y-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-mono font-bold text-blue-400">{selectedReport.trackingCode}</span>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <h4 className="font-bold text-slate-100 capitalize">{selectedReport.category.replace('_', ' ')}</h4>
              <p className="text-slate-400 text-[11px] line-clamp-2 mt-0.5">{selectedReport.description}</p>
            </div>

            <div className="flex items-center justify-between text-[11px] bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400">Location:</span>
              <span className="font-semibold text-slate-200 truncate max-w-[180px]">{selectedReport.locationText}</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-semibold capitalize">
                Status: {selectedReport.status.replace('_', ' ')}
              </span>
              <Link
                href={`/government/reports/${selectedReport.id}`}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg flex items-center gap-1 text-[11px] transition"
              >
                Inspect <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
