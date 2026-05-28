import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AiAssistantModal from './components/AiAssistantModal';
import DashboardView from './views/DashboardView';
import KependudukanView from './views/KependudukanView';
import SuratView from './views/SuratView';
import KeuanganView from './views/KeuanganView';
import BansosView from './views/BansosView';
import AsetView from './views/AsetView';
import RtRwView from './views/RtRwView';
import PengaduanView from './views/PengaduanView';
import PelayananWargaView from './views/PelayananWargaView';
import WebDesaView from './views/WebDesaView';
import KioskView from './views/KioskView';

import { Role, Resident, Letter, FinanceTransaction, VillageAsset, Complaint, VillageAnnouncement, VillageAgenda, AuditLog, VillageProfile, PortalCredential } from './types';
import { INITIAL_VILLAGE_PROFILE, LocalDb, INITIAL_PORTAL_CREDENTIALS } from './mockData';
import PengaturanView from './views/PengaturanView';
import LoginView from './views/LoginView';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { 
  authenticateFirebaseUser, 
  subscribeCollectionWithSeed, 
  subscribeSingleDoc, 
  saveRecord, 
  deleteRecord,
  syncListToFirestoreBatch
} from './firebaseDb';

const VIEW_ROLES: Record<string, Role[]> = {
  'dashboard': ['Super Admin', 'Kepala Desa', 'Sekretaris', 'Bendahara', 'Operator', 'RT/RW'],
  'kependudukan': ['Super Admin', 'Kepala Desa', 'Sekretaris', 'Operator'],
  'surat': ['Super Admin', 'Kepala Desa', 'Sekretaris', 'Operator', 'RT/RW'],
  'kiosk': ['Super Admin', 'Kepala Desa', 'Sekretaris', 'Operator', 'RT/RW'],
  'keuangan': ['Super Admin', 'Kepala Desa', 'Bendahara'],
  'bansos': ['Super Admin', 'Kepala Desa', 'Sekretaris', 'Operator', 'RT/RW'],
  'aset': ['Super Admin', 'Kepala Desa', 'Sekretaris', 'Operator'],
  'rtrw': ['Super Admin', 'RT/RW'],
  'pengaduan': ['Super Admin', 'Kepala Desa', 'Sekretaris', 'Operator', 'RT/RW', 'Masyarakat'],
  'pelayanan-warga': ['Masyarakat'],
  'web-desa': ['Super Admin', 'Kepala Desa', 'Sekretaris', 'Bendahara', 'Operator', 'RT/RW', 'Masyarakat'],
  'pengaturan': ['Super Admin'],
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<{ name: string; role: Role; nik?: string } | null>(() => {
    const saved = localStorage.getItem('smart_desa_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [activeRole, setActiveRole] = useState<Role>(() => {
    const saved = localStorage.getItem('smart_desa_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        return u.role;
      } catch (e) {
        return 'Operator';
      }
    }
    return 'Operator';
  });

  const [currentView, setView] = useState(() => {
    const saved = localStorage.getItem('smart_desa_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u.role === 'Masyarakat') return 'pelayanan-warga';
        if (u.role === 'RT/RW') return 'rtrw';
        return 'dashboard';
      } catch (e) {
        return 'dashboard';
      }
    }
    return 'dashboard';
  });

  const getHomeViewForRole = (role: Role) => {
    if (role === 'Masyarakat') return 'pelayanan-warga';
    if (role === 'RT/RW') return 'rtrw';
    return 'dashboard';
  };

  // Keep activeRole and currentView in direct sync with authorized currentUser role (zero role escalation)
  useEffect(() => {
    if (currentUser) {
      if (activeRole !== currentUser.role) {
        setActiveRole(currentUser.role);
      }
      
      const allowedRoles = VIEW_ROLES[currentView];
      if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
        setView(getHomeViewForRole(currentUser.role));
      }
    }
  }, [currentUser, currentView, activeRole]);

  const [isAiOpen, setIsAiOpen] = useState(false);

  const handleLoginSuccess = (user: { name: string; role: Role; nik?: string }) => {
    setCurrentUser(user);
    setActiveRole(user.role);
    localStorage.setItem('smart_desa_user', JSON.stringify(user));
    
    // Redirect based on role
    if (user.role === 'Masyarakat') {
      setView('pelayanan-warga');
    } else if (user.role === 'RT/RW') {
      setView('rtrw');
    } else {
      setView('dashboard');
    }
    
    // Log login activity
    const loginLog: AuditLog = {
      id: `log-${Date.now()}`,
      userId: user.nik || 'staff-01',
      userName: user.name,
      userRole: user.role,
      action: `User ${user.name} masuk ke sistem sebagai ${user.role}`,
      module: 'Autentikasi_Lobby',
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [loginLog, ...prev]);
  };

  const handleLogout = () => {
    // Log logout activity before state clears
    if (currentUser) {
      const logoutLog: AuditLog = {
        id: `log-${Date.now()}`,
        userId: currentUser.nik || 'user-id',
        userName: currentUser.name,
        userRole: currentUser.role,
        action: `User ${currentUser.name} keluar dari sistem`,
        module: 'Autentikasi_Lobby',
        timestamp: new Date().toISOString()
      };
      setAuditLogs(prev => [logoutLog, ...prev]);
    }
    
    setCurrentUser(null);
    localStorage.removeItem('smart_desa_user');
    setView('dashboard');
  };

  // Consolidated global state
  const [residents, setResidents] = useState<Resident[]>([]);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [finances, setFinances] = useState<FinanceTransaction[]>([]);
  const [assets, setAssets] = useState<any[]>([]); // handled polymorphic mapping
  const [complaints, setComplaints] = useState<any[]>([]); // handled polymorphic mapping
  const [announcements, setAnnouncements] = useState<VillageAnnouncement[]>([]);
  const [agendas, setAgendas] = useState<VillageAgenda[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [villageProfile, setVillageProfile] = useState<VillageProfile>(INITIAL_VILLAGE_PROFILE);
  const [portalCredentials, setPortalCredentials] = useState<{ credentials: PortalCredential[] }>(INITIAL_PORTAL_CREDENTIALS);
  const [loadingDb, setLoadingDb] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Set up subscribers when user is logged in
  useEffect(() => {
    if (!currentUser) {
      setLoadingDb(false);
      return;
    }

    let unsubscribes: (() => void)[] = [];

    const initializeAndSubscribe = async () => {
      setLoadingDb(true);
      setDbError(null);
      try {
        // Authenticate user in Firebase Auth and set their roles on user document
        await authenticateFirebaseUser(currentUser.name, activeRole, currentUser.nik);

        // Subscribe to residents
        const unsubResidents = subscribeCollectionWithSeed<Resident>(
          'residents',
          LocalDb.getResidents(),
          (items) => setResidents(items)
        );
        unsubscribes.push(unsubResidents);

        // Subscribe to letters
        const unsubLetters = subscribeCollectionWithSeed<Letter>(
          'letters',
          LocalDb.getLetters(),
          (items) => setLetters(items)
        );
        unsubscribes.push(unsubLetters);

        // Subscribe to finances
        const unsubFinances = subscribeCollectionWithSeed<FinanceTransaction>(
          'finances',
          LocalDb.getFinances(),
          (items) => setFinances(items)
        );
        unsubscribes.push(unsubFinances);

        // Subscribe to assets
        const unsubAssets = subscribeCollectionWithSeed<any>(
          'assets',
          LocalDb.getAssets(),
          (items) => setAssets(items)
        );
        unsubscribes.push(unsubAssets);

        // Subscribe to complaints
        const unsubComplaints = subscribeCollectionWithSeed<any>(
          'complaints',
          LocalDb.getComplaints(),
          (items) => setComplaints(items)
        );
        unsubscribes.push(unsubComplaints);

        // Subscribe to announcements
        const unsubAnnouncements = subscribeCollectionWithSeed<VillageAnnouncement>(
          'announcements',
          LocalDb.getAnnouncements(),
          (items) => setAnnouncements(items)
        );
        unsubscribes.push(unsubAnnouncements);

        // Subscribe to agendas
        const unsubAgendas = subscribeCollectionWithSeed<VillageAgenda>(
          'agendas',
          LocalDb.getAgendas(),
          (items) => setAgendas(items)
        );
        unsubscribes.push(unsubAgendas);

        // Subscribe to audit logs
        const unsubAuditLogs = subscribeCollectionWithSeed<AuditLog>(
          'auditLogs',
          LocalDb.getAuditLogs(),
          (items) => setAuditLogs(items)
        );
        unsubscribes.push(unsubAuditLogs);

        // Subscribe to village profile single document
        const unsubProfile = subscribeSingleDoc<VillageProfile>(
          'settings',
          'villageProfile',
          LocalDb.getVillageProfile(),
          (profile) => setVillageProfile(profile)
        );
        unsubscribes.push(unsubProfile);

        // Subscribe to portal credentials
        const unsubCredentials = subscribeSingleDoc<{ credentials: PortalCredential[] }>(
          'settings',
          'portalCredentials',
          LocalDb.getPortalCredentials(),
          (items) => setPortalCredentials(items)
        );
        unsubscribes.push(unsubCredentials);

        setLoadingDb(false);
      } catch (err: any) {
        console.warn("Informasi koneksi dialihkan ke lokal (offline):", err.message || err);
        setDbError("Gagal terhubung ke basis data awan Firestore. Beralih ke penyimpanan lokal offline.");
        setLoadingDb(false);
        
        // Fallback loading from LocalDb
        setResidents(LocalDb.getResidents());
        setLetters(LocalDb.getLetters());
        setFinances(LocalDb.getFinances());
        setAssets(LocalDb.getAssets());
        setComplaints(LocalDb.getComplaints());
        setAnnouncements(LocalDb.getAnnouncements());
        setAgendas(LocalDb.getAgendas());
        setAuditLogs(LocalDb.getAuditLogs());
        setVillageProfile(LocalDb.getVillageProfile());
        setPortalCredentials(LocalDb.getPortalCredentials());
      }
    };

    initializeAndSubscribe();

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [currentUser, activeRole]);

  // Sync delta state savers using transactions/batch-writes helper
  const syncListToFirestore = async (collectionPath: string, currentItems: any[], nextItems: any[]) => {
    try {
      await syncListToFirestoreBatch(collectionPath, currentItems, nextItems);
    } catch (error) {
      console.error(`Gagal sinkronisasi data ke '${collectionPath}':`, error);
    }
  };

  // Logger helper
  const handleLogAction = (actionText: string, moduleName: string) => {
    const newLogItem: AuditLog = {
      id: `log-${Date.now()}`,
      userId: currentUser?.nik || 'staff-01',
      userName: currentUser?.name || 'Petugas Sipil',
      userRole: activeRole,
      action: actionText,
      module: moduleName,
      timestamp: new Date().toISOString()
    };
    
    // Save locally
    const updatedLogs = [newLogItem, ...auditLogs];
    setAuditLogs(updatedLogs);
    LocalDb.saveAuditLogs(updatedLogs);
    
    // Save to Firestore
    saveRecord('auditLogs', newLogItem.id, newLogItem).catch(e => {
      console.warn("Gagal merekam audit log ke Firestore:", e);
    });
  };

  // State savers
  const handleSaveResidents = (data: Resident[]) => {
    setResidents(data);
    LocalDb.saveResidents(data);
    syncListToFirestore('residents', residents, data);
  };

  const handleSaveLetters = (data: Letter[]) => {
    setLetters(data);
    LocalDb.saveLetters(data);
    syncListToFirestore('letters', letters, data);
  };

  const handleSaveFinances = (data: FinanceTransaction[]) => {
    setFinances(data);
    LocalDb.saveFinances(data);
    syncListToFirestore('finances', finances, data);
  };

  const handleSaveAssets = (data: any[]) => {
    setAssets(data);
    LocalDb.saveAssets(data);
    syncListToFirestore('assets', assets, data);
  };

  const handleSaveComplaints = (data: any[]) => {
    setComplaints(data);
    LocalDb.saveComplaints(data);
    syncListToFirestore('complaints', complaints, data);
  };

  const handleSaveAnnouncements = (data: VillageAnnouncement[]) => {
    setAnnouncements(data);
    LocalDb.saveAnnouncements(data);
    syncListToFirestore('announcements', announcements, data);
  };

  const handleSaveProfile = (data: VillageProfile) => {
    setVillageProfile(data);
    LocalDb.saveVillageProfile(data);
    saveRecord('settings', 'villageProfile', data).catch(e => {
      console.error("Gagal menyimpan profil desa ke Firestore:", e);
    });
  };

  const handleSavePortalCredentials = (data: { credentials: PortalCredential[] }) => {
    setPortalCredentials(data);
    LocalDb.savePortalCredentials(data);
    saveRecord('settings', 'portalCredentials', data).catch(e => {
      console.error("Gagal menyimpan kredensial portal ke Firestore:", e);
    });
  };

  const handleSaveAgendas = (data: VillageAgenda[]) => {
    setAgendas(data);
    LocalDb.saveAgendas(data);
    syncListToFirestore('agendas', agendas, data);
  };

  if (!currentUser) {
    return (
      <LoginView 
        onLoginSuccess={handleLoginSuccess}
        villageProfile={villageProfile}
      />
    );
  }

  return (
    <div id="smart-desa-digital-viewport" className="flex bg-slate-50 min-h-screen font-sans antialiased text-slate-800">
      
      {/* Role-controlled layout Sidebar */}
      <Sidebar 
        currentView={currentView} 
        setView={setView} 
        activeRole={activeRole} 
        setActiveRole={setActiveRole} 
        villageProfile={villageProfile}
        onLogout={handleLogout}
      />

      <div id="content-container-block" className="flex-grow flex flex-col h-screen overflow-hidden">
        
        {/* Main top header */}
        <Header 
          activeRole={activeRole} 
          onOpenAiAssistant={() => setIsAiOpen(true)} 
          villageProfile={villageProfile}
          onLogout={handleLogout}
        />

        {/* Dynamic content canvas */}
        <main id="main-content" className="flex-grow overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          
          {dbError && (
            <div className="mb-6 bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-start gap-3.5 shadow-sm">
              <div className="p-1.5 bg-amber-100 rounded-xl text-amber-600 shrink-0">
                <AlertTriangle size={15} />
              </div>
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-amber-800 uppercase tracking-widest font-mono">
                  Notasi Integrasi Awan Offline Fallback
                </h4>
                <p className="text-xs text-amber-700 leading-relaxed font-sans font-medium">
                  {dbError.includes("restricted") || dbError.includes("Anonymous") || dbError.includes("kredensial") ? (
                    <span>
                      Basis data awan Firestore saat ini berjalan dalam mode <strong>Penyimpanan Lokal (Offline Fallback)</strong> karena Otentikasi Anonim dinonaktifkan di proyek Firebase Anda. Untuk menyinkronkan data antar-perangkat secara real-time, silakan <strong>Aktifkan Penyedia Masuk Anonim</strong> di: 
                      <code className="mx-1 px-1.5 py-0.5 bg-amber-100/50 rounded font-mono text-[10.5px] border border-amber-200/50">
                        Firebase Console &gt; Authentication &gt; Sign-in method &gt; Anonymous &gt; Enable
                      </code>.
                    </span>
                  ) : (
                    dbError
                  )}
                </p>
              </div>
            </div>
          )}

          {!VIEW_ROLES[currentView] || VIEW_ROLES[currentView].includes(activeRole) ? (
            <>
              {currentView === 'dashboard' && (
                <DashboardView 
                  residents={residents}
                  letters={letters}
                  finances={finances}
                  announcements={announcements}
                  agendas={agendas}
                  auditLogs={auditLogs}
                  onNavigate={setView}
                  openAiAssistant={() => setIsAiOpen(true)}
                />
              )}

              {currentView === 'kependudukan' && (
                <KependudukanView 
                  residents={residents}
                  saveResidents={handleSaveResidents}
                  activeRole={activeRole}
                  onLogAction={handleLogAction}
                  villageProfile={villageProfile}
                />
              )}

              {currentView === 'surat' && (
                <SuratView 
                  letters={letters}
                  saveLetters={handleSaveLetters}
                  activeRole={activeRole}
                  onLogAction={handleLogAction}
                  villageProfile={villageProfile}
                />
              )}

              {currentView === 'keuangan' && (
                <KeuanganView 
                  finances={finances}
                  saveFinances={handleSaveFinances}
                  activeRole={activeRole}
                  onLogAction={handleLogAction}
                  openAiAssistant={() => setIsAiOpen(true)}
                />
              )}

              {currentView === 'bansos' && (
                <BansosView 
                  residents={residents}
                  saveResidents={handleSaveResidents}
                  activeRole={activeRole}
                  onLogAction={handleLogAction}
                />
              )}

              {currentView === 'aset' && (
                <AsetView 
                  assets={assets}
                  saveAssets={handleSaveAssets}
                  activeRole={activeRole}
                  onLogAction={handleLogAction}
                />
              )}

              {currentView === 'rtrw' && (
                <RtRwView 
                  residents={residents}
                  announcements={announcements}
                  saveAnnouncements={handleSaveAnnouncements}
                  agendas={agendas}
                  saveAgendas={handleSaveAgendas}
                  activeRole={activeRole}
                  onLogAction={handleLogAction}
                />
              )}

              {currentView === 'pengaduan' && (
                <PengaduanView 
                  complaints={complaints}
                  saveComplaints={handleSaveComplaints}
                  activeRole={activeRole}
                  onLogAction={handleLogAction}
                  currentUser={currentUser}
                />
              )}

              {currentView === 'pelayanan-warga' && (
                <PelayananWargaView 
                  residents={residents}
                  letters={letters}
                  complaints={complaints}
                  onNavigate={setView}
                  openAiAssistant={() => setIsAiOpen(true)}
                  currentUser={currentUser}
                />
              )}

              {currentView === 'web-desa' && (
                <WebDesaView 
                  activeRole={activeRole}
                  onLogAction={handleLogAction}
                />
              )}

              {currentView === 'kiosk' && (
                <KioskView 
                  letters={letters}
                  saveLetters={handleSaveLetters}
                  onLogAction={handleLogAction}
                  villageProfile={villageProfile}
                />
              )}

              {currentView === 'pengaturan' && (
                <PengaturanView 
                  profile={villageProfile}
                  saveProfile={handleSaveProfile}
                  onLogAction={handleLogAction}
                  portalCredentials={portalCredentials}
                  savePortalCredentials={handleSavePortalCredentials}
                />
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[55vh] p-6 text-center">
              <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-sm w-full shadow-sm space-y-4">
                <div className="mx-auto w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center border border-rose-100">
                  <ShieldAlert size={22} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">
                    AKSES TIDAK DIIZINKAN
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                    Otorisasi akun Anda (<span className="font-bold text-slate-700">{activeRole}</span>) tidak sah untuk mengakses modul <code className="bg-slate-50 px-1 py-0.5 rounded font-mono text-[10px] text-rose-600 font-bold">`{currentView}`</code>.
                  </p>
                </div>
                <button
                  onClick={() => setView(getHomeViewForRole(activeRole))}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold transition-all uppercase tracking-wider font-mono"
                >
                  KEMBALI KE PORTAL RESMI
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* SukaAsisten AI intelligent modal backdrop launcher */}
      <AiAssistantModal 
        isOpen={isAiOpen} 
        onClose={() => setIsAiOpen(false)} 
        finances={finances}
      />
    </div>
  );
}
