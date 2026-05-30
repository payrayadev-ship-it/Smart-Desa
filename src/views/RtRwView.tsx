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
  Volume2,
  Edit,
  Check,
  X,
  Key
} from 'lucide-react';
import { VillageAnnouncement, VillageAgenda, Role, Resident, RtRwFinance } from '../types';

interface RtRwViewProps {
  residents: Resident[];
  announcements: VillageAnnouncement[];
  saveAnnouncements: (data: VillageAnnouncement[]) => void;
  agendas: VillageAgenda[];
  saveAgendas: (data: VillageAgenda[]) => void;
  activeRole: Role;
  onLogAction: (action: string, module: string) => void;
  rtFinances: RtRwFinance[];
  saveRtFinances: (data: RtRwFinance[]) => void;
}

export default function RtRwView({
  residents,
  announcements: initialAnns,
  saveAnnouncements,
  agendas: initialAges,
  saveAgendas,
  activeRole,
  onLogAction,
  rtFinances = [],
  saveRtFinances
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

  // New RT states
  const [newRtNumber, setNewRtNumber] = useState('');
  const [newRwNumber, setNewRwNumber] = useState('');
  const [newNamaRt, setNewNamaRt] = useState('');
  const [newRtPin, setNewRtPin] = useState('');
  const [successRtMsg, setSuccessRtMsg] = useState('');

  // Inline edit states
  const [editingRtId, setEditingRtId] = useState<string | null>(null);
  const [editNamaRt, setEditNamaRt] = useState('');
  const [editPin, setEditPin] = useState('');

  const handleCreateRt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRtNumber.trim() || !newRwNumber.trim() || !newNamaRt.trim()) {
      alert("Mohon lengkapi seluruh isian data RT baru!");
      return;
    }

    const cleanRt = newRtNumber.trim().padStart(2, '0');
    const cleanRw = newRwNumber.trim().padStart(2, '0');
    const cleanPin = newRtPin.trim() || '123456';

    // Check if RT and RW combination already exists
    const exists = rtFinances.some(
      item => item.rt === cleanRt && item.rw === cleanRw
    );
    if (exists) {
      alert(`Wilayah RT ${cleanRt} / RW ${cleanRw} sudah terdaftar sebelumnya!`);
      return;
    }

    const newRt: RtRwFinance = {
      id: `rtf-${Date.now()}`,
      rt: cleanRt,
      rw: cleanRw,
      month: 'Mei 2026',
      iuranWarga: 0,
      kasRt: 0,
      pengeluaranRt: 0,
      agendaRt: 'Baru didaftarkan oleh Super Admin',
      namaRt: newNamaRt.trim(),
      pin: cleanPin
    };

    const updated = [...rtFinances, newRt];
    saveRtFinances(updated);
    onLogAction(`Mendaftarkan wilayah RT baru: RT ${cleanRt} RW ${cleanRw} - ${newNamaRt} dengan PIN`, 'RT-RW');

    // Reset fields
    setNewRtNumber('');
    setNewRwNumber('');
    setNewNamaRt('');
    setNewRtPin('');
    
    // Flash message
    setSuccessRtMsg("Wilayah RT Baru Berhasil Ditambahkan dengan PIN Pengurus!");
    setTimeout(() => {
      setSuccessRtMsg('');
    }, 4000);
  };

  const handleStartEdit = (rtf: RtRwFinance) => {
    setEditingRtId(rtf.id);
    setEditNamaRt(rtf.namaRt || '');
    setEditPin(rtf.pin || '123456');
  };

  const handleSaveEdit = (id: string) => {
    if (!editNamaRt.trim() || !editPin.trim()) {
      alert("Nama RT dan PIN tidak boleh kosong!");
      return;
    }

    const updated = rtFinances.map(rtf => {
      if (rtf.id === id) {
        return {
          ...rtf,
          namaRt: editNamaRt.trim(),
          pin: editPin.trim()
        };
      }
      return rtf;
    });

    saveRtFinances(updated);
    const targetRt = rtFinances.find(r => r.id === id);
    onLogAction(`Memperbarui data dan PIN RT ${targetRt?.rt} RW ${targetRt?.rw}`, 'RT-RW');
    setEditingRtId(null);

    setSuccessRtMsg("Data wilayah dan PIN pengurus RT berhasil diperbarui!");
    setTimeout(() => {
      setSuccessRtMsg('');
    }, 4000);
  };

  const handleDeleteRt = (id: string, rtCode: string, rwCode: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus wilayah RT ${rtCode} / RW ${rwCode} dari daftar?`)) {
      const updated = rtFinances.filter(item => item.id !== id);
      saveRtFinances(updated);
      onLogAction(`Menghapus wilayah RT: RT ${rtCode} RW ${rwCode}`, 'RT-RW');
    }
  };

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

      {/* SECTION: DATA WILAYAH RUKUN TETANGGA (RT / RW) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
        <div className="border-b border-indigo-50 pb-2 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Users size={14} className="text-indigo-600" />
            <span>Manajemen Wilayah &amp; Registrasi Rukun Tetangga (RT)</span>
          </h3>
          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-extrabold uppercase font-mono rounded">
            Total: {rtFinances.length} Wilayah
          </span>
        </div>

        {successRtMsg && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] rounded flex items-center gap-1.5 font-mono">
            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
            <span>{successRtMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* LEFT: RT LIST TABLE / CARDS (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* 1. DESKTOP/TABLET TABLE VIEW (Hidden on Mobile) */}
            <div className="hidden md:block overflow-x-auto border border-slate-200/60 rounded-xl bg-slate-50/20">
              <table className="w-full text-left font-mono text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold bg-slate-50 text-[10px] uppercase">
                    <th className="p-3">RT</th>
                    <th className="p-3">RW</th>
                    <th className="p-3">Nama RT / Wilayah</th>
                    <th className="p-3">Sandi PIN</th>
                    <th className="p-3">Kas RT</th>
                    <th className="p-3">Agenda Terakhir</th>
                    {activeRole === 'Super Admin' && <th className="p-3 text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {rtFinances.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-slate-400 italic">
                        Belum ada data wilayah RT yang terdaftar.
                      </td>
                    </tr>
                  ) : (
                    rtFinances.map((rtf) => (
                      <tr key={rtf.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 font-black text-slate-700">RT {rtf.rt}</td>
                        <td className="p-3 text-slate-600">RW {rtf.rw}</td>
                        <td className="p-3">
                          {editingRtId === rtf.id ? (
                            <input
                              type="text"
                              value={editNamaRt}
                              name="edit-nama-rt"
                              onChange={(e) => setEditNamaRt(e.target.value)}
                              className="font-sans px-2.5 py-1.5 text-xs border border-indigo-200 rounded w-full max-w-[150px] focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                              placeholder="Nama RT"
                              required
                            />
                          ) : (
                            <span className="font-sans font-bold text-indigo-950">
                              {rtf.namaRt || `RT ${rtf.rt} ${rtf.rw}`}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {editingRtId === rtf.id ? (
                            <input
                              type="text"
                              value={editPin}
                              name="edit-pin"
                              maxLength={8}
                              onChange={(e) => setEditPin(e.target.value)}
                              className="font-mono px-2.5 py-1.5 text-xs border border-indigo-200 rounded w-20 text-center focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                              placeholder="PIN Pas"
                              required
                            />
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 font-mono px-2.5 py-1 rounded border border-slate-200" title="Sandi PIN Pengurus RT">
                              <Key size={10} className="text-amber-500" />
                              <span>{rtf.pin || '123456'}</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-emerald-600 font-bold">
                          Rp {rtf.kasRt.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-slate-500 max-w-[150px] truncate" title={rtf.agendaRt}>
                          {rtf.agendaRt}
                        </td>
                        {activeRole === 'Super Admin' && (
                          <td className="p-3 text-center">
                            {editingRtId === rtf.id ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(rtf.id)}
                                  className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-colors"
                                  title="Simpan Perubahan"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingRtId(null)}
                                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                                  title="Batal"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(rtf)}
                                  className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors"
                                  title="Ubah Data / PIN"
                                >
                                  <Edit size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRt(rtf.id, rtf.rt, rtf.rw)}
                                  className="p-1.5 text-slate-350 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                  title="Hapus RT"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 2. MOBILE CARD VIEW (Optimized for Handphone, Hidden on Desktop) */}
            <div className="md:hidden space-y-3">
              {rtFinances.length === 0 ? (
                <div className="p-6 text-center text-slate-450 text-xs italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Belum ada data wilayah RT yang terdaftar.
                </div>
              ) : (
                rtFinances.map((rtf) => (
                  <div 
                    key={rtf.id} 
                    className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 space-y-3 hover:border-indigo-200 transition-all shadow-xs"
                  >
                    {/* Header: RT / RW badge & Action button */}
                    <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-600 text-white text-[10px] font-black font-mono px-2.5 py-1 rounded-md uppercase tracking-wider">
                          RT {rtf.rt}
                        </span>
                        <span className="bg-slate-250 bg-slate-200 text-slate-700 text-[10px] font-black font-mono px-2 py-1 rounded-md uppercase tracking-wider">
                          RW {rtf.rw}
                        </span>
                      </div>

                      {activeRole === 'Super Admin' && (
                        <div>
                          {editingRtId === rtf.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(rtf.id)}
                                className="px-2.5 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded flex items-center gap-1 active:scale-95 transition-all"
                                title="Simpan"
                              >
                                <Check size={11} />
                                <span>Simpan</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingRtId(null)}
                                className="p-1.5 bg-slate-200 text-slate-700 text-[10px] rounded active:scale-95 transition-all"
                                title="Batal"
                              >
                                <X size={11} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(rtf)}
                                className="p-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded active:scale-95 transition-all flex items-center gap-1 text-[9.5px] font-semibold"
                                title="Edit"
                              >
                                <Edit size={11} />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteRt(rtf.id, rtf.rt, rtf.rw)}
                                className="p-1.5 bg-rose-50 text-rose-650 text-rose-600 rounded border border-rose-100 active:scale-95 transition-all"
                                title="Hapus"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Metadata Content Grid */}
                    <div className="space-y-2 text-xs font-mono">
                      
                      {/* Name field */}
                      <div>
                        <span className="text-[8.5px] uppercase font-bold text-slate-400 block tracking-wider">Nama RT / Wilayah</span>
                        {editingRtId === rtf.id ? (
                          <input
                            type="text"
                            value={editNamaRt}
                            name="edit-nama-rt-mobile"
                            onChange={(e) => setEditNamaRt(e.target.value)}
                            className="font-sans px-2.5 py-1.5 mt-1 text-xs border border-indigo-200 rounded w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                            placeholder="Nama RT"
                            required
                          />
                        ) : (
                          <span className="font-sans font-extrabold text-indigo-950 text-xs sm:text-sm block py-0.5">
                            {rtf.namaRt || `RT ${rtf.rt} ${rtf.rw}`}
                          </span>
                        )}
                      </div>

                      {/* Flex grid for PIN & Kas */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* PIN field */}
                        <div className="bg-slate-100/50 p-2 rounded border border-slate-200/50">
                          <span className="text-[8px] uppercase font-bold text-slate-450 block tracking-wider">Sandi PIN Pengurus</span>
                          {editingRtId === rtf.id ? (
                            <input
                              type="text"
                              value={editPin}
                              name="edit-pin-mobile"
                              maxLength={8}
                              onChange={(e) => setEditPin(e.target.value)}
                              className="font-mono px-2 py-1 mt-1 text-xs border border-indigo-200 rounded w-full text-center focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                              placeholder="PIN Pas"
                              required
                            />
                          ) : (
                            <span className="inline-flex items-center gap-1 mt-1 bg-white text-slate-800 font-bold px-2 py-0.5 rounded border border-slate-250">
                              <Key size={10} className="text-amber-500 shrink-0" />
                              <span className="text-[10px]">{rtf.pin || '123456'}</span>
                            </span>
                          )}
                        </div>

                        {/* Kas RT field */}
                        <div className="bg-emerald-50/20 p-2 rounded border border-emerald-100">
                          <span className="text-[8px] uppercase font-bold text-slate-450 block tracking-wider">Kas Dana RT</span>
                          <span className="text-emerald-700 font-extrabold text-xs block mt-1">
                            Rp {rtf.kasRt.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      {/* Agenda field */}
                      <div className="bg-slate-100/30 p-2 rounded text-[10px]">
                        <span className="text-[8px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">Agenda Teraktif</span>
                        <p className="text-slate-600 italic leading-snug">{rtf.agendaRt}</p>
                      </div>

                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

          {/* RIGHT: CREATE FORM (4 Cols - ONLY FOR SUPER ADMIN) */}
          <div className="lg:col-span-4">
            {activeRole === 'Super Admin' ? (
              <form onSubmit={handleCreateRt} className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center gap-1 border-b border-slate-200 pb-1.5 mb-1.5">
                  <Plus size={13} className="text-emerald-500" />
                  <span className="text-[10px] font-extrabold uppercase font-mono tracking-wider text-slate-600">Registrasi RT Baru</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1 text-left">
                    <label className="block text-[8.5px] uppercase font-bold text-slate-400 font-mono">Kode RT</label>
                    <input
                      id="new-rt-number"
                      type="text"
                      placeholder="e.g. 03"
                      maxLength={3}
                      value={newRtNumber}
                      onChange={(e) => setNewRtNumber(e.target.value)}
                      className="w-full text-xs font-mono p-1.5 bg-white rounded border border-slate-200 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="block text-[8.5px] uppercase font-bold text-slate-400 font-mono">Kode RW</label>
                    <input
                      id="new-rw-number"
                      type="text"
                      placeholder="e.g. 05"
                      maxLength={3}
                      value={newRwNumber}
                      onChange={(e) => setNewRwNumber(e.target.value)}
                      className="w-full text-xs font-mono p-1.5 bg-white rounded border border-slate-200 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="block text-[8.5px] uppercase font-bold text-slate-400 font-mono">Nama Wilayah / Pengurus RT</label>
                  <input
                    id="new-rt-name"
                    type="text"
                    placeholder="e.g. RT 03 Bojong Kidul"
                    value={newNamaRt}
                    onChange={(e) => setNewNamaRt(e.target.value)}
                    className="w-full text-xs p-1.5 bg-white rounded border border-slate-200 focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="block text-[8.5px] uppercase font-bold text-slate-400 font-mono">Sandi PIN Pengurus (6 Digit)</label>
                  <input
                    id="new-rt-pin-input"
                    type="text"
                    placeholder="e.g. 030503"
                    maxLength={10}
                    value={newRtPin}
                    onChange={(e) => setNewRtPin(e.target.value)}
                    className="w-full text-xs p-1.5 bg-white rounded border border-slate-200 focus:outline-none font-mono"
                  />
                  <span className="text-[8.5px] text-slate-400 block font-sans">Default jika kosong: 123456</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] uppercase font-bold rounded shadow transition-all duration-150 flex items-center justify-center gap-1"
                >
                  <Plus size={12} />
                  <span>Daftarkan RT Baru</span>
                </button>
              </form>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-200 p-4 rounded-xl text-center">
                <span className="text-[10px] text-slate-400 font-sans block leading-relaxed">
                  Otoritas penambahan wilayah RT baru dibatasi secara eksklusif untuk peran <strong className="text-slate-500 font-mono">Super Admin</strong>.
                </span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
