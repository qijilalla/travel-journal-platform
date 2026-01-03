import React, { useState } from 'react';
import { JournalEntry, Translation, User } from '../types';
import { MapPin, Calendar, Heart, MessageCircle, Send, ArrowLeft, Lock, Edit2, Trash2, ShieldAlert, X } from 'lucide-react';
import PixelButton from './PixelButton';

interface JournalDetailPageProps {
  entry: JournalEntry;
  currentUser: User | null;
  t: Translation;
  onBack: () => void;
  onLike: (id: string) => void;
  onComment: (id: string, text: string) => void;
  onDeleteComment: (entryId: string, commentId: string) => void; // New prop
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

const JournalDetailPage: React.FC<JournalDetailPageProps> = ({ 
  entry, currentUser, t, onBack, onLike, onComment, onDeleteComment, onEdit, onDelete 
}) => {
  const [commentText, setCommentText] = useState('');

  const isLiked = currentUser && entry.likes.includes(currentUser.id);
  
  // Permission Check: Author OR Admin
  const isAuthor = currentUser && entry.authorId === currentUser.id;
  const isAdmin = currentUser?.isAdmin;
  const canManagePost = isAuthor || isAdmin;

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(entry.id, commentText);
      setCommentText('');
    }
  };

  return (
    <div className="animate-fade-in-up pb-20">
      
      {/* Navigation & Actions Bar */}
      <div className="flex justify-between items-center mb-8 sticky top-[73px] bg-stone-50/90 backdrop-blur-sm z-40 py-4 border-b border-stone-200">
         <button 
           onClick={onBack}
           className="flex items-center gap-2 font-body text-xs uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900 transition-colors"
         >
           <ArrowLeft size={16} /> {t.backToList}
         </button>

         {canManagePost && (
           <div className="flex gap-2 items-center">
             {isAdmin && !isAuthor && (
               <span className="text-[0.6rem] uppercase tracking-widest text-red-500 mr-2 flex items-center gap-1 font-bold">
                 <ShieldAlert size={12}/> Admin Mode
               </span>
             )}
             <PixelButton variant="secondary" onClick={() => onEdit(entry)} className="!px-4 !py-2 !text-[0.6rem]">
               <Edit2 size={12} className="mr-2 inline" /> {t.edit}
             </PixelButton>
             <PixelButton variant="danger" onClick={() => onDelete(entry.id)} className="!px-4 !py-2 !text-[0.6rem]">
               <Trash2 size={12} />
             </PixelButton>
           </div>
         )}
      </div>

      <article className="max-w-4xl mx-auto bg-white shadow-xl shadow-stone-200/50 overflow-hidden">
        
        {/* Hero Image */}
        <div className="w-full h-[50vh] md:h-[60vh] bg-stone-200 relative">
          {entry.imageUrl ? (
            <img src={entry.imageUrl} alt={entry.title} className="w-full h-full object-cover" />
          ) : (
             <div className="w-full h-full flex items-center justify-center">
               <span className="font-header text-stone-400 italic text-3xl">No Image</span>
             </div>
          )}
          {entry.isPrivate && (
            <div className="absolute top-6 left-6 bg-stone-900 text-white px-3 py-1 text-xs uppercase tracking-widest font-body flex items-center gap-2">
              <Lock size={12} /> {t.privateBadge}
            </div>
          )}
        </div>

        <div className="px-8 md:px-16 py-12 md:py-16">
          {/* Metadata */}
          <div className="flex flex-col md:flex-row md:items-center justify-center gap-6 text-xs font-bold uppercase tracking-widest text-stone-400 mb-8 text-center border-b border-stone-100 pb-8">
             <span className="flex items-center justify-center"><MapPin size={14} className="mr-2"/> {entry.location}</span>
             <span className="hidden md:block text-stone-200">•</span>
             <span className="flex items-center justify-center"><Calendar size={14} className="mr-2"/> {entry.date}</span>
             <span className="hidden md:block text-stone-200">•</span>
             <span className="text-stone-800">By {entry.authorName}</span>
          </div>

          {/* Title */}
          <h1 className="font-header text-4xl md:text-6xl text-stone-900 mb-12 text-center leading-tight">
            {entry.title}
          </h1>

          {/* Content */}
          <div className="prose prose-stone prose-lg mx-auto font-body text-stone-600 leading-loose mb-16 first-letter:text-5xl first-letter:font-header first-letter:float-left first-letter:mr-3 first-letter:mt-[-10px] first-letter:text-stone-900">
            {entry.content}
          </div>

          {/* Social Interactions */}
          <div className="flex items-center justify-center gap-8 mb-16">
            <button 
              onClick={() => onLike(entry.id)}
              className={`flex flex-col items-center gap-2 transition-transform active:scale-95 group`}
            >
              <div className={`p-4 rounded-full border transition-colors ${isLiked ? 'bg-red-50 border-red-200 text-red-500' : 'border-stone-200 text-stone-400 hover:border-stone-900 hover:text-stone-900'}`}>
                 <Heart size={28} fill={isLiked ? "currentColor" : "none"} />
              </div>
              <span className="font-body text-xs uppercase tracking-widest text-stone-500">{entry.likes.length} {t.likes}</span>
            </button>
          </div>

          {/* Comments Section */}
          <div className="max-w-2xl mx-auto border-t border-stone-100 pt-12">
            <h3 className="font-header text-2xl text-center mb-8 flex items-center justify-center gap-3">
              <MessageCircle className="text-stone-300" /> {t.comments}
            </h3>

            <div className="space-y-8 mb-10">
              {entry.comments.length === 0 ? (
                <p className="text-center text-stone-400 font-body italic text-sm">No comments yet. Share your thoughts.</p>
              ) : (
                entry.comments.map(comment => (
                  <div key={comment.id} className="flex gap-4 group/comment relative">
                    <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center font-header text-stone-500 text-lg flex-shrink-0">
                      {comment.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-baseline gap-3 mb-1">
                        <span className="font-bold text-stone-900 font-body text-sm">{comment.authorName}</span>
                        <span className="text-xs text-stone-400 font-body">{comment.date}</span>
                      </div>
                      <p className="text-stone-600 font-body text-base leading-relaxed">{comment.text}</p>
                    </div>
                    
                    {/* Delete Comment Button (For Admin or Post Author) */}
                    {canManagePost && (
                        <button 
                            onClick={() => {
                                if(window.confirm("Delete this comment?")) onDeleteComment(entry.id, comment.id);
                            }}
                            className="absolute right-0 top-0 text-stone-300 hover:text-red-500 opacity-0 group-hover/comment:opacity-100 transition-opacity p-1"
                        >
                            <X size={14} />
                        </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            {currentUser ? (
              <form onSubmit={handleSubmitComment} className="flex gap-0 shadow-lg shadow-stone-100">
                <input 
                  type="text" 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 bg-stone-50 border-none px-6 py-4 font-body focus:outline-none focus:ring-1 focus:ring-stone-200 transition-colors"
                  placeholder={t.addComment}
                />
                <button 
                  type="submit" 
                  disabled={!commentText.trim()}
                  className="bg-stone-900 text-white px-8 hover:bg-stone-700 disabled:opacity-50 transition-colors uppercase tracking-widest font-body text-xs"
                >
                  {t.save}
                </button>
              </form>
            ) : (
               <div className="text-center p-6 bg-stone-50 border border-stone-100">
                 <p className="font-body text-stone-500 text-sm">{t.loginToAction}</p>
               </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
};

export default JournalDetailPage;