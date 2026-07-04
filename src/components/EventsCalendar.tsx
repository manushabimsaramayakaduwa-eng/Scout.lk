import React, { useState } from 'react';
import { Calendar, Plus, MapPin, Tag, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarEvent, User as UserType } from '../types';

interface EventsCalendarProps {
  events: CalendarEvent[];
  currentUser: UserType;
  onAddEvent: (event: Omit<CalendarEvent, "id">) => void;
}

export default function EventsCalendar({
  events, currentUser, onAddEvent
}: EventsCalendarProps) {
  const isLeaderOrAdmin = currentUser.role === 'leader' || currentUser.role === 'admin';
  const [showAddForm, setShowAddForm] = useState(false);

  // Month select (focus on June 2026, matching user meta local time)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // June (0-indexed)

  // Form states
  const [evTitle, setEvTitle] = useState('');
  const [evDate, setEvDate] = useState('2026-06-15');
  const [evDesc, setEvDesc] = useState('');
  const [evType, setEvType] = useState<'Meeting' | 'Camp' | 'Service' | 'Ceremony' | 'Training'>('Meeting');

  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evTitle.trim() || !evDate) return;

    onAddEvent({
      title: evTitle.trim(),
      date: evDate,
      description: evDesc.trim() || 'No description provided.',
      type: evType
    });

    setEvTitle(''); setEvDesc('');
    setShowAddForm(false);
    alert('Squad event successfully logged in calendar schedulers!');
  };

  // Generate days array for Google Calendar sheet representation
  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const startDayOfWeek = date.getDay(); // 0 is Sunday, etc.
    const days = [];
    
    // Previous Month padding days
    const prevDate = new Date(year, month, 0);
    const prevDaysCount = prevDate.getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevDaysCount - i,
        isCurrentMonth: false,
        dateStr: `${year}-${String(month).padStart(2, '0')}-${String(prevDaysCount - i).padStart(2, '0')}`
      });
    }

    // Current Month active days
    const currentDaysCount = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= currentDaysCount; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      });
    }

    return days;
  };

  const calendarDays = getDaysInMonth(currentYear, currentMonth);

  const getEventsForDay = (dateStr: string) => {
    return events.filter(e => e.date === dateStr);
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Camp': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Meeting': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Service': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Ceremony': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Training': return 'bg-stone-500/10 text-stone-400 border-stone-800';
      default: return 'bg-stone-500/10 text-stone-400';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Calendar Month Selector & Form trigger */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between pb-4 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={handlePrevMonth}
            className="p-1.5 bg-stone-900 border border-stone-800 hover:text-amber-500 rounded"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <h3 className="text-sm font-bold text-stone-100 font-mono uppercase tracking-wide min-w-[140px] text-center">
            📅 {monthNames[currentMonth]} {currentYear}
          </h3>

          <button 
            type="button" 
            onClick={handleNextMonth}
            className="p-1.5 bg-stone-900 border border-stone-800 hover:text-amber-500 rounded"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {isLeaderOrAdmin && (
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full md:w-auto bg-amber-500 hover:bg-amber-400 active:scale-95 transition text-stone-950 font-bold text-xs px-4 py-2 rounded-lg flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Schedule Event
          </button>
        )}
      </div>

      {/* Add event form */}
      {showAddForm && (
        <form onSubmit={handleCreateEvent} className="bg-stone-900/60 border border-stone-800 rounded-xl p-5 space-y-4 max-w-md mx-auto animate-fadeIn">
          <h4 className="text-xs font-bold text-amber-500 font-mono tracking-wider uppercase">LOG SCOUTING MEET OR ADVENTURE</h4>
          
          <div>
            <label className="block text-[10px] text-stone-400 font-mono uppercase mb-1">Event Title</label>
            <input
              type="text"
              className="w-full bg-stone-950 text-xs border border-stone-850 rounded px-2.5 py-2 text-stone-100 outline-none"
              placeholder="e.g. Pioneering weekend drill"
              required
              value={evTitle}
              onChange={(e) => setEvTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[10px] text-stone-400 font-mono uppercase mb-1">Occasion Date</label>
              <input
                type="date"
                className="w-full bg-stone-950 border border-stone-850 rounded px-2 py-1.5 text-stone-100 outline-none"
                required
                value={evDate}
                onChange={(e) => setEvDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] text-stone-400 font-mono uppercase mb-1">Session Type</label>
              <select
                className="w-full bg-stone-950 border border-stone-850 rounded px-2 py-1.5 text-stone-100 outline-none"
                value={evType}
                onChange={(e) => setEvType(e.target.value as any)}
              >
                <option value="Meeting">Weekly Meeting</option>
                <option value="Camp">Campout / Camporee</option>
                <option value="Service">Community Service</option>
                <option value="Ceremony">Ceremony / Court of Honour</option>
                <option value="Training">Training drill</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-stone-400 font-mono uppercase mb-1">Venue / Information description</label>
            <input
              type="text"
              className="w-full bg-stone-950 text-xs border border-stone-850 rounded px-2.5 py-2 text-stone-100 outline-none"
              placeholder="e.g. Kotte Grounds / Temple grounds"
              value={evDesc}
              onChange={(e) => setEvDesc(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 text-xs">
            <button
              type="button"
              className="bg-stone-800 text-stone-200 px-3 py-1.5 rounded"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-amber-500 text-stone-950 font-bold px-4 py-1.5 rounded"
            >
              Commit Event
            </button>
          </div>
        </form>
      )}

      {/* Grid Google Calendar view */}
      <div className="bg-stone-900/30 border border-stone-800 rounded-xl overflow-hidden shadow-md">
        
        {/* Days of week */}
        <div className="grid grid-cols-7 bg-stone-950 p-2.5 text-center text-[10px] font-bold text-stone-500 uppercase tracking-widest font-mono border-b border-stone-800">
          <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
        </div>

        {/* Days matrix */}
        <div className="grid grid-cols-7 divide-x divide-y divide-stone-850 bg-stone-950/20">
          {calendarDays.map((dayObj, idx) => {
            const dayEvents = getEventsForDay(dayObj.dateStr);
            return (
              <div 
                key={idx} 
                className={`min-h-[90px] p-2 flex flex-col justify-between ${
                  dayObj.isCurrentMonth ? 'text-stone-300' : 'text-stone-700'
                }`}
              >
                <span className="text-[10px] font-bold font-mono self-start">
                  {dayObj.day}
                </span>

                <div className="flex-1 mt-1.5 space-y-1 overflow-y-auto max-h-[60px]">
                  {dayEvents.map(ev => (
                    <div 
                      key={ev.id} 
                      className={`text-[9px] px-1.5 py-0.5 rounded border text-left truncate font-medium ${getTypeBadgeColor(ev.type)}`}
                      title={`${ev.title}: ${ev.description}`}
                    >
                      🔹 {ev.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
