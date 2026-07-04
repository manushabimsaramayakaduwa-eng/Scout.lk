import React, { useState } from 'react';
import { Trophy, Plus, Edit, Trash2, Award, User, Calendar, ShieldCheck, CheckSquare } from 'lucide-react';
import { Award as AwardType, ScoutMember, User as UserType } from '../types';

interface AwardsPanelProps {
  awards: AwardType[];
  scouts: ScoutMember[];
  currentUser: UserType;
  onAddAward: (award: Omit<AwardType, "id">) => void;
  onUpdateAward: (id: string, award: Partial<AwardType>) => void;
  onGrantAwardToScout: (scoutId: string, awardId: string) => void;
}

export default function AwardsPanel({
  awards, scouts, currentUser, onAddAward, onUpdateAward, onGrantAwardToScout
}: AwardsPanelProps) {
  const isLeaderOrAdmin = currentUser.role === 'leader' || currentUser.role === 'admin';
  const [showAddAwardForm, setShowAddAwardForm] = useState(false);
  const [editingAward, setEditingAward] = useState<AwardType | null>(null);

  // Award Form
  const [nameInput, setNameInput] = useState('');
  const [descInput, setDescInput] = useState('');

  // Editing Award Form
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Granting state
  const [selectedScout, setSelectedScout] = useState(scouts[0]?.id || '');
  const [selectedAward, setSelectedAward] = useState(awards[0]?.id || '');

  // Reset dropdown select whenever arrays update
  React.useEffect(() => {
    if (scouts.length && !selectedScout) setSelectedScout(scouts[0].id);
    if (awards.length && !selectedAward) setSelectedAward(awards[0].id);
  }, [scouts, awards, selectedAward, selectedScout]);

  const handleCreateAward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !descInput.trim()) return;

    onAddAward({
      name: nameInput.trim(),
      description: descInput.trim()
    });

    setNameInput(''); setDescInput('');
    setShowAddAwardForm(false);
    alert('New state level award configuration created successfully!');
  };

  const startEdit = (aw: AwardType) => {
    setEditingAward(aw);
    setEditName(aw.name);
    setEditDesc(aw.description);
  };

  const handleUpdateAwardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAward) return;

    onUpdateAward(editingAward.id, {
      name: editName.trim(),
      description: editDesc.trim()
    });

    setEditingAward(null);
    alert('SLSA award guidelines modified successfully!');
  };

  const handleGrantAward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScout || !selectedAward) {
      alert('Please check if scouts and awards configurations exist.');
      return;
    }

    onGrantAwardToScout(selectedScout, selectedAward);
    alert('Scout awarded outstanding honors on database registers.');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between pb-4 border-b border-stone-800">
        <div>
          <h3 className="font-bold text-sm tracking-wider text-stone-100 uppercase flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" /> SLSA Awards and Honors Registry
          </h3>
          <p className="text-xs text-stone-500 font-mono mt-1">Outstanding leadership and community medals</p>
        </div>

        {isLeaderOrAdmin && (
          <button
            onClick={() => setShowAddAwardForm(!showAddAwardForm)}
            className="w-full md:w-auto bg-amber-500 font-bold hover:bg-amber-400 active:scale-95 transition text-stone-950 text-xs px-4 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4 inline mr-1" /> Create Award Config
          </button>
        )}
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Side: List of Awards Guidances */}
        <div className="space-y-4">
          <div className="bg-stone-900/40 border border-stone-800 p-5 rounded-2xl">
            <h4 className="text-xs font-bold text-amber-500 font-mono tracking-widest uppercase mb-4">Official Honors Guidelines</h4>
            
            <div className="space-y-3">
              {awards.map(aw => (
                <div key={aw.id} className="bg-stone-950/60 border border-stone-850 p-4 rounded-xl flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 bg-amber-500/15 rounded-full flex items-center justify-center shrink-0 text-amber-400 font-bold text-sm">
                      🏅
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-200">{aw.name}</h4>
                      <p className="text-[10px] text-stone-400 mt-1 leading-relaxed">{aw.description}</p>
                    </div>
                  </div>

                  {isLeaderOrAdmin && (
                    <button
                      onClick={() => startEdit(aw)}
                      className="text-[10px] text-amber-500 hover:text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded bg-stone-900 shrink-0 font-mono"
                    >
                      EDIT Specs
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add award guidance inline */}
          {showAddAwardForm && (
            <form onSubmit={handleCreateAward} className="bg-stone-900/60 border border-stone-800 rounded-xl p-5 space-y-4 animate-fadeIn">
              <h4 className="text-xs font-bold text-amber-500 font-mono tracking-wider uppercase">New Honors Syllabus Profile</h4>
              <div>
                <label className="block text-[10px] text-stone-400 font-mono uppercase mb-1">Medal Name</label>
                <input
                  type="text"
                  className="w-full bg-stone-950 text-xs border border-stone-850 rounded px-2.5 py-2 text-stone-100 outline-none"
                  placeholder="e.g. Chief Scout Shield"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] text-stone-400 font-mono uppercase mb-1">Syllabus Requirements Description</label>
                <textarea
                  className="w-full bg-stone-950 text-xs border border-stone-850 rounded px-2.5 py-2 text-stone-100 h-14 resize-none outline-none font-sans"
                  placeholder="e.g. 50 hours of active community service log..."
                  required
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  className="bg-stone-800 text-stone-200 px-3 py-1.5 rounded"
                  onClick={() => setShowAddAwardForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 text-stone-950 font-bold px-4 py-1.5 rounded"
                >
                  Confirm Guidelines
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Side: Grant Award Screen & Earners list */}
        <div className="space-y-4">
          
          {/* Grant award block (Leaders only) */}
          {isLeaderOrAdmin ? (
            <form onSubmit={handleGrantAward} className="bg-stone-900/40 border border-stone-800 p-5 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold text-amber-400 font-mono tracking-widest uppercase">Allocate Outstanding Honors</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="block text-[10px] text-stone-400 font-mono uppercase mb-1">Scout Recipient</label>
                  <select
                    className="w-full bg-stone-950 border border-stone-850 rounded px-2.5 py-2 text-stone-100 outline-none"
                    value={selectedScout}
                    onChange={(e) => setSelectedScout(e.target.value)}
                  >
                    {scouts.map(s => (
                      <option key={s.id} value={s.id}>{s.firstName} {s.lastName} (CMB/51)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-stone-400 font-mono uppercase mb-1">Choose Award</label>
                  <select
                    className="w-full bg-stone-950 border border-stone-850 rounded px-2.5 py-2 text-stone-100 outline-none"
                    value={selectedAward}
                    onChange={(e) => setSelectedAward(e.target.value)}
                  >
                    {awards.map(aw => (
                      <option key={aw.id} value={aw.id}>{aw.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 font-bold hover:bg-amber-400 text-stone-950 p-2 text-xs rounded-lg active:scale-95 transition"
              >
                🏅 Record National Award Achievements
              </button>
            </form>
          ) : (
            <div className="bg-stone-900/30 border border-stone-800/80 p-5 rounded-2xl text-center text-xs text-stone-500">
              Logged in as Scout. Only Troop Leaders are authorized to grant National Awards.
            </div>
          )}

          {/* Table list of Recipients */}
          <div className="bg-stone-900/40 border border-stone-800 p-5 rounded-2xl">
            <h4 className="text-xs font-bold text-stone-300 font-mono tracking-wider uppercase mb-3">Recent Award Recipients</h4>
            
            <div className="divide-y divide-stone-850 max-h-[220px] overflow-y-auto">
              {scouts.filter(s => (s.awardsEarned || []).length > 0).map(s => (
                <div key={s.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-stone-200">{s.firstName} {s.lastName}</h5>
                    <p className="text-[10px] text-stone-500 font-mono">{s.patrol} Patrol</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 font-mono text-[9px]">
                    {s.awardsEarned.map(awId => {
                      const match = awards.find(a => a.id === awId);
                      return (
                        <span key={awId} className="bg-amber-500/10 text-amber-400 border border-amber-500/25 px-2 py-0.5 rounded">
                          👑 {match ? match.name : 'Outstanding Achievement'}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
              {scouts.every(s => (s.awardsEarned || []).length === 0) && (
                <div className="py-8 text-center text-stone-500 text-xs font-mono">
                  No scouts have been assigned national medals yet.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Edit award modal specs */}
      {editingAward && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-100">
          <form onSubmit={handleUpdateAwardSubmit} className="bg-stone-900 border border-stone-800 rounded-2xl p-6 w-full max-w-md text-stone-100 space-y-4 shadow-2xl animate-fadeIn">
            <h4 className="text-xs font-bold text-amber-500 font-mono tracking-widest uppercase pb-2 border-b border-stone-800">
              Update Honor guidelines: {editingAward.name}
            </h4>

            <div>
              <label className="block text-[10px] text-stone-400 font-mono uppercase mb-1">Award Title</label>
              <input
                type="text"
                className="w-full bg-stone-950 text-xs border border-stone-850 rounded px-2.5 py-1.5 text-stone-100 outline-none"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] text-stone-400 font-mono uppercase mb-1">Guidelines Syllabus Description</label>
              <textarea
                className="w-full bg-stone-950 text-xs border border-stone-850 rounded px-2.5 py-1.5 text-stone-100 h-24 resize-none outline-none font-sans"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                type="button"
                className="bg-stone-800 text-stone-200 px-3 py-1 rounded"
                onClick={() => setEditingAward(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-amber-500 text-stone-950 font-bold px-4 py-1 rounded hover:bg-amber-400"
              >
                Save Award Syllabus
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
