import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  User, 
  MessageSquare,
  Clock,
  X,
  RefreshCw,
  Eye
} from 'lucide-react';
import { CitizenComplaint, Role } from '../types';

interface PengaduanViewProps {
  complaints: CitizenComplaint[];
  saveComplaints: (data: CitizenComplaint[]) => void;
  activeRole: Role;
  onLogAction: (action: string, module: string) => void;
  currentUser?: { name: string; role: Role; nik?: string } | null;
}

export default function PengaduanView({
  complaints: initialComplaints,
  saveComplaints,
  activeRole,
  onLogAction,
  currentUser
}: PengaduanViewProps) {
  const [complaints, setComplaints] = useState<CitizenComplaint[]>(initialComplaints);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua');

  // Synchronize local state with live database updates from Firestore
  useEffect(() => {
    setComplaints(initialComplaints);
  }, [initialComplaints]);

  // New Complaint state
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Infrastruktur');
  const [description, setDescription] = useState('');
  const [residentNik, setResidentNik] = useState(currentUser?.nik || '');

  // Keep resident NIK in sync if the current user object changes
  useEffect(() => {
    if (currentUser?.nik) {
      setResidentNik(currentUser.nik);
    }
  }, [currentUser]);
  
  // AI assistant dynamic states inside Complaint View
  const [aiDraftId, setAiDraftId] = useState<string | null>(null);
  const [aiResponseText, setAiResponseText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("Mohon masukkan judul pengaduan dan rincian masalah.");
      return;
    }

    const newComp: CitizenComplaint = {
      id: `cmp-${Date.now()}`,
      title: title.trim(),
      category,
      description: description.trim(),
      residentNik: residentNik || '1512401204000302',
      status: 'Diajukan',
      response: '',
      createdAt: new Date().toISOString()
    };

    const payload = [newComp, ...complaints];
    setComplaints(payload);
    saveComplaints(payload);
    onLogAction(`Warga mengunggah laporan pengaduan baru: ${title}`, 'Pengaduan');

    // Reset
    setTitle('');
    setDescription('');
    setResidentNik('');
    setShowForm(false);
  };

  // Submit official diplomatic response
  const submitOfficialResponse = (id: string, text: string) => {
    const payload = complaints.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'Diproses' as const,
          response: text,
          respondedBy: activeRole,
          respondedAt: new Date().toISOString()
        };
      }
      return c;
    });
    setComplaints(payload);
    saveComplaints(payload);
    onLogAction(`Memberikan tanggapan resmi pada pengaduan ID ${id}`, 'Pengaduan');
    setAiDraftId(null);
    setAiResponseText('');
  };

  // Resolve complaint
  const handleResolveComplaint = (id: string) => {
    const payload = complaints.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'Selesai' as const,
          respondedAt: new Date().toISOString()
        };
      }
      return c;
    });
    setComplaints(payload);
    saveComplaints(payload);
    onLogAction(`Menutup laporan pengaduan ID ${id} dengan status SELESAI`, 'Pengaduan');
  };

  // Delete complaint
  const handleDeleteComplaint = (id: string, name: string) => {
    if (window.confirm(`Hapus permanen laporan keluhan "${name}"?`)) {
      const payload = complaints.filter(c => c.id !== id);
      setComplaints(payload);
      saveComplaints(payload);
      onLogAction(`Menghapus laporan pengaduan: ${name}`, 'Pengaduan');
    }
  };

  // FETCH GEMINI DIPLOMATIC RESPONSE AUTO WRITER
  const fetchAiDiplomaticResponse = async (complaintItem: CitizenComplaint) => {
    setAiDraftId(complaintItem.id);
    setAiLoading(true);
    setAiResponseText('');
    try {
      const response = await fetch('/api/ai/complaint-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaintTitle: complaintItem.title,
          complaintCategory: complaintItem.category,
          complaintDesc: complaintItem.description
        })
      });
      const data = await response.json();
      if (response.ok && data.text) {
        setAiResponseText(data.text);
      } else {
        setAiResponseText(`Gagal generate draf AI: ${data.error || 'Unknown error'}`);
      }
    } catch {
      setAiResponseText('Masalah sinkronisasi koneksi server asisten AI.');
    } finally {
      setAiLoading(false);
    }
  };

  // Filtering
  const filteredComplaints = complaints.filter(c => {
    const term = search.toLowerCase();
    const queryMatch = 
      c.title.toLowerCase().includes(term) || 
      c.description.toLowerCase().includes(term) || 
      c.residentNik.includes(term);

    const categoryMatch = filterCategory === 'Semua' || c.category === filterCategory;
    return queryMatch && categoryMatch;
  });

  return (
    <div id="pengaduan-view-wrapper" className="space-y-4 animate-fade">
      
      {/* Header element */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 leading-none">Pusat Halo Kades & Pengaduan Warga Online</h2>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Penanganan Keluhan Publik, Mediasi KKN, Kerusakan Infrastruktur & Transparansi Sosial</p>
          </div>
        </div>

        <button
          id="add-complaint-btn-trigger"
          onClick={() => setShowForm(true)}
          className="px-4 py-1.5 bg-amber-650 bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-all self-start"
        >
          <Plus size={14} />
          <span>Laporkan Keluhan Warga</span>
        </button>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative md:col-span-2">
          <Search className="absolute left-2.5 top-2.5 text-slate-400" size={13} />
          <input
            id="complaint-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kata kunci keluhan, paving berlubang, nama pelapor, NIK..."
            className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono"
          />
        </div>

        <select
          id="filter-complaint-cat"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-700"
        >
          <option value="Semua">Semua Kategori Keluhan</option>
          <option value="Infrastruktur">Infrastruktur</option>
          <option value="Sampah & Kebersihan">Sampah & Kebersihan</option>
          <option value="Bantuan Sosial">Bantuan Sosial</option>
          <option value="Keamanan">Keamanan & Keberisikan</option>
        </select>
      </div>

      {/* SUBMISSION MODAL FORM */}
      {showForm && (
        <div id="new-complaint-modal-backdrop" className="bg-slate-900/60 backdrop-blur-sm fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
            
            <div className="bg-amber-600 text-white p-3.5 flex justify-between items-center text-xs font-bold font-mono tracking-wider shrink-0">
              <span>PENGAJUAN FORUM PENGADUAN KELUARGA</span>
              <button id="close-complaint-modal" onClick={() => setShowForm(false)} className="text-white hover:text-slate-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitComplaint} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">NIK Anda (Penduduk Terdaftar)*</label>
                <input
                  id="comp-nik-input"
                  type="text"
                  maxLength={16}
                  value={residentNik}
                  onChange={(e) => setResidentNik(e.target.value.replace(/\D/g, ''))}
                  placeholder="NIK 16 digit penjamin laporan"
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Judul Isu / Pelaporan Singkat*</label>
                <input
                  id="comp-title-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Pemasangan Lampu Kamling RT04"
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Kategori Layanan</label>
                <select
                  id="comp-cat-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800"
                >
                  <option value="Pelayanan">Pemerintahan & Pelayanan</option>
                  <option value="Infrastruktur">Infrastruktur & Jalan</option>
                  <option value="Sampah & Kebersihan">Sampah & Kebersihan Lingkungan</option>
                  <option value="Bantuan Sosial">Bantuan Sosial & BLT</option>
                  <option value="Keamanan">Keamanan & Pos Ronda</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Isi Narasi Kejadian / Uraian Detail*</label>
                <textarea
                  id="comp-desc-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ceritakan sejarah keluhan, kronologi, daerah terdampak..."
                  rows={3}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold font-mono"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  id="submit-complaint-btn"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  KIRIM PENGADUAN RESMI
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DETAILED BLOG-LIKE COMPLAINT ROWS */}
      <div className="space-y-3">
        {filteredComplaints.length > 0 ? (
          filteredComplaints.map((comp) => {
            const isEditingResponse = aiDraftId === comp.id;
            
            return (
              <div key={comp.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative hover:border-amber-200 transition-all flex flex-col gap-3">
                
                {/* Meta details */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-[9px] font-black uppercase tracking-wider font-mono">
                      ⚠️ {comp.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">💡 Dilaporkan: {new Date(comp.createdAt).toLocaleDateString()}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                    comp.status === 'Selesai' 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : comp.status === 'Diproses'
                      ? 'bg-blue-50 text-blue-800 border border-blue-200 animate-pulse'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {comp.status}
                  </span>
                </div>

                {/* Question Narration */}
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800 leading-tight">{comp.title}</h4>
                  <p className="text-[11px] text-slate-500 font-mono mt-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed max-w-full">
                    {comp.description}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-1 font-mono">NIK Pelapor: {comp.residentNik}</p>
                </div>

                {/* Responder official block */}
                {comp.response ? (
                  <div className="bg-blue-50/70 border border-blue-150 p-3 rounded-lg flex flex-col gap-1.5 relative">
                    <div className="flex justify-between text-[10px] text-blue-700 font-mono uppercase font-bold leading-none">
                      <span className="inline-flex items-center gap-1">💬 TANGGAPAN RESMI BALAI DESA</span>
                      <span>Oleh : {comp.respondedBy || 'Sekretariat'}</span>
                    </div>
                    <p className="text-xs text-slate-700 whitespace-pre-line font-mono leading-relaxed">{comp.response}</p>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-400 italic font-mono flex items-center justify-between pb-1">
                    <span>Laporan belum ditindaklanjuti. Menunggu proses analisis.</span>
                    {activeRole !== 'Masyarakat' && !isEditingResponse && (
                      <button 
                        id={`ai-helper-btn-${comp.id}`}
                        onClick={() => fetchAiDiplomaticResponse(comp)}
                        className="px-2 py-1 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 rounded font-bold text-[9.5px] inline-flex items-center gap-1 font-mono"
                      >
                        <Sparkles size={11} />
                        <span>Draf AI Diplomatic</span>
                      </button>
                    )}
                  </div>
                )}

                {/* AI RESPONDER TEXT WRITING BOX */}
                {isEditingResponse && (
                  <div className="border border-blue-200 rounded-xl p-3 bg-slate-50 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold text-blue-700 font-mono">
                      <span className="flex items-center gap-1">
                        <Sparkles size={12} className="animate-spin text-amber-500" />
                        <span>DRAF BALASAN KADES DIPLOMATIS (GEMINI)</span>
                      </span>
                      <button id="cancel-ai-composition" onClick={() => setAiDraftId(null)} className="text-slate-400 hover:text-slate-600">
                        Batal
                      </button>
                    </div>

                    {aiLoading ? (
                      <div className="text-xs text-slate-500 font-mono py-4 flex items-center gap-2">
                        <RefreshCw className="animate-spin" size={13} />
                        <span>Kepala Desa AI sedang menyusun tangbapan persuasif...</span>
                      </div>
                    ) : (
                      <>
                        <textarea
                          id="ai-response-editor"
                          value={aiResponseText}
                          onChange={(e) => setAiResponseText(e.target.value)}
                          rows={3}
                          className="w-full text-xs p-2 bg-white rounded border border-slate-200 font-mono text-slate-800"
                        />
                        <div className="flex justify-end gap-2 text-[10px] font-bold">
                          <button
                            type="button"
                            id="accept-ai-draft-btn"
                            onClick={() => submitOfficialResponse(comp.id, aiResponseText)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm font-mono"
                          >
                            🚀 PUBLIKASIKAN JAWABAN RESMI
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Operation Buttons for Admin */}
                {activeRole !== 'Masyarakat' && (
                  <div className="flex justify-end items-center gap-2 border-t border-slate-100 pt-2 shrink-0">
                    {comp.status !== 'Selesai' && (
                      <button
                        id={`resolve-comp-${comp.id}`}
                        onClick={() => handleResolveComplaint(comp.id)}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 rounded text-[10px] font-bold font-mono transition-colors"
                      >
                        ✔ Tutup Isu (Selesai)
                      </button>
                    )}
                    <button
                      id={`delete-comp-${comp.id}`}
                      onClick={() => handleDeleteComplaint(comp.id, comp.title)}
                      className="p-1 text-slate-300 hover:text-rose-600 rounded"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}

              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-slate-400 bg-white border border-slate-200 rounded-xl font-mono text-xs shadow-sm">
            Laporan pengaduan warga kosong pada database filter ini.
          </div>
        )}
      </div>

    </div>
  );
}
