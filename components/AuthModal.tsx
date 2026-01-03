import React, { useState } from 'react';
import PixelButton from './PixelButton';
import { Translation } from '../types';
import { X, ShieldCheck, User } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string) => void;
  t: Translation;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, t }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-md shadow-2xl p-8 md:p-10 animate-fade-in-up">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <h2 className="font-header text-3xl mb-2 italic">
            {isRegister ? t.joinUs : t.welcomeBack}
          </h2>
          <p className="font-body text-stone-500 text-sm tracking-wide">
            {t.signInDesc}
          </p>
        </div>

        {/* --- Quick Login Section --- */}
        {!isRegister && (
            <div className="mb-8">
                <p className="font-body text-xs uppercase tracking-widest text-stone-400 text-center mb-3">{t.quickLogin}</p>
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => { onLogin('admin'); onClose(); }}
                        className="flex flex-col items-center justify-center p-4 border border-stone-200 hover:border-red-500 hover:bg-red-50 transition-all rounded-sm group"
                    >
                        <ShieldCheck size={24} className="text-stone-400 group-hover:text-red-500 mb-2 transition-colors" />
                        <span className="font-header text-stone-800 text-sm">{t.adminRole}</span>
                    </button>
                    <button 
                        onClick={() => { onLogin('user'); onClose(); }}
                        className="flex flex-col items-center justify-center p-4 border border-stone-200 hover:border-stone-900 hover:bg-stone-50 transition-all rounded-sm group"
                    >
                        <User size={24} className="text-stone-400 group-hover:text-stone-900 mb-2 transition-colors" />
                        <span className="font-header text-stone-800 text-sm">{t.userRole}</span>
                    </button>
                </div>
                <div className="relative flex items-center py-6">
                    <div className="flex-grow border-t border-stone-200"></div>
                    <span className="flex-shrink-0 mx-4 text-stone-400 text-[10px] uppercase tracking-widest">OR</span>
                    <div className="flex-grow border-t border-stone-200"></div>
                </div>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-body text-xs uppercase tracking-widest text-stone-500 mb-2">
              {t.username}
            </label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border-b border-stone-300 py-2 font-header text-xl focus:outline-none focus:border-stone-900 transition-colors bg-transparent"
              placeholder="e.g. TravelGuru"
              required
            />
          </div>
          
          <div>
            <label className="block font-body text-xs uppercase tracking-widest text-stone-500 mb-2">
              {t.password}
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-stone-300 py-2 font-header text-xl focus:outline-none focus:border-stone-900 transition-colors bg-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="pt-4">
            <PixelButton type="submit" className="w-full">
              {isRegister ? t.register : t.login}
            </PixelButton>
          </div>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsRegister(!isRegister)}
            className="font-body text-xs text-stone-400 hover:text-stone-900 underline underline-offset-4 decoration-stone-300 hover:decoration-stone-900 transition-all mb-4"
          >
            {isRegister ? "Already have an account? Sign In" : "New here? Create an account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;