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

import { Role, Resident, Letter, FinanceTransaction, VillageAsset, Complaint, VillageAnnouncement, VillageAgenda, AuditLog, VillageProfile } from './types';
import { INITIAL_VILLAGE_PROFILE, LocalDb } from './mockData';
import PengaturanView from './views/PengaturanView';
import LoginView from './views/LoginView';

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

  // Load from LocalDB on mount
  useEffect(() => {
    setResidents(LocalDb.getResidents());
    setLetters(LocalDb.getLetters());
    setFinances(LocalDb.getFinances());
    setAssets(LocalDb.getAssets());
    setComplaints(LocalDb.getComplaints());
    setAnnouncements(LocalDb.getAnnouncements());
    setAgendas(LocalDb.getAgendas());
    setAuditLogs(LocalDb.getAuditLogs());
    setVillageProfile(LocalDb.getVillageProfile());
  }, []);

  // Logger helper
  const handleLogAction = (actionText: string, moduleName: string) => {
    const newLogItem: AuditLog = {
      id: `log-${Date.now()}`,
      userId: activeRole === 'Masyarakat' ? 'warga-32' : 'staff-01',
      userName: activeRole === 'Masyarakat' ? 'Ahmad Sopian' : activeRole === 'RT/RW' ? 'Bpk. Yanto' : 'Petugas Sipil',
      userRole: activeRole,
      action: actionText,
      module: moduleName,
      timestamp: new Date().toISOString()
    };
    const updatedLogs = [newLogItem, ...auditLogs];
    setAuditLogs(updatedLogs);
    LocalDb.saveAuditLogs(updatedLogs);
  };

  // State savers
  const handleSaveResidents = (data: Resident[]) => {
    setResidents(data);
    LocalDb.saveResidents(data);
  };

  const handleSaveLetters = (data: Letter[]) => {
    setLetters(data);
    LocalDb.saveLetters(data);
  };

  const handleSaveFinances = (data: FinanceTransaction[]) => {
    setFinances(data);
    LocalDb.saveFinances(data);
  };

  const handleSaveAssets = (data: any[]) => {
    setAssets(data);
    LocalDb.saveAssets(data);
  };

  const handleSaveComplaints = (data: any[]) => {
    setComplaints(data);
    LocalDb.saveComplaints(data);
  };

  const handleSaveAnnouncements = (data: VillageAnnouncement[]) => {
    setAnnouncements(data);
    LocalDb.saveAnnouncements(data);
  };

  const handleSaveProfile = (data: VillageProfile) => {
    setVillageProfile(data);
    LocalDb.saveVillageProfile(data);
  };

  const handleSaveAgendas = (data: VillageAgenda[]) => {
    setAgendas(data);
    LocalDb.saveAgendas(data);
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
            />
          )}

          {currentView === 'pelayanan-warga' && (
            <PelayananWargaView 
              residents={residents}
              letters={letters}
              complaints={complaints}
              onNavigate={setView}
              openAiAssistant={() => setIsAiOpen(true)}
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
            />
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
