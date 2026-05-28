import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  User, 
  Key, 
  Volume2, 
  VolumeX, 
  Camera, 
  Users, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  Link,
  Copy,
  Check
} from 'lucide-react';
import { Role, VillageProfile } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: { name: string; role: Role; nik?: string }) => void;
  villageProfile: VillageProfile;
}

export default function LoginView({ onLoginSuccess, villageProfile }: LoginViewProps) {
  // Query parameter parser for isolation
  const getInitialPortal = (): 'staff' | 'warga' => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const portalParam = searchParams.get('portal');
      if (portalParam === 'warga' || window.location.hash === '#warga') {
        return 'warga';
      }
      if (portalParam === 'staf' || portalParam === 'staff' || portalParam === 'aparat' || window.location.hash === '#staf') {
        return 'staff';
      }
    } catch (e) {
      console.warn("Unable to parse params, fallback to default tabs");
    }
    return 'staff';
  };

  const [activeTab, setActiveTab] = useState<'staff' | 'warga'>(getInitialPortal);
  const queryParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const isStrictWarga = queryParams?.get('portal') === 'warga';
  const isStrictStaff = queryParams?.get('portal') === 'staf' || queryParams?.get('portal') === 'staff' || queryParams?.get('portal') === 'aparat';
  const currentTab = isStrictWarga ? 'warga' : isStrictStaff ? 'staff' : activeTab;

  const [selectedStaffRole, setSelectedStaffRole] = useState<Role>('Operator');
  const [nik, setNik] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [successAnimation, setSuccessAnimation] = useState(false);
  const [copiedType, setCopiedType] = useState<'warga' | 'staf' | null>(null);

  // Synchronize tab if search param changes
  useEffect(() => {
    const handleUrlChange = () => {
      const tab = getInitialPortal();
      setActiveTab(tab);
    };
    window.addEventListener('popstate', handleUrlChange);
    // Initial sync
    handleUrlChange();
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // Audio Synthesizer
  const playLoginSound = (type: 'click' | 'error' | 'success') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.04);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.setValueAtTime(554.37, audioCtx.currentTime + 0.08);
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.16);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.24);
        gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      }
    } catch (e) {
      console.warn("Audio system blocked/not supported in this context");
    }
  };

  // Demo account quick switch values
  const STAFF_DEMOS = [
    { role: 'Operator' as Role, name: 'Budi Santoso', desc: 'Petugas Input & Pelayanan' },
    { role: 'Kepala Desa' as Role, name: 'H. Dadang Sulaeman, S.IP.', desc: 'Pemberi Tanda Tangan' },
    { role: 'Sekretaris' as Role, name: 'Ahmad Fauzi, S.Kom.', desc: 'Verifikator Berkas & RT' },
    { role: 'Bendahara' as Role, name: 'Siti Rahmawati, A.Md.', desc: 'Otorisator APBDes' },
    { role: 'RT/RW' as Role, name: 'Bpk. Yanto (RT)', desc: 'Pengurus Lingkungan 02/05' },
    { role: 'Super Admin' as Role, name: 'Admin Utama', desc: 'Kendali Penuh Sistem' }
  ];

  const CITIZEN_DEMOS = [
    { nik: '3204121208850001', name: 'Herman Kartomi', rt: '02', rw: '05' },
    { nik: '3204124311890002', name: 'Anisa Rahmawati', rt: '02', rw: '05' },
    { nik: '3204120302550008', name: 'Slamet Rahardja', rt: '01', rw: '02' }
  ];

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!pin) {
      playLoginSound('error');
      setErrorMsg("Sandi PIN tidak boleh kosong (Demo PIN default: 123456)");
      return;
    }

    if (pin !== '123456') {
      playLoginSound('error');
      setErrorMsg("Sandi PIN salah! Silakan gunakan PIN Demo default: 123456");
      return;
    }

    const matchedStaff = STAFF_DEMOS.find(s => s.role === selectedStaffRole);
    const staffName = matchedStaff ? matchedStaff.name : `Petugas ${selectedStaffRole}`;

    // Success login sequence
    playLoginSound('success');
    setSuccessAnimation(true);
    setTimeout(() => {
      onLoginSuccess({
        name: staffName,
        role: selectedStaffRole
      });
    }, 1200);
  };

  const handleWargaLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!nik || nik.length < 16) {
      playLoginSound('error');
      setErrorMsg("Silakan masukkan 16 Digit NIK terdaftar di sistem.");
      return;
    }

    if (!pin) {
      playLoginSound('error');
      setErrorMsg("Kata sandi / PIN tidak boleh kosong");
      return;
    }

    if (pin !== '123456') {
      playLoginSound('error');
      setErrorMsg("Kata PIN salah. Gunakan PIN Demo default: 123456");
      return;
    }

    // Try to match NIK
    const matchedCitizen = CITIZEN_DEMOS.find(c => c.nik === nik);
    const citizenName = matchedCitizen ? matchedCitizen.name : 'Ahmad Sopian (Warga)';

    playLoginSound('success');
    setSuccessAnimation(true);
    setTimeout(() => {
      onLoginSuccess({
        name: citizenName,
        role: 'Masyarakat',
        nik: nik
      });
    }, 1200);
  };

  const handleQuickStaffSelect = (role: Role) => {
    playLoginSound('click');
    setSelectedStaffRole(role);
    setPin('123456');
    setErrorMsg(null);
  };

  const handleQuickWargaSelect = (selectedNik: string) => {
    playLoginSound('click');
    setNik(selectedNik);
    setPin('123456');
    setErrorMsg(null);
  };

  const getPortalLink = (type: 'warga' | 'staf') => {
    return `${window.location.origin}${window.location.pathname}?portal=${type}`;
  };

  const copyLinkToClipboard = (type: 'warga' | 'staf') => {
    const link = getPortalLink(type);
    navigator.clipboard.writeText(link).then(() => {
      playLoginSound('click');
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    }).catch(() => {
      alert(`Salin tautan ini: ${link}`);
    });
  };

  const switchPortalTab = (tab: 'staff' | 'warga') => {
    playLoginSound('click');
    setActiveTab(tab);
    setErrorMsg(null);
    // Push silent URL update
    const newUrl = `${window.location.pathname}?portal=${tab === 'warga' ? 'warga' : 'staf'}`;
    window.history.pushState({ portal: tab }, '', newUrl);
  };

  const hasExplicitQuery = new URLSearchParams(window.location.search).has('portal');

  return (
    <div id="smart-login-viewport" className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 relative overflow-hidden select-none font-sans">
      
      {/* Decorative Matrix/Mesh background overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.15)_1px,transparent_1px)] bg-[size:24px_24px] opacity-30 pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/15 rounded-full blur-[150px] pointer-events-none" />

      {/* Header bar controls only */}
      <div className="flex justify-between items-center px-4 py-2 shrink-0 z-10 font-sans">
        <div className="flex items-center space-x-2">
          {villageProfile.logoUrl ? (
            <img 
              src={villageProfile.logoUrl} 
              className="w-8 h-8 rounded bg-white p-0.5 object-contain" 
              alt="Logo Desa"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold font-mono text-xs">SD</div>
          )}
          <span className="text-[10px] uppercase font-black font-mono tracking-widest text-slate-400">
            Sistem Autentikasi Terpadu
          </span>
        </div>

        <button 
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="text-slate-400 hover:text-white p-2 hover:bg-slate-900 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-mono"
        >
          {soundEnabled ? <Volume2 size={15} className="text-blue-400 animate-pulse" /> : <VolumeX size={15} />}
          <span>{soundEnabled ? 'Suara Aktif' : 'Senyap'}</span>
        </button>
      </div>

      {/* Main card centerpiece layout */}
      <div className="flex-1 flex items-center justify-center py-6 z-10 w-full max-w-lg mx-auto">
        {successAnimation ? (
          <div className="bg-slate-900/80 border border-emerald-950 rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="inline-flex items-center justify-center p-3.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/30">
              <CheckCircle2 size={42} className="animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <div>
              <h2 className="text-xl font-black text-emerald-400 font-mono tracking-wide uppercase">AUTENTIKASI BERHASIL</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Mempersiapkan hak akses <span className="text-blue-400 font-extrabold">{currentTab === 'staff' ? selectedStaffRole : 'Warga Sukamaju'}</span>...
              </p>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden shrink-0 mt-4">
              <div className="bg-emerald-500 h-1 w-full animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/95 border border-slate-800/80 rounded-2xl w-full shadow-2xl flex flex-col overflow-hidden backdrop-blur-md">
            
            {/* Top Brand Banner block */}
            <div className="bg-slate-950 p-6 text-center border-b border-slate-800/60 relative">
              <div className="absolute top-3 right-3 text-[9px] font-mono font-bold text-slate-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>ONLINE PORTAL</span>
              </div>
              <span className="text-[9px] font-black tracking-widest text-blue-400 bg-blue-950/80 border border-blue-900/80 px-2.5 py-0.5 rounded font-mono uppercase">
                {currentTab === 'warga' ? '👥 PORTAL LAYANAN MANDIRI WARGA' : '🔑 PORTAL UTAMA ADMINISTRASI DESA'}
              </span>
              <h2 className="text-xl font-black mt-2 bg-gradient-to-r from-blue-400 via-sky-200 to-indigo-300 bg-clip-text text-transparent uppercase tracking-wider font-mono">
                {villageProfile.name} Digital
              </h2>
              <p className="text-[10.5px] text-slate-500 font-mono mt-0.5 uppercase tracking-tight">
                {villageProfile.subdistrict}, {villageProfile.regency}
              </p>
            </div>

            {/* Switchers representing isolated portal entryways */}
            {!isStrictWarga && !isStrictStaff ? (
              <div className="bg-slate-950/90 p-4 border-b border-slate-800/60 space-y-2">
                <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">
                  📍 PILIH UNIT PORTAL MASUK ANDA :
                </p>
                
                <div className="grid grid-cols-2 gap-2">
                  {/* PORTAL WARGA LINK BAR */}
                  <button
                    type="button"
                    onClick={() => switchPortalTab('warga')}
                    className={`p-2.5 text-left rounded-xl border flex flex-col gap-0.5 relative overflow-hidden transition-all ${
                      activeTab === 'warga'
                        ? 'bg-blue-600/15 border-blue-500 text-white shadow-md'
                        : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900/80 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Users size={12} className={activeTab === 'warga' ? 'text-blue-400' : 'text-slate-500'} />
                      <span className="text-[10px] uppercase font-black tracking-wider">Portal Warga</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 truncate mt-0.5">Keperluan Administrasi</span>
                    {activeTab === 'warga' && (
                      <div className="absolute right-2 top-2 bg-blue-500 text-[8px] font-bold px-1 py-0.2 rounded uppercase">
                        AKTIF
                      </div>
                    )}
                  </button>

                  {/* PORTAL STAF LINK BAR */}
                  <button
                    type="button"
                    onClick={() => switchPortalTab('staff')}
                    className={`p-2.5 text-left rounded-xl border flex flex-col gap-0.5 relative overflow-hidden transition-all ${
                      activeTab === 'staff'
                        ? 'bg-blue-600/15 border-blue-500 text-white shadow-md'
                        : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900/80 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={12} className={activeTab === 'staff' ? 'text-blue-400' : 'text-slate-500'} />
                      <span className="text-[10px] uppercase font-black tracking-wider">Portal Staf/RT</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 truncate mt-0.5">Pengelolaan & TTD</span>
                    {activeTab === 'staff' && (
                      <div className="absolute right-2 top-2 bg-blue-500 text-[8px] font-bold px-1 py-0.2 rounded uppercase">
                        AKTIF
                      </div>
                    )}
                  </button>
                </div>

                {/* Dynamic Information about separate deep links */}
                <div className="mt-2.5 bg-slate-950 p-2 border border-slate-800/40 rounded-lg flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[8.5px] font-mono text-slate-500 flex items-center gap-1">
                      <Link size={10} className="text-blue-400" />
                      <span>LINK SEPARATED PORTAL:</span>
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-950">
                      Aman Terisolasi ✓
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-[9px] bg-slate-900/80 p-1.5 rounded border border-slate-850 gap-2">
                    <span className="font-mono text-slate-400 truncate">
                      {activeTab === 'warga' ? '?portal=warga' : '?portal=staf'}
                    </span>
                    
                    <button
                      type="button"
                      onClick={() => copyLinkToClipboard(activeTab === 'warga' ? 'warga' : 'staf')}
                      className="shrink-0 text-[8.5px] font-mono font-bold uppercase transition-all px-2 py-0.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded flex items-center gap-1"
                    >
                      {copiedType === (activeTab === 'warga' ? 'warga' : 'staf') ? (
                        <>
                          <Check size={10} />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={10} />
                          <span>Salin Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/80 px-6 py-3.5 border-b border-slate-800/60 flex items-center justify-between text-xs font-mono">
                {isStrictWarga ? (
                  <>
                    <span className="text-blue-400 font-bold flex items-center gap-1.5 uppercase">
                      <Users size={14} className="animate-pulse text-blue-400" />
                      <span>JALUR LAYANAN KHUSUS WARGA DESA</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900">
                      TERISOLASI ✓
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-amber-400 font-bold flex items-center gap-1.5 uppercase">
                      <ShieldCheck size={14} className="animate-pulse text-amber-500" />
                      <span>JALUR ADMINISTRASI APARAT DESA</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900">
                      ENKRIPSI DATA ✓
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Forms body block */}
            <div className="p-6 space-y-4">
              
              {/* Global validation error placeholder */}
              {errorMsg && (
                <div className="bg-rose-950/80 border border-rose-900 rounded-xl p-3 flex items-start gap-2 text-rose-300 text-[11px] leading-relaxed">
                  <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* TAB 1: APARAT/STAFF AUTH */}
              {currentTab === 'staff' && (
                <form onSubmit={handleStaffLogin} className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <label className="col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      PILIH PERAN ADMINISTRATOR / STAF DESA :
                    </label>
                    <select
                      value={selectedStaffRole}
                      onChange={(e) => {
                        playLoginSound('click');
                        setSelectedStaffRole(e.target.value as Role);
                        setErrorMsg(null);
                      }}
                      className="col-span-2 bg-slate-950 text-white border border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:ring-1 focus:ring-blue-500 font-semibold focus:outline-none"
                    >
                      <option value="Operator">Operator Desa (Budi Santoso)</option>
                      <option value="Kepala Desa">Kepala Desa (H. Dadang Sulaeman, S.IP.)</option>
                      <option value="Sekretaris">Sekretaris Desa (Ahmad Fauzi, S.Kom.)</option>
                      <option value="Bendahara">Bendahara Desa (Siti Rahmawati, A.Md.)</option>
                      <option value="RT/RW">Ketua RT 02 / RW 05 (Bpk. Yanto)</option>
                      <option value="Super Admin">Super Administrator (Developer Kedaulatan)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                      SANDI PIN AKSES ADMINISTRATOR :
                    </label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                      <input
                        type={showPin ? 'text' : 'password'}
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="Masukkan PIN Akses (Demo PIN: 123456)"
                        className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-650 rounded-xl pl-9 pr-10 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-3.5 top-3.5 text-slate-500 hover:text-white"
                      >
                        {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* QUICK STAFF DEMO SWITCH BOARD */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/50 space-y-2">
                    <span className="text-[8.5px] font-mono text-blue-400 uppercase tracking-wider block font-bold">
                      ⚡ TESTING INSTANT (klik salah satu akun untuk auto-fill & set PIN):
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {STAFF_DEMOS.map(s => {
                        const isChosen = selectedStaffRole === s.role;
                        return (
                          <button
                            key={s.role}
                            type="button"
                            onClick={() => handleQuickStaffSelect(s.role)}
                            className={`p-1.5 rounded text-left border text-[9.5px] transition-all truncate leading-tight ${
                              isChosen 
                                ? 'bg-blue-600/10 border-blue-500 text-white font-extrabold' 
                                : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-400'
                            }`}
                          >
                            <div className="text-[9px] uppercase font-mono font-bold tracking-wide truncate">{s.role}</div>
                            <div className="text-[8px] text-slate-500 truncate mt-0.5">{s.name}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md uppercase font-mono tracking-wide"
                  >
                    <span>Masuk Hub Administrasi</span>
                    <ArrowRight size={13} />
                  </button>
                </form>
              )}

              {/* TAB 2: WARGA / CITIZEN AUTH */}
              {currentTab === 'warga' && (
                <form onSubmit={handleWargaLogin} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                      NOMOR INDUK KEPENDUDUKAN (NIK Warga Terdaftar)* :
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                      <input
                        type="text"
                        maxLength={16}
                        value={nik}
                        onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                        placeholder="Ketik 16 Digit NIK Anda"
                        className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-650 rounded-xl pl-9 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                      KATA SANDI / PIN ACCOUNT WARGA :
                    </label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                      <input
                        type={showPin ? 'text' : 'password'}
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="Masukkan sandi PIN Anda (Demo PIN: 123456)"
                        className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-650 rounded-xl pl-9 pr-10 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-3.5 top-3.5 text-slate-500 hover:text-white"
                      >
                        {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* QUICK CITIZEN QUICKLAUNCH BOARD */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/50 space-y-2">
                    <span className="text-[8.5px] font-mono text-blue-400 uppercase tracking-wider block font-bold">
                      ⚡ TESTING AKUN WARGA (Klik salah satu untuk login instan):
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {CITIZEN_DEMOS.map(c => {
                        const isChosen = nik === c.nik;
                        return (
                          <button
                            key={c.nik}
                            type="button"
                            onClick={() => handleQuickWargaSelect(c.nik)}
                            className={`p-2 rounded text-left border text-[10px] transition-all flex justify-between items-center ${
                              isChosen 
                                ? 'bg-blue-600/10 border-blue-500 text-white font-extrabold' 
                                : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-400'
                            }`}
                          >
                            <div>
                              <span className="font-semibold block">{c.name}</span>
                              <span className="text-[8.5px] font-mono text-slate-500 block mt-0.5">NIK: {c.nik}</span>
                            </div>
                            <span className="text-[8.5px] font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 font-bold shrink-0">
                              RT {c.rt}/RW {c.rw}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md uppercase font-mono tracking-wide"
                  >
                    <span>Masuk Layanan Warga Mandiri</span>
                    <ArrowRight size={13} />
                  </button>
                </form>
              )}

            </div>

            {/* Login advisory notification block */}
            <div className="bg-slate-950 p-4 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex items-start gap-1.5">
              <Info className="text-amber-500 shrink-0 mt-0.5" size={13} />
              <span>Gunakan kode PIN <span className="text-amber-400 font-extrabold font-mono">123456</span> untuk login cepat segenap aparat dan warga. Bagikan tautan khusus ini untuk memisahkan pintu masuk masyarakat.</span>
            </div>

          </div>
        )}
      </div>

      {/* Footer copyright */}
      <div className="text-center p-3 text-[10px] text-slate-500 font-mono shrink-0">
        © {new Date().getFullYear()} {villageProfile.name} Hub Mandiri Digital • Paseh, Kab. Bandung
      </div>

    </div>
  );
}
