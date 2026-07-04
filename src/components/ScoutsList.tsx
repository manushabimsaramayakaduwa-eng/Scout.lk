import React, { useState } from 'react';
import { 
  Users, Search, UserCheck, Plus, CheckSquare, Edit, Trash2, Shield, Eye, Mail, Phone, MapPin, 
  User, Calendar, Smartphone, FileText, Globe, Key, AlertCircle, RefreshCw, Download
} from 'lucide-react';
import { ScoutMember, ScoutPosition, User as UserType, Badge, Award, AttendanceRecord } from '../types';

interface ScoutsListProps {
  scouts: ScoutMember[];
  currentUser: UserType;
  patrols: string[];
  allBadges: Badge[];
  allAwards: Award[];
  attendance?: AttendanceRecord[];
  onAddScout: (scout: Omit<ScoutMember, "id">) => void;
  onUpdateScout: (id: string, scout: Partial<ScoutMember>) => void;
  onDeleteScout: (id: string) => void;
  onAddNewPatrol: (name: string) => void;
  onRemovePatrol: (name: string) => void;
  onUpdateSelfCredentials: (password: string, username: string, name: string, email: string, whatsapp: string, address: string, parentPhone: string) => void;
}

const highlightMatch = (text: string, query: string) => {
  if (!text) return <React.Fragment />;
  if (!query.trim()) return <span>{text}</span>;

  try {
    const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-amber-400 text-stone-950 font-semibold rounded-sm px-0.5 selection:bg-stone-950 selection:text-amber-400">{part}</mark>
          ) : (
            part
          )
        )}
      </>
    );
  } catch (e) {
    return <span>{text}</span>;
  }
};

const handleDownloadPhoto = async (photoUrl: string, scoutName: string) => {
  if (!photoUrl) return;
  try {
    if (photoUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = photoUrl;
      link.download = `${scoutName.replace(/\s+/g, '_')}_photo.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const response = await fetch(photoUrl, { mode: 'cors' }).catch(() => null);
    if (response) {
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${scoutName.replace(/\s+/g, '_')}_photo.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } else {
      const link = document.createElement('a');
      link.href = photoUrl;
      link.target = "_blank";
      link.download = `${scoutName.replace(/\s+/g, '_')}_photo.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    window.open(photoUrl, '_blank');
  }
};

export default function ScoutsList({
  scouts, currentUser, patrols, allBadges, allAwards, attendance = [], onAddScout, onUpdateScout, onDeleteScout, onAddNewPatrol, onRemovePatrol, onUpdateSelfCredentials
}: ScoutsListProps) {
  const isLeaderOrAdmin = currentUser.role === 'leader' || currentUser.role === 'admin';
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatrol, setSelectedPatrol] = useState<string>('All');
  const [selectedScout, setSelectedScout] = useState<ScoutMember | null>(null);

  // Form toggles
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSelfEditForm, setShowSelfEditForm] = useState(false);
  const [showManagePatrols, setShowManagePatrols] = useState(false);
  const [showReportView, setShowReportView] = useState(false);

  // Patrol actions
  const [newPatrolInput, setNewPatrolInput] = useState('');

  // Add Scout Form State
  const [formFname, setFormFname] = useState('');
  const [formLname, setFormLname] = useState('');
  const [formPhoto, setFormPhoto] = useState('');
  const [formDob, setFormDob] = useState('');
  const [formJoined, setFormJoined] = useState('');
  const [formMembership, setFormMembership] = useState('');
  const [formPatrol, setFormPatrol] = useState(patrols[0] || 'Hawk');
  const [formNic, setFormNic] = useState('');
  const [formPosition, setFormPosition] = useState<ScoutPosition>('Member');
  const [formAddress, setFormAddress] = useState('');
  const [formParentName, setFormParentName] = useState('');
  const [formRelationship, setFormRelationship] = useState('');
  const [formParentPhone, setFormParentPhone] = useState('');
  const [formWhatsapp, setFormWhatsapp] = useState('');
  const [formEmail, setFormEmail ] = useState('');

  // Edit Self Form State
  const [selfName, setSelfName] = useState(currentUser.name);
  const [selfEmail, setSelfEmail] = useState(currentUser.email || '');
  const [selfWhatsapp, setSelfWhatsapp] = useState(currentUser.whatsapp || '');
  const [selfAddress, setSelfAddress] = useState('');
  const [selfParentPhone, setSelfParentPhone] = useState(currentUser.parentPhone || '');
  const [selfUsername, setSelfUsername] = useState(currentUser.username);
  const [selfPassword, setSelfPassword] = useState('');
  const [selfSuccessMsg, setSelfSuccessMsg] = useState('');

  // Editing Scout Detail Modal (Admin perspective)
  const [editScoutForm, setEditScoutForm] = useState<ScoutMember | null>(null);

  // Load self details from scout profile if matching email
  React.useEffect(() => {
    // If logged in user is a scout, try looking up their scout record
    if (currentUser.role === 'scout') {
      const match = scouts.find(s => s.email?.toLowerCase() === currentUser.email?.toLowerCase() || s.membershipNo?.toLowerCase() === currentUser.username?.toLowerCase());
      if (match) {
        setSelfAddress(match.address);
        setSelfName(`${match.firstName} ${match.lastName}`);
        setSelfEmail(match.email);
        setSelfWhatsapp(match.whatsapp);
        setSelfParentPhone(match.parentPhone);
      }
    }
  }, [currentUser, scouts]);

  const handleCreateScout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFname.trim() || !formLname.trim() || !formDob.trim() || !formMembership.trim()) {
      alert('First Name, Last Name, DOB and Membership No are required.');
      return;
    }

    onAddScout({
      firstName: formFname.trim(),
      lastName: formLname.trim(),
      scoutPhoto: formPhoto.trim() || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      dob: formDob,
      dateJoined: formJoined || new Date().toISOString().slice(0, 10),
      membershipNo: formMembership.trim(),
      patrol: formPatrol,
      nic: formNic.trim(),
      position: formPosition,
      address: formAddress.trim(),
      parentName: formParentName.trim(),
      relationship: formRelationship.trim(),
      parentPhone: formParentPhone.trim(),
      whatsapp: formWhatsapp.trim(),
      email: formEmail.trim(),
      badgesEarned: [],
      awardsEarned: []
    });

    // Reset Form
    setFormFname(''); setFormLname(''); setFormPhoto(''); setFormDob(''); setFormJoined('');
    setFormMembership(''); setFormAddress(''); setFormParentName(''); setFormRelationship('');
    setFormParentPhone(''); setFormWhatsapp(''); setFormEmail(''); setFormNic('');
    setShowAddForm(false);
  };

  const handleUpdateSelf = (e: React.FormEvent) => {
    e.preventDefault();
    setSelfSuccessMsg('');
    if (!selfName.trim()) {
      alert('Name cannot be empty.');
      return;
    }
    
    onUpdateSelfCredentials(
      selfPassword,
      selfUsername.trim(),
      selfName.trim(),
      selfEmail.trim(),
      selfWhatsapp.trim(),
      selfAddress.trim(),
      selfParentPhone.trim()
    );

    setSelfSuccessMsg('Profile changes dispatch triggered successfully!');
    setTimeout(() => setSelfSuccessMsg(''), 4000);
  };

  const startEditScout = (scout: ScoutMember) => {
    setEditScoutForm({ ...scout });
  };

  const handleSaveScoutEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editScoutForm) return;

    onUpdateScout(editScoutForm.id, editScoutForm);
    setSelectedScout(editScoutForm);
    setEditScoutForm(null);
    alert('Scout member record updated successfully!');
  };

  // Badge toggle check helper
  const handleToggleBadge = (badgeId: string) => {
    if (!editScoutForm) return;
    const current = editScoutForm.badgesEarned || [];
    const isEarned = current.includes(badgeId);
    let updated;
    if (isEarned) {
      updated = current.filter(id => id !== badgeId);
    } else {
      updated = [...current, badgeId];
    }
    setEditScoutForm({
      ...editScoutForm,
      badgesEarned: updated
    });
  };

  // Medal toggle check helper
  const handleToggleAward = (awardId: string) => {
    if (!editScoutForm) return;
    const current = editScoutForm.awardsEarned || [];
    const isEarned = current.includes(awardId);
    let updated;
    if (isEarned) {
      updated = current.filter(id => id !== awardId);
    } else {
      updated = [...current, awardId];
    }
    setEditScoutForm({
      ...editScoutForm,
      awardsEarned: updated
    });
  };

  const listPositions: ScoutPosition[] = [
    'Member', 'Patrol Leader', 'Asst. Patrol Leader', 'Asst. Troop Leader', 
    'Troop Quatermaster', 'Troop Treasure', 'Senior'
  ];

  // Filtering
  const filteredScouts = scouts.filter(s => {
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesQuery = 
      fullName.includes(query) || 
      s.membershipNo.toLowerCase().includes(query) || 
      s.patrol.toLowerCase().includes(query) ||
      (s.position || "").toLowerCase().includes(query);
    const matchesPatrol = selectedPatrol === 'All' || s.patrol === selectedPatrol;
    return matchesQuery && matchesPatrol;
  });

  return (
    <div className="space-y-6">
      
      {/* Search and Quick Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between pb-4 border-b border-stone-800">
        <div className="flex items-center gap-2 bg-stone-900/60 border border-stone-800/80 px-3 py-1.5 rounded-lg w-full md:max-w-md">
          <Search className="w-4 h-4 text-stone-500" />
          <input
            type="text"
            className="bg-transparent text-xs text-stone-100 outline-none w-full"
            placeholder="Search Scouts by name, membership No, patrol, or rank..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Patrol Fast Select */}
          <select
            className="bg-stone-900 border border-stone-800 text-stone-200 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-amber-500"
            value={selectedPatrol}
            onChange={(e) => setSelectedPatrol(e.target.value)}
          >
            <option value="All">All Patrols</option>
            {patrols.map(ptl => (
              <option key={ptl} value={ptl}>{ptl} Patrol</option>
            ))}
          </select>

          {/* Self Edit Trigger */}
          <button
            onClick={() => { setShowSelfEditForm(!showSelfEditForm); setShowAddForm(false); setShowManagePatrols(false); }}
            className={`text-xs ml-auto font-semibold px-3 py-1.5 rounded-lg border transition ${
              showSelfEditForm ? 'bg-amber-500 border-amber-500 text-stone-950' : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-stone-100'
            }`}
          >
            <Key className="w-3.5 h-3.5 inline mr-1.5" /> Editable Account &amp; Passwords
          </button>

          {/* Manage Patrols Trigger */}
          {isLeaderOrAdmin && (
            <button
              onClick={() => { setShowManagePatrols(!showManagePatrols); setShowSelfEditForm(false); setShowAddForm(false); }}
              className="bg-stone-900 border border-stone-800 text-stone-300 hover:text-stone-100 text-xs font-semibold px-3 py-1.5 rounded-lg"
            >
              ⚜ Patrols
            </button>
          )}

          {/* Create Scout Member Button */}
          {isLeaderOrAdmin && (
            <button
              onClick={() => { setShowAddForm(!showAddForm); setShowSelfEditForm(false); setShowManagePatrols(false); setShowReportView(false); }}
              className="bg-amber-500 text-stone-950 font-bold text-xs px-4 py-1.5 rounded-lg hover:bg-amber-400 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Member
            </button>
          )}

          {/* Generate Members Report Button (Leaders & Admins Only) */}
          {isLeaderOrAdmin && (
            <button
              onClick={() => { setShowReportView(!showReportView); setShowAddForm(false); setShowSelfEditForm(false); setShowManagePatrols(false); }}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg border transition flex items-center gap-1.5 cursor-pointer ${
                showReportView ? 'bg-amber-500 border-amber-500 text-stone-950 font-bold' : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-stone-100 hover:border-amber-500/40'
              }`}
            >
              <FileText className="w-4 h-4 text-amber-500" /> Members Report
            </button>
          )}
        </div>
      </div>

      {/* Edit Self Panel */}
      {showSelfEditForm && (
        <div className="bg-stone-900/60 border border-amber-500/30 rounded-xl p-5 shadow-lg max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-800 pb-2">
            <User className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-stone-100 uppercase font-mono tracking-wide">
              Logged User Profile Updates ({currentUser.role.toUpperCase()})
            </h3>
          </div>

          <p className="text-xs text-stone-400 font-sans leading-relaxed">
            {currentUser.role === 'scout' 
              ? 'As a Scout Member, you can update your Name, Email, WhatsApp Phone, Address, Parents Contact. Other administrative fields require leadership access.'
              : 'As an Admin/Leader, you can change your display credentials, username, passwords, email, and WhatsApp details.'}
          </p>

          <form onSubmit={handleUpdateSelf} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-stone-400 mb-1 font-mono uppercase">Full Name</label>
              <input
                type="text"
                className="w-full bg-stone-950/80 border border-stone-800 rounded px-3 py-1.5 text-xs text-stone-100 outline-none"
                value={selfName}
                onChange={(e) => setSelfName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-stone-400 mb-1 font-mono uppercase font-mono uppercase">Account Username</label>
              <input
                type="text"
                className="w-full bg-stone-950/80 border border-stone-800 rounded px-3 py-1.5 text-xs text-stone-100 outline-none"
                value={selfUsername}
                onChange={(e) => setSelfUsername(e.target.value)}
                disabled={currentUser.role === 'scout'} // scout log username is fixed to membership
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-stone-400 mb-1 font-mono uppercase">Update Password (Leave empty to keep existing)</label>
              <input
                type="password"
                className="w-full bg-stone-950/80 border border-stone-800 rounded px-3 py-1.5 text-xs text-stone-100 outline-none"
                placeholder="••••••••"
                value={selfPassword}
                onChange={(e) => setSelfPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-stone-400 mb-1 font-mono uppercase">E-mail</label>
              <input
                type="email"
                className="w-full bg-stone-950/80 border border-stone-800 rounded px-3 py-1.5 text-xs text-stone-100 outline-none"
                value={selfEmail}
                onChange={(e) => setSelfEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-stone-400 mb-1 font-mono uppercase">WhatsApp No</label>
              <input
                type="text"
                className="w-full bg-stone-950/80 border border-stone-800 rounded px-3 py-1.5 text-xs text-stone-100 outline-none"
                value={selfWhatsapp}
                onChange={(e) => setSelfWhatsapp(e.target.value)}
              />
            </div>

            {currentUser.role === 'scout' && (
              <>
                <div>
                  <label className="block text-[10px] font-semibold text-stone-400 mb-1 font-mono uppercase">Parents Contact Number</label>
                  <input
                    type="text"
                    className="w-full bg-stone-950/80 border border-stone-800 rounded px-3 py-1.5 text-xs text-stone-100 outline-none"
                    value={selfParentPhone}
                    onChange={(e) => setSelfParentPhone(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-semibold text-stone-400 mb-1 font-mono uppercase">Home Address</label>
                  <textarea
                    className="w-full bg-stone-950/80 border border-stone-800 rounded px-3 py-1.5 text-xs text-stone-100 outline-none h-14 resize-none"
                    value={selfAddress}
                    onChange={(e) => setSelfAddress(e.target.value)}
                  />
                </div>
              </>
            )}

            {selfSuccessMsg && (
              <div className="md:col-span-2 bg-emerald-900/30 border border-emerald-500/40 p-3 rounded-lg text-xs text-emerald-300">
                {selfSuccessMsg}
              </div>
            )}

            <div className="md:col-span-2 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowSelfEditForm(false)}
                className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-1.5 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-4 py-1.5 rounded"
              >
                Publish Profile Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Manage Patrols UI */}
      {showManagePatrols && (
        <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-5 max-w-xl mx-auto space-y-4">
          <h4 className="text-xs font-bold text-amber-500 uppercase font-mono tracking-wider">Patrol Directory Configuration</h4>
          
          <div className="flex gap-2">
            <input
              type="text"
              className="bg-stone-950 text-xs border border-stone-800 rounded px-3 py-2 text-stone-100 outline-none flex-1 focus:border-amber-500"
              placeholder="e.g. Kingfisher"
              value={newPatrolInput}
              onChange={(e) => setNewPatrolInput(e.target.value)}
            />
            <button
              onClick={() => {
                if (newPatrolInput.trim()) {
                  onAddNewPatrol(newPatrolInput.trim());
                  setNewPatrolInput('');
                }
              }}
              className="bg-amber-500 text-stone-950 text-xs font-semibold px-4 py-2 rounded-lg"
            >
              Add Patrol Group
            </button>
          </div>

          <p className="text-[10px] text-stone-500">
            Official Colombo Scout Patrol Groups: Salalihini, Woodpecker, Pigeon, Eagle, Parrot, Kingfisher, Hawk, Senior.
          </p>

          <div className="border border-stone-800/80 rounded-lg p-3 grid grid-cols-2 gap-2">
            {patrols.map(p => (
              <div key={p} className="flex items-center justify-between bg-stone-950/60 px-2.5 py-1.5 rounded border border-stone-900">
                <span className="text-xs font-semibold text-stone-200">{p}</span>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete ${p} Patrol? Scouts will default to Hawk.`)) {
                      onRemovePatrol(p);
                    }
                  }}
                  className="text-red-500 hover:text-red-400 p-0.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Scout Form */}
      {showAddForm && (
        <form onSubmit={handleCreateScout} className="bg-stone-900/40 border border-stone-800 p-6 rounded-xl space-y-4 max-w-3xl mx-auto animate-fadeIn">
          <h3 className="font-bold text-sm text-stone-100 uppercase tracking-widest border-b border-stone-800 pb-2">
            ⚜ Troop registration entry form
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-stone-400 mb-1 font-mono uppercase">First Name *</label>
              <input
                type="text"
                className="w-full bg-stone-950 text-xs border border-stone-800 rounded px-3 py-2 text-stone-100 outline-none focus:border-amber-500"
                placeholder="Kasun"
                required
                value={formFname}
                onChange={(e) => setFormFname(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-stone-400 mb-1 font-mono uppercase">Last Name *</label>
              <input
                type="text"
                className="w-full bg-stone-950 text-xs border border-stone-800 rounded px-3 py-2 text-stone-100 outline-none focus:border-amber-500"
                placeholder="Perera"
                required
                value={formLname}
                onChange={(e) => setFormLname(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-stone-400 mb-1 font-mono uppercase">Scout Photo URL (Optional)</label>
              <input
                type="text"
                className="w-full bg-stone-950 text-xs border border-stone-800 rounded px-3 py-2 text-stone-100 outline-none"
                placeholder="Paste avatar URL or leave blank"
                value={formPhoto}
                onChange={(e) => setFormPhoto(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-stone-400 mb-1 font-mono uppercase">Date Of Birth *</label>
              <input
                type="date"
                className="w-full bg-stone-950 text-xs border border-stone-800 rounded px-3 py-2 text-stone-100 outline-none"
                required
                value={formDob}
                onChange={(e) => setFormDob(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-stone-400 mb-1 font-mono uppercase">Date of Joining</label>
              <input
                type="date"
                className="w-full bg-stone-950 text-xs border border-stone-800 rounded px-3 py-2 text-stone-100 outline-none"
                value={formJoined}
                onChange={(e) => setFormJoined(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-stone-400 mb-1 font-mono uppercase">Membership No *</label>
              <input
                type="text"
                className="w-full bg-stone-950 text-xs border border-stone-800 rounded px-3 py-2 text-stone-100 outline-none"
                placeholder="CMB/51/2026/04"
                required
                value={formMembership}
                onChange={(e) => setFormMembership(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-stone-400 mb-1 font-mono uppercase">Patrol Group</label>
              <select
                className="w-full bg-stone-950 text-xs border border-stone-800 rounded px-3 py-2 text-stone-100 outline-none"
                value={formPatrol}
                onChange={(e) => setFormPatrol(e.target.value)}
              >
                {patrols.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-stone-400 mb-1 font-mono uppercase">NIC Number (National Identity Card)</label>
              <input
                type="text"
                className="w-full bg-stone-950 text-xs border border-stone-800 rounded px-3 py-2 text-stone-100 outline-none"
                placeholder="Optional for youngsters"
                value={formNic}
                onChange={(e) => setFormNic(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-stone-400 mb-1 font-mono uppercase">E-mail Address</label>
              <input
                type="email"
                className="w-full bg-stone-950 text-xs border border-stone-800 rounded px-3 py-2 text-stone-100 outline-none"
                placeholder="scoutemail@gmail.com"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-stone-400 mb-2 font-mono uppercase">Position (Choose one)</label>
            <div className="flex flex-wrap gap-2.5">
              {listPositions.map(pos => (
                <label key={pos} className="flex items-center gap-1.5 bg-stone-950 px-3 py-1.5 rounded-lg text-xs border border-stone-800 cursor-pointer hover:border-amber-500 transition select-none">
                  <input
                    type="radio"
                    name="position"
                    className="accent-amber-500"
                    checked={formPosition === pos}
                    onChange={() => setFormPosition(pos)}
                  />
                  <span>{pos}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-stone-400 mb-1 font-mono uppercase">Parent's Full Name</label>
              <input
                type="text"
                className="w-full bg-stone-950 text-xs border border-stone-800 rounded px-3 py-2 text-stone-100 outline-none"
                placeholder="Parent Guardian"
                value={formParentName}
                onChange={(e) => setFormParentName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-stone-400 mb-1 font-mono uppercase">Relationship to Scout</label>
              <input
                type="text"
                className="w-full bg-stone-950 text-xs border border-stone-800 rounded px-3 py-2 text-stone-100 outline-none"
                placeholder="Father/Mother/Uncle"
                value={formRelationship}
                onChange={(e) => setFormRelationship(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-stone-400 mb-1 font-mono uppercase">Parent Contact Phone *</label>
              <input
                type="text"
                className="w-full bg-stone-950 text-xs border border-stone-800 rounded px-3 py-2 text-stone-100 outline-none"
                placeholder="+94 77 123 4567"
                required
                value={formParentPhone}
                onChange={(e) => setFormParentPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-stone-400 mb-1 font-mono uppercase">WhatsApp Number</label>
              <input
                type="text"
                className="w-full bg-stone-950 text-xs border border-stone-800 rounded px-3 py-2 text-stone-100 outline-none"
                placeholder="+94 WhatsApp"
                value={formWhatsapp}
                onChange={(e) => setFormWhatsapp(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-stone-400 mb-1 font-mono uppercase">Home Address</label>
              <textarea
                className="w-full bg-stone-950 text-xs border border-stone-800 rounded px-3 py-2 text-stone-100 outline-none h-10 resize-none"
                placeholder="Home Address"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 text-xs">
            <button
              type="button"
              className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-4 py-2 rounded-lg"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-amber-500 font-bold hover:bg-amber-400 text-stone-950 px-5 py-2 rounded-lg"
            >
              Confirm Registration
            </button>
          </div>
        </form>
      )}

      {/* Printable / Viewable Simple Members Report */}
      {showReportView && isLeaderOrAdmin && (
        <div className="bg-stone-900/45 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-6 animate-fadeIn font-sans">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-850 pb-4">
            <div>
              <h3 className="text-sm font-bold text-stone-100 uppercase font-mono tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-500" /> Executive Troop Members Registry Report
              </h3>
              <p className="text-[10px] text-stone-400 font-mono uppercase mt-0.5">
                51st Colombo Scout Troop Base · Generated on {new Date().toISOString().slice(0, 10)}
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold px-4 py-1.5 rounded-lg transition shadow-md hover:shadow-amber-500/10 cursor-pointer"
              >
                🖨️ Print / Save PDF
              </button>
              <button
                type="button"
                onClick={() => setShowReportView(false)}
                className="bg-stone-800 hover:bg-stone-750 text-xs text-stone-300 hover:text-stone-100 px-3 py-1.5 rounded-lg border border-stone-700 transition cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>

          {/* Core Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-stone-950/80 p-4 rounded-xl border border-stone-850 space-y-1">
              <span className="text-[10px] text-stone-500 font-mono uppercase block font-bold">Total Roster Scouts</span>
              <span className="text-lg font-black text-stone-200">{filteredScouts.length} Members</span>
            </div>
            <div className="bg-stone-950/80 p-4 rounded-xl border border-stone-850 space-y-1">
              <span className="text-[10px] text-stone-500 font-mono uppercase block font-bold">Total Badges Earned</span>
              <span className="text-lg font-black text-amber-500">
                {filteredScouts.reduce((sum, s) => sum + (s.badgesEarned?.length || 0), 0)} Badges
              </span>
            </div>
            <div className="bg-stone-950/80 p-4 rounded-xl border border-stone-850 space-y-1">
              <span className="text-[10px] text-stone-500 font-mono uppercase block font-bold">State Awards Shelf</span>
              <span className="text-lg font-black text-indigo-400">
                {filteredScouts.reduce((sum, s) => sum + (s.awardsEarned?.length || 0), 0)} Medals
              </span>
            </div>
            <div className="bg-stone-950/80 p-4 rounded-xl border border-stone-850 space-y-1">
              <span className="text-[10px] text-stone-500 font-mono uppercase block font-bold">Average Attendance</span>
              <span className="text-lg font-black text-emerald-500">
                {(() => {
                  if (attendance.length === 0 || filteredScouts.length === 0) return "0%";
                  let sumRate = 0;
                  filteredScouts.forEach(s => {
                    const attended = attendance.filter(r => r.presentIds.includes(s.id)).length;
                    sumRate += (attended / attendance.length);
                  });
                  return `${Math.round((sumRate / filteredScouts.length) * 100)}%`;
                })()}
              </span>
            </div>
          </div>

          {/* Roster Report Table */}
          <div className="overflow-x-auto border border-stone-850 rounded-xl bg-stone-950 max-h-[450px]">
            <table className="w-full text-left text-xs border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-stone-850 bg-stone-900/40 text-[10px] text-stone-500 uppercase tracking-widest font-mono">
                  <th className="py-3 px-4">Scout Name & ID</th>
                  <th className="py-3 px-4">Patrol & Designation</th>
                  <th className="py-3 px-4 text-center">Badges</th>
                  <th className="py-3 px-4 text-center">Awards</th>
                  <th className="py-3 px-4 text-center">Attendance</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Parent Guardian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-850 text-stone-300">
                {filteredScouts.map(s => {
                  const sAttended = attendance.filter(rec => rec.presentIds.includes(s.id)).length;
                  const attPercent = attendance.length > 0 ? Math.round((sAttended / attendance.length) * 100) : 0;
                  return (
                    <tr key={s.id} className="hover:bg-stone-900/20 text-stone-300 transition">
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-stone-100">{highlightMatch(`${s.firstName} ${s.lastName}`, searchQuery)}</div>
                        <div className="text-[10px] text-stone-400 font-mono">{highlightMatch(s.membershipNo, searchQuery)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-stone-300">{highlightMatch(s.patrol, searchQuery)} Patrol</div>
                        <div className="text-[10px] text-amber-500 font-mono font-semibold tracking-wide uppercase">{highlightMatch(s.position, searchQuery)}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-stone-200">
                        {s.badgesEarned?.length || 0}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-indigo-400">
                        {s.awardsEarned?.length || 0}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          attPercent >= 80 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {attPercent}%
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] space-y-0.5">
                        <div className="truncate max-w-[160px]">{s.email || 'No email registered'}</div>
                        <div className="text-stone-400 font-semibold">{s.whatsapp || 'No WhatsApp'}</div>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-stone-400 max-w-[180px] truncate">
                        <div className="font-bold text-stone-300">{s.parentName || 'None'}</div>
                        <div className="text-[10px] text-stone-500 font-mono">
                          {s.relationship || 'Guardian'} · {s.parentPhone || 'No Phone'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-stone-500 font-mono italic text-right">
            * This report is restricted on-demand view only for troop leaders and administrators. Do not share credentials.
          </p>
        </div>
      )}

      {/* Grid of Scouts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredScouts.length === 0 ? (
          <div className="col-span-full py-16 text-center text-stone-500 text-xs font-mono">
            No scouts found reflecting details.
          </div>
        ) : (
          filteredScouts.map(s => {
            const positionsEarnedCount = s.badgesEarned?.length || 0;
            return (
              <div 
                key={s.id} 
                onClick={() => setSelectedScout(s)}
                className="bg-stone-900/40 border border-stone-800/80 rounded-xl p-4 cursor-pointer hover:border-amber-500/40 hover:-translate-y-0.5 transition flex gap-3 h-32 relative group"
              >
                <div className="w-16 h-16 rounded-lg bg-stone-800 shrink-0 overflow-hidden border border-stone-800 relative self-center">
                  <img
                    src={s.scoutPhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                    alt="Scout"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between truncate pr-2">
                  <div className="truncate">
                    <span className="text-[10px] font-bold text-amber-500 tracking-wider font-mono uppercase bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 mr-1.5 inline-block my-0.5">
                      {highlightMatch(s.position, searchQuery)}
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono inline-block">
                      {highlightMatch(s.patrol, searchQuery)}
                    </span>
                    <h4 className="text-sm font-bold text-stone-100 truncate mt-0.5 group-hover:text-amber-400 transition">
                      {highlightMatch(`${s.firstName} ${s.lastName}`, searchQuery)}
                    </h4>
                    <p className="text-[10px] text-stone-500 font-mono truncate mt-0.5">{highlightMatch(s.membershipNo, searchQuery)}</p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono border-t border-stone-800/60 pt-1">
                    <span>🎖️ {positionsEarnedCount} Badges</span>
                    <span>🏆 {s.awardsEarned?.length || 0} Awards</span>
                  </div>
                </div>

                <div className="absolute right-3 top-3 bg-stone-950 p-1 rounded border border-stone-800 opacity-0 group-hover:opacity-100 transition">
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Scout Detail Modal */}
      {selectedScout && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-100 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 w-full max-w-2xl text-stone-100 space-y-4 shadow-2xl">
            
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <div className="w-16 h-16 rounded-xl bg-stone-800 overflow-hidden border border-stone-800 shadow-inner">
                    <img
                      src={selectedScout.scoutPhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                      alt="Scout Profile"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {selectedScout.scoutPhoto && (
                    <button
                      onClick={() => handleDownloadPhoto(selectedScout.scoutPhoto!, `${selectedScout.firstName}_${selectedScout.lastName}`)}
                      className="text-[10px] text-amber-500 hover:text-amber-400 font-mono font-semibold flex items-center gap-1 bg-stone-950 px-1.5 py-0.5 rounded border border-stone-850 hover:border-amber-500/20 transition cursor-pointer"
                      title="Download Member Photo"
                    >
                      <Download className="w-2.5 h-2.5" /> Download
                    </button>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-100">{selectedScout.firstName} {selectedScout.lastName}</h3>
                  <p className="text-xs text-amber-500 font-mono uppercase">{selectedScout.position} · {selectedScout.patrol} Patrol</p>
                  <p className="text-[11px] text-stone-400 font-mono">ID No: {selectedScout.membershipNo}</p>
                </div>
              </div>

              <div className="flex gap-1.5">
                {isLeaderOrAdmin && (
                  <>
                    <button
                      onClick={() => startEditScout(selectedScout)}
                      className="bg-amber-500 text-stone-950 hover:bg-amber-400 text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1 transition"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit Record
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${selectedScout.firstName} ${selectedScout.lastName} permanently from troop dataset?`)) {
                          onDeleteScout(selectedScout.id);
                          setSelectedScout(null);
                        }
                      }}
                      className="bg-red-950/40 text-red-400 hover:bg-red-900/30 text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1 transition border border-red-800/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedScout(null)}
                  className="bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold px-3 py-1.5 rounded"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans mt-2">
              <div className="bg-stone-950/40 border border-stone-800/60 p-4 rounded-xl space-y-2">
                <h4 className="text-stone-400 font-bold uppercase font-mono tracking-wider mb-2">Member Metadata</h4>
                <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-stone-500" /> <span>DOB: {selectedScout.dob}</span></div>
                {selectedScout.dateJoined && (
                  <div className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-stone-500" /> <span>Joined: {selectedScout.dateJoined}</span></div>
                )}
                {selectedScout.nic && (
                  <div className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-stone-500" /> <span>NIC No: <span className="text-amber-500">{selectedScout.nic}</span></span></div>
                )}
                <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-stone-500" /> <span>Address: {selectedScout.address || "No address supplied"}</span></div>
              </div>

              <div className="bg-stone-950/40 border border-stone-800/60 p-4 rounded-xl space-y-2">
                <h4 className="text-stone-400 font-bold uppercase font-mono tracking-wider mb-2">Family &amp; Contact info</h4>
                <div className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-stone-500" /> <span>Parent: {selectedScout.parentName} ({selectedScout.relationship})</span></div>
                <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-stone-500" /> <span>Parent Phone: {selectedScout.parentPhone || "Not specified"}</span></div>
                <div className="flex items-center gap-2"><Smartphone className="w-3.5 h-3.5 text-stone-500" /> <span>WhatsApp: {selectedScout.whatsapp || "Not specified"}</span></div>
                <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-stone-500" /> <span>E-mail: {selectedScout.email || "Not specified"}</span></div>
              </div>
            </div>

            {/* Badges Earned Section */}
            <div className="bg-stone-950/40 border border-stone-800/60 p-4 rounded-xl space-y-2 text-xs">
              <h4 className="text-stone-400 font-bold uppercase font-mono tracking-wider">Earned Proficiency Badges ({selectedScout.badgesEarned?.length || 0})</h4>
              <div className="flex flex-wrap gap-2 pt-1.5">
                {(selectedScout.badgesEarned || []).length === 0 ? (
                  <span className="text-stone-600 italic">No badges earned in this catalog yet.</span>
                ) : (
                  (selectedScout.badgesEarned || []).map(bId => {
                    const match = allBadges.find(b => b.id === bId);
                    return (
                      <span key={bId} className="bg-stone-900 border border-stone-800 px-2.5 py-1 text-xs text-stone-300 rounded-lg flex items-center gap-1 mb-1 shadow-sm">
                        🎖️ {match ? `${match.name} [${match.category}]` : 'Special Badge'}
                      </span>
                    );
                  })
                )}
              </div>
            </div>

            {/* Awards Earned Section */}
            <div className="bg-stone-950/40 border border-stone-800/60 p-4 rounded-xl space-y-2 text-xs">
              <h4 className="text-stone-400 font-bold uppercase font-mono tracking-wider">Scout Awards / Honours ({selectedScout.awardsEarned?.length || 0})</h4>
              <div className="flex flex-wrap gap-2 pt-1.5">
                {(selectedScout.awardsEarned || []).length === 0 ? (
                  <span className="text-stone-600 italic">No awards listed on profile.</span>
                ) : (
                  (selectedScout.awardsEarned || []).map(awId => {
                    const match = allAwards.find(a => a.id === awId);
                    return (
                      <span key={awId} className="bg-amber-500/10 border border-amber-500/35 px-2.5 py-1 text-xs text-amber-400 rounded-lg flex items-center gap-1 mb-1 shadow-sm font-semibold">
                        🏆 {match ? match.name : 'Special Honours'}
                      </span>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Admin/Leader Editing Scout Modal */}
      {editScoutForm && (
        <div className="fixed inset-0 bg-stone-950/90 backdrop-blur-xs flex items-center justify-center p-4 z-200 overflow-y-auto">
          <form onSubmit={handleSaveScoutEdit} className="bg-stone-900 border border-stone-800 rounded-2xl p-6 w-full max-w-2xl text-stone-100 space-y-4 shadow-2xl">
            
            <div className="flex items-start justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-bold text-stone-100 uppercase font-mono tracking-wider">
                Override Scout Record Info: {editScoutForm.firstName} {editScoutForm.lastName}
              </h3>
              <button
                type="button"
                className="bg-stone-800 text-stone-300 hover:text-stone-100 px-2.5 py-1 rounded"
                onClick={() => setEditScoutForm(null)}
              >
                X
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block text-[10px] text-stone-400 font-mono mb-1 uppercase font-semibold">First Name</label>
                <input
                  type="text"
                  className="w-full bg-stone-950 border border-stone-800 rounded px-2.5 py-1.5 text-stone-100 outline-none"
                  value={editScoutForm.firstName}
                  onChange={(e) => setEditScoutForm({ ...editScoutForm, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] text-stone-400 font-mono mb-1 uppercase font-semibold">Last Name</label>
                <input
                  type="text"
                  className="w-full bg-stone-950 border border-stone-800 rounded px-2.5 py-1.5 text-stone-100 outline-none"
                  value={editScoutForm.lastName}
                  onChange={(e) => setEditScoutForm({ ...editScoutForm, lastName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] text-stone-400 font-mono mb-1 uppercase font-semibold">Patrol Group</label>
                <select
                  className="w-full bg-stone-950 border border-stone-800 rounded px-2.5 py-1.5 text-stone-100 outline-none"
                  value={editScoutForm.patrol}
                  onChange={(e) => setEditScoutForm({ ...editScoutForm, patrol: e.target.value })}
                >
                  {patrols.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-stone-400 font-mono mb-1 uppercase font-semibold">Troop Officer Designation</label>
                <select
                  className="w-full bg-stone-950 border border-stone-800 rounded px-2.5 py-1.5 text-stone-100 outline-none"
                  value={editScoutForm.position}
                  onChange={(e) => setEditScoutForm({ ...editScoutForm, position: e.target.value as ScoutPosition })}
                >
                  {listPositions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-stone-400 font-mono mb-1 uppercase font-semibold">E-mail</label>
                <input
                  type="email"
                  className="w-full bg-stone-950 border border-stone-800 rounded px-2.5 py-1.5 text-stone-100 outline-none"
                  value={editScoutForm.email}
                  onChange={(e) => setEditScoutForm({ ...editScoutForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] text-stone-400 font-mono mb-1 uppercase font-semibold">WhatsApp Phone</label>
                <input
                  type="text"
                  className="w-full bg-stone-950 border border-stone-800 rounded px-2.5 py-1.5 text-stone-100 outline-none"
                  value={editScoutForm.whatsapp}
                  onChange={(e) => setEditScoutForm({ ...editScoutForm, whatsapp: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] text-stone-400 font-mono mb-1 uppercase font-semibold">NIC number</label>
                <input
                  type="text"
                  className="w-full bg-stone-950 border border-stone-800 rounded px-2.5 py-1.5 text-stone-100 outline-none"
                  value={editScoutForm.nic || ''}
                  onChange={(e) => setEditScoutForm({ ...editScoutForm, nic: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] text-stone-400 font-mono mb-1 uppercase font-semibold">Home Address</label>
                <input
                  type="text"
                  className="w-full bg-stone-950 border border-stone-800 rounded px-2.5 py-1.5 text-stone-100 outline-none"
                  value={editScoutForm.address || ''}
                  onChange={(e) => setEditScoutForm({ ...editScoutForm, address: e.target.value })}
                />
              </div>
            </div>

            {/* Badges Assign (Checkbox selector for administrative update) */}
            <div className="bg-stone-950/50 p-4 border border-stone-850 rounded-xl space-y-1.5">
              <label className="block text-[10px] text-amber-500 font-mono tracking-widest uppercase font-semibold">Proficiency Badges Checklist</label>
              <p className="text-[10px] text-stone-500 font-sans">
                Only scouts can be assigned badges. Admins and leaders can choose which badges are marked earned:
              </p>
              <div className="max-h-24 overflow-y-auto pt-2 grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px]">
                {allBadges.map(b => {
                  const isChecked = (editScoutForm.badgesEarned || []).includes(b.id);
                  return (
                    <label key={b.id} className="flex items-center gap-1.5 cursor-pointer selection:bg-none bg-stone-900 border border-stone-800/80 px-2 py-1 rounded hover:border-amber-500/30">
                      <input
                        type="checkbox"
                        className="accent-amber-500"
                        checked={isChecked}
                        onChange={() => handleToggleBadge(b.id)}
                      />
                      <span className="truncate">{b.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Awards Assign (Checkbox list) */}
            <div className="bg-stone-950/50 p-4 border border-stone-850 rounded-xl space-y-1.5">
              <label className="block text-[10px] text-amber-400 font-mono tracking-widest uppercase font-semibold">State Awards and Honours Checklist</label>
              <div className="max-h-20 overflow-y-auto pt-2 grid grid-cols-2 gap-2 text-[11px]">
                {allAwards.map(a => {
                  const isChecked = (editScoutForm.awardsEarned || []).includes(a.id);
                  return (
                    <label key={a.id} className="flex items-center gap-1.5 cursor-pointer selection:bg-none bg-stone-900 border border-stone-800/80 px-2 py-1 rounded hover:border-amber-500/30">
                      <input
                        type="checkbox"
                        className="accent-amber-500"
                        checked={isChecked}
                        onChange={() => handleToggleAward(a.id)}
                      />
                      <span className="truncate">{a.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs pt-1">
              <button
                type="button"
                className="bg-stone-800 text-stone-200 px-4 py-1.5 rounded"
                onClick={() => setEditScoutForm(null)}
              >
                Cancel Changes
              </button>
              <button
                type="submit"
                className="bg-amber-500 text-stone-950 font-bold px-4 py-1.5 rounded"
              >
                Save Record Overrides
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
