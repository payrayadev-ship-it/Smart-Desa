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
  Eye,
  Printer,
  FileText,
  FileDown
} from 'lucide-react';
import { CitizenComplaint, Role, VillageProfile } from '../types';

interface PengaduanViewProps {
  complaints: CitizenComplaint[];
  saveComplaints: (data: CitizenComplaint[]) => void;
  activeRole: Role;
  onLogAction: (action: string, module: string) => void;
  currentUser?: { name: string; role: Role; nik?: string } | null;
  villageProfile?: VillageProfile;
}

export default function PengaduanView({
  complaints: initialComplaints,
  saveComplaints,
  activeRole,
  onLogAction,
  currentUser,
  villageProfile
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

  // Printing monthly report states
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('Semua');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [printFilterCat, setPrintFilterCat] = useState('Semua');
  const [printFilterStat, setPrintFilterStat] = useState('Semua');

  const handlePrintPDF = (selMonth: string, selYear: string, pCat: string, pStat: string) => {
    // Filter complaints based on selections
    const docs = complaints.filter(c => {
      const dateObj = new Date(c.createdAt || c.date || Date.now());
      const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      const complaintMonth = monthNames[dateObj.getMonth()];
      const complaintYear = dateObj.getFullYear().toString();

      const matchesMonth = selMonth === 'Semua' || complaintMonth === selMonth;
      const matchesYear = selYear === 'Semua' || complaintYear === selYear;
      const matchesCat = pCat === 'Semua' || c.category === pCat;
      const matchesStat = pStat === 'Semua' || c.status === pStat;

      return matchesMonth && matchesYear && matchesCat && matchesStat;
    });

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup terblokir! Silakan aktifkan izin popup di browser Anda.");
      return;
    }

    const mName = villageProfile?.name || "Desa Contoh";
    const subdistrict = villageProfile?.subdistrict || "Kecamatan Contoh";
    const regency = villageProfile?.regency || "Kabupaten Contoh";
    const phone = villageProfile?.phone || "-";
    const lKades = villageProfile?.kepalaDesa || "Kepala Desa";

    const formattedDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    let tableRowsHtml = "";
    docs.forEach((d, index) => {
      const dDate = new Date(d.createdAt || d.date || Date.now()).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      tableRowsHtml += `
        <tr>
          <td style="text-align: center;">${index + 1}</td>
          <td>${dDate}</td>
          <td style="font-family: monospace;">${d.residentNik}</td>
          <td><strong>${d.title}</strong></td>
          <td>${d.category}</td>
          <td>${d.description}</td>
          <td>
            <span class="status-badge status-${d.status.toLowerCase()}">${d.status}</span>
            ${d.response ? `<div style="font-size: 10px; color: #4b5563; margin-top: 5px; border-top: 1px dashed #d1d5db; padding-top: 4px;"><strong>Tanggapan:</strong> ${d.response}</div>` : ''}
          </td>
        </tr>
      `;
    });

    if (docs.length === 0) {
      tableRowsHtml = `<tr><td colspan="7" style="text-align: center; color: #6b7280; font-style: italic; padding: 30px;">Tidak ada pengaduan warga tercatat untuk filter periode ini.</td></tr>`;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan Bulanan Pengaduan - ${mName}</title>
          <style>
            @media print {
              body { margin: 1cm; font-size: 11px; }
              @page { size: A4 portrait; margin: 1cm; }
              .no-print { display: none !important; }
            }
            body { 
              font-family: Arial, sans-serif; 
              color: #111827; 
              line-height: 1.4;
              margin: 40px;
            }
            .kop-surat {
              border-bottom: 3px double #000;
              padding-bottom: 12px;
              margin-bottom: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .logo-placeholder {
              width: 70px;
              height: 70px;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 2px solid #111827;
              border-radius: 9999px;
              font-size: 9px;
              text-align: center;
              font-weight: bold;
              margin-right: 20px;
              text-transform: uppercase;
              padding: 5px;
            }
            .kop-text {
              text-align: center;
              flex: 1;
              padding-right: 40px;
            }
            .kop-text h1 {
              font-size: 14px;
              margin: 0;
              font-weight: bold;
              text-transform: uppercase;
            }
            .kop-text h2 {
              font-size: 16px;
              margin: 3px 0;
              font-weight: bold;
              text-transform: uppercase;
            }
            .kop-text h3 {
              font-size: 18px;
              margin: 0;
              font-weight: bold;
              text-transform: uppercase;
            }
            .kop-text p {
              font-size: 10px;
              margin: 4px 0 0 0;
              color: #4b5563;
              font-style: italic;
            }
            .report-title {
              text-align: center;
              margin-bottom: 25px;
            }
            .report-title h4 {
              font-size: 14px;
              text-decoration: underline;
              margin: 0 0 5px 0;
              font-weight: bold;
              text-transform: uppercase;
            }
            .report-title p {
              margin: 0;
              font-size: 11px;
              font-weight: bold;
            }
            .meta-info {
              margin-bottom: 20px;
              font-size: 11px;
              width: 100%;
              border-collapse: collapse;
            }
            .meta-info td {
              padding: 4px 0;
            }
            .report-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
              font-size: 10px;
            }
            .report-table th, .report-table td {
              border: 1px solid #111827;
              padding: 8px 6px;
              vertical-align: top;
            }
            .report-table th {
              background-color: #f3f4f6;
              font-weight: bold;
              text-align: center;
              text-transform: uppercase;
            }
            .status-badge {
              display: inline-block;
              padding: 2px 5px;
              border-radius: 3px;
              font-size: 8px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .status-diajukan { background: #fee2e2; color: #7f1d1d; border: 1px solid #fca5a5; }
            .status-diproses { background: #dbeafe; color: #1e3a8a; border: 1px solid #93c5fd; }
            .status-selesai { background: #d1fae5; color: #064e3b; border: 1px solid #6ee7b7; }
            
            .signature-section {
              margin-top: 40px;
              display: flex;
              justify-content: flex-end;
              font-size: 11px;
              page-break-inside: avoid;
            }
            .signature-box {
              text-align: center;
              width: 250px;
            }
            .signature-box p {
              margin: 0;
            }
            .signature-space {
              height: 70px;
            }
            .signature-name {
              font-weight: bold;
              text-decoration: underline;
            }
            .print-btn-bar {
              background: #0f172a;
              padding: 14px;
              border-bottom: 1px solid #1e293b;
              display: flex;
              justify-content: center;
              gap: 12px;
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              z-index: 1000;
            }
            .btn {
              padding: 8px 18px;
              font-size: 12px;
              font-weight: bold;
              border-radius: 6px;
              cursor: pointer;
              border: none;
              text-transform: uppercase;
              font-family: sans-serif;
            }
            .btn-primary { background: #10b981; color: #fff; }
            .btn-secondary { background: #475569; color: #fff; }
            
            body {
              margin-top: 80px;
            }
            @media print {
              body { margin-top: 0px; }
              .print-btn-bar { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="print-btn-bar no-print">
            <button class="btn btn-primary" onclick="window.print()">Cetak Laporan / Simpan PDF</button>
            <button class="btn btn-secondary" onclick="window.close()">Tutup Jendela</button>
          </div>

          <div class="kop-surat">
            <div class="logo-placeholder">
              PEMERINTAH<br/>DESA
            </div>
            <div class="kop-text">
              <h1>PEMERINTAH KABUPATEN ${regency.toUpperCase()}</h1>
              <h2>KECAMATAN ${subdistrict.toUpperCase()}</h2>
              <h3>KANTOR KEPALA DESA ${mName.toUpperCase()}</h3>
              <p>Sistem Management Informasi Desa Terpadu. Telepon: ${phone}. Email: cs-desa-${mName.toLowerCase().replace(/\s+/g, '')}@go.id</p>
            </div>
          </div>

          <div class="report-title">
            <h4>LAPORAN BULANAN PENGADUAN WARGA</h4>
            <p>Periode Laporan: ${selMonth === 'Semua' ? 'Keseluruhan' : selMonth} ${selYear}</p>
          </div>

          <table class="meta-info">
            <tr>
              <td style="width: 140px;"><strong>Tanggal Cetak</strong></td>
              <td style="width: 15px;">:</td>
              <td style="width: 250px;">${formattedDate}</td>
              <td style="width: 145px;"><strong>Filter Kategori</strong></td>
              <td style="width: 15px;">:</td>
              <td>${pCat}</td>
            </tr>
            <tr>
              <td><strong>Pihak Sekretariat</strong></td>
              <td>:</td>
              <td>Balai Kantor Desa ${mName}</td>
              <td><strong>Filter Status</strong></td>
              <td>:</td>
              <td>${pStat}</td>
            </tr>
            <tr>
              <td><strong>Volume Pelaporan</strong></td>
              <td>:</td>
              <td>${docs.length} Berkas Keluhan Publik</td>
              <td><strong>Keabsahan Laporan</strong></td>
              <td>:</td>
              <td>Arsip Fisik Kepala Desa</td>
            </tr>
          </table>

          <table class="report-table">
            <thead>
              <tr>
                <th style="width: 5%;">No</th>
                <th style="width: 12%;">Tanggal</th>
                <th style="width: 15%;">NIK Pelapor</th>
                <th style="width: 22%;">Judul Laporan</th>
                <th style="width: 13%;">Kategori</th>
                <th>Uraian Pengaduan / Keluhan Warga</th>
                <th style="width: 18%;">Status Laporan & Tindakan</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>

          <div class="signature-section">
            <div class="signature-box">
              <p>${mName}, ${formattedDate}</p>
              <p style="margin-top: 5px; font-weight: bold; text-transform: uppercase;">MENGETAHUI,<br/>KEPALA DESA ${mName.toUpperCase()}</p>
              <div class="signature-space"></div>
              <p class="signature-name">${lKades}</p>
              <p style="font-size: 10px; color: #4b5563; margin-top: 3px;">Arsip Desa ${mName}</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    onLogAction(`Mencetak arsip PDF bulanan pengaduan periode ${selMonth} ${selYear}`, 'Pengaduan');
  };

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

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          <button
            id="print-complaint-report-btn"
            onClick={() => {
              // Prepopulate with matches if useful
              setShowPrintModal(true);
            }}
            className="px-4 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-300 flex items-center gap-1.5 shadow-sm transition-all"
            title="Cetak Arsip Laporan Bulanan Kepala Desa"
          >
            <Printer size={14} className="text-emerald-700" />
            <span>Cetak Arsip Laporan (PDF)</span>
          </button>

          <button
            id="add-complaint-btn-trigger"
            onClick={() => setShowForm(true)}
            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-all"
          >
            <Plus size={14} />
            <span>Laporkan Keluhan Warga</span>
          </button>
        </div>
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

      {/* MONTLHY PDF REPORT PRINT MODAL */}
      {showPrintModal && (
        <div id="print-report-modal" className="bg-slate-900/60 backdrop-blur-sm fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-emerald-700 text-white p-4 flex justify-between items-center text-xs font-bold font-mono tracking-wider shrink-0">
              <span className="flex items-center gap-2">
                <Printer size={16} />
                <span>FORMULIR ARSIP DOKUMEN FISIK BULANAN KEPALA DESA</span>
              </span>
              <button 
                id="close-print-modal" 
                onClick={() => setShowPrintModal(false)} 
                className="text-emerald-100 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Form Config Side */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono border-b pb-1.5 border-slate-100">
                  Parameter Pencetakan
                </h3>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Bulan Laporan</label>
                  <select
                    id="print-month-select"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 font-bold text-slate-800"
                  >
                    <option value="Semua">Semua Bulan Laporan</option>
                    <option value="Januari">Januari</option>
                    <option value="Februari">Februari</option>
                    <option value="Maret">Maret</option>
                    <option value="April">April</option>
                    <option value="Mei">Mei</option>
                    <option value="Juni">Juni</option>
                    <option value="Juli">Juli</option>
                    <option value="Agustus">Agustus</option>
                    <option value="September">September</option>
                    <option value="Oktober">Oktober</option>
                    <option value="November">November</option>
                    <option value="Desember">Desember</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Tahun Laporan</label>
                  <select
                    id="print-year-select"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 font-mono text-slate-800"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Filter Kategori</label>
                  <select
                    id="print-category-select"
                    value={printFilterCat}
                    onChange={(e) => setPrintFilterCat(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 font-bold text-slate-700"
                  >
                    <option value="Semua">Semua Kategori Keluhan</option>
                    <option value="Infrastruktur">Infrastruktur & Jalan</option>
                    <option value="Sampah & Kebersihan">Sampah & Kebersihan Lingkungan</option>
                    <option value="Bantuan Sosial">Bantuan Sosial & BLT</option>
                    <option value="Keamanan">Keamanan & Pos Ronda</option>
                    <option value="Pelayanan">Pemerintahan & Pelayanan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Filter Status</label>
                  <select
                    id="print-status-select"
                    value={printFilterStat}
                    onChange={(e) => setPrintFilterStat(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 font-bold text-slate-700"
                  >
                    <option value="Semua">Semua Status Keluhan</option>
                    <option value="Diajukan">Diajukan</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>

              {/* Simulation/Stats Panel */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono border-b pb-1.5 border-slate-200 mb-2.5 flex items-center justify-between">
                    <span>Pratinjau Berkas</span>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-mono uppercase font-black">
                      Ready
                    </span>
                  </h3>

                  <div className="bg-white border rounded-lg p-3 text-[10px] text-slate-400 font-mono shadow-inner space-y-2">
                    <div className="text-center font-bold border-b pb-1 text-slate-600 uppercase">
                      KOP KANTOR DESA {villageProfile?.name || "CONTOH"}
                    </div>
                    <div className="font-sans text-xs text-slate-800 font-black text-center mt-1">
                      LAPORAN BULANAN PENGADUAN WARGA
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-1.5 text-slate-500">
                      <span>Bulan Laporan:</span>
                      <span className="text-slate-800 font-bold">{selectedMonth} {selectedYear}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Kategori:</span>
                      <span className="text-slate-700 font-bold">{printFilterCat}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Status:</span>
                      <span className="text-slate-700 font-bold">{printFilterStat}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 border-t border-dashed pt-1 mt-1 font-bold">
                      <span className="text-slate-600">Total Berkas Keluhan:</span>
                      <span className="text-emerald-700 text-xs font-extrabold">
                        {complaints.filter(c => {
                          const dateObj = new Date(c.createdAt || c.date || Date.now());
                          const monthNames = [
                            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                          ];
                          const complaintMonth = monthNames[dateObj.getMonth()];
                          const complaintYear = dateObj.getFullYear().toString();

                          const matchesMonth = selectedMonth === 'Semua' || complaintMonth === selectedMonth;
                          const matchesYear = selectedYear === 'Semua' || complaintYear === selectedYear;
                          const matchesCat = printFilterCat === 'Semua' || c.category === printFilterCat;
                          const matchesStat = printFilterStat === 'Semua' || c.status === printFilterStat;

                          return matchesMonth && matchesYear && matchesCat && matchesStat;
                        }).length} Item
                      </span>
                    </div>
                  </div>

                  <div className="mt-3.5 bg-amber-50 border border-amber-200 rounded-lg p-3 text-[10.5px] text-amber-900 leading-relaxed">
                    <p className="font-bold">⚠️ Panduan Arsip Fisik:</p>
                    <p className="mt-1 font-sans">Laporan ini memuat rekapitulasi pelaporan dari warga untuk diarsipkan secara fisik oleh Kepala Desa sebagai bahan audit mingguan/bulanan.</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPrintModal(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold font-mono"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handlePrintPDF(selectedMonth, selectedYear, printFilterCat, printFilterStat);
                      setShowPrintModal(false);
                    }}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5"
                  >
                    <Printer size={13} />
                    <span>Lanjutkan Cetak PDF</span>
                  </button>
                </div>

              </div>

            </div>
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
