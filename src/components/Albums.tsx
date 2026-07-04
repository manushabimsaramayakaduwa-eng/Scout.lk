import React, { useState } from 'react';
import { Image, FolderPlus, Plus, Download, ChevronRight, CornerDownRight, X, AlertCircle, Video } from 'lucide-react';
import { PhotoAlbum, Photo, User as UserType } from '../types';

interface AlbumsProps {
  albums: PhotoAlbum[];
  currentUser: UserType;
  onCreateAlbum: (name: string, description: string) => void;
  onAddPhotoToAlbum: (albumId: string, url: string, caption: string, type?: 'image' | 'video') => void;
}

const getYouTubeEmbedUrl = (url: string) => {
  try {
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
  } catch(e) {
    return url;
  }
};

export default function Albums({
  albums, currentUser, onCreateAlbum, onAddPhotoToAlbum
}: AlbumsProps) {
  const isLeaderOrAdmin = currentUser.role === 'leader' || currentUser.role === 'admin';
  
  const [selectedAlbum, setSelectedAlbum] = useState<PhotoAlbum | null>(null);
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [showAddPhoto, setShowAddPhoto] = useState(false);

  // Modal full-size viewer
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null);

  // Form states
  const [albumName, setAlbumName] = useState('');
  const [albumDesc, setAlbumDesc] = useState('');

  const [photoUrl, setPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoType, setPhotoType] = useState<'image' | 'video'>('image');

  const handleCreateAlbumSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumName.trim()) return;

    onCreateAlbum(albumName.trim(), albumDesc.trim());
    setAlbumName(''); setAlbumDesc('');
    setShowCreateAlbum(false);
    alert('Facebook-style photo album folder created!');
  };

  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlbum || !photoUrl.trim()) return;

    onAddPhotoToAlbum(selectedAlbum.id, photoUrl.trim(), photoCaption.trim(), photoType);
    
    // Auto update state view
    const updatedAlbum = albums.find(a => a.id === selectedAlbum.id);
    if (updatedAlbum) {
      setSelectedAlbum(updatedAlbum);
    }

    setPhotoUrl(''); setPhotoCaption(''); setPhotoType('image');
    setShowAddPhoto(false);
    alert(`New ${photoType === 'video' ? 'video' : 'snapshot'} uploaded to album gallery!`);
  };

  const handleDownloadPhoto = (p: Photo) => {
    // Elegant down-stream dynamic canvas bypass download
    const link = document.createElement('a');
    link.href = p.url;
    link.target = '_blank';
    link.download = `51_scout_${p.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert(`Downloading image descriptor bypass requested. Snapshot linked: ${p.caption || 'Scout Activity photo'}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header and folder triggers */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between pb-4 border-b border-stone-800">
        <div>
          <h3 className="font-bold text-sm tracking-wider text-stone-100 uppercase flex items-center gap-2">
            <Image className="w-5 h-5 text-amber-500" /> Scout Activities Media Albums
          </h3>
          <p className="text-xs text-stone-500 font-mono mt-1">Facebook-style albums for campouts and ceremony sessions</p>
        </div>

        {isLeaderOrAdmin && (
          <button
            onClick={() => { setShowCreateAlbum(!showCreateAlbum); setSelectedAlbum(null); }}
            className="w-full md:w-auto bg-amber-500 font-bold hover:bg-amber-400 active:scale-95 transition text-stone-950 text-xs px-4 py-2 rounded-lg flex items-center justify-center gap-1.5"
          >
            <FolderPlus className="w-4 h-4" /> Create Album
          </button>
        )}
      </div>

      {/* Creation form album */}
      {showCreateAlbum && (
        <form onSubmit={handleCreateAlbumSubmit} className="bg-stone-900/60 border border-stone-800 rounded-xl p-5 space-y-4 max-w-md mx-auto animate-fadeIn">
          <h4 className="text-xs font-bold text-amber-500 font-mono tracking-wider uppercase">New Visual Album Folder</h4>
          
          <div>
            <label className="block text-[10px] text-stone-400 font-mono uppercase mb-1">Album Title Name</label>
            <input
              type="text"
              className="w-full bg-stone-950 text-xs border border-stone-850 rounded px-2.5 py-2 text-stone-100 outline-none"
              placeholder="e.g. District Camp 2026"
              required
              value={albumName}
              onChange={(e) => setAlbumName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] text-stone-400 font-mono uppercase mb-1">Short Description</label>
            <input
              type="text"
              className="w-full bg-stone-950 text-xs border border-stone-850 rounded px-2.5 py-2 text-stone-100 outline-none"
              placeholder="e.g. Memory files from Kandy outing"
              value={albumDesc}
              onChange={(e) => setAlbumDesc(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 text-xs">
            <button
              type="button"
              className="bg-stone-800 text-stone-200 px-3 py-1.5 rounded"
              onClick={() => setShowCreateAlbum(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-amber-500 text-stone-950 font-bold px-4 py-1.5 rounded hover:bg-amber-400"
            >
              Initialize Folder
            </button>
          </div>
        </form>
      )}

      {/* Root Album View vs Inside Album View */}
      {!selectedAlbum ? (
        /* ALBUMS DIRECTORY */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {albums.map(alb => {
            const imgs = alb.photos.filter(p => !p.type || p.type === 'image').length;
            const vids = alb.photos.filter(p => p.type === 'video').length;
            return (
              <div
                key={alb.id}
                onClick={() => setSelectedAlbum(alb)}
                className="bg-stone-900/40 border border-stone-800/80 hover:border-stone-700/80 rounded-xl p-4 cursor-pointer relative overflow-hidden group hover:-translate-y-0.5 transition"
              >
                <div className="aspect-video w-full rounded-lg bg-stone-950 overflow-hidden mb-3 border border-stone-850 relative">
                  {alb.photos.length > 0 ? (
                    <img
                      src={alb.photos[0].url}
                      alt="Album Cover"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-700 font-mono text-xs">
                      📁 No media uploaded
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-stone-950/80 backdrop-blur-xs text-[9px] font-bold text-amber-500 px-2 py-0.5 rounded font-mono border border-stone-800">
                    {imgs} {imgs === 1 ? 'PHOTO' : 'PHOTOS'} {vids > 0 && `· ${vids} ${vids === 1 ? 'VIDEO' : 'VIDEOS'}`}
                  </div>
                </div>

                <h4 className="text-sm font-bold text-stone-200 group-hover:text-amber-400 transition truncate">{alb.name}</h4>
                <p className="text-xs text-stone-500 truncate mt-1 leading-relaxed">{alb.description || 'No description provided.'}</p>
              </div>
            );
          })}
        </div>
      ) : (
        /* INSIDE ALBUM */
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-stone-950/40 border border-stone-850 p-4 rounded-xl">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-stone-500 font-mono">
                <span className="hover:text-amber-500 cursor-pointer" onClick={() => setSelectedAlbum(null)}>Albums Root</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-stone-300 font-semibold">{selectedAlbum.name}</span>
              </div>
              <h3 className="text-base font-bold text-stone-100 mt-1">{selectedAlbum.name}</h3>
              <p className="text-xs text-stone-400 mt-1">{selectedAlbum.description}</p>
            </div>

            <div className="flex gap-2">
              {isLeaderOrAdmin && (
                <button
                  type="button"
                  onClick={() => setShowAddPhoto(!showAddPhoto)}
                  className="bg-amber-500 text-stone-950 font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1 hover:bg-amber-400 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Photo / Video
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedAlbum(null)}
                className="bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs px-3.5 py-1.5 rounded-lg cursor-pointer"
              >
                Go Back
              </button>
            </div>
          </div>

          {/* Add photo/video inline form */}
          {showAddPhoto && (
            <form onSubmit={handleAddPhotoSubmit} className="bg-stone-900/60 border border-stone-850 rounded-xl p-5 space-y-4 max-w-md mx-auto animate-fadeIn">
              <h4 className="text-xs font-bold text-amber-500 font-mono tracking-wider uppercase">Add Media file to "{selectedAlbum.name}"</h4>
              
              <div>
                <label className="block text-[10px] text-stone-400 font-mono uppercase mb-2">Media Upload Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-xs text-stone-300 cursor-pointer">
                    <input
                      type="radio"
                      name="mediaTypeType"
                      value="image"
                      checked={photoType === 'image'}
                      onChange={() => setPhotoType('image')}
                      className="accent-amber-500 bg-stone-950 border-stone-800 focus:ring-amber-500"
                    />
                    <span>Photo / Image</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-stone-300 cursor-pointer">
                    <input
                      type="radio"
                      name="mediaTypeType"
                      value="video"
                      checked={photoType === 'video'}
                      onChange={() => setPhotoType('video')}
                      className="accent-amber-500 bg-stone-950 border-stone-800 focus:ring-amber-500"
                    />
                    <span>Video file / YouTube Link</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-stone-400 font-mono uppercase mb-1">
                  {photoType === 'video' ? 'Video File URL or YouTube Link' : 'Image online path / URL'}
                </label>
                <input
                  type="text"
                  className="w-full bg-stone-950 text-xs border border-stone-850 rounded px-2.5 py-2 text-stone-100 outline-none focus:border-amber-500/50"
                  placeholder={photoType === 'video' ? "Paste MP4 source URL or YouTube watch URL" : "Paste image URL (Unsplash, Imgur or similar)"}
                  required
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] text-stone-400 font-mono uppercase mb-1">Caption / Details</label>
                <input
                  type="text"
                  className="w-full bg-stone-950 text-xs border border-stone-850 rounded px-2.5 py-2 text-stone-100 outline-none focus:border-amber-500/50"
                  placeholder="e.g. Flag elevation morning assembly"
                  required
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  className="bg-stone-800 text-stone-200 px-3 py-1.5 rounded cursor-pointer"
                  onClick={() => setShowAddPhoto(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 text-stone-950 font-bold px-4 py-1.5 rounded hover:bg-amber-400 cursor-pointer"
                >
                  Confirm Upload
                </button>
              </div>
            </form>
          )}

          {/* Album Photos/Videos Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {selectedAlbum.photos.length === 0 ? (
              <div className="col-span-full py-16 text-center text-stone-500 font-mono text-xs">
                No active photographs or videos in this folder cabinet yet.
              </div>
            ) : (
              selectedAlbum.photos.map(p => {
                const isVideo = p.type === 'video';
                return (
                  <div key={p.id} className="bg-stone-900 border border-stone-800 rounded-lg overflow-hidden group relative flex flex-col justify-between h-48 shadow">
                    <div 
                      className="flex-1 overflow-hidden bg-stone-950 cursor-zoom-in relative"
                      onClick={() => setActivePhoto(p)}
                    >
                      {isVideo ? (
                        <div className="w-full h-full bg-stone-950 flex items-center justify-center relative">
                          <Video className="w-8 h-8 text-amber-500 opacity-60 absolute z-5" />
                          {p.url.includes('youtube.com') || p.url.includes('youtu.be') ? (
                            <img
                              src={`https://img.youtube.com/vi/${
                                p.url.includes('youtu.be/') 
                                  ? p.url.split('youtu.be/')[1]?.split('?')[0] 
                                  : p.url.split('v=')[1]?.split('&')[0]
                              }/0.jpg`}
                              alt={p.caption}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-40"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <video
                              src={p.url}
                              className="w-full h-full object-cover opacity-55"
                              preload="metadata"
                              muted
                              playsInline
                            />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition">
                            <span className="bg-amber-500 hover:bg-amber-400 text-stone-950 p-2 rounded-full shadow-lg group-hover:scale-110 transition duration-300">
                              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" stroke="none" />
                              </svg>
                            </span>
                          </div>
                          <span className="absolute bottom-1.5 left-2 bg-stone-950/70 py-0.5 px-1.5 text-[8px] font-mono text-amber-400 rounded tracking-wider border border-stone-800">
                            VIDEO
                          </span>
                        </div>
                      ) : (
                        <img
                          src={p.url}
                          alt={p.caption}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                    
                    <div className="p-2 text-[10px] text-stone-400 truncate max-w-full font-sans bg-stone-900/65 flex justify-between items-center gap-2">
                      <span className="truncate pr-1" title={p.caption}>{p.caption}</span>
                      <button
                        type="button"
                        onClick={() => handleDownloadPhoto(p)}
                        className="p-1 hover:text-amber-400 text-stone-500 shrink-0 border border-stone-800 rounded bg-stone-950 shadow-sm cursor-pointer"
                        title={isVideo ? "Download bypass file link / open file" : "Download image bypass file"}
                      >
                        <Download className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Full-size Photo viewer modal */}
      {activePhoto && (
        <div 
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 bg-stone-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-200 cursor-zoom-out animate-fadeIn"
        >
          <div className="relative max-w-3xl w-full max-h-[80vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {activePhoto.type === 'video' ? (
              activePhoto.url.includes('youtube.com') || activePhoto.url.includes('youtu.be') ? (
                <iframe
                  src={getYouTubeEmbedUrl(activePhoto.url)}
                  title={activePhoto.caption}
                  className="w-full aspect-video rounded-lg max-h-[75vh] border border-stone-800 shadow-2xl bg-black"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={activePhoto.url}
                  className="max-w-full max-h-[75vh] rounded-lg object-contain shadow-2xl border border-stone-800 bg-black"
                  controls
                  autoPlay
                />
              )
            ) : (
              <img
                src={activePhoto.url}
                alt={activePhoto.caption}
                className="max-w-full max-h-[85vh] rounded-lg object-contain shadow-2xl border border-stone-800"
                referrerPolicy="no-referrer"
              />
            )}
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute -top-10 right-0 bg-stone-900 hover:bg-stone-800 text-stone-300 p-2 rounded-full border border-stone-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-stone-300 text-center text-xs mt-3 bg-stone-900/80 px-4 py-2 border border-stone-800 rounded-lg max-w-md font-sans">
            <p className="font-bold flex items-center justify-center gap-1.5">
              {activePhoto.type === 'video' && <Video className="w-3.5 h-3.5 text-amber-500" />} {activePhoto.caption}
            </p>
            <p className="text-[10px] text-stone-500 font-mono mt-1">Date: {activePhoto.date}</p>
          </div>
        </div>
      )}

    </div>
  );
}
