import React, { useState } from 'react';
import { BookOpen, Download, Plus, Trash2, FileText, Globe, Search, AlertCircle } from 'lucide-react';
import { LibraryDoc, User as UserType } from '../types';

interface LibraryProps {
  library: LibraryDoc[];
  currentUser: UserType;
  onAddDoc: (doc: Omit<LibraryDoc, "id" | "addedBy" | "addedAt">) => void;
  onDeleteDoc: (id: string) => void;
}

export default function Library({
  library, currentUser, onAddDoc, onDeleteDoc
}: LibraryProps) {
  const isLeaderOrAdmin = currentUser.role === 'leader' || currentUser.role === 'admin';
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDocForm, setShowAddDocForm] = useState(false);

  // Form State
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('Guides');
  const [docSize, setDocSize] = useState('1.5 MB');

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docCategory.trim()) {
      alert('Please fill out Title and Category.');
      return;
    }

    onAddDoc({
      title: docTitle.trim(),
      category: docCategory.trim(),
      fileSize: docSize,
      downloadUrl: "#"
    });

    setDocTitle('');
    setShowAddDocForm(false);
    alert('Document registered in eLibrary and Google Drive sync established!');
  };

  const triggerDownload = (doc: LibraryDoc) => {
    // Generate a simple text file dynamic download as a proof of capability
    const textContent = `
      ========================================================
      51ST COLOMBO SCOUT TROOP - ANANDA SASTRALAYA KOTTE
      ========================================================
      E-LIBRARY DOCUMENT: ${doc.title}
      Category: ${doc.category}
      File size: ${doc.fileSize}
      Downloaded by: ${currentUser.name} (${currentUser.role})
      Date downloaded: ${new Date().toLocaleDateString()}
      ========================================================
      This is a digitally generated copy matching troop regulations.
      All materials belong to SLSA.
    `;
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.title.replace(/\s+/g, '_')}_manual.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredDocs = library.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header and Add button */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between pb-4 border-b border-stone-800">
        <div>
          <h3 className="font-bold text-sm tracking-wider text-stone-100 uppercase flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" /> Colombo Scout Troop E-Library
          </h3>
          <p className="text-xs text-stone-500 font-mono mt-1">Syllabus downloads &amp; handbook directory</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto items-center">
          <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 w-full md:max-w-xs text-xs">
            <Search className="w-4 h-4 text-stone-500" />
            <input
              type="text"
              className="bg-transparent text-stone-100 outline-none"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLeaderOrAdmin && (
            <button
              onClick={() => setShowAddDocForm(!showAddDocForm)}
              className="bg-amber-500 font-bold hover:bg-amber-400 active:scale-95 transition text-stone-950 text-xs px-4 py-2 rounded-lg shrink-0"
            >
              <Plus className="w-4 h-4" /> Add eBook
            </button>
          )}
        </div>
      </div>

      {/* Adding form */}
      {showAddDocForm && (
        <form onSubmit={handleAddDocument} className="bg-stone-900/60 border border-stone-800 rounded-xl p-5 space-y-4 max-w-xl mx-auto animate-fadeIn">
          <h4 className="text-xs font-bold text-amber-500 font-mono tracking-wider uppercase">Upload eBook Record to SLSA Drive Archive</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-[10px] text-stone-400 font-mono uppercase mb-1">eBook Title</label>
              <input
                type="text"
                className="w-full bg-stone-950 text-xs border border-stone-850 rounded px-2.5 py-2 text-stone-100 outline-none"
                placeholder="e.g. Pioneering and Rope craft"
                required
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] text-stone-400 font-mono uppercase mb-1">eBook Category</label>
              <input
                type="text"
                className="w-full bg-stone-950 text-xs border border-stone-850 rounded px-2.5 py-2 text-stone-100 outline-none"
                placeholder="e.g. Pioneering"
                required
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-stone-400 font-mono uppercase mb-1">Simulated File size</label>
              <select
                className="w-full bg-stone-950 text-xs border border-stone-850 rounded px-2.5 py-2 text-stone-100 outline-none"
                value={docSize}
                onChange={(e) => setDocSize(e.target.value)}
              >
                <option value="1.2 MB">Small eBook (1.2 MB)</option>
                <option value="4.8 MB">Medium Guide (4.8 MB)</option>
                <option value="12.5 MB">Heavy Handbook (12.5 MB)</option>
                <option value="25.0 MB">Premium POR Rules PDF (25.0 MB)</option>
              </select>
            </div>
            <div className="flex items-end justify-end gap-2 text-xs">
              <button
                type="button"
                className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-2 rounded"
                onClick={() => setShowAddDocForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 px-4 py-2 rounded font-semibold"
              >
                Confirm Upload
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Catalog items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full py-16 text-center text-stone-500 font-mono text-xs">
            E-Library containing no files matching keywords.
          </div>
        ) : (
          filteredDocs.map(doc => (
            <div key={doc.id} className="bg-stone-900/40 border border-stone-800 rounded-xl p-4 flex justify-between items-center hover:border-stone-750 transition gap-4">
              <div className="flex gap-3 items-center min-w-0">
                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center border border-amber-500/20 shrink-0 text-amber-500">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <span className="text-[9px] font-mono font-bold text-amber-500 px-1 py-0.5 rounded bg-amber-500/10 uppercase">
                    {doc.category}
                  </span>
                  <h4 className="text-xs font-bold text-stone-200 truncate mt-1">{doc.title}</h4>
                  <p className="text-[10px] text-stone-500 font-mono mt-0.5">Size: {doc.fileSize} · Added by: {doc.addedBy}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => triggerDownload(doc)}
                  className="bg-stone-950 hover:bg-stone-850 text-amber-400 hover:text-amber-300 border border-stone-800 p-2 rounded-lg transition"
                  title="Download manual eBook"
                >
                  <Download className="w-4 h-4" />
                </button>

                {isLeaderOrAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Remove manual handbook "${doc.title}" catalog record from drive storage?`)) {
                        onDeleteDoc(doc.id);
                      }
                    }}
                    className="bg-stone-950 hover:bg-red-950/20 text-stone-500 hover:text-red-400 border border-stone-800 p-2 rounded-lg transition"
                    title="Remove guidebook record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
