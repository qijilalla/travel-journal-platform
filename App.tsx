import React, { useState, useEffect } from 'react';
import { JournalEntry, Language, DICTIONARY, User } from './types';
import * as api from './services/api';
import JournalForm from './components/JournalForm';
import JournalCard from './components/JournalCard';
import JournalDetailPage from './components/JournalDetailPage';
import AuthModal from './components/AuthModal';
import PixelButton from './components/PixelButton';
import { Globe, User as UserIcon, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Views: list = feed, my-journal = dashboard, detail = single page
  const [view, setView] = useState<'list' | 'create' | 'edit' | 'my-journal' | 'detail'>('list');
  const [editingEntry, setEditingEntry] = useState<JournalEntry | undefined>(undefined);
  const [language, setLanguage] = useState<Language>('en');
  
  // Auth & Selection
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  const t = DICTIONARY[language];

  // --- Effects ---
  useEffect(() => {
    fetchEntries();
  }, []);

  // --- Handlers ---
  const fetchEntries = async () => {
    setLoading(true);
    try {
      const data = await api.getJournals();
      setEntries(data);
    } catch (error) {
      console.error("Failed to fetch journals", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: Omit<JournalEntry, 'id'>) => {
    if (!user) { setShowAuthModal(true); return; }
    setLoading(true);
    try {
      await api.createJournal({ ...data, authorId: user.id, authorName: user.username });
      await fetchEntries();
      setView('list');
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleUpdate = async (data: JournalEntry | Omit<JournalEntry, 'id'>) => {
    if (!user) return;
    setLoading(true);
    try {
      if ('id' in data) {
        await api.updateJournal(data as JournalEntry);
        await fetchEntries();
        // Return to where we came from
        if (selectedEntry && selectedEntry.id === (data as JournalEntry).id) {
            setSelectedEntry(data as JournalEntry);
            setView('detail');
        } else {
            setView('list');
        }
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this memory?")) {
      setLoading(true);
      try {
        await api.deleteJournal(id);
        await fetchEntries();
        // If deleting current detailed entry, go back to list
        if (selectedEntry?.id === id) {
             setSelectedEntry(null);
             setView('list');
        }
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    }
  };

  const handleLike = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); 
    if (!user) { setShowAuthModal(true); return; }

    try {
      const updatedLikes = await api.toggleLike(id, user.id);
      
      const updateEntry = (e: JournalEntry) => e.id === id ? { ...e, likes: updatedLikes } : e;
      
      setEntries(prev => prev.map(updateEntry));
      if (selectedEntry?.id === id) {
        setSelectedEntry(prev => prev ? updateEntry(prev) : null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (id: string, text: string) => {
    if (!user) { setShowAuthModal(true); return; }
    try {
      const newComment = await api.addComment(id, { 
        authorId: user.id, 
        authorName: user.username, 
        text 
      });
      
      const updateEntry = (entry: JournalEntry) => ({
        ...entry,
        comments: [...entry.comments, newComment]
      });

      setEntries(prev => prev.map(e => e.id === id ? updateEntry(e) : e));
      if (selectedEntry?.id === id) {
        setSelectedEntry(prev => prev ? updateEntry(prev) : null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (entryId: string, commentId: string) => {
      if (!user) return;
      try {
          await api.deleteComment(entryId, commentId);
          
          const updateEntry = (entry: JournalEntry) => ({
              ...entry,
              comments: entry.comments.filter(c => c.id !== commentId)
          });
          
          setEntries(prev => prev.map(e => e.id === entryId ? updateEntry(e) : e));
          if (selectedEntry?.id === entryId) {
            setSelectedEntry(prev => prev ? updateEntry(prev) : null);
          }
      } catch(err) {
          console.error(err);
      }
  };

  const handleLogin = async (username: string) => {
    try {
      const loggedUser = await api.login(username);
      setUser(loggedUser);
    } catch (e) {
      console.error(e);
      alert("Login failed");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('list');
    setSelectedEntry(null);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'cn' : 'en');
  };

  // --- Filtering Logic ---
  // Global View: Show Only Public
  // Dashboard: 
  //   - If Admin: Show ALL entries (Moderation mode)
  //   - If Normal User: Show only their entries
  const displayedEntries = React.useMemo(() => {
      if (view === 'my-journal' && user) {
          if (user.isAdmin) return entries; // Admin sees all
          return entries.filter(e => e.authorId === user.id); // User sees theirs
      }
      return entries.filter(e => !e.isPrivate); // Public Feed
  }, [view, user, entries]);

  // --- Render ---
  return (
    <div className="min-h-screen bg-stone-50 selection:bg-stone-200 selection:text-black">
      
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="flex flex-col">
                <h1 className="font-header text-2xl tracking-tighter text-stone-900 cursor-pointer" onClick={() => setView('list')}>
                  {t.title}
                </h1>
                <span className="font-body text-[0.65rem] uppercase tracking-[0.2em] text-stone-500 hidden sm:block">
                  {t.subtitle}
                </span>
             </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
               onClick={toggleLanguage} 
               className="flex items-center gap-2 font-body text-xs uppercase tracking-widest hover:text-stone-500 transition-colors"
            >
              <Globe size={14} /> <span className="hidden sm:inline">{language === 'en' ? 'EN' : 'CN'}</span>
            </button>

            {user ? (
              <div className="flex items-center gap-4">
                 <button 
                  onClick={() => setView('my-journal')}
                  className={`flex items-center gap-2 font-body text-xs uppercase tracking-widest hover:text-stone-900 transition-colors ${view === 'my-journal' ? 'text-stone-900 font-bold border-b border-stone-900' : 'text-stone-500'}`}
                 >
                   {user.isAdmin ? <ShieldCheck size={14} /> : <LayoutDashboard size={14} />} 
                   <span className="hidden md:inline">{user.isAdmin ? t.adminDashboard : t.myJournals}</span>
                 </button>
                 <div className="h-4 w-px bg-stone-300"></div>
                 <button 
                   onClick={handleLogout}
                   className="flex items-center gap-2 font-body text-xs uppercase tracking-widest text-stone-500 hover:text-red-500 transition-colors"
                 >
                   <LogOut size={14} />
                 </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="font-body text-xs uppercase tracking-widest text-stone-900 border border-stone-900 px-4 py-2 hover:bg-stone-900 hover:text-white transition-colors"
              >
                {t.login}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Loading State Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-white/80 z-[70] flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
                <div className="w-16 h-1 bg-stone-900 mx-auto mb-6 animate-pulse"></div>
                <h3 className="font-header text-xl italic text-stone-800">{t.loading}</h3>
            </div>
          </div>
        )}

        {/* --- VIEW: Detail Page --- */}
        {view === 'detail' && selectedEntry ? (
            <JournalDetailPage 
                entry={selectedEntry}
                currentUser={user}
                t={t}
                onBack={() => setView(view === 'my-journal' ? 'my-journal' : 'list')}
                onLike={handleLike}
                onComment={handleComment}
                onDeleteComment={handleDeleteComment}
                onEdit={(entry) => { setEditingEntry(entry); setView('edit'); }}
                onDelete={handleDelete}
            />
        ) : 
        
        /* --- VIEW: List or Dashboard --- */
        (view === 'list' || view === 'my-journal') ? (
          <>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-stone-200 pb-6 gap-6">
               <div className="max-w-xl">
                  <h2 className="font-header text-5xl md:text-6xl text-stone-900 mb-4 leading-tight">
                    {view === 'my-journal' 
                        ? (user?.isAdmin ? t.adminDashboard : t.myJournals) 
                        : 'Journal'}
                  </h2>
                  <p className="font-body text-stone-500 text-lg font-light leading-relaxed">
                    {view === 'my-journal' 
                      ? (user?.isAdmin 
                          ? "Administrator Access: Managing all global entries." 
                          : "Manage your stories. You can see private entries here.")
                      : "Curating memories from around the globe. Only public stories are shown."}
                  </p>
               </div>
               <div className="mb-2">
                 <PixelButton onClick={() => { 
                   if(!user) setShowAuthModal(true);
                   else { setView('create'); setEditingEntry(undefined); }
                 }}>
                   {t.createButton}
                 </PixelButton>
               </div>
            </div>

            {displayedEntries.length === 0 && !loading ? (
              <div className="text-center py-32 border border-stone-200 bg-white">
                <p className="font-header text-stone-300 mb-6 text-5xl italic">Empty</p>
                <p className="font-body text-stone-500 mb-8">{t.noEntries}</p>
                <PixelButton variant="secondary" onClick={() => {
                   if(!user) setShowAuthModal(true);
                   else { setView('create'); setEditingEntry(undefined); }
                }}>Start Writing</PixelButton>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {displayedEntries.map(entry => (
                  <JournalCard 
                    key={entry.id} 
                    entry={entry} 
                    t={t}
                    currentUserId={user?.id}
                    onLike={handleLike}
                    onClick={(e) => { setSelectedEntry(e); setView('detail'); }}
                  />
                ))}
              </div>
            )}
          </>
        ) : 
        
        /* --- VIEW: Create / Edit Form --- */
        (
          <div className="animate-fade-in-up">
             <div className="mb-8 flex justify-center">
               <button 
                  onClick={() => setView('list')} 
                  className="font-body text-xs uppercase tracking-[0.2em] text-stone-400 hover:text-stone-900 transition-colors border-b border-transparent hover:border-stone-900 pb-1"
                >
                 {t.cancel}
               </button>
             </div>
             <JournalForm 
               t={t}
               initialData={editingEntry}
               onSave={view === 'create' ? handleCreate : handleUpdate}
               onCancel={() => setView(view === 'edit' && selectedEntry ? 'detail' : 'list')}
             />
          </div>
        )}

      </main>

      {/* Footer */}
      {(view === 'list' || view === 'my-journal') && (
        <footer className="text-center py-12 border-t border-stone-200 mt-12 bg-white">
            <p className="font-header italic text-stone-900 text-lg mb-2">Travel Journal Platform</p>
            <p className="font-body text-xs text-stone-400 uppercase tracking-widest">Designed for Azure Cloud Native</p>
        </footer>
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
        t={t}
      />

    </div>
  );
};

export default App;