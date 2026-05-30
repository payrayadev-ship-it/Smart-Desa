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
import { onSnapshot, doc, setDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from '../firebase';
import { LocalDb, INITIAL_PORTAL_CREDENTIALS } from '../mockData';
import { Role, VillageProfile, PortalCredential, RtRwFinance } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: { name: string; role: Role; nik?: string }) => void;
  villageProfile: VillageProfile;
  rtFinances?: RtRwFinance[];
}

export default function LoginView({ onLoginSuccess, villageProfile, rtFinances = [] }: LoginViewProps) {
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

  const [portalCredentials, setPortalCredentials] = useState<{ credentials: PortalCredential[] }>(() => {
    return LocalDb.getPortalCredentials();
  });

  const [selectedStaffRole, setSelectedStaffRole] = useState<Role>('Operator');
  const [staffNameInput, setStaffNameInput] = useState('');
  const [nik, setNik] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [successAnimation, setSuccessAnimation] = useState(false);
  const [copiedType, setCopiedType] = useState<'warga' | 'staf' | null>(null);

  // Authenticate anonymously and subscribe to portalCredentials from Firestore
  useEffect(() => {
    const initAuthAndSubscribe = async () => {
      let authSuccessful = false;
      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
        authSuccessful = true;
      } catch (e) {
        console.warn("Silent anonymous authenticate on mount failed, running in local database fallback mode:", e);
      }

      if (!authSuccessful && !auth.currentUser) {
        console.warn("Firebase Auth bypassed or restricted. Running LoginView on local credentials fallback.");
        return;
      }

      try {
        const unsub = onSnapshot(doc(db, 'settings', 'portalCredentials'), (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as { credentials: PortalCredential[] };
            if (data && Array.isArray(data.credentials)) {
              setPortalCredentials(data);
              LocalDb.savePortalCredentials(data);
            }
          } else {
            // Seed documents if doesn't exist
            setDoc(doc(db, 'settings', 'portalCredentials'), INITIAL_PORTAL_CREDENTIALS).catch(e => {
              console.warn("Seeding initial portal credentials to Firestore failed:", e);
            });
          }
        }, (err) => {
          console.warn("Credentials subscription failed, falling back to local database:", err);
        });
        return unsub;
      } catch (err) {
        console.warn("Setup subscription error:", err);
      }
    };

    let unsubFn: (() => void) | undefined;
    initAuthAndSubscribe().then(unsub => {
      if (unsub) unsubFn = unsub;
    });

    return () => {
      if (unsubFn) unsubFn();
    };
  }, []);

  // Sync typed name when role is chosen if empty
  useEffect(() => {
    const cred = portalCredentials.credentials.find(c => c.type === 'staf' && c.role === selectedStaffRole);
    if (cred && !staffNameInput) {
      setStaffNameInput(cred.name);
    }
  }, [portalCredentials, selectedStaffRole]);

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

  // Switch labels and default options
  const STAFF_DEMOS = [
    { role: 'Operator' as Role, desc: 'Petugas Input & Pelayanan' },
    { role: 'Kepala Desa' as Role, desc: 'Pemberi Tanda Tangan' },
    { role: 'Sekretaris' as Role, desc: 'Verifikator Berkas & RT' },
    { role: 'Bendahara' as Role, desc: 'Otorisator APBDes' },
    { role: 'RT/RW' as Role, desc: 'Pengurus Lingkungan 02/05' },
    { role: 'Super Admin' as Role, desc: 'Kendali Penuh Sistem' }
  ];

  const CITIZEN_DEMOS = [
    { nik: '3204121208850001', name: 'Herman Kartomi', rt: '02', rw: '05' },
    { nik: '3204124311890002', name: 'Anisa Rahmawati', rt: '02', rw: '05' },
    { nik: '3204120302550008', name: 'Slamet Rahardja', rt: '01', rw: '02' }
  ];

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = staffNameInput.trim();
    if (!trimmedName) {
      playLoginSound('error');
      setErrorMsg("Nama Sesuai Portal tidak boleh kosong.");
      return;
    }

    if (!pin) {
      playLoginSound('error');
      setErrorMsg("Sandi PIN tidak boleh kosong.");
      return;
    }

    // Match typed name and pin
    let matchedCred = portalCredentials.credentials.find(
      c => c.type === 'staf' &&
           c.name.toLowerCase() === trimmedName.toLowerCase() &&
           c.pin === pin
    );

    let loggedInName = matchedCred?.name || '';
    let loggedInRole = matchedCred?.role || 'Operator';

    // Check dynamic RT/RW custom registrations if no standard credentials matched
    if (!matchedCred && rtFinances && rtFinances.length > 0) {
      const matchedRt = rtFinances.find(
        rtf => (rtf.namaRt && rtf.namaRt.toLowerCase() === trimmedName.toLowerCase() && (rtf.pin || '123456') === pin) ||
               (`rt ${rtf.rt}`.toLowerCase() === trimmedName.toLowerCase() && (rtf.pin || '123456') === pin) ||
               (`rt ${rtf.rt} rw ${rtf.rw}`.toLowerCase() === trimmedName.toLowerCase() && (rtf.pin || '123456') === pin)
      );

      if (matchedRt) {
        loggedInName = matchedRt.namaRt || `RT ${matchedRt.rt} RW ${matchedRt.rw}`;
        loggedInRole = 'RT/RW';
        matchedCred = {
          type: 'staf',
          name: loggedInName,
          role: 'RT/RW',
          pin: matchedRt.pin || '123456'
        };
      }
    }

    if (!matchedCred) {
      playLoginSound('error');
      setErrorMsg("Nama Sesuai Portal atau Sandi PIN salah! Silakan coba lagi atau hubungi Super Admin.");
      return;
    }

    // Success login sequence
    playLoginSound('success');
    setSuccessAnimation(true);
    setTimeout(() => {
      onLoginSuccess({
        name: loggedInName,
        role: loggedInRole as Role
      });
    }, 1200);
  };

  const handleWargaLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanNik = nik.trim();
    if (!cleanNik || cleanNik.length < 16) {
      playLoginSound('error');
      setErrorMsg("Silakan masukkan 16 Digit NIK terdaftar di sistem.");
      return;
    }

    if (!pin) {
      playLoginSound('error');
      setErrorMsg("Kata PIN tidak boleh kosong.");
      return;
    }

    const matchedCred = portalCredentials.credentials.find(
      c => c.type === 'warga' && c.nik === cleanNik && c.pin === pin
    );

    if (!matchedCred) {
      playLoginSound('error');
      setErrorMsg("Sandi PIN salah atau NIK belum didaftarkan di sistem!");
      return;
    }

    playLoginSound('success');
    setSuccessAnimation(true);
    setTimeout(() => {
      onLoginSuccess({
        name: matchedCred.name,
        role: 'Masyarakat',
        nik: cleanNik
      });
    }, 1200);
  };

  const handleQuickStaffSelect = (role: Role) => {
    playLoginSound('click');
    setSelectedStaffRole(role);
    const cred = portalCredentials.credentials.find(c => c.type === 'staf' && c.role === role);
    if (cred) {
      setStaffNameInput(cred.name);
      setPin(cred.pin);
    } else {
      setStaffNameInput('');
      setPin('');
    }
    setErrorMsg(null);
  };

  const handleQuickWargaSelect = (selectedNik: string) => {
    playLoginSound('click');
    setNik(selectedNik);
    const cred = portalCredentials.credentials.find(c => c.type === 'warga' && c.nik === selectedNik);
    if (cred) {
      setPin(cred.pin);
    } else {
      setPin('123456');
    }
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
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                      NAMA LENGKAP APARAT (Sesuai Portal Masing-masing)* :
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                      <input
                        type="text"
                        value={staffNameInput}
                        onChange={(e) => setStaffNameInput(e.target.value)}
                        placeholder="Ketik Nama Lengkap Anda (cth: Budi Santoso)"
                        className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-600 rounded-xl pl-9 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                      PORTAL UTAMA AKSES DESA :
                    </label>
                    <select
                      value={selectedStaffRole}
                      onChange={(e) => {
                        playLoginSound('click');
                        const newRole = e.target.value as Role;
                        setSelectedStaffRole(newRole);
                        const cred = portalCredentials.credentials.find(c => c.type === 'staf' && c.role === newRole);
                        if (cred) {
                          setStaffNameInput(cred.name);
                        }
                        setErrorMsg(null);
                      }}
                      className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:ring-1 focus:ring-blue-500 font-semibold focus:outline-none"
                    >
                      <option value="Operator">Operator Desa (Arsip & Input)</option>
                      <option value="Kepala Desa">Kepala Desa (Verifikator Akhir)</option>
                      <option value="Sekretaris">Sekretaris Desa (Verifikator Berkas)</option>
                      <option value="Bendahara">Bendahara Desa (Otorisator Keuangan)</option>
                      <option value="RT/RW">Ketua RT / RW (Kewilayahan)</option>
                      <option value="Super Admin">Super Admin (Pengendali Menyeluruh)</option>
                    </select>

                    {selectedStaffRole === 'RT/RW' && rtFinances && rtFinances.length > 0 && (
                      <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl space-y-2 mt-2">
                        <label className="block text-[9px] font-extrabold text-indigo-400 uppercase tracking-wider font-mono">
                          PILIH WILAYAH RT ANDA :
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {rtFinances.map(rtf => {
                            const name = rtf.namaRt || `RT ${rtf.rt} RW ${rtf.rw}`;
                            const rawPin = rtf.pin || '123456';
                            return (
                              <button
                                key={rtf.id}
                                type="button"
                                onClick={() => {
                                  playLoginSound('click');
                                  setStaffNameInput(name);
                                  setPin(rawPin);
                                  setErrorMsg(null);
                                }}
                                className="px-2.5 py-1.5 bg-slate-950 hover:bg-indigo-900/40 border border-slate-800 hover:border-indigo-400 rounded text-[9.5px] text-slate-300 font-mono transition-all duration-150 flex items-center gap-1 hover:text-white"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                                <span>{name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
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
                        placeholder="Masukkan PIN Sandi"
                        className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-650 rounded-xl pl-9 pr-10 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                        required
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



                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md uppercase font-mono tracking-wide"
                  >
                    <span>Masuk Hub Administrasi Desa</span>
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
