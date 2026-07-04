import React, { useState, useEffect } from 'react';
import { 
  Settings, Key, User, ShieldCheck, Mail, Phone, Trash2, 
  HelpCircle, CheckCircle2, HardDrive, Bell, Power, Sparkles, Building, Code,
  ShieldAlert, Check, X, Edit, Shield
} from 'lucide-react';
import { User as UserType, StorageStatus, ScoutMember } from '../types';

interface SettingsPanelProps {
  currentUser: UserType | null;
  storage: StorageStatus;
  onAdjustStorage: (bytes: number) => void;
  onUpdateDigestSettings: (enabled: boolean, frequency: 'daily' | 'weekly') => Promise<void>;
  onClearChats: () => void;
  onUpdateSelfCredentials: (
    passwordInput: string, usernameInput: string, nameInput: string, 
    emailInput: string, whatsappInput: string, addressInput: string, parentPhoneInput: string
  ) => Promise<void>;
  users: UserType[];
  scouts: ScoutMember[];
  onApproveUser: (userId: string) => Promise<void>;
  onRejectUser: (userId: string) => Promise<void>;
  onUpdateUser: (userId: string, updatedFields: any) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
}

export default function SettingsPanel({ 
  currentUser, storage, onAdjustStorage, onUpdateDigestSettings, onClearChats, onUpdateSelfCredentials,
  users, scouts, onApproveUser, onRejectUser, onUpdateUser, onDeleteUser
}: SettingsPanelProps) {
  
  // Credentials edit form states
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [whatsapp, setWhatsapp] = useState(currentUser?.whatsapp || '');
  const [address, setAddress] = useState('');
  const [parentPhone, setParentPhone] = useState(currentUser?.parentPhone || '');
  const [isUpdatingCreds, setIsUpdatingCreds] = useState(false);
  const [credsSuccess, setCredsSuccess] = useState('');

  // Admin and Troop system configurations
  const [capacityGiga, setCapacityGiga] = useState((storage.totalBytes / 1024 / 1024 / 1024).toFixed(0));
  const [recvEmail, setRecvEmail] = useState(storage.email || 'managementsystermscout@gmail.com');
  const [termYear, setTermYear] = useState('2026/2027');
  const [district] = useState('COLOMBO');
  const [isClearingChats, setIsClearingChats] = useState(false);

  // Email Digest Settings
  const [digestEnabled, setDigestEnabled] = useState(storage.reportDigestEnabled || false);
  const [digestFrequency, setDigestFrequency] = useState<'daily' | 'weekly'>(storage.reportDigestFrequency || 'weekly');
  const [isSavingDigest, setIsSavingDigest] = useState(false);

  // Google Drive Connection & Custom Credentials States
  const [googleStatus, setGoogleStatus] = useState<{ connected: boolean; email: string | null } | null>(null);
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [customClientId, setCustomClientId] = useState('');
  const [customClientSecret, setCustomClientSecret] = useState('');
  const [isSavingCustomKeys, setIsSavingCustomKeys] = useState(false);
  const [showDeveloperCredentials, setShowDeveloperCredentials] = useState(false);

  const fetchGoogleStatus = async () => {
    try {
      const res = await fetch("/api/storage/google-status");
      if (res.ok) {
        const data = await res.json();
        setGoogleStatus(data);
        if (data.email) {
          setRecvEmail(data.email);
        }
      }
    } catch (err) {
      console.error("Failed to fetch Google status:", err);
    }
  };

  useEffect(() => {
    setDigestEnabled(storage.reportDigestEnabled || false);
    setDigestFrequency(storage.reportDigestFrequency || 'weekly');
  }, [storage]);

  useEffect(() => {
    fetchGoogleStatus();

    // Fetch initial custom client keys
    fetch("/api/state")
      .then(r => r.json())
      .then(data => {
        if (data.storage) {
          setCustomClientId(data.storage.customClientId || '');
          setCustomClientSecret(data.storage.customClientSecret || '');
        }
      })
      .catch(err => console.error("Failed to fetch custom keys:", err));
  }, []);

  const handleConnectGoogleDrive = () => {
    window.location.href = "/api/auth/google/login";
  };

  const handleDisconnectGoogleDrive = async () => {
    if (confirm("Are you sure you want to disconnect Google Drive? Active photo storage and roster syncing will stop.")) {
      try {
        const res = await fetch("/api/storage/google-disconnect", { method: "POST" });
        if (res.ok) {
          alert("Google Drive successfully disconnected.");
          fetchGoogleStatus();
        } else {
          alert("Failed to disconnect Google Drive.");
        }
      } catch (err) {
        alert("Error disconnecting Google Drive.");
      }
    }
  };

  const handleManualGoogleSync = async () => {
    setIsSyncingDrive(true);
    try {
      const res = await fetch("/api/storage/google-sync", { method: "POST" });
      if (res.ok) {
        alert("Google Drive Synchronization completed! members roster, txt, and log files are updated.");
        fetchGoogleStatus();
      } else {
        const errText = await res.text();
        alert(`Sync failed: ${errText}`);
      }
    } catch (err) {
      alert("Error syncing with Google Drive.");
    } finally {
      setIsSyncingDrive(false);
    }
  };

  const handleSaveCustomKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCustomKeys(true);
    try {
      const res = await fetch("/api/storage/custom-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customClientId, customClientSecret })
      });
      if (res.ok) {
        alert("Google Developer Credentials updated. Click 'Connect Google Drive' to link with this client.");
      } else {
        alert("Failed to update Developer Credentials.");
      }
    } catch (err) {
      alert("Error saving custom credentials.");
    } finally {
      setIsSavingCustomKeys(false);
    }
  };

  const handleSaveDigestSettings = async () => {
    setIsSavingDigest(true);
    try {
      await onUpdateDigestSettings(digestEnabled, digestFrequency);
      alert(`Automated report digest configuration saved. Marked ${digestEnabled ? 'ENABLED (' + digestFrequency + ')' : 'DISABLED'}.`);
    } catch (err) {
      alert("Failed to save automated digest settings.");
    } finally {
      setIsSavingDigest(false);
    }
  };

  // Simulated notification alert dispatches
  const [alertEmail, setAlertEmail] = useState(true);
  const [alertWhatsapp, setAlertWhatsapp] = useState(true);

  // Exclusive Admin check
  const isAdminDev = currentUser?.username === 'Dineth_Jayasuriya' || currentUser?.username === 'Manusha_Bimsara';

  // Computed Login Analytics
  const formatLastLogin = (isoString?: string) => {
    if (!isoString) return 'Never logged in';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return isoString;
    }
  };

  const userLogins = users.map(u => ({
    id: u.id,
    name: u.name,
    username: `@${u.username}`,
    role: u.role === 'admin' ? 'Admin / Developer' : 'Troop Council Leader',
    roleClass: u.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
    loginCount: u.loginCount || 0,
    lastLogin: u.lastLogin
  }));

  const scoutLogins = scouts.map(s => ({
    id: s.id,
    name: `${s.firstName} ${s.lastName}`,
    username: `Membership: ${s.membershipNo}`,
    role: 'Scout Member',
    roleClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    loginCount: s.loginCount || 0,
    lastLogin: s.lastLogin
  }));

  const allLogins = [...userLogins, ...scoutLogins]
    .filter(item => item.loginCount > 0)
    .sort((a, b) => {
      const timeF = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
      const timeG = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
      return timeG - timeF;
    });

  const totalAppLogins = [...users, ...scouts].reduce((sum, current) => sum + (current.loginCount || 0), 0);
  const uniqueActiveUsers = [...users, ...scouts].filter(u => (u.loginCount || 0) > 0).length;

  // State variables for administering registered accounts (Admins only)
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editNic, setEditNic] = useState('');
  const [editParentPhone, setEditParentPhone] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editApproved, setEditApproved] = useState(true);
  const [isSavingUser, setIsSavingUser] = useState(false);

  const startEditUser = (user: UserType) => {
    setEditingUserId(user.id);
    setEditName(user.name || '');
    setEditUsername(user.username || '');
    setEditRole(user.role || 'leader');
    setEditEmail(user.email || '');
    setEditWhatsapp(user.whatsapp || '');
    setEditNic(user.nic || '');
    setEditParentPhone(user.parentPhone || '');
    setEditPassword('');
    setEditApproved(user.approved !== false);
  };

  const handleSaveUser = async (userId: string) => {
    if (!editName.trim() || !editUsername.trim()) {
      alert("Name and Username are required!");
      return;
    }
    setIsSavingUser(true);
    try {
      const updatedFields: any = {
        name: editName,
        username: editUsername,
        role: editRole,
        email: editEmail,
        whatsapp: editWhatsapp,
        nic: editNic,
        parentPhone: editParentPhone,
        approved: editApproved
      };
      if (editPassword.trim()) {
        updatedFields.password = editPassword;
      }
      await onUpdateUser(userId, updatedFields);
      setEditingUserId(null);
    } catch (err) {
      alert("Failed to save updates.");
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleUpdateCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredsSuccess('');
    setIsUpdatingCreds(true);
    try {
      await onUpdateSelfCredentials(password, username, name, email, whatsapp, address, parentPhone);
      setCredsSuccess('Credentials successfully updated inside local scout registries. Background alerts dispatched.');
      setTimeout(() => setCredsSuccess(''), 4000);
      setPassword('');
    } catch (err) {
      alert('Failed to execute credentials updates.');
    } finally {
      setIsUpdatingCreds(false);
    }
  };

  const handleStorageAdjustSave = () => {
    const val = parseFloat(capacityGiga);
    if (!isNaN(val) && val > 0) {
      onAdjustStorage(val * 1024 * 1024 * 1024);
      alert('Troop persistent storage threshold expanded.');
    }
  };

  const handleExecuteClear = () => {
    if (confirm('Are you absolutely sure you want to clear all council chat records? This action cannot be undone.')) {
      setIsClearingChats(true);
      onClearChats();
      setTimeout(() => {
        setIsClearingChats(false);
        alert('All chat history records successfully purged.');
      }, 500);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Settings Top Indicator */}
      <div className="bg-stone-900/40 border border-stone-850 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500 text-stone-950 rounded-xl shadow shrink-0">
            <Settings className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-stone-200 uppercase tracking-widest">
              Troop Core Settings Dashboard
            </h3>
            <p className="text-xs text-stone-400">
              Update personal access credentials or adjust common configurations of the 51st Colombo District Scouts network.
            </p>
          </div>
        </div>

        <div className="bg-stone-950 border border-stone-850 p-2 rounded-xl text-[11px] font-mono shrink-0 flex items-center gap-2">
          <span>Active Troop District:</span>
          <span className="font-bold text-amber-500 uppercase tracking-wide">{district}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Left Column: Personal Credentials Adjustment (8 columns) */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-stone-900/40 border border-stone-850 p-6 rounded-2xl space-y-4">
            
            <div className="flex items-center gap-2 border-b border-stone-800 pb-3">
              <Key className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200">
                Personal Credentials & Profile Details
              </h4>
            </div>

            <p className="text-[11px] text-stone-400">
              Modifying your key profile logins or family numbers automatically updates other troop registers.
            </p>

            {credsSuccess && (
              <div className="bg-emerald-950/30 border border-emerald-600/40 rounded-xl p-3 flex items-center gap-2 text-[11px] text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{credsSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdateCreds} className="space-y-4 text-xs font-sans">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-stone-400 font-bold uppercase font-mono text-[10px]">Logins Username</label>
                  <input 
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-850 rounded-lg px-3 py-2 text-stone-200 outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* Password change */}
                <div className="space-y-1.5">
                  <label className="text-stone-400 font-bold uppercase font-mono text-[10px]">Access Password (Change)</label>
                  <input 
                    type="password"
                    value={password}
                    placeholder="Enter new password..."
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-850 rounded-lg px-3 py-2 text-stone-200 outline-none focus:border-amber-500/50 placeholder-stone-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-400 font-bold uppercase font-mono text-[10px]">Your Display Name</label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-850 rounded-lg px-3 py-2 text-stone-200 outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-stone-400 font-bold uppercase font-mono text-[10px]">Email Coordinates</label>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-850 rounded-lg px-3 py-2 text-stone-200 outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* WhatsApp */}
                <div className="space-y-1.5">
                  <label className="text-stone-400 font-bold uppercase font-mono text-[10px]">My WhatsApp Number</label>
                  <input 
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-850 rounded-lg px-3 py-2 text-stone-200 outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              {currentUser?.role === 'scout' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Parent Phone */}
                  <div className="space-y-1.5">
                    <label className="text-stone-400 font-bold uppercase font-mono text-[10px]">Parent/Guardian Phone</label>
                    <input 
                      type="text"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-850 rounded-lg px-3 py-2 text-stone-200 outline-none focus:border-amber-500/50"
                    />
                  </div>

                  {/* Optional address update */}
                  <div className="space-y-1.5">
                    <label className="text-stone-400 font-bold uppercase font-mono text-[10px]">Physical Address</label>
                    <input 
                      type="text"
                      value={address}
                      placeholder="Leave blank to preserve..."
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-850 rounded-lg px-3 py-2 text-stone-200 outline-none focus:border-amber-500/50 placeholder-stone-700"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isUpdatingCreds}
                className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 text-xs transition cursor-pointer"
              >
                {isUpdatingCreds ? 'Publishing Updates...' : 'Publish Update Registries'}
              </button>

            </form>

          </div>
        </div>

        {/* Right Column: Troop System Settings (Leader/Admin only) (5 columns) */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Developer / Administration Division Recognition */}
          <div className="bg-gradient-to-br from-indigo-950 to-stone-900 border border-indigo-500/30 p-5 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Code className="w-4 h-4 text-amber-500" /> Platform Core Developers
            </h4>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              We officially acknowledge the sole development division and administrator identities:
            </p>
            <div className="space-y-1 text-[11px] font-mono">
              <div className="bg-stone-950/60 p-2.5 rounded-lg border border-stone-800">
                <div className="text-amber-400 font-bold">⚜️ Manusha Bimsara</div>
                <div className="text-[10px] text-stone-400">Owner & Lead App Developer · Admin</div>
              </div>
              <div className="bg-stone-950/60 p-2.5 rounded-lg border border-stone-800">
                <div className="text-amber-400 font-bold">⚜️ Dineth Jayasuriya</div>
                <div className="text-[10px] text-stone-400">Co-Developer & Admin</div>
              </div>
            </div>
          </div>

          {/* Pending Approvals Card (Only shown if isAdminDev is true) */}
          {isAdminDev && (
            <div className="bg-stone-900/40 border border-amber-500/20 p-6 rounded-2xl space-y-4 shadow-xl">
              <div className="flex items-center gap-2 border-b border-stone-800 pb-3 justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500 animate-pulse" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Pending Leader Approvals
                  </h4>
                </div>
                <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {users.filter(u => u.role === 'leader' && u.approved === false).length} waiting
                </span>
              </div>

              <p className="text-[11px] text-stone-400">
                You must verify identities (such as National ID cards) before activating. Approved leaders will immediately be granted council rosters and event permissions.
              </p>

              {users.filter(u => u.role === 'leader' && u.approved === false).length === 0 ? (
                <div className="bg-stone-950/40 border border-stone-850/50 p-4 rounded-xl text-center text-[11px] text-stone-500 font-mono">
                  No leader registrations currently pending activation.
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {users.filter(u => u.role === 'leader' && u.approved === false).map(user => (
                    <div key={user.id} className="bg-stone-950 p-3.5 rounded-xl border border-stone-850 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="font-bold text-stone-200 text-xs">{user.name}</div>
                          <div className="text-[10px] text-stone-400 font-mono">@{user.username}</div>
                        </div>
                        <span className="text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono uppercase shrink-0">
                          NIC: {user.nic || 'N/A'}
                        </span>
                      </div>
                      
                      <div className="text-[11px] text-stone-400 space-y-0.5 font-mono">
                        <div className="truncate">Email: {user.email || 'N/A'}</div>
                        <div>WhatsApp: {user.whatsapp || 'N/A'}</div>
                      </div>

                      <div className="flex gap-2 pt-1 border-t border-stone-900">
                        <button
                          onClick={() => onApproveUser(user.id)}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-[10px] font-extrabold py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" /> Approve
                        </button>
                        <button
                          onClick={() => onRejectUser(user.id)}
                          className="flex-1 bg-stone-900 hover:bg-red-950/40 text-red-400 hover:border-red-500/20 text-[10px] font-extrabold py-1.5 rounded-lg border border-stone-800 transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="bg-stone-900/40 border border-stone-850 p-6 rounded-2xl space-y-4">
            
            <div className="flex items-center gap-2 border-b border-stone-800 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200">
                Troop System & Admin Console
              </h4>
            </div>

            {isAdminDev || currentUser?.role === 'admin' || currentUser?.role === 'leader' ? (
              <div className="space-y-4 text-xs font-sans">
                
                {/* Google Drive Integration and Status Panel */}
                <div className="bg-stone-950 p-4 rounded-xl border border-stone-850 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                      <span className="text-[10px] text-stone-400 font-bold uppercase font-mono tracking-wider block">
                        Google Drive Cloud Sync
                      </span>
                    </div>
                    <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${googleStatus?.connected ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/10' : 'bg-stone-900 text-stone-500 border border-stone-800'}`}>
                      {googleStatus?.connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-400 leading-relaxed font-sans">
                    Automatically save uploaded scout member profile pictures, album snaps, and printable scout registers to your Google Drive space. Keep files stored safely in folders inside <code className="text-amber-500 font-mono">TroopTrack Colombo Scouts</code>.
                  </p>

                  {googleStatus?.connected ? (
                    <div className="space-y-3 pt-1">
                      <div className="bg-stone-900/40 border border-stone-850 p-3 rounded-lg flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] text-stone-500 font-mono block">LINKED ACCOUNT</span>
                          <span className="text-stone-200 font-medium font-mono text-[11px]">{googleStatus.email}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleDisconnectGoogleDrive}
                          className="bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-500/10 hover:border-red-500/30 text-[9px] font-bold font-mono px-2.5 py-1 rounded transition cursor-pointer"
                        >
                          Disconnect
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={isSyncingDrive}
                          onClick={handleManualGoogleSync}
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-stone-950 text-[10px] font-extrabold uppercase py-2 rounded-lg font-mono transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          {isSyncingDrive ? 'Syncing...' : '⚜️ Sync Now'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-1">
                      <button
                        type="button"
                        onClick={handleConnectGoogleDrive}
                        className="w-full bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/30 text-stone-300 hover:text-amber-400 text-[10px] font-bold font-mono py-2 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>🔗</span> Connect Google Drive
                      </button>

                      {/* Developer settings dropdown */}
                      <div className="border-t border-stone-900/60 pt-2.5">
                        <button
                          type="button"
                          onClick={() => setShowDeveloperCredentials(!showDeveloperCredentials)}
                          className="text-stone-500 hover:text-stone-300 text-[9px] font-bold font-mono uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                        >
                          {showDeveloperCredentials ? '▼ Hide' : '► Show'} Dev API Credentials (Optional)
                        </button>

                        {showDeveloperCredentials && (
                          <form onSubmit={handleSaveCustomKeys} className="space-y-3 mt-3 bg-stone-900/20 p-3 rounded-lg border border-stone-850">
                            <div className="space-y-1">
                              <label className="text-stone-500 text-[9px] font-bold font-mono uppercase block">OAuth Client ID</label>
                              <input
                                type="text"
                                value={customClientId}
                                onChange={(e) => setCustomClientId(e.target.value)}
                                placeholder="e.g. 123456-abcdef.apps.googleusercontent.com"
                                className="w-full bg-stone-950 border border-stone-850 rounded px-2 py-1 text-stone-200 outline-none text-[10px] font-mono"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-stone-500 text-[9px] font-bold font-mono uppercase block">OAuth Client Secret</label>
                              <input
                                type="password"
                                value={customClientSecret}
                                onChange={(e) => setCustomClientSecret(e.target.value)}
                                placeholder="e.g. GOCSPX-secretkey123"
                                className="w-full bg-stone-950 border border-stone-850 rounded px-2 py-1 text-stone-200 outline-none text-[10px] font-mono"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={isSavingCustomKeys}
                              className="bg-stone-950 hover:bg-stone-850 border border-stone-800 text-stone-300 text-[9px] font-bold font-mono px-3 py-1 rounded cursor-pointer transition"
                            >
                              {isSavingCustomKeys ? 'Saving...' : 'Save Keys'}
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Storage Threshold */}
                <div className="space-y-1.5">
                  <label className="text-stone-400 font-bold uppercase font-mono text-[10px] flex items-center justify-between">
                    <span>Drive Storage limit</span>
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="number"
                      value={capacityGiga}
                      onChange={(e) => setCapacityGiga(e.target.value)}
                      className="bg-stone-950 border border-stone-850 rounded-lg px-2 py-1.5 text-xs text-stone-200 outline-none w-20"
                    />
                    <button 
                      onClick={handleStorageAdjustSave}
                      className="bg-stone-950 hover:bg-stone-850 border border-stone-800 text-stone-300 text-[10px] font-bold px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
                    >
                      Apply (GB)
                    </button>
                  </div>
                </div>

                {/* Recipient email configuration */}
                <div className="space-y-1.5">
                  <label className="text-stone-400 font-bold uppercase font-mono text-[10px]">Google Drive sync destination mail</label>
                  <input 
                    type="email"
                    value={recvEmail}
                    onChange={(e) => setRecvEmail(e.target.value)}
                    placeholder="managementsystermscout@gmail.com"
                    className="w-full bg-stone-950 border border-stone-850 rounded-lg px-2.5 py-1.5 text-stone-200 outline-none"
                    disabled
                  />
                </div>

                {/* Automated Reports Email Digest Option */}
                <div className="bg-stone-950 p-4 rounded-xl border border-stone-850 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase font-mono tracking-wider block">🚨 Reports Email Digest</span>
                      <p className="text-[11px] text-stone-500">Enable automated digests of submitted reports</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={digestEnabled}
                        onChange={(e) => setDigestEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-stone-400 after:border-stone-600 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-stone-950 peer-checked:after:border-amber-600"></div>
                    </label>
                  </div>

                  {digestEnabled && (
                    <div className="space-y-3 pt-2 border-t border-stone-900/60 transition-all duration-300">
                      <div className="space-y-1.5 bg-stone-900/40 p-2.5 rounded-lg border border-stone-850/50">
                        <label className="text-[10px] text-stone-400 uppercase font-mono font-extrabold block mb-1">
                          Digest Frequency Range
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-1.5 text-[11px] text-stone-300 cursor-pointer">
                            <input
                              type="radio"
                              name="digestFrequency"
                              value="daily"
                              checked={digestFrequency === 'daily'}
                              onChange={() => setDigestFrequency('daily')}
                              className="accent-amber-500 bg-stone-950 border-stone-800 focus:ring-amber-500"
                            />
                            <span>Daily Digest</span>
                          </label>
                          <label className="flex items-center gap-1.5 text-[11px] text-stone-300 cursor-pointer">
                            <input
                              type="radio"
                              name="digestFrequency"
                              value="weekly"
                              checked={digestFrequency === 'weekly'}
                              onChange={() => setDigestFrequency('weekly')}
                              className="accent-amber-500 bg-stone-950 border-stone-800 focus:ring-amber-500"
                            />
                            <span>Weekly Digest</span>
                          </label>
                        </div>
                      </div>

                      <div className="text-[10px] text-stone-500 flex items-start gap-1 bg-stone-900/30 p-2 rounded-lg border border-stone-900/80 leading-relaxed font-sans">
                        <span>ℹ️</span>
                        <span>
                          A compiled summary of newly created member dispute details will automatically dispatch to 
                          <strong className="text-stone-300 mx-1">{recvEmail}</strong> 
                          every {digestFrequency === 'daily' ? '24 hours at 00:00 UTC' : 'Sunday evening'}.
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSaveDigestSettings}
                    disabled={isSavingDigest}
                    className="w-full bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/40 text-stone-300 hover:text-amber-400 font-bold py-1.5 rounded-lg text-[10px] font-mono transition cursor-pointer"
                  >
                    {isSavingDigest ? 'Saving Digest Options...' : 'Save Digest Settings'}
                  </button>
                </div>

                {/* Simulated notifications toggle switches */}
                <div className="space-y-2 border-t border-stone-850 pt-3">
                  <span className="text-stone-500 text-[10px] uppercase font-mono font-bold tracking-wider block">ALERT GATEWAYS</span>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-stone-300">Automated Gmail Logs</span>
                    <button 
                      onClick={() => setAlertEmail(!alertEmail)} 
                      className={`p-1 rounded-md transition ${alertEmail ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/20' : 'bg-stone-950 text-stone-600 border border-stone-850'}`}
                      title={alertEmail ? 'Alert Dispatcher is Active' : 'Offline'}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-stone-300">Real-time WhatsApp Dispatch</span>
                    <button 
                      onClick={() => setAlertWhatsapp(!alertWhatsapp)} 
                      className={`p-1 rounded-md transition ${alertWhatsapp ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/20' : 'bg-stone-950 text-stone-600 border border-stone-850'}`}
                      title={alertWhatsapp ? 'Alert Dispatcher is Active' : 'Offline'}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Delete all chats option */}
                <div className="border-t border-stone-850 pt-3 space-y-2">
                  <span className="text-stone-500 text-[10px] uppercase font-mono font-bold tracking-wider block">DILIGENT HOUSEKEEPING</span>
                  <button
                    onClick={handleExecuteClear}
                    disabled={isClearingChats}
                    className="w-full bg-red-950/20 border border-red-500/20 hover:bg-red-950/40 text-red-400 font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition text-xs cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear All Council Chats
                  </button>
                </div>

              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-[11px] text-stone-500 italic leading-relaxed">
                  Troop system logs, WhatsApp alert pathways, and housekeeping settings are exclusively reserved for leadership developers Dineth Jayasuriya & Manusha Bimsara.
                </p>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Registered User Accounts Management Administration (Admins Only) */}
      {isAdminDev && (
        <>
          <div className="bg-stone-900/40 border border-stone-850 p-6 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-850 pb-4">
            <div>
              <h3 className="font-bold text-xs tracking-widest text-stone-100 uppercase flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500 animate-pulse" /> Registered User Accounts Administration
              </h3>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Manage, edit permissions, update details, or delete registered Admin / Leader accounts.
              </p>
            </div>
          </div>

          {editingUserId ? (
            /* ACTIVE EDITING MODULE */
            <div className="bg-stone-950 p-5 rounded-xl border border-amber-500/20 space-y-4">
              <h4 className="text-xs font-bold font-mono uppercase text-amber-400 flex items-center gap-1.5">
                <Edit className="w-3.5 h-3.5" /> Editing User Account Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-stone-400 font-mono font-bold uppercase text-[10px]">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-200 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-stone-400 font-mono font-bold uppercase text-[10px]">Username</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-200 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-stone-400 font-mono font-bold uppercase text-[10px]">Designation Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-200 outline-none cursor-pointer text-stone-300"
                  >
                    <option value="admin">Administrator / Developer</option>
                    <option value="leader">Troop Council Leader</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-stone-400 font-mono font-bold uppercase text-[10px]">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-200 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-stone-400 font-mono font-bold uppercase text-[10px]">WhatsApp Contact</label>
                  <input
                    type="text"
                    value={editWhatsapp}
                    onChange={(e) => setEditWhatsapp(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-200 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-stone-400 font-mono font-bold uppercase text-[10px]">National ID (NIC)</label>
                  <input
                    type="text"
                    value={editNic}
                    onChange={(e) => setEditNic(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-200 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-stone-400 font-mono font-bold uppercase text-[10px]">Parent / Guard Phone</label>
                  <input
                    type="text"
                    value={editParentPhone}
                    onChange={(e) => setEditParentPhone(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-200 outline-none"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-stone-400 font-mono font-bold uppercase text-[10px]">Change Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Set new access key..."
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-200 outline-none placeholder:text-stone-600 font-mono"
                  />
                </div>

                <div className="flex items-center gap-3 col-span-full pt-2">
                  <label className="flex items-center gap-2 text-stone-300 font-bold uppercase text-[10px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editApproved}
                      onChange={(e) => setEditApproved(e.target.checked)}
                      className="rounded border-stone-800 text-amber-500 focus:ring-amber-500 bg-stone-900 w-4 h-4 cursor-pointer"
                    />
                    <span>Approved & Activated Account</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-stone-900">
                <button
                  type="button"
                  onClick={() => handleSaveUser(editingUserId)}
                  disabled={isSavingUser}
                  className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-4 py-2 rounded-lg text-xs transition duration-200 cursor-pointer"
                >
                  {isSavingUser ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUserId(null)}
                  className="bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-400 hover:text-stone-200 font-bold px-4 py-2 rounded-lg text-xs transition duration-200 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* REGISTERED ACCOUNTS TABLE EXPOSURE */
            <div className="overflow-x-auto border border-stone-850 rounded-xl bg-stone-950/60 font-sans">
              <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-stone-850 bg-stone-950/80 text-[10px] text-stone-500 uppercase tracking-widest font-mono">
                    <th className="py-3 px-4">Account Holder</th>
                    <th className="py-3 px-4">Role Designation</th>
                    <th className="py-3 px-4">Contact Detail</th>
                    <th className="py-3 px-4">Approval State</th>
                    <th className="py-3 px-4 text-center">Roster Management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-850">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-stone-900/20 transition">
                      
                      {/* Name and Username */}
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-stone-200">{user.name}</div>
                        <div className="text-[10px] text-stone-500 font-mono">@{user.username}</div>
                      </td>

                      {/* Role representation with custom color schemes */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          user.role === 'admin' 
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {user.role === 'admin' ? "Admin / Developer" : "Troop Council Leader"}
                        </span>
                      </td>

                      {/* Contact metadata */}
                      <td className="py-3 px-4 text-stone-300 font-mono text-[11px] space-y-0.5">
                        <div className="truncate max-w-[170px]">{user.email || 'No email registered'}</div>
                        <div className="text-stone-400">{user.whatsapp || 'No whatsapp'}</div>
                      </td>

                      {/* Status indicator: Activated vs Pending */}
                      <td className="py-3 px-4">
                        {user.approved === false ? (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold font-mono tracking-wider bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded">
                            Pending Approval
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold font-mono tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                            <Check className="w-3 h-3 text-emerald-400" /> Fully Approved
                          </span>
                        )}
                      </td>

                      {/* Management Action Dispatchers */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => startEditUser(user)}
                            className="p-1 px-2.5 bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/50 text-stone-300 hover:text-amber-400 rounded-lg text-[10px] font-mono transition flex items-center gap-1 cursor-pointer"
                            title="Edit User Detail"
                          >
                            <Edit className="w-3 h-3" /> Edit
                          </button>
                          
                          <button
                            onClick={() => onDeleteUser(user.id)}
                            className="p-1 px-2.5 bg-stone-900/55 hover:bg-red-950/40 border border-stone-800 hover:border-red-500/30 text-stone-400 hover:text-red-400 rounded-lg text-[10px] font-mono transition flex items-center gap-1 cursor-pointer"
                            title={user.username === currentUser?.username ? "Delete Your Own Account" : "Delete User Account"}
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* User Session Analytics Section */}
        <div className="bg-stone-900/40 border border-stone-850 p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="font-bold text-xs tracking-widest text-stone-100 uppercase flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-500 animate-pulse" /> App Login Traffic Analytics
            </h3>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Monitor live application log-ins, session frequencies, and the last seen activity of admins, leaders, and scouts.
            </p>
          </div>

          {/* Engagement Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-stone-950 p-3 rounded-xl border border-stone-850 text-center">
              <div className="text-[10px] uppercase font-mono text-stone-400">Total App Logins</div>
              <div className="text-xl font-bold font-serif text-amber-500 mt-1">{totalAppLogins}</div>
            </div>
            <div className="bg-stone-950 p-3 rounded-xl border border-stone-850 text-center">
              <div className="text-[10px] uppercase font-mono text-stone-400">Active Unique Users</div>
              <div className="text-xl font-bold font-serif text-amber-500 mt-1">{uniqueActiveUsers}</div>
            </div>
            <div className="bg-stone-950 p-3 rounded-xl border border-stone-850 text-center">
              <div className="text-[10px] uppercase font-mono text-stone-400">Never Logged In</div>
              <div className="text-xl font-bold font-serif text-stone-500 mt-1">{([...users, ...scouts].length) - uniqueActiveUsers}</div>
            </div>
          </div>

          {allLogins.length === 0 ? (
            <div className="bg-stone-950/40 border border-stone-850/50 p-4 rounded-xl text-center text-[11px] text-stone-500 font-mono">
              No active session logs recorded yet. Real-time count starts upon next login.
            </div>
          ) : (
            <div className="border border-stone-850/50 rounded-xl overflow-hidden bg-stone-950/30">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-stone-850 bg-stone-950/60 text-stone-400 text-[10px] uppercase font-mono">
                      <th className="py-2.5 px-4 font-semibold">User Details</th>
                      <th className="py-2.5 px-4 font-semibold">Roster Role</th>
                      <th className="py-2.5 px-4 font-semibold text-center">Session Count</th>
                      <th className="py-2.5 px-4 font-semibold">Last Session Detected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-900/40">
                    {allLogins.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-900/10 text-stone-300 transition">
                        <td className="py-2.5 px-4">
                          <div className="font-extrabold text-stone-200">{item.name}</div>
                          <div className="text-[9px] text-stone-500 font-mono">{item.username}</div>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold shrink-0 inline-block ${item.roleClass}`}>
                            {item.role}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center font-mono font-bold text-amber-500">
                          {item.loginCount}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[10px] text-stone-400">
                          {formatLastLogin(item.lastLogin)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        </>
      )}

    </div>
  );
}
