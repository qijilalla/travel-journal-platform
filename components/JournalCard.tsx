import React from 'react';
import { JournalEntry, Translation } from '../types';
import { MapPin, Calendar, Heart, MessageCircle, Lock } from 'lucide-react';

interface JournalCardProps {
  entry: JournalEntry;
  t: Translation;
  currentUserId?: string;
  onClick: (entry: JournalEntry) => void;
  onLike: (id: string, e: React.MouseEvent) => void;
}

const JournalCard: React.FC<JournalCardProps> = ({ entry, t, currentUserId, onClick, onLike }) => {
  
  const isLiked = currentUserId && entry.likes.includes(currentUserId);

  return (
    <div 
      className="group bg-white flex flex-col h-full shadow-sm hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-500 ease-out cursor-pointer relative"
      onClick={() => onClick(entry)}
    >
      
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        {entry.imageUrl ? (
          <img 
            src={entry.imageUrl} 
            alt={entry.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-stone-100">
             <span className="font-header text-stone-300 text-4xl italic">No Image</span>
          </div>
        )}
        
        {/* Private Indicator */}
        {entry.isPrivate && (
            <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur text-white px-2 py-1 text-[0.6rem] uppercase tracking-widest font-body flex items-center gap-1">
              <Lock size={10} /> {t.privateBadge}
            </div>
        )}
        
        {/* Overlay Info (Likes/Comments Preview) */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-between items-end">
             <div className="text-white font-body text-xs">
               <span className="block font-bold">{entry.authorName}</span>
             </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 md:p-8 flex-grow flex flex-col bg-white z-10">
        <div className="mb-4 flex items-center justify-between border-b border-stone-100 pb-4">
             <span className="flex items-center text-xs font-bold uppercase tracking-widest text-stone-400">
                <MapPin size={12} className="mr-1"/> {entry.location}
            </span>
            <span className="flex items-center text-xs font-body text-stone-400">
                {entry.date}
            </span>
        </div>

        <h3 className="font-header text-2xl md:text-3xl mb-4 leading-tight text-stone-900 group-hover:text-stone-600 transition-colors">
            {entry.title}
        </h3>

        <p className="font-body text-stone-600 leading-relaxed line-clamp-3 mb-6 font-light">
          {entry.content}
        </p>
        
        {/* Social Stats footer */}
        <div className="mt-auto pt-4 flex items-center justify-between text-stone-400 border-t border-stone-50">
           <button 
             onClick={(e) => onLike(entry.id, e)}
             className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest hover:text-red-500 transition-colors ${isLiked ? 'text-red-500' : ''}`}
           >
              <Heart size={14} fill={isLiked ? "currentColor" : "none"} /> {entry.likes.length}
           </button>
           <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
              <MessageCircle size={14} /> {entry.comments.length}
           </div>
        </div>
      </div>
    </div>
  );
};

export default JournalCard;