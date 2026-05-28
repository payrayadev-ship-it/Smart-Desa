import React, { useState } from 'react';
import { 
  Building, 
  Megaphone, 
  CalendarDays, 
  Users, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  DollarSign,
  Sparkles,
  Volume2
} from 'lucide-react';
import { VillageAnnouncement, VillageAgenda, Role, Resident } from '../types';

interface RtRwViewProps {
  residents: Resident[];
  announcements: VillageAnnouncement[];
  saveAnnouncements: (data: VillageAnnouncement[]) => void;
  agendas: VillageAgenda[];
  saveAgendas: (data: VillageAgenda[]) => void;
  activeRole: Role;
  onLogAction: (action: string, module: string) => void;
}

export default function RtRwView({
  residents,
  announcements: initialAnns,
  saveAnnouncements,
  agendas: initialAges,
  saveAgendas,
  activeRole,
  onLogAction
}: RtRwViewProps) {
  const [anns, setAnns] = useState<VillageAnnouncement[]>(initialAnns);
  const [ages, setAges] = useState<VillageAgenda[]>(initialAges);

  // New announcement states
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState('Gotong Royong');

  // New agenda states
  const [ageTitle, setAgeTitle] = useState('');
  const [ageDate, setAgeDate] = useState('2026-06-10');
  const [ageTime, setAgeTime] = useState('08:00');
  const [ageDesc, setAgeDesc] = useState('');
  const [ageAttendees, setAgeAttendees] = useState('Seluruh Warga RT 02');

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) {
      alert("Mohon isi judul dan rincian pengumuman warga!");
      return;
    }

    const newAnn: VillageAnnouncement = {
      id: `ann-${Date.now()}`,
      title: annTitle.trim(),
      content: annContent.trim(),
      date: new Date().toLocaleDateString('id-ID'),
      category: annCategory,
      author: activeRole
    };

    const payload = [newAnn, ...anns];
    setAnns(payload);
    saveAnnouncements(payload);
    onLogAction(`Memposting pengumuman RT/RW: ${annTitle}`, 'RT-RW');

    // Reset
    setAnnTitle('');
    setAnnContent('');
  };

  const handlePostAgenda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ageTitle.trim() || !ageDesc.trim()) {
      alert("Mohon isi nama agenda!");
      return;
    }

    const newAge: VillageAgenda = {
      id: `age-${Date.now()}`,
      title: ageTitle.trim(),
      date: ageDate,
      time: ageTime,
      description: ageDesc.trim(),
      attendees: ageAttendees,
      location: 'Balai Sawala RT / RW'
    };

    const payload = [newAge, ...ages];
    setAges(payload);
    saveAgendas(payload);
    onLogAction(`Membuat jadwal agenda warga RT: ${ageTitle}`, 'RT-RW');

    // Reset
    setAgeTitle('');
    setAgeDesc('');
  };

  const deleteAnnouncement = (id: string) => {
    if (window.confirm("Hapus pengumuman ini dari portal warga?")) {
      const payload = anns.filter(a => a.id !== id);
      setAnns(payload);
      saveAnnouncements(payload);
    }
  };

  const deleteAgenda = (id: string) => {
    if (window.confirm("Hapus agenda ini dari jadwal kalender kependudukan?")) {
      const payload = ages.filter(a => a.id !== id);
      setAges(payload);
      saveAgendas(payload);
    }
  };

  return (
    <div id="rt-rw-view-wrapper" className="space-y-4 animate-fade">
      
      {/* Header Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Building size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 leading-none">Pusat Koordinasi Paguyuban RT / RW</h2>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Musyawarah, Pengumuman Paving Jalan, Posyandu & Jaringan Pengamanan Ronda</p>
          </div>
        </div>

        <div className="text-[11px] font-semibold text-slate-500 font-mono">
          Peran Log : <span className="text-blue-600 font-extrabold">{activeRole}</span>
        </div>
      </div>

      {/* TWO PANEL SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* LEFT COLUMN: ANNOUNCEMENTS MANAGEMENT */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="border-b border-indigo-50 pb-2 mb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Megaphone size={14} className="text-blue-500" />
                <span>Publikasi Pengumuman Warga Desa</span>
              </h3>
            </div>

            {/* Post new Announcement form */}
            {activeRole !== 'Masyarakat' && (
              <form onSubmit={handlePostAnnouncement} className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4 space-y-2.5">
                <input
                  id="ann-title-input"
                  type="text"
                  placeholder="Judul Pengumuman (e.g. Kerja Bakti RT 02)"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full text-xs font-bold p-2 bg-white rounded border border-slate-200 focus:outline-none"
                  required
                />
                <textarea
                  id="ann-content-input"
                  placeholder="Rincian informasi jadwal berkumpul, perlengkapan yang wajib dibawa..."
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2 bg-white rounded border border-slate-200 focus:outline-none font-mono"
                  required
                />
                <div className="flex justify-between items-center">
                  <select
                    id="ann-cat-select"
                    value={annCategory}
                    onChange={(e) => setAnnCategory(e.target.value)}
                    className="text-[10px] font-bold border border-slate-200 bg-white p-1 rounded"
                  >
                    <option value="Rapat Warga">Rapat RT-RW</option>
                    <option value="Gotong Royong">Kolektif/Kerja Bakti</option>
                    <option value="Kesehatan">Kesehatan/Posyandu</option>
                    <option value="Keamanan">Ronda Malam/Kamling</option>
                  </select>
                  <button
                    type="submit"
                    id="submit-ann-btn"
                    className="px-3.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] uppercase font-bold rounded transition-colors"
                  >
                    Tayangkan Pengumuman
                  </button>
                </div>
              </form>
            )}

            {/* List active Announcements */}
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
              {anns.map((an) => (
                <div key={an.id} className="relative p-3 bg-white border border-slate-250 border-slate-200 hover:border-blue-200 rounded-lg flex flex-col gap-1 transition-all">
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-extrabold font-mono rounded-full">{an.category}</span>
                    <span className="text-[9px] text-slate-400 font-mono">{an.date}</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-800 leading-tight">{an.title}</h4>
                  <p className="text-[11px] text-slate-500 whitespace-pre-line font-mono leading-relaxed">{an.content}</p>
                  <p className="text-[9px] text-slate-400 italic">Diposting oleh: {an.author}</p>

                  {/* Detach option */}
                  {activeRole !== 'Masyarakat' && (
                    <button
                      id={`delete-ann-${an.id}`}
                      onClick={() => deleteAnnouncement(an.id)}
                      className="absolute top-2.5 right-2 px-1 text-slate-350 hover:text-rose-600 transition-colors"
                      title="Sembunyikan Pengumuman"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RECURRING AGENDAS AND MUTUAL WORK PLANNER */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="border-b border-indigo-50 pb-2 mb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <CalendarDays size={14} className="text-teal-600" />
                <span>Agenda / Kegiatan Kependudukan</span>
              </h3>
            </div>

            {/* Post new Agenda form */}
            {activeRole !== 'Masyarakat' && (
              <form onSubmit={handlePostAgenda} className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4 space-y-2.5">
                <input
                  id="agenda-title-input"
                  type="text"
                  placeholder="Nama Agenda (e.g. Pembelian Vaksin Balita)"
                  value={ageTitle}
                  onChange={(e) => setAgeTitle(e.target.value)}
                  className="w-full text-xs font-bold p-2 bg-white rounded border border-slate-200 focus:outline-none"
                  required
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <input
                    id="agenda-date-input"
                    type="date"
                    value={ageDate}
                    onChange={(e) => setAgeDate(e.target.value)}
                    className="text-xs p-1.5 bg-white border border-slate-200 rounded font-mono"
                  />
                  <input
                    id="agenda-time-input"
                    type="time"
                    value={ageTime}
                    onChange={(e) => setAgeTime(e.target.value)}
                    className="text-xs p-1.5 bg-white border border-slate-200 rounded font-mono"
                  />
                </div>

                <input
                  id="agenda-desc-input"
                  type="text"
                  placeholder="Rincian ringkas lokasi pendaftaran..."
                  value={ageDesc}
                  onChange={(e) => setAgeDesc(e.target.value)}
                  className="w-full text-xs p-2 bg-white rounded border border-slate-200 focus:outline-none font-mono"
                  required
                />

                <div className="flex justify-between items-center">
                  <input
                    id="agenda-attendees-input"
                    type="text"
                    value={ageAttendees}
                    onChange={(e) => setAgeAttendees(e.target.value)}
                    placeholder="e.g. Warga Kadus II"
                    className="text-[10px] font-bold border border-slate-200 bg-white p-1 rounded max-w-[150px]"
                  />
                  <button
                    type="submit"
                    id="submit-agenda-btn"
                    className="px-3.5 py-1 bg-teal-600 hover:bg-teal-700 text-white text-[10px] uppercase font-bold rounded transition-colors"
                  >
                    Rekam dalam Kalender
                  </button>
                </div>
              </form>
            )}

            {/* List active Agendas */}
            <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
              {ages.map((age) => (
                <div key={age.id} className="relative p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-1 hover:border-teal-300 transition-all">
                  <div className="flex justify-between items-center text-[9px] text-slate-400 font-extrabold uppercase font-mono">
                    <span>📅 {age.date} ⌚ {age.time}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 leading-tight">{age.title}</h4>
                  <p className="text-[10px] text-slate-500 font-mono leading-tight">{age.description}</p>
                  <p className="text-[9px] text-teal-600 font-extrabold">Peserta: {age.attendees}</p>

                  {/* Delete option */}
                  {activeRole !== 'Masyarakat' && (
                    <button
                      id={`delete-agenda-${age.id}`}
                      onClick={() => deleteAgenda(age.id)}
                      className="absolute top-2 right-1.5 px-1 text-slate-350 hover:text-rose-600"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
