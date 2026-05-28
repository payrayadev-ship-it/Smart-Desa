import { Calendar, Bell, Shield, CloudSun, LogOut } from 'lucide-react';
import { Role, VillageProfile } from '../types';

interface HeaderProps {
  activeRole: Role;
  onOpenAiAssistant: () => void;
  villageProfile: VillageProfile;
  onLogout?: () => void;
}

export default function Header({ activeRole, onOpenAiAssistant, villageProfile, onLogout }: HeaderProps) {
  const formatIndonesianDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('id-ID', options);
  };

  return (
    <header 
      id="main-app-header"
      className="bg-white border-b border-slate-100 p-4 shrink-0 flex items-center justify-between sticky top-0 z-30 shadow-sm"
    >
      {/* Left Greeting & Date */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg hidden sm:block">
          <CloudSun size={20} />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-slate-800 leading-tight">
            Selamat Datang di Portal, <span className="text-blue-600 capitalize">{activeRole}</span>
          </h1>
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono mt-0.5">
            <Calendar size={13} />
            <span>{formatIndonesianDate()}</span>
            <span className="hidden md:inline text-slate-300">|</span>
            <span className="hidden md:inline">{villageProfile.name} Mandiri Digital</span>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-3">
        {/* Active AI Assistant Button with Sparkle */}
        <button
          id="assistant-trigger-header"
          onClick={onOpenAiAssistant}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 rounded-lg text-xs font-semibold font-mono transition-all duration-200 border border-indigo-100 animate-pulse"
        >
          <span className="shrink-0">✨ SukaAsisten AI</span>
        </button>

        {/* Role status badge */}
        <div className="hidden lg:flex items-center space-x-1 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-xs text-slate-600">
          <Shield size={12} className="text-blue-500" />
          <span className="font-medium text-slate-500 font-mono">ID: {activeRole.toUpperCase()}</span>
        </div>

        {/* Notification Bell */}
        <button 
          id="notification-bell-btn"
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg relative transition-colors"
        >
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>

        {onLogout && (
          <button 
            id="header-logout-btn"
            onClick={onLogout}
            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg relative transition-colors flex items-center justify-center border border-transparent hover:border-rose-100"
            title="Keluar dari Portal (Logout)"
          >
            <LogOut size={17} />
          </button>
        )}
      </div>
    </header>
  );
}
