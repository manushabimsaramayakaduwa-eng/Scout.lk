import React, { useState } from 'react';
import { Shield, User, Lock, Phone, Smartphone, Mail, AlertCircle, Heart } from 'lucide-react';
import { User as UserType } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: UserType) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [activeTab, setActiveTab ] = useState<'login' | 'register'>('login');
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Registration State
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'leader' | 'scout'>('scout');
  const [regEmail, setRegEmail] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [regNic, setRegNic] = useState(''); // required if Leader
  const [regParentPhone, setRegParentPhone] = useState(''); // required if Scout member
  const [regError, setRegError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!username.trim() || !password.trim()) {
      setLoginError('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        onLoginSuccess(data.user);
      } else {
        setLoginError(data.message || 'Invalid username or password.');
      }
    } catch (err) {
      setLoginError('Could not connect to the scout database server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regFirstName.trim() || !regLastName.trim() || !regUsername.trim() || !regPassword.trim() || !regEmail.trim() || !regWhatsapp.trim()) {
      setRegError('Please fill in all general fields.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters.');
      return;
    }

    // Role-specific validator checks
    if (regRole === 'leader' && !regNic.trim()) {
      setRegError('NIC number is strictly required for Troop Leader / Assistant registration.');
      return;
    }
    if (regRole === 'scout' && !regParentPhone.trim()) {
      setRegError('Parent/Guardian contact number is strictly required for Scout Member registration.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        username: regUsername.trim(),
        password: regPassword,
        name: `${regFirstName.trim()} ${regLastName.trim()}`,
        role: regRole,
        email: regEmail.trim(),
        whatsapp: regWhatsapp.trim(),
        nic: regRole === 'leader' ? regNic.trim() : '',
        parentPhone: regRole === 'scout' ? regParentPhone.trim() : ''
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        if (data.user.role === 'leader' && data.user.approved === false) {
          setRegError('');
          alert("⚜️ Registration Received Successfully!\n\nYour Troop Leader account has been created and is now pending verification and approval by Admins Dineth Jayasuriya or Manusha Bimsara.\n\nPlease reach out to them to activate your leader permissions. You can log in once approved.");
          setActiveTab('login');
        } else {
          onLoginSuccess(data.user);
        }
      } else {
        setRegError(data.message || 'Registration failed.');
      }
    } catch (err) {
      setRegError('Failed to establish server registration connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="login-container" className="min-height-screen w-full flex items-center justify-center p-4 bg-gradient-to-tr from-emerald-950 via-teal-900 to-emerald-900">
      <div className="w-full max-w-md bg-stone-900/40 backdrop-blur-md border border-stone-800/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden text-stone-100">
        
        {/* Absolute Background Orbs for premium visual layout */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col items-center mb-6 text-center select-none">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 rounded-full flex items-center justify-center font-bold text-3xl shadow-lg mb-3">
            ⚜️
          </div>
          <h1 className="text-xl font-bold tracking-tight text-amber-400">51st COLOMBO SCOUT TROOP</h1>
          <p className="text-xs text-stone-400 font-mono tracking-wider uppercase mt-1">Ananda Sastralaya Kotte · TroopTrack</p>
        </div>

        {/* Auth Tabs */}
        <div className="flex bg-stone-950/60 p-1.5 rounded-lg border border-stone-800/50 mb-6">
          <button
            type="button"
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'login' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-400 hover:text-stone-100'
            }`}
            onClick={() => { setActiveTab('login'); setLoginError(''); setRegError(''); }}
          >
            Sign In Account
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'register' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-400 hover:text-stone-100'
            }`}
            onClick={() => { setActiveTab('register'); setLoginError(''); setRegError(''); }}
          >
            New Registration
          </button>
        </div>

        {activeTab === 'login' ? (
          /* SIGN IN FORM */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-1.5 font-mono uppercase">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400"><User className="w-4 h-4" /></span>
                <input
                  type="text"
                  className="w-full bg-stone-950/80 border border-stone-800 focus:border-amber-400 rounded-lg pl-10 pr-4 py-2.5 text-sm text-stone-100 outline-none transition"
                  placeholder="e.g. Dineth_Jayasuriya"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-1.5 font-mono uppercase">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400"><Lock className="w-4 h-4" /></span>
                <input
                  type="password"
                  className="w-full bg-stone-950/80 border border-stone-800 focus:border-amber-400 rounded-lg pl-10 pr-4 py-2.5 text-sm text-stone-100 outline-none transition"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {loginError && (
              <div className="flex items-center gap-2 bg-red-950/30 border border-red-800/50 p-3 rounded-lg text-xs text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-amber-500 text-stone-950 font-bold py-2.5 rounded-lg text-sm hover:bg-amber-400 active:scale-[0.98] transition shadow-lg outline-none flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Verify & Enter'} ⚜️
            </button>


          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegister} className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-stone-400 mb-1 font-mono uppercase">First Name</label>
                <input
                  type="text"
                  className="w-full bg-stone-950/80 border border-stone-800 focus:border-amber-400 rounded-lg px-3 py-2 text-xs text-stone-100 outline-none transition"
                  placeholder="Kasun"
                  value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-stone-400 mb-1 font-mono uppercase">Last Name</label>
                <input
                  type="text"
                  className="w-full bg-stone-950/80 border border-stone-800 focus:border-amber-400 rounded-lg px-3 py-2 text-xs text-stone-100 outline-none transition"
                  placeholder="Perera"
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-stone-400 mb-1 font-mono uppercase">Username</label>
                <input
                  type="text"
                  className="w-full bg-stone-950/80 border border-stone-800 focus:border-amber-400 rounded-lg px-3 py-2 text-xs text-stone-100 outline-none transition"
                  placeholder="kasun.perera"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-stone-400 mb-1 font-mono uppercase">Password</label>
                <input
                  type="password"
                  className="w-full bg-stone-950/80 border border-stone-800 focus:border-amber-400 rounded-lg px-3 py-2 text-xs text-stone-100 outline-none transition"
                  placeholder="Min 6 chars"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-stone-400 mb-1.5 font-mono uppercase">My System Role</label>
              <select
                className="w-full bg-stone-950/80 border border-stone-800 focus:border-amber-400 rounded-lg px-3 py-2 text-xs text-stone-100 outline-none transition"
                value={regRole}
                onChange={(e) => {
                  setRegRole(e.target.value as 'leader' | 'scout');
                  setRegError('');
                }}
                disabled={isLoading}
              >
                <option value="scout">Scout Member (Has Parent Contact)</option>
                <option value="leader">Troop Leader / Helper (Has NIC)</option>
              </select>
            </div>

            {/* Role SPECIFIC REQUIRED Inputs */}
            {regRole === 'leader' ? (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg animate-fadeIn">
                <label className="block text-[10px] font-semibold text-amber-400 mb-1 font-mono uppercase">National Identity Card (NIC) *Required for Leaders</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-stone-400"><Shield className="w-3.5 h-3.5" /></span>
                  <input
                    type="text"
                    className="w-full bg-stone-950/80 border border-amber-500/40 focus:border-amber-400 rounded mx-0 pl-10 pr-3 py-1.5 text-xs text-stone-100 outline-none transition"
                    placeholder="e.g. 200401827V or 12 Digit ID"
                    value={regNic}
                    onChange={(e) => setRegNic(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            ) : (
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg animate-fadeIn">
                <label className="block text-[10px] font-semibold text-blue-300 mb-1 font-mono uppercase">Parent Phone Number *Required for Scouts</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-stone-400"><Phone className="w-3.5 h-3.5" /></span>
                  <input
                    type="text"
                    className="w-full bg-stone-950/80 border border-blue-500/40 focus:border-blue-400 rounded mx-0 pl-10 pr-3 py-1.5 text-xs text-stone-100 outline-none transition"
                    placeholder="e.g. +94 77 123 4567"
                    value={regParentPhone}
                    onChange={(e) => setRegParentPhone(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-stone-400 mb-1 font-mono uppercase">E-mail Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-stone-400"><Mail className="w-3.5 h-3.5" /></span>
                  <input
                    type="email"
                    className="w-full bg-stone-950/80 border border-stone-800 focus:border-amber-400 rounded-lg pl-9 pr-3 py-2 text-xs text-stone-100 outline-none"
                    placeholder="e.g. name@domain.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-stone-400 mb-1 font-mono uppercase">WhatsApp Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-stone-400"><Smartphone className="w-3.5 h-3.5" /></span>
                  <input
                    type="text"
                    className="w-full bg-stone-950/80 border border-stone-800 focus:border-amber-400 rounded-lg pl-9 pr-3 py-2 text-xs text-stone-100 outline-none"
                    placeholder="e.g. +9477... or WhatsApp"
                    value={regWhatsapp}
                    onChange={(e) => setRegWhatsapp(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {regError && (
              <div className="flex items-center gap-2 bg-red-950/30 border border-red-800/50 p-2.5 rounded-lg text-xs text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{regError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-amber-500 text-stone-950 font-bold py-2.5 rounded-lg text-xs hover:bg-amber-400 active:scale-[0.98] transition shadow-lg outline-none flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Register Personal Scout Account'} ⚜
            </button>
          </form>
        )}
        
        <div className="mt-6 text-center select-none">
          <p className="text-[10px] text-stone-500 flex items-center justify-center gap-1 font-mono">
            TroopTrack Systems Colombo · Designed with <Heart className="w-3 h-3 text-red-500 animate-pulse fill-red-500" /> in Sri Lanka
          </p>
        </div>
      </div>
    </div>
  );
}
