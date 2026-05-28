import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Sparkles, 
  CreditCard, 
  HeartHandshake, 
  Box, 
  Map, 
  AlertTriangle, 
  Globe, 
  UserSquare2, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  Monitor,
  LogOut
} from 'lucide-react';
import { Role, VillageProfile } from '../types';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  villageProfile: VillageProfile;
  onLogout?: () => void;
}

export default function Sidebar({ currentView, setView, activeRole, setActiveRole, villageProfile, onLogout }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  // Define navigation items with translation and icon
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Desa', icon: LayoutDashboard, roles: ['Super Admin', 'Kepala Desa', 'Sekretaris', 'Bendahara', 'Operator', 'RT/RW'] },
    { id: 'kependudukan', label: 'Data Penduduk', icon: Users, roles: ['Super Admin', 'Kepala Desa', 'Sekretaris', 'Operator'] },
    { id: 'surat', label: 'Surat Menyurat', icon: FileText, roles: ['Super Admin', 'Kepala Desa', 'Sekretaris', 'Operator', 'RT/RW'] },
    { id: 'kiosk', label: 'Monitor Kiosk Surat', icon: Monitor, roles: ['Super Admin', 'Kepala Desa', 'Sekretaris', 'Operator', 'RT/RW'] },
    { id: 'keuangan', label: 'APBDes & Keuangan', icon: CreditCard, roles: ['Super Admin', 'Kepala Desa', 'Bendahara'] },
    { id: 'bansos', label: 'Bantuan Sosial', icon: HeartHandshake, roles: ['Super Admin', 'Kepala Desa', 'Sekretaris', 'Operator', 'RT/RW'] },
    { id: 'aset', label: 'Aset & Inventaris', icon: Box, roles: ['Super Admin', 'Kepala Desa', 'Sekretaris', 'Operator'] },
    { id: 'rtrw', label: 'Sistem RT / RW', icon: UserSquare2, roles: ['Super Admin', 'RT/RW'] },
    { id: 'pengaduan', label: 'Pengaduan Warga', icon: AlertTriangle, roles: ['Super Admin', 'Kepala Desa', 'Sekretaris', 'Operator', 'RT/RW', 'Masyarakat'] },
    { id: 'pelayanan-warga', label: 'Layanan Mandiri', icon: FileText, roles: ['Masyarakat'] },
    { id: 'web-desa', label: 'Website Profil Desa', icon: Globe, roles: ['Super Admin', 'Kepala Desa', 'Sekretaris', 'Bendahara', 'Operator', 'RT/RW', 'Masyarakat'] },
    { id: 'pengaturan', label: 'Pengaturan Desa', icon: Settings, roles: ['Super Admin'] },
  ];

  const rolesList: Role[] = [
    'Super Admin',
    'Kepala Desa',
    'Sekretaris',
    'Bendahara',
    'Operator',
    'RT/RW',
    'Masyarakat'
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(activeRole));

  return (
    <aside 
      id="sidebar-container"
      className={`bg-slate-900 text-white h-screen border-r border-slate-800 transition-all duration-300 flex flex-col justify-between z-40 fixed md:sticky top-0 left-0 ${isOpen ? 'w-64' : 'w-20'}`}
    >
      {/* Top Brand Block */}
      <div>
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center space-x-3 overflow-hidden">
            {villageProfile.logoUrl ? (
              <img src={villageProfile.logoUrl} className="w-9 h-9 rounded-lg object-contain bg-white p-0.5 shadow-lg shadow-blue-500/10 shrink-0" alt="Logo" referrerPolicy="no-referrer" />
            ) : (
              <div className="p-2 bg-blue-600 rounded-lg text-white font-bold shrink-0 shadow-lg shadow-blue-500/30">
                SD
              </div>
            )}
            {isOpen && (
              <div className="flex flex-col whitespace-nowrap leading-tight">
                <span className="font-bold text-base tracking-wider bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">SMART DESA</span>
                <span className="text-[10px] text-slate-400 font-mono">DIGITAL SYSTEM</span>
              </div>
            )}
          </div>
          <button 
            id="sidebar-toggle-btn"
            onClick={() => setIsOpen(!isOpen)} 
            className="md:flex hidden p-1.5 hover:bg-slate-800 rounded transition-colors text-slate-400"
          >
            {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[55vh]">
          {filteredMenu.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                id={`sidebar-menu-${item.id}`}
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-600/20' 
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <IconComponent 
                  size={19} 
                  className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                  }`} 
                />
                {isOpen && <span className="text-sm truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Role Switcher & Profile Block */}
      <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/40">
        {isOpen ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>HAK AKSES AKTIF:</span>
              <Sparkles size={11} className={activeRole === 'Masyarakat' ? "text-blue-400 animate-pulse" : "text-amber-400 animate-pulse"} />
            </div>
            {activeRole === 'Masyarakat' ? (
              <div className="w-full text-xs bg-blue-950/40 border border-blue-900/60 text-blue-400 rounded-lg p-2.5 font-bold flex items-center gap-1.5 uppercase tracking-wider font-mono">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0"></span>
                <span>MASYARAKAT MANDIRI</span>
              </div>
            ) : activeRole === 'Super Admin' ? (
              <div className="w-full text-xs bg-purple-950/40 border border-purple-900/60 text-purple-400 rounded-lg p-2.5 font-bold flex items-center gap-1.5 uppercase tracking-wider font-mono">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shrink-0"></span>
                <span>SUPER ADMINISTRATOR</span>
              </div>
            ) : activeRole === 'Kepala Desa' ? (
              <div className="w-full text-xs bg-amber-950/30 border border-amber-900/60 text-amber-500 rounded-lg p-2.5 font-bold flex items-center gap-1.5 uppercase tracking-wider font-mono">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
                <span>KEPALA DESA</span>
              </div>
            ) : activeRole === 'Sekretaris' ? (
              <div className="w-full text-xs bg-emerald-950/30 border border-emerald-900/60 text-emerald-400 rounded-lg p-2.5 font-bold flex items-center gap-1.5 uppercase tracking-wider font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span>SEKRETARIS DESA</span>
              </div>
            ) : activeRole === 'Bendahara' ? (
              <div className="w-full text-xs bg-rose-950/30 border border-rose-900/60 text-rose-400 rounded-lg p-2.5 font-bold flex items-center gap-1.5 uppercase tracking-wider font-mono">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0"></span>
                <span>BENDAHARA DESA</span>
              </div>
            ) : activeRole === 'RT/RW' ? (
              <div className="w-full text-xs bg-teal-950/30 border border-teal-900/60 text-teal-400 rounded-lg p-2.5 font-bold flex items-center gap-1.5 uppercase tracking-wider font-mono">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse shrink-0"></span>
                <span>KETUA RT / RW</span>
              </div>
            ) : (
              <div className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded-lg p-2.5 font-bold flex items-center gap-1.5 uppercase tracking-wider font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0"></span>
                <span>OPERATOR SIPIL</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            <div 
              className={`p-1 px-2.5 rounded-full text-[10px] font-bold cursor-default ${activeRole === 'Masyarakat' ? 'bg-blue-950 text-blue-400 border border-blue-900/55' : 'bg-slate-800 text-blue-400'}`} 
              title={activeRole === 'Masyarakat' ? "Akses Masyarakat Mandiri" : "Ubah Hak Akses"}
            >
              {activeRole.substring(0, 3).toUpperCase()}
            </div>
          </div>
        )}

        {isOpen && (
          <div className="flex items-center space-x-3 pt-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-blue-400">
              {activeRole.charAt(0)}
            </div>
            <div className="leading-tight truncate flex-grow">
              <p className="text-xs font-semibold text-slate-200 truncate font-sans">
                {activeRole === 'Masyarakat' ? `Warga ${villageProfile.name.replace('Desa ', '')}` : activeRole === 'RT/RW' ? 'Bpk. Yanto (RT)' : 'Staf Desa'}
              </p>
              <p className="text-[10px] text-slate-500 font-mono truncate">ID: {activeRole.substring(0, 3)}..-02</p>
            </div>
          </div>
        )}

        {onLogout && (
          <button
            id="sidebar-logout-action-btn"
            onClick={() => {
              try {
                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.frequency.setValueAtTime(300, audioCtx.currentTime);
                gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.08);
              } catch(err){}
              onLogout();
            }}
            className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-rose-450 hover:text-white hover:bg-rose-950/60 transition-all font-mono text-[10px] font-black border border-transparent hover:border-rose-900/40 ${!isOpen ? 'justify-center p-1.5' : ''}`}
            title="Keluar dari Portal"
          >
            <LogOut size={13} className="shrink-0 text-rose-450" />
            {isOpen && <span className="tracking-wider">KELUAR PORTAL</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
