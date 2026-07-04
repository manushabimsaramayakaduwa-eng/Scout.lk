import React, { useState } from 'react';
import { CalendarCheck, UserCheck, ShieldAlert, Check, X, AlertCircle } from 'lucide-react';
import { ScoutMember, User as UserType, AttendanceRecord } from '../types';

interface AttendanceRegisterProps {
  scouts: ScoutMember[];
  attendance: AttendanceRecord[];
  currentUser: UserType;
  onSaveAttendance: (date: string, presentIds: string[]) => void;
}

export default function AttendanceRegister({
  scouts, attendance, currentUser, onSaveAttendance
}: AttendanceRegisterProps) {
  const isLeaderOrAdmin = currentUser.role === 'leader' || currentUser.role === 'admin';
  const todayStr = new Date().toISOString().slice(0, 10);
  
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Find existing record or initialize
  const existingRecord = attendance.find(r => r.date === selectedDate);
  const [markedPresentList, setMarkedPresentList] = useState<string[]>(
    existingRecord ? existingRecord.presentIds : []
  );

  // Sync state whenever selected date or database changes
  React.useEffect(() => {
    const freshRecord = attendance.find(r => r.date === selectedDate);
    setMarkedPresentList(freshRecord ? freshRecord.presentIds : []);
  }, [selectedDate, attendance]);

  const handleTogglePresent = (scoutId: string) => {
    if (!isLeaderOrAdmin) return; // ignore if scout member tries to modify

    if (markedPresentList.includes(scoutId)) {
      setMarkedPresentList(markedPresentList.filter(id => id !== scoutId));
    } else {
      setMarkedPresentList([...markedPresentList, scoutId]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLeaderOrAdmin) {
      alert('Unauthorized access. Only leaders are permitted to mark troop meetings.');
      return;
    }
    onSaveAttendance(selectedDate, markedPresentList);
    alert(`Troop Attendance updated for ${selectedDate}!`);
  };

  // Math metrics
  const totalScouts = scouts.length;
  const presentCount = markedPresentList.length;
  const absentCount = totalScouts - presentCount;
  const attendanceRate = totalScouts > 0 ? Math.round((presentCount / totalScouts) * 100) : 0;

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between pb-4 border-b border-stone-800">
        <div>
          <h3 className="font-bold text-sm tracking-wider text-stone-100 uppercase flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-amber-500" /> SLSA Weekly Attendance Register
          </h3>
          <p className="text-xs text-stone-500 font-mono mt-1">Official Troop Attendance Registry</p>
        </div>

        <form onSubmit={handleSave} className="flex gap-2 w-full md:w-auto items-center">
          <input
            type="date"
            className="bg-stone-900 border border-stone-800 text-xs text-stone-100 outline-none rounded-lg px-3 py-1.5 focus:border-amber-500"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />

          {isLeaderOrAdmin ? (
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 active:scale-95 transition text-stone-950 font-bold text-xs px-4 py-2 rounded-lg"
            >
              Verify &amp; Save Attendance
            </button>
          ) : (
            <span className="text-[10px] bg-stone-950 px-3 py-2 rounded border border-stone-850 text-stone-400 font-mono">
              View-Only Mode
            </span>
          )}
        </form>
      </div>

      {/* Access alert */}
      {!isLeaderOrAdmin && (
        <div className="bg-amber-950/20 border border-amber-500/30 text-amber-300 p-3 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong>Scout View:</strong> You may see when you were registered present, but only scout leaders (Dineth or Manusha) can modify attendance roll calls.
          </span>
        </div>
      )}

      {/* Mini Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-stone-950/40 p-4 border border-stone-850/80 rounded-xl">
        <div className="text-center">
          <div className="text-[10px] text-stone-500 font-mono uppercase font-semibold">Marked Date</div>
          <div className="text-sm font-bold text-stone-200 mt-1">{selectedDate}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-stone-500 font-mono uppercase font-semibold">Total Scouts</div>
          <div className="text-sm font-bold text-stone-200 mt-1">{totalScouts}</div>
        </div>
        <div className="text-center font-mono">
          <div className="text-[10px] text-stone-500 uppercase font-semibold">Present / Absent</div>
          <div className="text-sm font-bold mt-1">
            <span className="text-emerald-400">{presentCount}</span> / <span className="text-red-400">{absentCount}</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-stone-500 font-mono uppercase font-semibold">Attendance Rate</div>
          <div className="text-sm font-bold text-amber-400 mt-1">{attendanceRate}%</div>
        </div>
      </div>

      {/* Scouts Table */}
      <div className="bg-stone-900/40 border border-stone-800 rounded-xl overflow-hidden max-w-xl mx-auto">
        <div className="bg-stone-950 p-3 border-b border-stone-800 text-xs font-bold text-stone-400 uppercase tracking-widest flex justify-between items-center font-mono">
          <span>Scout Member Roll</span>
          <span>Presence STATUS</span>
        </div>

        <div className="divide-y divide-stone-850 max-h-[300px] overflow-y-auto">
          {scouts.map(s => {
            const isPresent = markedPresentList.includes(s.id);
            return (
              <div 
                key={s.id} 
                onClick={() => handleTogglePresent(s.id)}
                className={`p-3 flex items-center justify-between text-xs transition ${
                  isLeaderOrAdmin ? 'cursor-pointer hover:bg-stone-850/40' : ''
                }`}
              >
                <div>
                  <h4 className="font-bold text-stone-200">{s.firstName} {s.lastName}</h4>
                  <p className="text-[10px] text-stone-500 font-mono uppercase">{s.position} · {s.patrol} Patrol</p>
                </div>

                <div>
                  {isPresent ? (
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/35 px-2.5 py-1 rounded-full font-mono text-[10px] flex items-center gap-1">
                      <Check className="w-3 h-3" /> PRESENT
                    </span>
                  ) : (
                    <span className="bg-red-500/10 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-full font-mono text-[10px] flex items-center gap-1">
                      <X className="w-3 h-3" /> ABSENT
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
