import React, { useState } from 'react';
import { 
  Users, Award, HardDrive, Bell, CheckSquare, ShieldCheck, HelpCircle, AlertTriangle, AlertCircle, 
  Map, Bird, ChevronRight, Activity, Calendar, ArrowRight, Trash2, ShieldAlert, CheckCircle, Clock, FileText
} from 'lucide-react';
import { ScoutMember, Badge, CalendarEvent, AuditLog, StorageStatus, MemberReport, User as UserType } from '../types';

interface DashboardProps {
  scouts: ScoutMember[];
  badges: Badge[];
  events: CalendarEvent[];
  auditLogs: AuditLog[];
  storage: StorageStatus;
  patrols: string[];
  onAdjustStorage: (bytes: number) => void;
  onClearChats: () => void;
  reports: MemberReport[];
  currentUser: UserType | null;
  onResolveReport: (id: string, text: string) => void;
}

export default function Dashboard({ 
  scouts, badges, events, auditLogs, storage, patrols, onAdjustStorage, onClearChats,
  reports = [], currentUser, onResolveReport
}: DashboardProps) {
  const [capacityInput, setCapacityInput] = useState((storage.usedBytes / 1024 / 1024 / 1024).toFixed(1));
  const [showConfig, setShowConfig] = useState(false);
  const [activeSideTab, setActiveSideTab] = useState<'dispatches' | 'reports'>('dispatches');
  const [resolutionTexts, setResolutionTexts] = useState<Record<string, string>>({});

  const handleResolveClick = (reportId: string) => {
    const text = resolutionTexts[reportId]?.trim() || "Action taken. Corrective update completed successfully.";
    onResolveReport(reportId, text);
    // Clear resolved text
    setResolutionTexts(prev => {
      const next = { ...prev };
      delete next[reportId];
      return next;
    });
  };

  // Math calculated stats
  const totalBadgesEarned = scouts.reduce((acc, s) => acc + (s.badgesEarned?.length || 0), 0);
  const totalAwardsEarned = scouts.reduce((acc, s) => acc + (s.awardsEarned?.length || 0), 0);

  const usedGB = storage.usedBytes / (1024 * 1024 * 1024);
  const totalGB = storage.totalBytes / (1024 * 1024 * 1024);
  const spacePercentage = Math.min(100, Math.round((usedGB / totalGB) * 100));

  const isStorageCritical = spacePercentage >= 90;

  const handleUpdateStorage = () => {
    const gb = parseFloat(capacityInput);
    if (!isNaN(gb) && gb >= 0) {
      onAdjustStorage(Math.round(gb * 1024 * 1024 * 1024));
    }
  };

  // Get count in each patrol
  const getPatrolCount = (pName: string) => {
    return scouts.filter(s => s.patrol === pName).length;
  };

  // Bird icon map for Sri Lankan patrols
  const getPatrolEmoji = (pName: string) => {
    switch(pName.toLowerCase()) {
      case 'salalihini': return '🐦';
      case 'woodpecker': return '🪵';
      case 'pigeon': return '🕊️';
      case 'eagle': return '🦅';
      case 'parrot': return '🦜';
      case 'kingfisher': return '🐟';
      case 'hawk': return '🦅';
      case 'senior': return '⚜️';
      default: return '🐤';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Storage Capacity Banner Alert */}
      {storage.isFull ? (
        <div className="bg-red-950/40 border-2 border-red-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="bg-red-800 text-stone-100 p-2.5 rounded-lg">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-red-400 font-sans tracking-wide">CRITICAL: GOOGLE DRIVE STORAGE EXCEEDED</h3>
              <p className="text-xs text-red-200 mt-1">
                The storage drive <strong className="underline text-stone-100">managementsystermscout@gmail.com</strong> is fully depleted ({usedGB.toFixed(2)} GB / {totalGB} GB). Administrative actions and uploads have been blocked until files are purged!
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onClearChats}
              className="bg-stone-100 text-stone-900 border border-stone-200 hover:bg-stone-200 text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Purge Chatroom Logs
            </button>
          </div>
        </div>
      ) : isStorageCritical ? (
        <div className="bg-amber-950/40 border border-amber-500/50 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-amber-400">Google Drive is almost full!</h4>
            <p className="text-xs text-amber-200">
              Usage sits at <strong className="text-stone-100">{spacePercentage}%</strong> ({usedGB.toFixed(2)} GB of {totalGB} GB). Notify Troop Leader Dineth/Manusha to clean the eLibrary or chatroom immediately.
            </p>
          </div>
        </div>
      ) : null}

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Scouts */}
        <div className="bg-stone-900/40 border border-stone-800/80 rounded-xl p-4 relative overflow-hidden backdrop-blur-xs">
          <div className="absolute right-3 top-3 text-stone-700/50"><Users className="w-12 h-12" /></div>
          <span className="text-xs text-stone-400 font-semibold font-mono tracking-wider uppercase">Active Troops</span>
          <h3 className="text-3xl font-bold mt-2 text-stone-100">{scouts.length} <span className="text-xs text-stone-500 font-mono">SCOUTS</span></h3>
          <p className="text-[11px] text-stone-500 mt-2">Active in Sri Lanka Scout register</p>
        </div>

        {/* Total Earned Badges */}
        <div className="bg-stone-900/40 border border-stone-800/80 rounded-xl p-4 relative overflow-hidden backdrop-blur-xs">
          <div className="absolute right-3 top-3 text-stone-700/50"><Award className="w-12 h-12" /></div>
          <span className="text-xs text-stone-400 font-semibold font-mono tracking-wider uppercase">Badges Awarded</span>
          <h3 className="text-3xl font-bold mt-2 text-amber-400">{totalBadgesEarned} <span className="text-xs text-stone-500 font-mono">BADGES</span></h3>
          <p className="text-[11px] text-stone-500 mt-2">SLSA Proficiency achievements</p>
        </div>

        {/* GDrive Storage Status */}
        <div className="bg-stone-900/40 border border-stone-800/80 rounded-xl p-4 relative overflow-hidden backdrop-blur-xs">
          <div className="absolute right-3 top-3 text-stone-700/50" onClick={() => setShowConfig(!showConfig)}><HardDrive className="w-12 h-12 hover:text-amber-500 cursor-pointer transition" /></div>
          <span className="text-xs text-stone-400 font-semibold font-mono tracking-wider uppercase">GDrive Backup Space</span>
          <h3 className="text-lg font-bold mt-2 text-blue-400">{usedGB.toFixed(2)} GB <span className="text-xs text-stone-500">/ {totalGB} GB</span></h3>
          
          <div className="w-full bg-stone-800 h-2 rounded-full mt-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                spacePercentage >= 95 ? 'bg-red-500' : spacePercentage >= 80 ? 'bg-amber-500' : 'bg-blue-500'
              }`}
              style={{ width: `${spacePercentage}%` }}
            ></div>
          </div>
          
          <p className="text-[10px] text-stone-500 mt-1">{spacePercentage}% used · managementsystermscout@gmail.com</p>
        </div>
      </div>

      {/* Storage Adjust Config Modal inline (hidden by default) */}
      {showConfig && (
        <div className="bg-stone-950/60 border border-stone-800 p-4 rounded-xl max-w-sm ml-auto animate-fadeIn space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-amber-500 uppercase font-mono tracking-wider">Storage Simulation Control</h4>
            <span className="text-[10px] text-stone-500">Scale storage bytes</span>
          </div>
          <div className="flex gap-2">
            <input 
              type="number" 
              step="0.1" 
              className="bg-stone-900 border border-stone-800 rounded px-2.5 py-1 text-xs text-stone-100 max-w-[120px] outline-none"
              value={capacityInput}
              onChange={(e) => setCapacityInput(e.target.value)}
            />
            <span className="text-xs flex items-center text-stone-400 font-mono">GB used</span>
            <button 
              onClick={handleUpdateStorage}
              className="bg-amber-500 text-stone-950 hover:bg-amber-400 text-xs font-bold rounded px-3 py-1 ml-auto"
            >
              Set Space
            </button>
          </div>
          <p className="text-[10px] text-stone-500">
            Set capacity above 15.0 GB to trigger Drive Full email/whatsapp alerts.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Rank Progression & Patrol Overview */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Rank Progression */}
          <div className="bg-stone-900/40 border border-stone-800/80 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm tracking-widest text-stone-100 uppercase flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" /> SLSA Scouting Rank ladder
              </h3>
              <span className="text-xs text-stone-500 font-mono">Troop standard progression</span>
            </div>
            
            <p className="text-xs text-stone-400 mb-4 font-sans leading-relaxed">
              Based on the official rules of the Sri Lanka Scout Association (Kotte division). Scouts advance from Tenderfoot to King Scout upon earning required badge groups.
            </p>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {[
                { name: 'Tenderfoot', desc: 'Membership entry check' },
                { name: 'Scout Rank', desc: 'Camping & patrol skills' },
                { name: '2nd Class', desc: 'Emergency response' },
                { name: '1st Class', desc: 'Navigation mastery' },
                { name: 'Pathfinder', desc: 'Provincial Leadership' },
                { name: 'King Scout', desc: 'Highest National Honour' }
              ].map((rk, idx) => (
                <div key={idx} className="bg-stone-950/50 border border-stone-800/50 p-2.5 rounded-lg text-center hover:border-amber-500/40 transition">
                  <div className="w-6 h-6 rounded-full bg-stone-900 text-amber-400 text-xs font-bold flex items-center justify-center mx-auto mb-1.5">
                    {idx + 1}
                  </div>
                  <div className="text-xs font-bold text-stone-200">{rk.name}</div>
                  <div className="text-[9px] text-stone-500 mt-1 leading-tight">{rk.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Patrol Overview Grid */}
          <div className="bg-stone-900/40 border border-stone-800/80 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm tracking-widest text-stone-100 uppercase flex items-center gap-2">
                <Bird className="w-5 h-5 text-amber-500" /> Troop Patrol Rosters
              </h3>
              <span className="text-xs bg-stone-950/80 px-2.5 py-1 border border-stone-800 text-stone-400 rounded-md">8 Official Patrols</span>
            </div>

            <p className="text-xs text-stone-400 mb-4 font-sans leading-relaxed">
              Active divisions of the 51st Colombo Scout Troop. Leaders can add or remove patrols and manage scout registrations.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {patrols.map((ptl, idx) => {
                const count = getPatrolCount(ptl);
                return (
                  <div key={idx} className="bg-stone-950/60 border border-stone-800/60 p-3 rounded-lg flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{getPatrolEmoji(ptl)}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-800">
                        {count} {count === 1 ? 'scout' : 'scouts'}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-stone-200 mt-1">{ptl} Patrol</div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Side: Alert Dispatches / Real-time Notification Logs */}
        <div className="space-y-6">
          <div className="bg-stone-900/40 border border-stone-800/80 rounded-2xl p-6 flex flex-col h-[525px]">
            {/* Tab Swappers */}
            <div className="flex border-b border-stone-800/85 mb-4">
              <button 
                onClick={() => setActiveSideTab('dispatches')}
                className={`flex-1 pb-2.5 text-xs font-extrabold tracking-widest uppercase transition border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeSideTab === 'dispatches'
                    ? 'border-amber-500 text-stone-100'
                    : 'border-transparent text-stone-500 hover:text-stone-300'
                }`}
              >
                <Bell className="w-3.5 h-3.5" /> Dispatches
              </button>
              <button 
                onClick={() => setActiveSideTab('reports')}
                className={`flex-1 pb-2.5 text-xs font-extrabold tracking-widest uppercase transition border-b-2 flex items-center justify-center gap-1.5 cursor-pointer relative ${
                  activeSideTab === 'reports'
                    ? 'border-amber-500 text-stone-100'
                    : 'border-transparent text-stone-500 hover:text-stone-300'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Reports
                {reports.filter(r => r.status === 'Pending').length > 0 && (
                  <span className="absolute top-0.5 right-6 w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                )}
              </button>
            </div>

            {activeSideTab === 'dispatches' ? (
              <>
                <p className="text-[11px] text-stone-400 mb-4 font-sans">
                  Critical changes made by leaders or member profile revisions immediately trigger automated Gmail and WhatsApp dispatcher notifications to the scout master.
                </p>

                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
                  {auditLogs.length === 0 ? (
                    <div className="text-center text-stone-500 py-12 font-mono text-[11px]">
                      No notifications recorded.
                    </div>
                  ) : (
                    [...auditLogs].reverse().map((log, idx) => (
                      <div key={log.id || idx} className="bg-stone-950/60 border border-stone-800/50 rounded-lg p-3 space-y-2 last:mb-2 hover:border-amber-500/30 transition">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-amber-400 text-xs tracking-tight">{log.action}</span>
                          <span className="text-[9px] text-stone-500 font-mono whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-stone-300 text-[11px] leading-relaxed break-words">{log.details}</p>
                        
                        <div className="flex items-center justify-between border-t border-stone-900/80 pt-2 text-[9px] text-stone-500">
                          <span>By: <strong className="text-stone-400">{log.user}</strong></span>
                          <div className="flex gap-2">
                            <span className={`px-1 rounded ${log.notifiedEmail ? 'bg-blue-500/10 text-blue-400' : 'bg-stone-800'}`}>
                              📧 Gmail Dispatch
                            </span>
                            <span className={`px-1 rounded ${log.notifiedEmail ? 'bg-emerald-500/10 text-emerald-400' : 'bg-stone-800'}`}>
                              📱 WhatsApp
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="text-[11px] text-stone-400 mb-4 font-sans">
                  Scout reports of wrong information, badge record errors, or app bugs. Admins/leaders can resolve reports below to send immediate dispatches.
                </p>

                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
                  {reports.length === 0 ? (
                    <div className="text-center text-stone-500 py-12 font-mono text-[11px]">
                      No reports generated.
                    </div>
                  ) : (
                    [...reports].reverse().map((rep) => (
                      <div key={rep.id} className="bg-stone-950/60 border border-stone-800/50 rounded-lg p-3 space-y-2.5 last:mb-2 hover:border-amber-500/30 transition">
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-stone-200 text-xs tracking-tight">{rep.type}</span>
                            <span className="text-[10px] text-stone-500">
                              By {rep.reporterName} ({rep.reporterRole.toUpperCase()})
                            </span>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className={`text-[8px] uppercase font-bold font-mono px-1 py-0.5 rounded ${
                              rep.priority === 'High' ? 'bg-red-500/20 text-red-400' : rep.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-stone-800 text-stone-400'
                            }`}>
                              {rep.priority}
                            </span>
                            <span className={`text-[8px] uppercase font-bold font-mono px-1 py-0.5 rounded ${
                              rep.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-stone-900 border border-amber-500/20 text-amber-500'
                            }`}>
                              {rep.status}
                            </span>
                          </div>
                        </div>

                        <p className="text-stone-300 text-[11px] leading-relaxed break-words bg-stone-900/40 p-2 rounded-md border border-stone-850/50">
                          {rep.description}
                        </p>

                        {rep.status === 'Pending' ? (
                          currentUser?.role === 'admin' || currentUser?.role === 'leader' ? (
                            <div className="space-y-2 border-t border-stone-800/40 pt-2">
                              <input 
                                type="text"
                                placeholder="Resolution action summary..."
                                value={resolutionTexts[rep.id] || ''}
                                onChange={(e) => setResolutionTexts(prev => ({ ...prev, [rep.id]: e.target.value }))}
                                className="w-full bg-stone-950 border border-stone-850 rounded px-2 py-1 text-[11px] text-stone-200 outline-none focus:border-amber-500/40"
                              />
                              <button
                                onClick={() => handleResolveClick(rep.id)}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1 px-2 rounded text-[10px] flex items-center justify-center gap-1 cursor-pointer transition uppercase tracking-wider font-sans"
                              >
                                <CheckSquare className="w-3 h-3" /> Execute Resolution Dispatch
                              </button>
                            </div>
                          ) : (
                            <div className="text-[10px] text-stone-500 italic text-center">
                              Awaiting leadership response.
                            </div>
                          )
                        ) : (
                          <div className="bg-stone-900/60 p-2 rounded border-l-2 border-emerald-500 text-[10px] space-y-1">
                            <span className="font-extrabold text-emerald-400 uppercase text-[9px] block">Resolution Action Logs</span>
                            <p className="text-stone-300 font-sans">{rep.resolutionDetails}</p>
                            <span className="text-[9px] text-stone-500 block">By {rep.resolvedBy} on {new Date(rep.resolvedAt || '').toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            <div className="pt-3 border-t border-stone-800/60 mt-2 text-center text-[10px] text-stone-500 font-mono">
              Receiver: managementsystermscout@gmail.com
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
