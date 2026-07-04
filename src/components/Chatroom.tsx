import React, { useState, useRef, useEffect } from 'react';
import { Send, AlertTriangle, Trash2, CalendarCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { ChatMessage, User as UserType } from '../types';

interface ChatroomProps {
  chats: ChatMessage[];
  currentUser: UserType;
  onSendMessage: (text: string) => void;
  onClearChats: () => void;
}

export default function Chatroom({
  chats, currentUser, onSendMessage, onClearChats
}: ChatroomProps) {
  const isLeaderOrAdmin = currentUser.role === 'leader' || currentUser.role === 'admin';
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [chatInput, setChatInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    onSendMessage(chatInput.trim());
    setChatInput('');
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  const getRoleStyle = (role: string) => {
    switch(role) {
      case 'admin': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'leader': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    }
  };

  return (
    <div className="bg-stone-900/40 border border-stone-800 rounded-2xl p-5 flex flex-col h-[525px] justify-between relative overflow-hidden max-w-2xl mx-auto">
      
      {/* Absolute background effects */}
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header and purge alerts */}
      <div className="flex items-center justify-between pb-3.5 border-b border-stone-800/80 mb-3 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <h3 className="font-bold text-xs tracking-widest text-stone-100 uppercase font-mono">
              ⚜️ Troop General Council Chatroom
            </h3>
            <p className="text-[10px] text-stone-500 uppercase font-mono tracking-wider">
              Automatic 1-Month Cleanup Enabled
            </p>
          </div>
        </div>

        {isLeaderOrAdmin && (
          <button
            type="button"
            onClick={() => {
              if (confirm('Deploy database cleaner? This will clear all counselor chats to maximize space.')) {
                onClearChats();
              }
            }}
            className="text-[10px] bg-red-950/40 hover:bg-red-900/30 text-red-400 hover:text-red-300 border border-red-800/30 rounded-lg px-2.5 py-1.5 font-bold transition flex items-center gap-1 shrink-0"
            title="Clean storage"
          >
            <Trash2 className="w-3.5 h-3.5" /> Purge Chat
          </button>
        )}
      </div>

      {/* Warning */}
      <div className="bg-amber-950/20 border border-amber-500/25 rounded-lg p-2.5 mb-3 text-[10px] text-amber-300 flex items-start gap-2 z-10 shrink-0 leading-relaxed font-sans">
        <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
        <span>
          <strong>Storage Cap Bypasser:</strong> To avoid filling up the shared <strong>managementsystermscout@gmail.com</strong> drive quota, messaging threads are automatically pruned off-service after precisely 30 days.
        </span>
      </div>

      {/* Scrollable messages panel */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1.5 mb-4 z-10 scrollbar-thin scrollbar-thumb-stone-800">
        {chats.length === 0 ? (
          <div className="text-center text-stone-600 py-16 font-mono text-xs">
            Begin the scout conference. No messages loaded.
          </div>
        ) : (
          chats.map((ch, idx) => {
            const isSelf = ch.senderName === currentUser.name;
            return (
              <div 
                key={ch.id || idx} 
                className={`flex flex-col max-w-[82%] relative ${isSelf ? 'ml-auto items-end animate-fadeIn' : 'items-start animate-fadeIn'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[10px]">
                  <span className="font-bold text-stone-300">{ch.senderName}</span>
                  <span className={`px-1 rounded text-[8px] uppercase font-bold tracking-wider ${getRoleStyle(ch.senderRole)}`}>
                    {ch.senderRole}
                  </span>
                </div>

                <div className={`p-3 rounded-2xl text-xs leading-relaxed font-sans shadow break-words ${
                  isSelf 
                    ? 'bg-amber-500 text-stone-950 font-medium rounded-tr-none' 
                    : 'bg-stone-950/80 text-stone-200 rounded-tl-none border border-stone-800/60'
                }`}>
                  {ch.text}
                </div>

                <span className="text-[8px] text-stone-500 font-mono mt-1 pr-1.5">
                  {ch.timestamp ? new Date(ch.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Bottom Send Input form */}
      <form onSubmit={handleSend} className="flex gap-2.5 items-center z-10 shrink-0 pt-2 border-t border-stone-800/60">
        <input
          type="text"
          className="bg-stone-950/95 border border-stone-800/90 focus:border-amber-400 rounded-xl px-3 py-2.5 text-xs text-stone-100 outline-none flex-1 font-sans placeholder-stone-600"
          placeholder="Transmit message and memos..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
        />
        <button
          type="submit"
          className="bg-amber-500 hover:bg-amber-400 text-stone-950 hover:scale-[1.02] active:scale-95 transition p-2.5 rounded-xl border border-amber-600/30 cursor-pointer flex items-center justify-center shrink-0"
        >
          <Send className="w-4 h-4 fill-stone-950" />
        </button>
      </form>

    </div>
  );
}
