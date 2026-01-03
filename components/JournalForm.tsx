import React, { useState, useRef } from 'react';
import { JournalEntry, Translation } from '../types';
import PixelButton from './PixelButton';
import { Upload, MapPin, Calendar, FileText, Lock, Globe } from 'lucide-react';
import { uploadImage } from '../services/api';

interface JournalFormProps {
  initialData?: JournalEntry;
  t: Translation;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const JournalForm: React.FC<JournalFormProps> = ({ initialData, t, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    location: initialData?.location || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    content: initialData?.content || '',
    imageUrl: initialData?.imageUrl || '',
    isPrivate: initialData?.isPrivate || false,
  });
  
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const url = await uploadImage(e.target.files[0]);
        setFormData(prev => ({ ...prev, imageUrl: url }));
      } catch (error) {
        console.error("Upload failed", error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData) {
      onSave({ ...formData, id: initialData.id });
    } else {
      onSave(formData);
    }
  };

  const inputClass = "w-full font-body text-lg bg-transparent border-b border-stone-300 py-3 focus:outline-none focus:border-stone-800 transition-colors placeholder-stone-400 text-stone-800";
  const labelClass = "block font-header text-sm text-stone-500 mb-1 mt-6";

  return (
    <div className="bg-white p-8 md:p-12 shadow-xl shadow-stone-200/50 max-w-3xl mx-auto">
      <h2 className="font-header text-3xl md:text-4xl mb-8 text-center text-stone-900 italic">
        {initialData ? t.edit : t.createButton.replace('+ ', '')}
      </h2>
      
      <form onSubmit={handleSubmit}>
        {/* Image Upload Area */}
        <div className="mb-8">
            <label className={labelClass}>{t.imageLabel}</label>
            <div 
              className={`relative border border-stone-200 bg-stone-50 h-64 md:h-80 flex flex-col items-center justify-center cursor-pointer hover:bg-stone-100 transition-colors duration-500 group overflow-hidden ${uploading ? 'opacity-50' : ''}`}
              onClick={() => fileInputRef.current?.click()}
            >
              {formData.imageUrl ? (
                <>
                   <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="font-body uppercase tracking-widest text-white text-xs border border-white px-4 py-2">{t.uploadImage}</span>
                   </div>
                </>
              ) : (
                <div className="text-center p-6">
                  <div className="border rounded-full p-4 inline-block border-stone-300 mb-3 text-stone-400 group-hover:border-stone-500 group-hover:text-stone-500 transition-all">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="font-header text-lg text-stone-400 group-hover:text-stone-600 transition-colors italic">{uploading ? 'Uploading...' : t.uploadImage}</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>
        </div>

        {/* Visibility Toggle */}
        <div className="mb-6">
          <label className={labelClass}>{t.visibilityLabel}</label>
          <div className="flex gap-4 mt-2">
            <button
              type="button"
              onClick={() => setFormData({...formData, isPrivate: false})}
              className={`flex-1 flex items-center justify-center gap-2 py-3 border transition-colors ${!formData.isPrivate ? 'bg-stone-900 text-white border-stone-900' : 'bg-transparent text-stone-400 border-stone-200 hover:border-stone-400'}`}
            >
              <Globe size={16} /> <span className="text-xs uppercase tracking-widest">{t.publicLabel}</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, isPrivate: true})}
              className={`flex-1 flex items-center justify-center gap-2 py-3 border transition-colors ${formData.isPrivate ? 'bg-stone-900 text-white border-stone-900' : 'bg-transparent text-stone-400 border-stone-200 hover:border-stone-400'}`}
            >
              <Lock size={16} /> <span className="text-xs uppercase tracking-widest">{t.privateLabel}</span>
            </button>
          </div>
        </div>

        <div>
          <label className={labelClass}>Title</label>
          <input
            type="text"
            required
            className={`${inputClass} text-2xl font-header`}
            placeholder={t.placeholderTitle}
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className={labelClass}><MapPin className="inline w-3 h-3 mr-1 text-stone-400"/>{t.locationLabel}</label>
            <input
              type="text"
              required
              className={inputClass}
              placeholder={t.placeholderLocation}
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
            />
          </div>
          <div>
            <label className={labelClass}><Calendar className="inline w-3 h-3 mr-1 text-stone-400"/>{t.dateLabel}</label>
            <input
              type="date"
              required
              className={inputClass}
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}><FileText className="inline w-3 h-3 mr-1 text-stone-400"/>Content</label>
          <textarea
            required
            rows={6}
            className={`${inputClass} resize-none`}
            placeholder={t.placeholderContent}
            value={formData.content}
            onChange={e => setFormData({...formData, content: e.target.value})}
          />
        </div>

        <div className="mt-12 flex justify-end gap-4 border-t border-stone-100 pt-8">
          <PixelButton type="button" variant="secondary" onClick={onCancel}>
            {t.cancel}
          </PixelButton>
          <PixelButton type="submit" disabled={uploading}>
            {t.save}
          </PixelButton>
        </div>
      </form>
    </div>
  );
};

export default JournalForm;