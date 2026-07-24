'use client';

import { assignDepartmentAction } from '@/features/government-management/presentation/managementActions';
import { Building2, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { useState, useTransition } from 'react';

interface Department {
  id: string;
  name: string;
}

interface DepartmentAssignmentCardProps {
  reportId: string;
  currentAssignedDeptName: string | null;
  currentAssignedDeptId: string | null;
  suggestedDeptName: string | null;
  suggestedDeptId: string | null;
  departments: Department[];
}

export function DepartmentAssignmentCard({
  reportId,
  currentAssignedDeptName,
  currentAssignedDeptId,
  suggestedDeptName,
  suggestedDeptId,
  departments,
}: DepartmentAssignmentCardProps) {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>(
    currentAssignedDeptId || suggestedDeptId || (departments[0]?.id ?? '')
  );
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isAiSuggestedAvailable = Boolean(suggestedDeptId && suggestedDeptName);

  const handleSubmit = (deptIdToAssign?: string) => {
    const deptId = deptIdToAssign || selectedDepartmentId;
    if (!deptId) return;

    setFeedback(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append('reportId', reportId);
      formData.append('departmentId', deptId);

      const res = await assignDepartmentAction(formData);

      if (res?.success) {
        setFeedback({
          type: 'success',
          text: res.message || 'Department assignment updated successfully.',
        });
      } else {
        setFeedback({
          type: 'error',
          text: res?.error || 'Failed to assign department. Please try again.',
        });
      }
    });
  };

  return (
    <div className="admin-card rounded-3xl p-6 space-y-5 shadow-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="text-sm font-extrabold text-slate-950 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-purple-700" /> Department Assignment
        </h3>
        {currentAssignedDeptName && (
          <span className="px-2.5 py-0.5 bg-purple-100 text-purple-900 text-[10px] font-extrabold rounded-full border border-purple-300 uppercase">
            Active Assignment
          </span>
        )}
      </div>

      {/* Currently Assigned Banner */}
      {currentAssignedDeptName ? (
        <div className="p-3.5 bg-purple-50/90 border border-purple-200 rounded-2xl space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-purple-950 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-purple-700 shrink-0" /> Currently Assigned
            </span>
            <span className="text-[10px] font-bold text-purple-800 bg-purple-200/60 px-2 py-0.5 rounded-md">
              Primary Jurisdiction
            </span>
          </div>
          <p className="text-sm font-extrabold text-slate-950 pt-0.5">{currentAssignedDeptName}</p>
        </div>
      ) : null}

      {/* AI Recommendation Spotlight Banner */}
      {isAiSuggestedAvailable && (
        <div className="p-4 bg-gradient-to-br from-amber-50 via-white to-amber-50/40 border border-amber-200/90 rounded-2xl space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between gap-1 text-xs">
            <span className="font-extrabold text-amber-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" /> AI Recommended Department
            </span>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-extrabold rounded-full border border-amber-300">
              Taxonomy Match
            </span>
          </div>

          <div>
            <p className="text-sm text-slate-950 font-extrabold">{suggestedDeptName}</p>
            <p className="text-[11px] text-slate-600 leading-tight mt-0.5">
              Suggested based on reported issue category and automated infrastructure taxonomy.
            </p>
          </div>

          {suggestedDeptId !== currentAssignedDeptId && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                setSelectedDepartmentId(suggestedDeptId!);
                handleSubmit(suggestedDeptId!);
              }}
              className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>⚡ Accept AI Recommendation ({suggestedDeptName})</span>
            </button>
          )}
        </div>
      )}

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
              : 'bg-rose-50 text-rose-950 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Department Dropdown & Manual Assignment Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-3"
      >
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            {currentAssignedDeptName ? 'Reassign Responsible Department' : 'Assign Responsible Department'}
          </label>
          <select
            value={selectedDepartmentId}
            onChange={(e) => setSelectedDepartmentId(e.target.value)}
            disabled={isPending}
            className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-600 shadow-sm disabled:opacity-60"
          >
            <option value="" disabled>Select Department</option>
            {departments.map((d) => {
              const isAiSuggested = d.id === suggestedDeptId;
              const isCurrentlyAssigned = d.id === currentAssignedDeptId;
              return (
                <option key={d.id} value={d.id}>
                  {d.name} {isCurrentlyAssigned ? '✓ (Assigned)' : isAiSuggested ? '✨ (AI Suggested)' : ''}
                </option>
              );
            })}
          </select>
        </div>

        <button
          type="submit"
          disabled={isPending || !selectedDepartmentId}
          className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md shadow-purple-900/15 transition flex items-center justify-center gap-1.5"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Building2 className="w-4 h-4" />
          )}
          <span>{currentAssignedDeptName ? 'Reassign Department' : 'Assign Department'}</span>
        </button>
      </form>
    </div>
  );
}
