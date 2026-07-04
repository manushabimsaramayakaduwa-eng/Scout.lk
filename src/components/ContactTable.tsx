import React, { useState } from 'react';
import { Mail, Phone, ShieldCheck, Search, Copy, CheckCircle2, MessageSquare, ExternalLink, Globe } from 'lucide-react';
import { User as UserType } from '../types';

interface ContactTableProps {
  users: UserType[];
}

export default function ContactTable({ users }: ContactTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter admins and leaders
  const leadershipUsers = users.filter(user => 
    user.role === 'admin' || user.role === 'leader'
  );

  // Ensure Dineth & Manusha are always guaranteed to be present as main admins / devs
  const guaranteedContacts = [
    {
      id: "u_admin1_fallback",
      name: "Dineth Jayasuriya",
      role: "admin",
      username: "Dineth_Jayasuriya",
      email: "dineth.j_admin@gmail.com",
      whatsapp: "+94771234567",
      phone: "+94 77 123 4567",
      title: "Co-Developer & Administrator"
    },
    {
      id: "u_admin2_fallback",
      name: "Manusha Bimsara",
      role: "admin",
      username: "Manusha_Bimsara",
      email: "managementsystermscout@gmail.com",
      whatsapp: "+94777887407",
      phone: "+94 77 788 7407",
      title: "Owner & Lead App Developer"
    }
  ];

  // Merge dynamic users while avoiding duplication of Dineth & Manusha
  const mergedContacts: Array<{
    id: string;
    name: string;
    role: string;
    email: string;
    whatsapp: string;
    phone: string;
    title: string;
  }> = [];

  // Add guaranteed ones first
  guaranteedContacts.forEach(gc => {
    // Check if they already exist in dynamic user list
    const existing = leadershipUsers.find(u => u.username === gc.username);
    mergedContacts.push({
      id: existing?.id || gc.id,
      name: existing?.name || gc.name,
      role: existing?.role || gc.role,
      email: existing?.email || gc.email,
      whatsapp: existing?.whatsapp || gc.whatsapp,
      phone: existing?.whatsapp || gc.phone,
      title: gc.title
    });
  });

  // Add other leaders or admins from db
  leadershipUsers.forEach(u => {
    const isGuaranteed = guaranteedContacts.some(gc => gc.username === u.username);
    if (!isGuaranteed) {
      mergedContacts.push({
        id: u.id,
        name: u.name,
        role: u.role,
        email: u.email || 'N/A',
        whatsapp: u.whatsapp || 'N/A',
        phone: u.whatsapp || 'N/A',
        title: u.role === 'admin' ? "App Developer & Admin" : "Troop Council Leader"
      });
    }
  });

  // Filter based on search query
  const filteredContacts = mergedContacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery) ||
    contact.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-stone-900/40 border border-stone-850 p-6 rounded-2xl space-y-5">
      
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
        <div>
          <h3 className="font-bold text-xs tracking-widest text-stone-100 uppercase flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-500" /> Troop Leadership Directory
          </h3>
          <p className="text-[11px] text-stone-400 mt-0.5">
            Verified contact details of 51st Colombo District Scout Admins and Leaders.
          </p>
        </div>

        {/* Search Field */}
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search Council contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-stone-950 border border-stone-850 rounded-lg pl-9 pr-3 py-1.5 text-xs text-stone-200 outline-none focus:border-amber-500/50 transition w-full sm:w-56 font-sans"
          />
        </div>
      </div>

      {/* Regional Headquarters Auxiliary Info */}
      <div className="bg-stone-950/40 border border-stone-850/60 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold font-mono tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
            Colombo District Office
          </span>
          <p className="text-xs text-stone-300 font-sans">
            Colombo District Scout Association HQ · Sir Chittampalam A Gardiner Mawatha
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 text-[11px] font-mono">
          <a 
            href="https://colomboscouts.lk" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-stone-900 hover:bg-stone-850 text-stone-300 px-3 py-1.5 rounded-lg border border-stone-800 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" /> Website <ExternalLink className="w-2.5 h-2.5" />
          </a>
          <a 
            href="mailto:info@colomboscouts.lk" 
            className="bg-stone-900 hover:bg-stone-850 text-stone-300 px-3 py-1.5 rounded-lg border border-stone-800 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" /> General Desk
          </a>
        </div>
      </div>

      {/* Interactive Contact Presentation (Responsive Design) */}
      {filteredContacts.length === 0 ? (
        <div className="text-center py-8 text-xs text-stone-500 font-mono">
          No matching leadership personnel found inside target records.
        </div>
      ) : (
        <>
          {/* Desktop view: structured crisp layout */}
          <div className="hidden md:block overflow-hidden border border-stone-850 rounded-xl bg-stone-950/60 scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-850 bg-stone-950/80 text-[10px] text-stone-500 uppercase tracking-widest font-mono">
                  <th className="py-3 px-4">Executive Name</th>
                  <th className="py-3 px-4">Designation Role</th>
                  <th className="py-3 px-4">Direct Email</th>
                  <th className="py-3 px-4">WhatsApp Contact</th>
                  <th className="py-3 px-4 text-center">Interactive Dispatch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-850">
                {filteredContacts.map(contact => (
                  <tr key={contact.id} className="hover:bg-stone-900/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-stone-200">{contact.name}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[10px]">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        contact.role === 'admin' 
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {contact.title}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-300">
                      <div className="flex items-center gap-1.5 group">
                        <span className="truncate max-w-[160px]">{contact.email}</span>
                        {contact.email !== 'N/A' && (
                          <button
                            onClick={() => handleCopyText(contact.email, contact.id + '_mail')}
                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-amber-500 transition cursor-pointer"
                            title="Copy email to clipboard"
                          >
                            {copiedId === contact.id + '_mail' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-stone-500" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-300">
                      <div className="flex items-center gap-1.5 group">
                        <span>{contact.phone}</span>
                        {contact.phone !== 'N/A' && (
                          <button
                            onClick={() => handleCopyText(contact.phone, contact.id + '_phone')}
                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-amber-500 transition cursor-pointer"
                            title="Copy contact number"
                          >
                            {copiedId === contact.id + '_phone' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-stone-500" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        {contact.email !== 'N/A' && (
                          <a
                            href={`mailto:${contact.email}`}
                            className="p-1.5 bg-stone-900 border border-stone-800 hover:border-amber-500/40 text-stone-300 hover:text-amber-400 rounded-md transition"
                            title="Despatch Mail Notification"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {contact.whatsapp !== 'N/A' && (
                          <a
                            href={`https://wa.me/${contact.whatsapp.replace('+', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-stone-900 border border-stone-800 hover:border-emerald-500/40 text-stone-300 hover:text-emerald-400 rounded-md transition"
                            title="WhatsApp message chat"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards view: compact responsive cards layout */}
          <div className="md:hidden space-y-3">
            {filteredContacts.map(contact => (
              <div 
                key={contact.id} 
                className="bg-stone-950/60 border border-stone-850 p-4 rounded-xl space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-stone-200 text-xs">{contact.name}</h4>
                    <span className="text-[9px] font-bold font-mono tracking-wider text-amber-500 block uppercase mt-0.5">
                      {contact.title}
                    </span>
                  </div>
                  <span className={`text-[8px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${
                    contact.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {contact.role}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-mono border-t border-stone-900 pt-2.5">
                  <div className="flex items-center justify-between text-stone-400 text-[11px]">
                    <span className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-stone-500" /> Email</span>
                    <a href={`mailto:${contact.email}`} className="text-stone-300 underline hover:text-amber-400 truncate max-w-[200px]">
                      {contact.email}
                    </a>
                  </div>
                  <div className="flex items-center justify-between text-stone-400 text-[11px]">
                    <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-stone-500" /> WhatsApp</span>
                    <a href={`https://wa.me/${contact.whatsapp.replace('+', '')}`} target="_blank" rel="noopener noreferrer" className="text-stone-200 font-bold hover:text-emerald-400">
                      {contact.whatsapp}
                    </a>
                  </div>
                </div>

                <div className="flex gap-2 pt-1 border-t border-stone-900/60">
                  <a 
                    href={`mailto:${contact.email}`}
                    className="flex-1 py-1.5 bg-stone-900 border border-stone-850 hover:border-amber-500/40 text-stone-300 hover:text-amber-400 rounded-lg text-center text-[10px] font-bold flex items-center justify-center gap-1"
                  >
                    <Mail className="w-3 h-3" /> Mail
                  </a>
                  <a 
                    href={`https://wa.me/${contact.whatsapp.replace('+', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 bg-stone-900 border border-stone-850 hover:border-emerald-500/40 text-stone-300 hover:text-emerald-400 rounded-lg text-center text-[10px] font-bold flex items-center justify-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3" /> WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}
