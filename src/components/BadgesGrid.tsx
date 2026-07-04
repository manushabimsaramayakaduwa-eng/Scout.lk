import React, { useState } from 'react';
import { Award, Plus, Edit, Trash2, Tag, BookOpen, User, Image, AlertCircle } from 'lucide-react';
import { Badge, ScoutMember, User as UserType } from '../types';

interface BadgesGridProps {
  badges: Badge[];
  scouts: ScoutMember[];
  currentUser: UserType;
  onAddBadge: (badge: Omit<Badge, "id">) => void;
  onUpdateBadge: (id: string, badge: Partial<Badge>) => void;
}

export default function BadgesGrid({
  badges, scouts, currentUser, onAddBadge, onUpdateBadge
}: BadgesGridProps) {
  const isLeaderOrAdmin = currentUser.role === 'leader' || currentUser.role === 'admin';
  
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isEditing, setIsEditing] = useState<Badge | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Forms values
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Emergency Skills');
  const [formDesc, setFormDesc] = useState('');
  const [formPhoto, setFormPhoto] = useState('');

  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPhoto, setEditPhoto] = useState('');

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(badges.map(b => b.category)))];

  const handleCreateBadge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDesc.trim() || !formCategory.trim()) {
      alert('Please fill out Name, Category and Description.');
      return;
    }

    onAddBadge({
      name: formName.trim(),
      category: formCategory.trim(),
      description: formDesc.trim(),
      photoUrl: formPhoto.trim() || 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=120'
    });

    setFormName(''); setFormDesc(''); setFormPhoto('');
    setShowAddForm(false);
    alert('New proficiency badge configuration created successfully!');
  };

  const handleStartEdit = (b: Badge) => {
    setIsEditing(b);
    setEditName(b.name);
    setEditCategory(b.category);
    setEditDesc(b.description);
    setEditPhoto(b.photoUrl || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;

    onUpdateBadge(isEditing.id, {
      name: editName.trim(),
      category: editCategory.trim(),
      description: editDesc.trim(),
      photoUrl: editPhoto.trim() || 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=120'
    });

    setIsEditing(null);
    alert('Proficiency badge guidelines updated.');
  };

  const filteredBadges = selectedCategory === 'All' 
    ? badges 
    : badges.filter(b => b.category === selectedCategory);

  // Calculate earning statistics
  const getEarningScouts = (bId: string) => {
    return scouts.filter(s => (s.badgesEarned || []).includes(bId));
  };

  return (
    <div className="space-y-6">
      
      {/* Category selector and Action header */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between pb-4 border-b border-stone-800">
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition ${
                selectedCategory === cat 
                  ? 'bg-amber-500 border-amber-500 text-stone-950 shadow' 
                  : 'bg-stone-900 border-stone-800/80 text-stone-400 hover:text-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLeaderOrAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full md:w-auto bg-amber-500 text-stone-950 font-bold text-xs px-4 py-2 rounded-lg hover:bg-amber-400 active:scale-95 transition flex items-center justify-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> Create Badge Config
          </button>
        )}
      </div>

      {/* Restricted Info for leaders */}
      {isLeaderOrAdmin && (
        <div className="bg-amber-950/20 border border-amber-500/30 text-amber-300 p-3 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong>Attention:</strong> Scout leaders and admins can edit badges and achievements, but they CANNOT earn badges themselves. Badges are strictly allocated to active scout members in their profile screens.
          </span>
        </div>
      )}

      {/* Add Badge Form */}
      {showAddForm && (
        <form onSubmit={handleCreateBadge} className="bg-stone-900/60 border border-stone-800 rounded-xl p-5 space-y-4 max-w-xl mx-auto animate-fadeIn">
          <h4 className="text-xs font-bold text-amber-500 font-mono tracking-wider uppercase">New SLSA Badge Guideline</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-stone-400 font-mono uppercase mb-1">Badge Name</label>
              <input
                type="text"
                className="w-full bg-stone-950 text-xs border border-stone-850 rounded px-2.5 py-1.5 text-stone-100 outline-none"
                placeholder="e.g. Map Reader"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] text-stone-400 font-mono uppercase mb-1">Badge Category</label>
              <input
                type="text"
                className="w-full bg-stone-950 text-xs border border-stone-850 rounded px-2.5 py-1.5 text-stone-100 outline-none"
                placeholder="e.g. Outdoor Skills"
                required
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-stone-400 font-mono uppercase mb-1">Description / Syllabus</label>
              <textarea
                className="w-full bg-stone-950 text-xs border border-stone-850 rounded px-2.5 py-1.5 text-stone-100 h-10 resize-none outline-none"
                placeholder="Required test conditions..."
                required
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] text-stone-400 font-mono uppercase mb-1">Badge Image URL</label>
              <input
                type="text"
                className="w-full bg-stone-950 text-xs border border-stone-850 rounded px-2.5 py-1.5 text-stone-100 outline-none"
                placeholder="Image path or paste online link"
                value={formPhoto}
                onChange={(e) => setFormPhoto(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 text-xs">
            <button
              type="button"
              className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-1 rounded"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-amber-500 font-semibold text-stone-950 px-4 py-1 rounded hover:bg-amber-400"
            >
              Verify &amp; Add Badge
            </button>
          </div>
        </form>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredBadges.map(b => {
          const earners = getEarningScouts(b.id);
          return (
            <div key={b.id} className="bg-stone-900/40 border border-stone-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-stone-700 transition space-y-4">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-lg bg-stone-950 border border-stone-850 overflow-hidden shrink-0 flex items-center justify-center p-1">
                  <img
                    src={b.photoUrl || "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=120"}
                    alt="Badge emblem"
                    className="w-full h-full object-cover rounded"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold text-amber-500 px-1.5 py-0.5 rounded bg-amber-500/10 uppercase">
                    {b.category}
                  </span>
                  <h4 className="text-xs font-bold text-stone-100 mt-1">{b.name}</h4>
                  <p className="text-[10px] text-stone-400 mt-1 lines-clamp-2 leading-relaxed">{b.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-stone-850/60 pt-3 text-[10px] text-stone-500 font-mono">
                <span>Earned by: <strong className="text-amber-500">{earners.length} scouts</strong></span>
                
                {isLeaderOrAdmin && (
                  <button
                    onClick={() => handleStartEdit(b)}
                    className="bg-stone-800 hover:bg-stone-750 text-stone-300 px-2.5 py-1 rounded border border-stone-800 transition"
                  >
                    Edit Guidelines
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Badge Guideline Model */}
      {isEditing && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-100">
          <form onSubmit={handleSaveEdit} className="bg-stone-900 border border-stone-800 rounded-2xl p-6 w-full max-w-md text-stone-100 space-y-4 shadow-2xl">
            <h4 className="text-xs font-bold text-amber-500 font-mono tracking-widest uppercase pb-2 border-b border-stone-800">
              Update Badge details: {isEditing.name}
            </h4>

            <div>
              <label className="block text-[10px] text-stone-400 font-mono uppercase mb-1">Badge Name</label>
              <input
                type="text"
                className="w-full bg-stone-950 text-xs border border-stone-850 rounded px-2.5 py-1.5 text-stone-100 outline-none"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] text-stone-400 font-mono uppercase mb-1">Category</label>
              <input
                type="text"
                className="w-full bg-stone-950 text-xs border border-stone-850 rounded px-2.5 py-1.5 text-stone-100 outline-none"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] text-stone-400 font-mono uppercase mb-1">Description Syllabus</label>
              <textarea
                className="w-full bg-stone-950 text-xs border border-stone-850 rounded px-2.5 py-1.5 text-stone-100 h-20 resize-none outline-none font-sans"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] text-stone-400 font-mono uppercase mb-1">Photo Url</label>
              <input
                type="text"
                className="w-full bg-stone-950 text-xs border border-stone-850 rounded px-2.5 py-1.5 text-stone-100 outline-none"
                value={editPhoto}
                onChange={(e) => setEditPhoto(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                type="button"
                className="bg-stone-800 text-stone-200 px-3 py-1 rounded"
                onClick={() => setIsEditing(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-amber-500 text-stone-950 font-bold px-4 py-1 rounded hover:bg-amber-400"
              >
                Save Guidelines
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
