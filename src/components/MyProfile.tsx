import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, Award, Trophy, MapPin, Mail, Phone, Calendar, 
  Percent, Shield, CheckCircle2, ChevronRight, HelpCircle, 
  Search, CheckCircle, ArrowUpRight, BookOpen, Clock, Heart, Sliders,
  TrendingUp, Award as AwardIcon
} from 'lucide-react';
import { ScoutMember, Badge, Award as AwardType, AttendanceRecord, User as UserType } from '../types';

interface MyProfileProps {
  currentUser: UserType | null;
  scouts: ScoutMember[];
  badges: Badge[];
  awards: AwardType[];
  attendance: AttendanceRecord[];
}

// Custom defined SLSA Syllabus requirements for interactive checklist
const SYLLABUS_REQUIREMENTS: Record<string, string[]> = {
  "b_firstaid": [
    "Assemble and demonstrate first aid kit essentials",
    "Treat a simulated fractured forearm with wooden splints",
    "Apply triangular bandage for broken collarbone",
    "Identify symptoms of severe shock and demonstrate recovery position",
    "Successfully pass the emergency signaling practical evaluation"
  ],
  "b_pioneering": [
    "Correctly tie Clove Hitch, Square Lash, and Diagonal Lash",
    "Explain the tension distribution in a standard A-frame tripod",
    "Participate in building a monkey-bridge or camp gateway structure",
    "Perform standard whipping to prevent rope end fraying",
    "Demonstrate safe handling of hand saws, camp axes, and mallets"
  ],
  "b_cooking": [
    "Assemble fuel-efficient wood arrangement (Tepee/Log Cabin fire)",
    "Light campfire without matches under leader supervision",
    "Prepare a hot meal (rice and curry) for a patrol of 6 scouts",
    "Explain camp hygiene rules and garbage disposal regulations",
    "Demonstrate extinguishing and making fire site completely cold"
  ]
};

export default function MyProfile({ currentUser, scouts, badges, awards, attendance }: MyProfileProps) {
  // Find currently logged in scout
  const findMyScout = () => {
    if (!currentUser) return null;
    return scouts.find(s => 
      s.email?.toLowerCase() === currentUser.email?.toLowerCase() ||
      s.firstName.toLowerCase() + " " + s.lastName.toLowerCase() === currentUser.name.toLowerCase() ||
      s.membershipNo?.toLowerCase() === currentUser.username?.toLowerCase()
    );
  };

  const selfScout = findMyScout();
  const [selectedScoutId, setSelectedScoutId] = useState<string>(selfScout?.id || (scouts[0]?.id || ''));
  const [completedReqs, setCompletedReqs] = useState<Record<string, Record<number, boolean>>>({});

  // Active viewed scout model
  const isPrivileged = currentUser?.role === 'admin' || currentUser?.role === 'leader';
  const activeScout = isPrivileged 
    ? scouts.find(s => s.id === selectedScoutId) || selfScout || scouts[0]
    : selfScout;

  if (!activeScout) {
    return (
      <div className="bg-stone-900/40 border border-stone-850 p-8 rounded-2xl text-center max-w-lg mx-auto space-y-4">
        <User className="w-10 h-10 text-stone-500 mx-auto" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-stone-200">No Connected Scout Member Profile</h3>
        <p className="text-xs text-stone-400">
          Your credentials do not match an existing record in the troop roster. Contact Dineth or Manusha to create your scout profile card.
        </p>
      </div>
    );
  }

  // Calculate actual dynamic attendance metrics
  const totalMeetings = attendance.length;
  const attendedMeetings = attendance.filter(rec => rec.presentIds.includes(activeScout.id)).length;
  const attendanceRate = totalMeetings > 0 ? Math.round((attendedMeetings / totalMeetings) * 100) : 0;

  // Toggle checklist requirements
  const handleToggleRequirement = (badgeId: string, reqIndex: number) => {
    setCompletedReqs(prev => {
      const badgeMap = prev[badgeId] || {};
      const updatedBadgeMap = { ...badgeMap, [reqIndex]: !badgeMap[reqIndex] };
      return { ...prev, [badgeId]: updatedBadgeMap };
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Leadership Scout Selector bar */}
      {isPrivileged && (
        <div className="bg-stone-900/40 border border-stone-850 p-4.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-amber-500 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4" /> Troop Progress Inspecting Console
            </h4>
            <p className="text-[11px] text-stone-400">
              You are viewing as an executive scout leader. Select any registered member to review their progress metrics.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-stone-500 shrink-0" />
            <select
              value={selectedScoutId}
              onChange={(e) => setSelectedScoutId(e.target.value)}
              className="bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-200 outline-none focus:border-amber-500/50 cursor-pointer w-full sm:w-64"
            >
              <option value="">-- Choose Scout Member --</option>
              {scouts.map(scout => (
                <option key={scout.id} value={scout.id}>
                  {scout.firstName} {scout.lastName} ({scout.patrol})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Scout Core Header Profile Card */}
      <div className="bg-stone-900/30 border border-stone-850 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-6 relative overflow-hidden">
        
        {/* Subtle decorative crest watermark */}
        <div className="absolute right-0 bottom-0 opacity-[0.03] text-[180px] select-none pointer-events-none transform translate-x-12 translate-y-12">
          ⚜️
        </div>

        {/* Left: Picture and basic tags */}
        <div className="md:col-span-3 flex flex-col items-center justify-center text-center space-y-3.5 border-b md:border-b-0 md:border-r border-stone-850/60 pb-6 md:pb-0 md:pr-6">
          <div className="relative">
            <img 
              src={activeScout.scoutPhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
              alt={`${activeScout.firstName} Profile`} 
              className="w-24 h-24 rounded-full object-cover border-2 border-amber-500/80 p-0.5 bg-stone-950 shadow-xl"
              referrerPolicy="no-referrer"
            />
            {attendanceRate >= 80 && (
              <span 
                title="Elite attendance status (>= 80%)"
                className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-1 border border-stone-900 shadow"
              >
                <CheckCircle className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-stone-200">{activeScout.firstName} {activeScout.lastName}</h3>
            <span className="text-[10px] uppercase font-bold font-mono tracking-wider bg-stone-950 px-2.5 py-0.5 rounded-full border border-stone-800 text-amber-500">
              {activeScout.position}
            </span>
          </div>

          <div className="text-[10px] text-stone-400 font-mono space-y-0.5">
            <div>Patrol: <span className="text-stone-200 font-bold">{activeScout.patrol} Bird 🐦</span></div>
            <div>No: {activeScout.membershipNo}</div>
          </div>
        </div>

        {/* Right: Personal Records Columns */}
        <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
          
          <div className="space-y-3">
            <div className="border-b border-stone-800/60 pb-1.5">
              <span className="text-stone-500 text-[10px] font-mono uppercase tracking-widest block">PERSONAL INFORMATION</span>
            </div>

            <div className="space-y-2 text-stone-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                <span>Date of Birth: <strong>{activeScout.dob}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                <span>Enlisted Since: <strong>{activeScout.dateJoined || '2024-01-15'}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-stone-500" />
                <span className="truncate" title={activeScout.address}>HQ Premise: <strong>{activeScout.address}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-stone-500" />
                <span className="truncate" title={activeScout.email}>Email: <strong>{activeScout.email}</strong></span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="border-b border-stone-800/60 pb-1.5">
              <span className="text-stone-500 text-[10px] font-mono uppercase tracking-widest block">EMERGENCY & GUARD STATUS</span>
            </div>

            <div className="space-y-2 text-stone-300">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-stone-500" />
                <span>Guardian: <strong>{activeScout.parentName} ({activeScout.relationship})</strong></span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Phone className="w-3.5 h-3.5 text-stone-500" />
                <span>Parent Phone: <strong>{activeScout.parentPhone}</strong></span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                <span>Self WhatsApp: <strong>{activeScout.whatsapp}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                <span>Reg District: <strong className="text-amber-500">COLOMBO District Scouts</strong></span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Grid of Achievements: SLSA Badge Syllabus Checklist, National Milestones, and Dynamic Attendance Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Interactive SLSA Syllabus Checklists & Badges Progress (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-stone-900/40 border border-stone-850 p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2.5 border-b border-stone-800/80 pb-3">
              <Award className="w-5 h-5 text-amber-500 animate-pulse" />
              <div className="flex-1">
                <h3 className="font-bold text-xs tracking-widest text-stone-100 uppercase">
                  SLSA Badges Examination Syllabus Progress
                </h3>
                <p className="text-[10px] text-stone-400 uppercase font-mono mt-0.5">Sri Lanka Scout Association Certification Progress</p>
              </div>
              <span className="text-[10px] bg-stone-950 border border-stone-850 font-bold px-2.5 py-0.5 rounded-full text-stone-300">
                Total Badges: {activeScout.badgesEarned?.length || 0}
              </span>
            </div>

            <p className="text-xs text-stone-400 font-sans leading-relaxed">
              Check requirement blocks below to verify progress towards each respective scout badge. Scouts may check these items to self-evaluate their preparations ahead of Leader inspect dispatches.
            </p>

            <div className="space-y-5">
              {badges.map((badge) => {
                const isEarned = activeScout.badgesEarned?.includes(badge.id);
                // Calculate requirement checklists progress percentage
                const reqs = SYLLABUS_REQUIREMENTS[badge.id] || [
                  "Fulfill general badge requirements and curriculum items",
                  "Pass the oral exam administered by troop commissioner",
                  "Demonstrate field practical techniques in high scoring range"
                ];
                
                const badgeChecks = completedReqs[badge.id] || {};
                const checkedCount = isEarned ? reqs.length : reqs.filter((_, i) => badgeChecks[i]).length;
                const percent = Math.round((checkedCount / reqs.length) * 100);

                return (
                  <div 
                    key={badge.id}
                    className={`border rounded-xl p-4 transition-all ${
                      isEarned 
                        ? 'bg-emerald-950/15 border-emerald-500/30' 
                        : 'bg-stone-950/40 border-stone-850/80 hover:border-stone-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-stone-900">
                      <div className="flex items-center gap-3">
                        <img 
                          src={badge.photoUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50"} 
                          alt={badge.name} 
                          className="w-10 h-10 object-cover rounded-lg border border-stone-800 shrink-0" 
                        />
                        <div>
                          <h4 className="text-xs font-bold text-stone-200">{badge.name}</h4>
                          <span className="text-[9px] font-bold font-mono tracking-widest text-stone-500 uppercase">{badge.category}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="text-right">
                          <span className={`text-[9px] uppercase font-mono font-extrabold px-2 py-0.5 rounded ${
                            isEarned 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-400/20' 
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/10'
                          }`}>
                            {isEarned ? 'Earned 💎' : 'In Progress (Active)'}
                          </span>
                        </div>
                        <div className="text-right text-[10px] font-mono text-stone-400">
                          {percent}% Complete
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar representation */}
                    <div className="w-full bg-stone-950/80 h-1.5 rounded-full overflow-hidden mb-3 border border-stone-900 relative">
                      <motion.div 
                        className={`h-full absolute left-0 top-0 rounded-full ${isEarned ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                      ></motion.div>
                    </div>

                    {/* Requirement checkboxes list */}
                    <div className="space-y-1.5 pl-2">
                      {reqs.map((req, ridx) => {
                        const checked = isEarned || !!badgeChecks[ridx];
                        return (
                          <label 
                            key={ridx}
                            className={`flex items-start gap-2.5 text-[11px] cursor-pointer transition select-none ${
                              checked ? 'text-stone-300' : 'text-stone-500 hover:text-stone-400'
                            }`}
                          >
                            <input 
                              type="checkbox"
                              checked={checked}
                              disabled={isEarned}
                              onChange={() => handleToggleRequirement(badge.id, ridx)}
                              className="mt-0.5 w-3.5 h-3.5 accents-amber-500 bg-stone-950 border-stone-800 rounded cursor-pointer transition"
                            />
                            <span className={checked ? 'line-through text-stone-500' : ''}>
                              {req}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Stats & Milestones Shelf (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Dynamic Attendance circular metric gauge */}
          <div className="bg-stone-900/40 border border-stone-850 p-6 rounded-2xl text-center space-y-4">
            <h4 className="text-xs font-bold text-stone-200 uppercase font-mono tracking-wider text-left border-b border-stone-800/80 pb-2">
              📅 Attendance Analyzer
            </h4>
            
            <div className="py-4 flex flex-col items-center justify-center">
              <div className="relative w-28 h-28 flex items-center justify-center rounded-full bg-stone-950 border-4 border-stone-800">
                {/* SVG circular track */}
                <svg className="absolute w-full h-full transform -rotate-90">
                  <circle 
                    cx="56" 
                    cy="56" 
                    r="48" 
                    fill="transparent" 
                    className="stroke-stone-900" 
                    strokeWidth="5" 
                  />
                  <circle 
                    cx="56" 
                    cy="56" 
                    r="48" 
                    fill="transparent" 
                    className={`${attendanceRate >= 85 ? 'stroke-emerald-500' : attendanceRate >= 60 ? 'stroke-amber-500' : 'stroke-red-500'} transition-all duration-700`}
                    strokeWidth="5" 
                    strokeDasharray={301.6}
                    strokeDashoffset={301.6 - (301.6 * attendanceRate) / 100}
                    strokeLinecap="round"
                  />
                </svg>

                <div className="text-center font-bold font-mono">
                  <span className="text-2xl text-stone-100">{attendanceRate}</span>
                  <span className="text-xs text-stone-400">%</span>
                </div>
              </div>

              <div className="mt-4 space-y-1">
                <div className="text-xs text-stone-200 font-bold">
                  {attendedMeetings} of {totalMeetings} Meetings Attended
                </div>
                <p className="text-[10px] text-stone-400 leading-relaxed max-w-xs px-2 mx-auto">
                  Calculated directly from council registries. Rates above 80% are required to register for presidential and king scout exam certificates.
                </p>
              </div>
            </div>
          </div>

          {/* National & State Awards Medal Shelf */}
          <div className="bg-stone-900/40 border border-stone-850 p-6 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-stone-200 uppercase font-mono tracking-wider border-b border-stone-800/80 pb-2 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" /> Milestone Awards Shelf
            </h4>

            <div className="space-y-4 font-sans text-xs">
              {awards.map(aw => {
                const isEarned = activeScout.awardsEarned?.includes(aw.id);
                return (
                  <div 
                    key={aw.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border ${
                      isEarned 
                        ? 'bg-amber-950/10 border-amber-500/30' 
                        : 'bg-stone-950/20 border-stone-900 opacity-60'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      isEarned ? 'bg-amber-500 text-stone-950 shadow' : 'bg-stone-900 text-stone-600'
                    }`}>
                      <Trophy className="w-4 h-4" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-200">{aw.name}</span>
                        {isEarned && (
                          <span className="text-[8px] font-mono uppercase bg-amber-500 text-stone-950 font-bold px-1 rounded">
                            AWARDED
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-400 leading-snug">{aw.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Overall Troop Standing Ranks (Animated Percentage Progress) */}
          {(() => {
            // Score helper: 15pts per badge, 25pts per award, attendance percentage
            const scoredScouts = scouts.map(s => {
              const sMeetings = attendance.length;
              const sAttended = attendance.filter(rec => rec.presentIds.includes(s.id)).length;
              const sAttendanceRate = sMeetings > 0 ? (sAttended / sMeetings) * 100 : 0;
              const score = (s.badgesEarned?.length || 0) * 15 + (s.awardsEarned?.length || 0) * 25 + sAttendanceRate;
              return { id: s.id, score };
            });
            // Sort descending
            scoredScouts.sort((a, b) => b.score - a.score);
            const scoutIndex = scoredScouts.findIndex(item => item.id === activeScout.id);
            const troopRank = scoutIndex !== -1 ? scoutIndex + 1 : 1;
            const totalScouts = scouts.length;
            // percentile represents sits height standing rank (Rank 1 out of 10 sits at 100% standing, Rank 10 sits at 10%)
            const standingPercent = totalScouts > 0 ? Math.round(((totalScouts - (troopRank - 1)) / totalScouts) * 100) : 0;
            const currentScore = Math.round(scoredScouts[scoutIndex]?.score || 0);

            return (
              <div className="bg-stone-900/40 border border-stone-850 p-6 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold text-stone-200 uppercase font-mono tracking-wider border-b border-stone-800/80 pb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-500 animate-pulse" /> Overall Troop Standing
                </h4>

                <div className="space-y-4 font-sans text-xs">
                  <div className="bg-stone-950 p-4 rounded-xl border border-stone-850 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-bold font-mono tracking-wider block">YOUR TROOP STANDING</span>
                      <div className="text-lg font-black text-amber-500">Rank #{troopRank} <span className="text-xs font-normal text-stone-400">of {totalScouts}</span></div>
                    </div>
                    <div className="bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-800 text-center">
                      <span className="text-[9px] text-stone-400 font-mono uppercase block">PERFORMANCE SCORE</span>
                      <span className="text-xs font-bold text-stone-200 font-mono">{currentScore} pts</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono text-stone-400">
                      <span>Percentile standing rank</span>
                      <span className="text-stone-300 font-bold">{standingPercent}%</span>
                    </div>
                    <div className="w-full bg-stone-950/80 h-2 rounded-full overflow-hidden border border-stone-900 relative">
                      <motion.div 
                        className="h-full absolute left-0 top-0 rounded-full bg-gradient-to-r from-amber-600 to-amber-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${standingPercent}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />
                    </div>
                    <p className="text-[10px] text-stone-400 leading-relaxed pt-1.5 bg-stone-950/40 p-2.5 rounded-lg border border-stone-850">
                      💡 <strong>How to level up?</strong> Complete more SLSA Badges (<strong>+15 pts</strong>), earn State Awards (<strong>+25 pts</strong>), and attend scheduled Troop meetings (<strong>+1 pts per session</strong>).
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

        </div>

      </div>

    </div>
  );
}
