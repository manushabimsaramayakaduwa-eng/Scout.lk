import React, { useState } from 'react';
import { FileText, Send, AlertTriangle, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';
import { MemberReport } from '../types';

interface ReportFormProps {
  onSubmitReport: (type: string, description: string, priority: string) => void;
  myReports: MemberReport[];
}

export default function ReportForm({ onSubmitReport, myReports }: ReportFormProps) {
  const [type, setType] = useState<'Wrong Personal Details' | 'App Bug / Technical Issue' | 'E-Library Feedback' | 'Other Issue'>('Wrong Personal Details');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please provide a description of the issue or incorrect details.');
      return;
    }
    onSubmitReport(type, description, priority);
    setDescription('');
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Interactive Submit Form */}
      <div className="bg-stone-900/40 border border-stone-855 p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-2.5 border-b border-stone-800 pb-3">
          <FileText className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-sm tracking-widest text-stone-100 uppercase">
            Discrepancy Reporting Desk
          </h3>
        </div>

        <p className="text-xs text-stone-400 font-sans leading-relaxed">
          Notice errors in your name, badges, awards, or parental records? Or found an app glitch? Let Leaders Dineth and Manusha know immediately. Submissions initiate instant email & WhatsApp alert dispatches back to the headmaster.
        </p>

        {isSuccess && (
          <div className="bg-emerald-950/30 border border-emerald-600/50 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-400 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Success: Your report has been dispatched to leaders and audit monitors!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nature of Issue */}
            <div className="space-y-1.5">
              <label className="text-xs text-stone-400 font-semibold uppercase font-mono">Nature of Issue</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none focus:border-amber-500/50 transition cursor-pointer"
              >
                <option value="Wrong Personal Details">❌ Incorrect Personal Details</option>
                <option value="Wrong Badge or Award Records">🎖️ Badges/Awards Record Error</option>
                <option value="App Bug / Technical Issue">👾 App Bug & Technical Issues</option>
                <option value="E-Library Feedback">📚 E-Library & Document Errors</option>
                <option value="Other Issue">⚙️ General Discrepancies</option>
              </select>
            </div>

            {/* Severity Level */}
            <div className="space-y-1.5">
              <label className="text-xs text-stone-400 font-semibold uppercase font-mono">Priority Urgency</label>
              <div className="flex gap-2">
                {(['Low', 'Medium', 'High'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setPriority(lvl)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition ${
                      priority === lvl
                        ? lvl === 'High'
                          ? 'bg-red-950/30 border-red-500 text-red-400'
                          : lvl === 'Medium'
                          ? 'bg-amber-950/20 border-amber-500 text-amber-400'
                          : 'bg-stone-900 border-stone-400 text-stone-300'
                        : 'bg-stone-950 border-stone-800 text-stone-500 hover:text-stone-300'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs text-stone-400 font-semibold uppercase font-mono">Discrepancy Details</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Be descriptive. E.g., 'My parent's phone number should be changed to +9477... instead of my WhatsApp' or 'I earned the First Aid badge and it is not appearing.'"
              className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none focus:border-amber-500/50 transition h-24 resize-none placeholder-stone-600"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 text-xs transition cursor-pointer shadow-md"
          >
            <Send className="w-3.5 h-3.5" /> Dispatch Report Dispatcher
          </button>
        </form>
      </div>

      {/* History log block for the user */}
      <div className="bg-stone-900/20 border border-stone-850 p-6 rounded-2xl space-y-4">
        <h4 className="text-xs font-semibold tracking-wider text-stone-300 uppercase flex items-center gap-2 font-mono">
          <Clock className="w-4 h-4 text-stone-500" /> Your Disparity Submissions ({myReports.length})
        </h4>

        {myReports.length === 0 ? (
          <p className="text-[11px] text-stone-500 font-mono italic">
            No submissions recorded from your account. Use the desk above to notify troop leaders.
          </p>
        ) : (
          <div className="space-y-3.5 overflow-y-auto max-h-[300px] pr-1">
            {[...myReports].reverse().map((rep) => (
              <div
                key={rep.id}
                className="bg-stone-950/60 border border-stone-850 rounded-xl p-4.5 space-y-2.5 hover:border-stone-800 transition"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-stone-200">{rep.type}</span>
                    <span className="text-[10px] text-stone-500">
                      {new Date(rep.timestamp).toLocaleDateString()} @ {new Date(rep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] uppercase font-bold font-mono px-1.5 py-0.5 rounded ${
                      rep.priority === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : rep.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-stone-800 text-stone-400'
                    }`}>
                      {rep.priority}
                    </span>
                    <span className={`text-[9px] uppercase font-bold font-mono px-1.5 py-0.5 rounded ${
                      rep.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-stone-900 text-amber-500 border border-amber-500/10 animate-pulse'
                    }`}>
                      {rep.status}
                    </span>
                  </div>
                </div>

                <p className="text-stone-300 text-[11px] leading-relaxed break-words bg-stone-950 p-2.5 rounded border border-stone-900">
                  {rep.description}
                </p>

                {rep.status === 'Resolved' && (
                  <div className="bg-stone-900 border-l-2 border-emerald-500 p-2.5 rounded-r-lg space-y-1 text-[11px]">
                    <div className="flex items-center justify-between text-stone-400">
                      <span className="font-bold text-emerald-400 font-mono text-[9px] uppercase">Resolution Logs</span>
                      <span>By {rep.resolvedBy} @ {rep.resolvedAt ? new Date(rep.resolvedAt).toLocaleDateString() : ''}</span>
                    </div>
                    <p className="text-stone-300 font-sans">{rep.resolutionDetails}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
