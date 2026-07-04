import React, { useState, useEffect } from 'react';
import { 
  Compass, LayoutDashboard, Users, Award, BookOpen, Calendar, Image, MessageSquare, Trophy, Shield, 
  MapPin, LogOut, Phone, HelpCircle, Mail, Sparkles, Building, Info, FileText, Settings, User as UserIcon
} from 'lucide-react';

import { User as UserType, ScoutMember, Badge, Award as AwardType, CalendarEvent, PhotoAlbum, LibraryDoc, ChatMessage, AttendanceRecord, AuditLog, StorageStatus, MemberReport } from './types';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import ScoutsList from './components/ScoutsList';
import BadgesGrid from './components/BadgesGrid';
import AttendanceRegister from './components/AttendanceRegister';
import Library from './components/Library';
import Albums from './components/Albums';
import EventsCalendar from './components/EventsCalendar';
import AwardsPanel from './components/AwardsPanel';
import Chatroom from './components/Chatroom';
import ReportForm from './components/ReportForm';
import MyProfile from './components/MyProfile';
import SettingsPanel from './components/SettingsPanel';
import ContactTable from './components/ContactTable';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [activeTab, setActiveTab ] = useState<'dashboard' | 'scunts' | 'badges' | 'attendance' | 'events' | 'awards' | 'library' | 'albums' | 'chats' | 'about' | 'profile' | 'settings'>('about'); // Start clean

  // State loaded from DB
  const [users, setUsers] = useState<UserType[]>([]);
  const [scouts, setScouts] = useState<ScoutMember[]>([]);
  const [patrols, setPatrols] = useState<string[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [awards, setAwards] = useState<AwardType[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
  const [library, setLibrary] = useState<LibraryDoc[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [reports, setReports] = useState<MemberReport[]>([]);
  const [storage, setStorage] = useState<StorageStatus>({
    email: "managementsystermscout@gmail.com",
    usedBytes: 11200000000,
    totalBytes: 15000000000,
    isFull: false
  });
  
  const [isSyncing, setIsSyncing] = useState(false);

  // Load state from server on launch
  const loadState = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/state');
      if (response.ok) {
        const db = await response.json();
        setUsers(db.users || []);
        setScouts(db.scouts || []);
        setPatrols(db.patrols || []);
        setBadges(db.badges || []);
        setAwards(db.awards || []);
        setEvents(db.events || []);
        setAlbums(db.albums || []);
        setLibrary(db.library || []);
        setChats(db.chats || []);
        setAttendance(db.attendance || []);
        setAuditLogs(db.auditLogs || []);
        setReports(db.reports || []);
        setStorage(db.storage || {
          email: "managementsystermscout@gmail.com",
          usedBytes: 11200000000,
          totalBytes: 15000000000,
          isFull: false
        });
      }
    } catch (err) {
      console.error('Failed to contact scout database backend', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadState();
    // Verify cached session
    const cached = localStorage.getItem('troop51_session');
    if (cached) {
      try {
        setCurrentUser(JSON.parse(cached));
        setActiveTab('dashboard');
      } catch (e) {
        localStorage.removeItem('troop51_session');
      }
    }
  }, []);

  const handleLoginSuccess = (user: UserType) => {
    setCurrentUser(user);
    localStorage.setItem('troop51_session', JSON.stringify(user));
    setActiveTab('dashboard');
    loadState(); // reload fresh state
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('troop51_session');
    setActiveTab('about');
  };

  // State Persistence triggers
  const handleAddScout = async (scoutData: Omit<ScoutMember, "id">) => {
    try {
      const response = await fetch('/api/scouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scout: scoutData, adminName: currentUser?.name })
      });
      if (response.ok) {
        loadState();
      }
    } catch (err) {
      alert('Fail saving member entry to network.');
    }
  };

  const handleUpdateScout = async (id: string, updatedParams: Partial<ScoutMember>) => {
    try {
      const response = await fetch(`/api/scouts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scout: updatedParams, adminName: currentUser?.name })
      });
      if (response.ok) {
        loadState();
      }
    } catch (err) {
      alert('Fail modifying member entry.');
    }
  };

  const handleDeleteScout = async (id: string) => {
    try {
      const response = await fetch(`/api/scouts/${id}?adminName=${encodeURIComponent(currentUser?.name || 'Admin')}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        loadState();
      }
    } catch (err) {
      alert('Fail purging member entry.');
    }
  };

  const handleAddNewPatrol = async (name: string) => {
    try {
      const response = await fetch('/api/patrols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patrolName: name, adminName: currentUser?.name })
      });
      if (response.ok) {
        loadState();
      }
    } catch (err) {
      alert('Fail configuring new patrol.');
    }
  };

  const handleRemovePatrol = async (name: string) => {
    try {
      const response = await fetch('/api/patrols', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patrolName: name, adminName: currentUser?.name })
      });
      if (response.ok) {
        loadState();
      }
    } catch (err) {
      alert('Fail removing patrol.');
    }
  };

  const handleAddBadge = async (badgeData: Omit<Badge, "id">) => {
    try {
      const response = await fetch('/api/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badge: badgeData, adminName: currentUser?.name })
      });
      if (response.ok) {
        loadState();
      }
    } catch (err) {
      alert('Fail creating badge.');
    }
  };

  const handleUpdateBadge = async (id: string, updatedBadge: Partial<Badge>) => {
    try {
      const response = await fetch(`/api/badges/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badge: updatedBadge, adminName: currentUser?.name })
      });
      if (response.ok) {
        loadState();
      }
    } catch (err) {
      alert('Fail modifying badge syllabus.');
    }
  };

  const handleSaveAttendance = async (date: string, presentIds: string[]) => {
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, presentIds, adminName: currentUser?.name })
      });
      if (response.ok) {
        loadState();
      }
    } catch (err) {
      alert('Failed to register attendance roll.');
    }
  };

  const handleAddEvent = async (eventData: Omit<CalendarEvent, "id">) => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: eventData, adminName: currentUser?.name })
      });
      if (response.ok) {
        loadState();
      }
    } catch (err) {
      alert('Failed to record event schedules.');
    }
  };

  const handleCreateAlbum = async (name: string, description: string) => {
    try {
      const response = await fetch('/api/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, adminName: currentUser?.name })
      });
      if (response.ok) {
        loadState();
      }
    } catch (err) {
      alert('Failed to record album folders.');
    }
  };

  const handleAddPhotoToAlbum = async (albumId: string, url: string, caption: string, type?: 'image' | 'video') => {
    if (storage.isFull) {
      alert('Error: Drive storage is strictly full. Photo uploads locked until space freed.');
      return;
    }
    try {
      const response = await fetch(`/api/albums/${albumId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrl: url, caption, uploaderName: currentUser?.name, type })
      });
      if (response.ok) {
        loadState();
      }
    } catch (err) {
      alert('Failed uploading photo.');
    }
  };

  const handleAddLibraryDoc = async (docData: Omit<LibraryDoc, "id" | "addedBy" | "addedAt">) => {
    if (storage.isFull) {
      alert('Error: Drive storage is strictly full. eBook uploads locked until space freed.');
      return;
    }
    try {
      const response = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...docData, adminName: currentUser?.name })
      });
      if (response.ok) {
        loadState();
      }
    } catch (err) {
      alert('Failed to list document in library.');
    }
  };

  const handleDeleteLibraryDoc = async (id: string) => {
    try {
      const response = await fetch(`/api/library/${id}?adminName=${encodeURIComponent(currentUser?.name || '')}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        loadState();
      }
    } catch (err) {
      alert('Failed to purge library file.');
    }
  };

  const handleAddAward = async (awardData: Omit<AwardType, "id">) => {
    try {
      const response = await fetch('/api/awards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ award: awardData, adminName: currentUser?.name })
      });
      if (response.ok) {
        loadState();
      }
    } catch (err) {
      alert('Failed creating honors definition.');
    }
  };

  const handleUpdateAward = async (id: string, awardData: Partial<AwardType>) => {
    try {
      const response = await fetch(`/api/awards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ award: awardData, adminName: currentUser?.name })
      });
      if (response.ok) {
        loadState();
      }
    } catch (err) {
      alert('Failed modifying honors guidelines.');
    }
  };

  const handleGrantAwardToScout = async (scoutId: string, awardId: string) => {
    const scout = scouts.find(s => s.id === scoutId);
    if (!scout) return;

    const currentAwards = scout.awardsEarned || [];
    if (currentAwards.includes(awardId)) {
      alert('Scout already earned this national medal.');
      return;
    }

    const updated = [...currentAwards, awardId];
    handleUpdateScout(scoutId, { awardsEarned: updated });
  };

  const handleSendMessage = async (text: string) => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: currentUser?.name || 'Unknown',
          senderRole: currentUser?.role || 'scout',
          text
        })
      });
      if (response.ok) {
        loadState();
      }
    } catch (err) {
      console.error('Chat transmit error', err);
    }
  };

  const handleClearChats = async () => {
    try {
      const response = await fetch('/api/chats/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminName: currentUser?.name })
      });
      if (response.ok) {
        loadState();
      }
    } catch (err) {
      console.error('Failed clearing chats', err);
    }
  };

  const handleAdjustStorage = async (bytes: number) => {
    try {
      const response = await fetch('/api/storage/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usedBytes: bytes, adminName: currentUser?.name })
      });
      if (response.ok) {
        loadState();
      }
    } catch (err) {
      console.error('Failed to mock modify storage.', err);
    }
  };

  const handleUpdateDigestSettings = async (enabled: boolean, frequency: 'daily' | 'weekly') => {
    try {
      const response = await fetch('/api/storage/digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reportDigestEnabled: enabled, 
          reportDigestFrequency: frequency, 
          adminName: currentUser?.name 
        })
      });
      if (response.ok) {
        loadState();
      }
    } catch (err) {
      console.error('Failed to update email digest settings', err);
    }
  };

  const handleApproveUser = async (userId: string) => {
    if (!currentUser) return;
    try {
      const response = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, adminUsername: currentUser.username })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        alert("Leader account successfully activated! ⚜️");
        loadState();
      } else {
        alert(data.message || "Failed to approve leader account");
      }
    } catch (err) {
      alert("Error contacting database server");
    }
  };

  const handleRejectUser = async (userId: string) => {
    if (!currentUser) return;
    if (!confirm("Are you sure you want to reject the leader's sign-up request? This will permanently delete the registration data.")) return;
    try {
      const response = await fetch('/api/admin/reject-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, adminUsername: currentUser.username })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        alert("Leader registration has been rejected and deleted.");
        loadState();
      } else {
        alert(data.message || "Failed to reject leader account");
      }
    } catch (err) {
      alert("Error contacting database server");
    }
  };

  const handleUpdateUser = async (userId: string, updatedFields: any) => {
    if (!currentUser) return;
    try {
      const response = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          adminUsername: currentUser.username, 
          updatedFields 
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        alert("User account updated successfully! ⚜️");
        loadState();
      } else {
        alert(data.message || "Failed to update user account");
      }
    } catch (err) {
      alert("Error contacting database server");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!currentUser) return;
    if (!confirm("Are you absolutely sure you want to delete this registered user account? This cannot be undone!")) return;
    try {
      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          adminUsername: currentUser.username 
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        if (data.isSelfDeleted) {
          alert("Your own account has been deleted permanently. Logging out.");
          handleLogout();
        } else {
          alert("User account has been deleted permanently.");
          loadState();
        }
      } else {
        alert(data.message || "Failed to delete user account");
      }
    } catch (err) {
      alert("Error contacting database server");
    }
  };

  const handleSubmitReport = async (type: string, description: string, priority: string) => {
    if (!currentUser) return;
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          description,
          priority,
          reporterName: currentUser.name,
          reporterId: currentUser.id,
          reporterRole: currentUser.role
        })
      });
      if (response.ok) {
        loadState();
      } else {
        alert('Failed to dispatch report to leaders.');
      }
    } catch (err) {
      console.error('Failed to submit report', err);
    }
  };

  const handleResolveReport = async (reportId: string, resolutionDetails: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolutionDetails, adminName: currentUser?.name })
      });
      if (response.ok) {
        loadState();
      } else {
        alert('Failed to resolve report.');
      }
    } catch (err) {
      console.error('Failed to resolve report', err);
    }
  };

  const handleUpdateSelfCredentials = async (
    passwordInput: string, usernameInput: string, nameInput: string, 
    emailInput: string, whatsappInput: string, addressInput: string, parentPhoneInput: string
  ) => {
    if (!currentUser) return;

    try {
      const response = await fetch('/api/auth/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          username: usernameInput,
          password: passwordInput,
          name: nameInput,
          email: emailInput,
          whatsapp: whatsappInput,
          parentPhone: parentPhoneInput,
          isScout: currentUser.role === 'scout'
        })
      });

      if (response.ok) {
        // Redraw self local state
        const updatedUser = {
          ...currentUser,
          username: usernameInput || currentUser.username,
          name: nameInput || currentUser.name,
          email: emailInput !== undefined ? emailInput : currentUser.email,
          whatsapp: whatsappInput !== undefined ? whatsappInput : currentUser.whatsapp,
          parentPhone: parentPhoneInput !== undefined ? parentPhoneInput : currentUser.parentPhone
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('troop51_session', JSON.stringify(updatedUser));
        loadState();
      }
    } catch (err) {
      alert('Fail publishing update registries.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 font-sans text-stone-100 flex flex-col">
      
      {/* GLOBAL HEADER BAR */}
      <header className="bg-gradient-to-r from-emerald-900 to-indigo-950 border-b border-stone-800 py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shrink-0 selection:bg-amber-400 select-none">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Three side-by-side logos representation */}
          <div className="flex items-center gap-1.5 bg-stone-950/60 p-1.5 rounded-xl border border-stone-800">
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/Sri_Lanka_Scout_Association.svg/200px-Sri_Lanka_Scout_Association.svg.png" 
              alt="SLSA" 
              className="w-10 h-10 object-contain p-0.5 bg-white rounded-full shrink-0"
              referrerPolicy="no-referrer"
              title="Sri Lanka Scout Association"
            />
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/3/30/Ananda_Sastralaya_Kotte_crest.png" 
              alt="AS Kotte" 
              className="w-10 h-10 object-contain p-0.5 bg-white rounded-full shrink-0"
              referrerPolicy="no-referrer"
              title="Ananda Sastralaya Kotte"
            />
            <img 
              src="https://pbs.twimg.com/profile_images/856860017122131968/Cj_30p2E_400x400.jpg" 
              alt="Colombo Scouts" 
              className="w-10 h-10 object-contain p-0.5 bg-white rounded-full shrink-0"
              referrerPolicy="no-referrer"
              title="Colombo District Scouts"
            />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-base font-extrabold tracking-tight text-white flex flex-wrap items-center justify-center sm:justify-start gap-1.5 uppercase">
              51st Colombo Scout Troop <span className="text-[10px] lowercase text-stone-300 font-mono italic">TroopTrack</span>
            </h1>
            <p className="text-[11px] text-stone-300 font-mono">
              Ananda Sastralaya Kotte · Sri Lanka Scout Association
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2.5">
              <div className="bg-stone-900/80 border border-stone-800 rounded-xl px-3 py-1.5 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-xs font-bold text-stone-200">
                  {currentUser.name} 
                  <span className={`text-[9px] uppercase font-bold ml-2 px-1.5 py-0.5 rounded ${
                    currentUser.role === 'admin' 
                      ? 'white-space-nowrap bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                      : currentUser.role === 'leader' 
                        ? 'bg-amber-500/10 text-amber-400' 
                        : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {currentUser.role === 'admin' ? 'Admin & App Developer 🛠️' : currentUser.role}
                  </span>
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-stone-900 hover:bg-stone-800 border border-stone-850 p-2 rounded-xl text-stone-400 hover:text-red-400 transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <span className="text-xs text-stone-400 font-mono italic">Guest view program</span>
          )}
        </div>
      </header>

      {/* DETAILED ROOT NAVIGATION BAR */}
      {currentUser && (
        <nav className="bg-stone-900/40 border-b border-stone-850/80 overflow-x-auto flex px-6 shrink-0 z-50 sticky top-0 selection:bg-amber-400 select-none font-sans">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'scunts', label: 'Scout Register', icon: Users },
            { id: 'badges', label: 'SLSA Badges', icon: Award },
            { id: 'attendance', label: 'Attendance', icon: Calendar },
            { id: 'events', label: 'Events', icon: Calendar },
            { id: 'awards', label: 'State Awards', icon: Trophy },
            { id: 'library', label: 'E-Library', icon: BookOpen },
            { id: 'albums', label: 'Photo Cabinets', icon: Image },
            { id: 'chats', label: 'Council Chat', icon: MessageSquare },
            { id: 'profile', label: 'My Progress', icon: UserIcon },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'about', label: 'Troop Profile', icon: Info }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 px-4 text-xs font-bold tracking-wide uppercase border-b-2 flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
                  activeTab === tab.id 
                    ? 'border-amber-500 text-amber-500' 
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            );
          })}
        </nav>
      )}

      {/* CORE DISPLAY CANVAS */}
      <main className="flex-1 overflow-y-auto px-6 py-6 max-w-7xl w-full mx-auto pb-14">
        {!currentUser ? (
          /* LOGIN SCREEN DIRECTORY fallback */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center justify-center">
            
            {/* Elegant About Troop Card on Left of login to present info */}
            <div className="lg:col-span-6 space-y-5 text-stone-300 font-sans p-2">
              <div className="bg-stone-900/30 border border-stone-850 rounded-2xl p-6 space-y-4">
                <span className="text-[10px] font-bold text-amber-400 uppercase font-mono tracking-widest bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                  ⚜️ TRADITION FROM 1916
                </span>
                <h2 className="text-xl font-extrabold uppercase text-white font-serif tracking-tight">
                  ABOUT THE 51ST COLOMBO SCOUT TROOP
                </h2>
                <p className="text-xs text-stone-400 leading-relaxed font-sans">
                  Founded at <strong className="text-stone-200">Ananda Sastralaya Kotte</strong>, our troop remains an elite flagship division of the Sri Lanka Scout Association. Decades of outdoor endurance, national level community service, and outstanding scout badges leadership forms our core value.
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-stone-950 p-3 rounded-lg border border-stone-850">
                    <span className="text-amber-400 font-bold block">HQ Base</span>
                    <span className="text-stone-400 text-[11px]">Kotte, Sri Lanka</span>
                  </div>
                  <div className="bg-stone-950 p-3 rounded-lg border border-stone-850">
                    <span className="text-amber-400 font-bold block">Troop Registry</span>
                    <span className="text-stone-400 text-[11px]">51st Colombo District</span>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-bold text-stone-200 uppercase font-mono tracking-wider mb-2">
                    ⚜️ Our Active Scout Patrol Birds
                  </h4>
                  <div className="flex flex-wrap gap-2 text-[11px] text-stone-400 font-serif">
                    {['Salalihini 🐦', 'Woodpecker 🪵', 'Pigeon 🕊️', 'Eagle 🦅', 'Parrot 🦜', 'Kingfisher 🐟', 'Hawk 🦅', 'Senior ⚜️'].map(pBird => (
                      <span key={pBird} className="bg-stone-950/80 border border-stone-850 px-2 py-1 rounded">
                        {pBird}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 flex items-center justify-center">
              <LoginScreen onLoginSuccess={handleLoginSuccess} />
            </div>

          </div>
        ) : (
          /* ACTIVE SESSION SECTIONS */
          <div className="animate-fadeIn">
            {activeTab === 'dashboard' && (
              <Dashboard 
                scouts={scouts}
                badges={badges}
                events={events}
                auditLogs={auditLogs}
                storage={storage}
                patrols={patrols}
                onAdjustStorage={handleAdjustStorage}
                onClearChats={handleClearChats}
                reports={reports}
                currentUser={currentUser}
                onResolveReport={handleResolveReport}
              />
            )}

            {activeTab === 'scunts' && (
              <ScoutsList 
                scouts={scouts}
                currentUser={currentUser}
                patrols={patrols}
                allBadges={badges}
                allAwards={awards}
                attendance={attendance}
                onAddScout={handleAddScout}
                onUpdateScout={handleUpdateScout}
                onDeleteScout={handleDeleteScout}
                onAddNewPatrol={handleAddNewPatrol}
                onRemovePatrol={handleRemovePatrol}
                onUpdateSelfCredentials={handleUpdateSelfCredentials}
              />
            )}

            {activeTab === 'badges' && (
              <BadgesGrid 
                badges={badges}
                scouts={scouts}
                currentUser={currentUser}
                onAddBadge={handleAddBadge}
                onUpdateBadge={handleUpdateBadge}
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceRegister 
                scouts={scouts}
                attendance={attendance}
                currentUser={currentUser}
                onSaveAttendance={handleSaveAttendance}
              />
            )}

            {activeTab === 'events' && (
              <EventsCalendar 
                events={events}
                currentUser={currentUser}
                onAddEvent={handleAddEvent}
              />
            )}

            {activeTab === 'awards' && (
              <AwardsPanel 
                awards={awards}
                scouts={scouts}
                currentUser={currentUser}
                onAddAward={handleAddAward}
                onUpdateAward={handleUpdateAward}
                onGrantAwardToScout={handleGrantAwardToScout}
              />
            )}

            {activeTab === 'library' && (
              <Library 
                library={library}
                currentUser={currentUser}
                onAddDoc={handleAddLibraryDoc}
                onDeleteDoc={handleDeleteLibraryDoc}
              />
            )}

            {activeTab === 'albums' && (
              <Albums 
                albums={albums}
                currentUser={currentUser}
                onCreateAlbum={handleCreateAlbum}
                onAddPhotoToAlbum={handleAddPhotoToAlbum}
              />
            )}

            {activeTab === 'chats' && (
              <Chatroom 
                chats={chats}
                currentUser={currentUser}
                onSendMessage={handleSendMessage}
                onClearChats={handleClearChats}
              />
            )}

            {activeTab === 'profile' && (
              <MyProfile 
                currentUser={currentUser}
                scouts={scouts}
                badges={badges}
                awards={awards}
                attendance={attendance}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsPanel 
                currentUser={currentUser}
                storage={storage}
                onAdjustStorage={handleAdjustStorage}
                onUpdateDigestSettings={handleUpdateDigestSettings}
                onClearChats={handleClearChats}
                onUpdateSelfCredentials={handleUpdateSelfCredentials}
                users={users}
                scouts={scouts}
                onApproveUser={handleApproveUser}
                onRejectUser={handleRejectUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
              />
            )}

            {activeTab === 'about' && (
              /* EXPLICIT Troop History and Profile Screen */
              <div className="max-w-4xl mx-auto space-y-6">
                <ContactTable users={users} />

                <div className="bg-stone-900/40 border border-stone-800 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center gap-3 border-b border-stone-800 pb-3">
                    <Building className="w-6 h-6 text-amber-500 animate-pulse" />
                    <h2 className="text-base font-extrabold text-white tracking-widest uppercase">
                      51st Colombo Scout Troop Base History
                    </h2>
                  </div>

                  <p className="text-xs text-stone-300 leading-relaxed font-sans">
                    Founded in Colombo district at <strong className="text-amber-400">Ananda Sastralaya Kotte</strong>, our troop remains highly decorated for producing elite, dedicated, community-mindful king scouts and leaders across generations under the Sri Lanka Scout Association curriculum.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="bg-stone-950 p-4 border border-stone-850 rounded-xl space-y-1">
                      <span className="text-xs font-bold text-amber-400 font-mono uppercase block">⚜ HQ Address</span>
                      <p className="text-[11px] text-stone-400">Ananda Sastralaya premises, Kotte, Western Province, Sri Lanka.</p>
                    </div>

                    <div className="bg-stone-950 p-4 border border-stone-850 rounded-xl space-y-1">
                      <span className="text-xs font-bold text-amber-500 font-mono uppercase block">📞 Contacts</span>
                      <p className="text-[11px] text-stone-400">managementsystermscout@gmail.com · Colombo District Association.</p>
                    </div>
                  </div>

                  <div className="bg-stone-950/60 p-4 border border-stone-850 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-stone-300 uppercase font-mono tracking-widest block">🛡️ LEADERSHIP COUNCILS</span>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-stone-300">
                        <span>Dineth Jayasuriya</span>
                        <span className="text-amber-500 font-mono font-bold text-[10px]">ADMIN / TROOP LEADER</span>
                      </div>
                      <div className="flex justify-between text-stone-300">
                        <span>Manusha Bimsara</span>
                        <span className="text-amber-500 font-mono font-bold text-[10px]">ADMIN / CO-ORDINATOR</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Integration of Member Discrepancy Reporting Form */}
                {currentUser?.role !== 'admin' ? (
                  <ReportForm 
                    onSubmitReport={handleSubmitReport}
                    myReports={reports.filter(r => r.reporterId === currentUser?.id)}
                  />
                ) : (
                  <div className="bg-stone-900/40 border border-stone-850 p-6 rounded-2xl text-center space-y-2">
                    <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded tracking-wide">
                      🛡️ Administrative Mode Active
                    </span>
                    <h3 className="font-extrabold text-white text-xs tracking-wider uppercase font-serif">Administrative Report Controls</h3>
                    <p className="text-[11px] text-stone-400 max-w-sm mx-auto leading-relaxed">
                      As an authorized Administrator, you are responsible for monitoring and resolving member disparity reports via the Admin Dashboard. Self-reporting is restricted.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

    </div>
  );
}
