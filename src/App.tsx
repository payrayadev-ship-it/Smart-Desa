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

import { Role, Resident, Letter, FinanceTransaction, VillageAsset, Complaint, VillageAnnouncement, VillageAgenda, AuditLog, VillageProfile } from './types';
import { INITIAL_VILLAGE_PROFILE, LocalDb } from './mockData';
import PengaturanView from './views/PengaturanView';

export default function App() {
  const [currentView, setView] = useState('dashboard');
  const [activeRole, setActiveRole] = useState<Role>('Operator');
  const [isAiOpen, setIsAiOpen] = useState(false);

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

  return (
    <div id="smart-desa-digital-viewport" className="flex bg-slate-50 min-h-screen font-sans antialiased text-slate-800">
      
      {/* Role-controlled layout Sidebar */}
      <Sidebar 
        currentView={currentView} 
        setView={setView} 
        activeRole={activeRole} 
        setActiveRole={setActiveRole} 
        villageProfile={villageProfile}
      />

      <div id="content-container-block" className="flex-grow flex flex-col h-screen overflow-hidden">
        
        {/* Main top header */}
        <Header 
          activeRole={activeRole} 
          onOpenAiAssistant={() => setIsAiOpen(true)} 
          villageProfile={villageProfile}
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
