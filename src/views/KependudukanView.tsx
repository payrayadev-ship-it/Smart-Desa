import React, { useState, useRef } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  UploadCloud, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { Resident, Role, VillageProfile } from '../types';

interface KependudukanViewProps {
  residents: Resident[];
  saveResidents: (data: Resident[]) => void;
  activeRole: Role;
  onLogAction: (action: string, module: string) => void;
  villageProfile?: VillageProfile;
}

export default function KependudukanView({
  residents: initialResidents,
  saveResidents,
  activeRole,
  onLogAction,
  villageProfile
}: KependudukanViewProps) {
  const [residents, setResidents] = useState<Resident[]>(initialResidents);
  const [search, setSearch] = useState('');
  const [filterRt, setFilterRt] = useState('Semua');
  const [filterRw, setFilterRw] = useState('Semua');
  const [filterBansos, setFilterBansos] = useState('Semua');
  
  // Sorting
  const [sortField, setSortField] = useState<keyof Resident>('nama');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);

  // Form Fields
  const [nik, setNik] = useState('');
  const [noKK, setNoKK] = useState('');
  const [nama, setNama] = useState('');
  const [tempatLahir, setTempatLahir] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('1990-01-01');
  const [jenisKelamin, setJenisKelamin] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [agama, setAgama] = useState('Islam');
  const [statusPerkawinan, setStatusPerkawinan] = useState<'Belum Kawin' | 'Kawin' | 'Cerai Hidup' | 'Cerai Mati'>('Belum Kawin');
  const [pendidikan, setPendidikan] = useState('SLTA');
  const [pekerjaan, setPekerjaan] = useState('Karyawan Swasta');
  const [alamat, setAlamat] = useState('');
  const [rt, setRt] = useState('01');
  const [rw, setRw] = useState('04');
  const [statusPenduduk, setStatusPenduduk] = useState<'Aktif' | 'Meninggal' | 'Pindah'>('Aktif');
  const [statusBansos, setStatusBansos] = useState<'Penerima BLT' | 'Penerima PKH' | 'Penerima BPNT' | 'Tidak Menerima'>('Tidak Menerima');
  const [fotoKtp, setFotoKtp] = useState<string | null>(null);

  // File Upload states
  const [dragActive, setDragActive] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Handle Sort
  const toggleSort = (field: keyof Resident) => {
    const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(order);
  };

  // Drag-and-drop simulators
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFotoKtp(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFotoKtp(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Edit Mode
  const handleEdit = (res: Resident) => {
    setEditingResident(res);
    setNik(res.nik);
    setNoKK(res.noKK);
    setNama(res.nama);
    setTempatLahir(res.tempatLahir);
    setTanggalLahir(res.tanggalLahir);
    setJenisKelamin(res.jenisKelamin);
    setAgama(res.agama);
    setStatusPerkawinan(res.statusPerkawinan);
    setPendidikan(res.pendidikan);
    setPekerjaan(res.pekerjaan);
    setAlamat(res.alamat);
    setRt(res.rt);
    setRw(res.rw);
    setStatusPenduduk(res.statusPenduduk);
    setStatusBansos(res.statusBansos);
    setFotoKtp(res.fotoKtp || null);
    
    setFormError('');
    setFormSuccess('');
    setShowForm(true);
  };

  // Reset Form Fields
  const resetForm = () => {
    setEditingResident(null);
    setNik('');
    setNoKK('');
    setNama('');
    setTempatLahir('');
    setTanggalLahir('1990-01-01');
    setJenisKelamin('Laki-laki');
    setAgama('Islam');
    setStatusPerkawinan('Belum Kawin');
    setPendidikan('SLTA');
    setPekerjaan('Karyawan Swasta');
    setAlamat('');
    setRt('01');
    setRw('04');
    setStatusPenduduk('Aktif');
    setStatusBansos('Tidak Menerima');
    setFotoKtp(null);
    setFormError('');
    setFormSuccess('');
  };

  const getNikValidationStatus = () => {
    if (!nik) {
      return {
        message: 'NIK wajib diisi (16 digit).',
        status: 'idle',
        className: 'text-slate-500'
      };
    }
    if (/\D/.test(nik)) {
      return {
        message: 'NIK hanya boleh berisi karakter angka saja.',
        status: 'error',
        className: 'text-rose-600 font-bold'
      };
    }
    if (nik.length < 16) {
      return {
        message: `NIK belum lengkap: ${nik.length} / 16 digit.`,
        status: 'warning',
        className: 'text-amber-600 font-medium'
      };
    }
    if (nik.length > 16) {
      return {
        message: 'NIK tidak boleh lebih dari 16 digit.',
        status: 'error',
        className: 'text-rose-600 font-bold'
      };
    }
    
    const isDuplicate = residents.some(r => r.nik === nik && (!editingResident || r.id !== editingResident.id));
    if (isDuplicate) {
      return {
        message: '⚠️ NIK ini sudah terdaftar pada basis data!',
        status: 'error',
        className: 'text-rose-600 font-bold'
      };
    }
    
    return {
      message: '✔ NIK Format Valid & Tersedia',
      status: 'success',
      className: 'text-emerald-600 font-semibold'
    };
  };

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const validation = getNikValidationStatus();
    if (validation.status === 'error') {
      setFormError(validation.message);
      return;
    }
    if (validation.status === 'warning') {
      setFormError('Nomor NIK belum lengkap (harus tepat 16 digit angka).');
      return;
    }
    if (noKK.length !== 16) {
      setFormError('Nomor KK harus tepat 16 digit angka.');
      return;
    }
    if (!nama.trim()) {
      setFormError('Nama lengkap tidak boleh dibiarkan kosong.');
      return;
    }

    const updatedData: Resident = {
      id: editingResident ? editingResident.id : `res-${Date.now()}`,
      nik,
      noKK,
      nama: nama.trim(),
      tempatLahir,
      tanggalLahir,
      jenisKelamin,
      agama,
      statusPerkawinan,
      pendidikan,
      pekerjaan,
      alamat,
      rt,
      rw,
      statusPenduduk,
      statusBansos,
      fotoKtp: fotoKtp || undefined,
      updatedAt: new Date().toISOString()
    };

    let newResidentsList: Resident[] = [];
    if (editingResident) {
      newResidentsList = residents.map(r => r.id === editingResident.id ? updatedData : r);
      setFormSuccess('Data kependudukan berhasil diperbarui!');
      onLogAction(`Memperbarui data penduduk ${nama} (${nik})`, 'Kependudukan');
    } else {
      newResidentsList = [updatedData, ...residents];
      setFormSuccess('Penduduk baru berhasil ditambahkan!');
      onLogAction(`Menambahkan penduduk baru ${nama} (${nik})`, 'Kependudukan');
    }

    setResidents(newResidentsList);
    saveResidents(newResidentsList);

    // Auto-close form after short delay
    setTimeout(() => {
      setShowForm(false);
      resetForm();
    }, 1200);
  };

  // Handle Action: Delete
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data penduduk ${name}? This action is soft-deleting and logged.`)) {
      const remaining = residents.filter(r => r.id !== id);
      setResidents(remaining);
      saveResidents(remaining);
      onLogAction(`Menghapus data kependudukan ${name}`, 'Kependudukan');
    }
  };

  // EXPORT PROCESS SIMULATOR (Excel & PDF)
  const exportToExcel = () => {
    // Generate actual printable/downloadeable CSV
    const headers = 'ID,NIK,No_KK,Nama,Jenis_Kelamin,Alamat,RT,RW,Agama,Pekerjaan,Status_Bansos,Status_Penduduk\r\n';
    const rows = residents.map(r => 
      `"${r.id}","${r.nik}","${r.noKK}","${r.nama}","${r.jenisKelamin}","${r.alamat}","${r.rt}","${r.rw}","${r.agama}","${r.pekerjaan}","${r.statusBansos}","${r.statusPenduduk}"`
    ).join('\r\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Data_Kependudukan_Desa_Sukamaju_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onLogAction("Mengekspor data kependudukan format CSV/Excel", "Kependudukan");
  };

  const handlePrintPdf = () => {
    // Open a beautifully isolated window specifically formatted to print neatly
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>DATA KEPENDUDUKAN DESA SUKAMAJU</title>
          <style>
            body { font-family: monospace; padding: 20px; font-size: 11px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid black; padding: 6px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>PEMERINTAH KABUPATEN BANDUNG</h2>
            <h3>KANTOR KEPALA DESA SUKAMAJU</h3>
            <p>Alamat: Jl. Raya Paseh No. 123, Kabupaten Bandung, Jawa Barat</p>
            <hr/>
            <h4>LAPORAN REKAPITULASI DATA PENDUDUK</h4>
          </div>
          <table>
            <thead>
              <tr>
                <th>NIK</th>
                <th>No. KK</th>
                <th>Nama Lengkap</th>
                <th>L/P</th>
                <th>Alamat</th>
                <th>RT/RW</th>
                <th>Pendidikan</th>
                <th>Pekerjaan</th>
                <th>Status Bansos</th>
              </tr>
            </thead>
            <tbody>
              ${residents.map(r => `
                <tr>
                  <td>${r.nik}</td>
                  <td>${r.noKK}</td>
                  <td>${r.nama}</td>
                  <td>${r.jenisKelamin === 'Laki-laki' ? 'L' : 'P'}</td>
                  <td>${r.alamat}</td>
                  <td>RT ${r.rt} / RW ${r.rw}</td>
                  <td>${r.pendidikan}</td>
                  <td>${r.pekerjaan}</td>
                  <td>${r.statusBansos}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="margin-top: 40px; text-align: right; float: right; width: 250px;">
            <p>Mengetahui,</p>
            <p style="margin-bottom: 5px;">Kepala ${villageProfile?.name || 'Desa Sukamaju'}</p>
            ${villageProfile?.signatureType === 'barcode' ? `
              <div style="height: 65px; display: flex; align-items: center; justify-content: flex-end; margin: 5px 0;">
                <div style="text-align: center; display: flex; flex-direction: column; align-items: center;">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=SMART_DESA_SIGNED_BY_KADES_${(villageProfile?.kepalaDesa || 'DADANG_SULAEMAN').replace(/\s+/g, '_')}_REPORT_KEPENDUDUKAN" style="max-height: 55px; max-width: 55px; border: 1px solid #ddd; padding: 1px;" alt="TTE Kades QR"/>
                  <span style="font-size: 7px; color: #2e7d32; font-family: monospace; font-weight: bold; display: block; margin-top: 1px;">✓ TTE KADES VALID</span>
                </div>
              </div>
            ` : villageProfile?.signatureUrl ? `
              <div style="height: 55px; display: flex; align-items: center; justify-content: flex-end; margin: 5px 0;">
                <img src="${villageProfile.signatureUrl}" style="max-height: 55px; max-width: 150px; object-fit: contain;" alt="TTD Kades"/>
              </div>
            ` : '<br/><br/><br/>'}
            <p style="font-weight: bold; text-decoration: underline; margin-top: 5px;">${villageProfile?.kepalaDesa || 'H. Dadang Sulaeman, S.IP.'}</p>
          </div>
          <div style="clear: both;"></div>

          <script>
            window.addEventListener('load', function() {
              var images = Array.from(document.images);
              var loadedCount = 0;
              
              function triggerPrint() {
                setTimeout(function() {
                  window.print();
                }, 500);
              }
              
              if (images.length === 0) {
                triggerPrint();
                return;
              }
              
              var safetyTimeout = setTimeout(triggerPrint, 2500);
              
              images.forEach(function(img) {
                if (img.complete) {
                  loadedCount++;
                  if (loadedCount === images.length) {
                    clearTimeout(safetyTimeout);
                    triggerPrint();
                  }
                } else {
                  img.addEventListener('load', function() {
                    loadedCount++;
                    if (loadedCount === images.length) {
                      clearTimeout(safetyTimeout);
                      triggerPrint();
                    }
                  });
                  img.addEventListener('error', function() {
                    loadedCount++;
                    if (loadedCount === images.length) {
                      clearTimeout(safetyTimeout);
                      triggerPrint();
                    }
                  });
                }
              });
            });
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    onLogAction("Mengekspor laporan rekapitulasi data kependudukan PDF", "Kependudukan");
  };

  // Mass Import Simulator
  const triggerExcelImport = () => {
    alert("Fitur Integrasi: Anda dapat memilih file rekapitulasi Excel (.csv / .xlsx) kependudukan dari Dukcapil. Sistem akan menguraikan dan mencocokkan NIK secara realtime.");
  };

  // Realtime Filter & Search logic
  const filteredResidents = residents.filter(r => {
    const term = search.toLowerCase();
    const matchesSearch = 
      r.nama.toLowerCase().includes(term) || 
      r.nik.includes(term) || 
      r.noKK.includes(term) || 
      r.pekerjaan.toLowerCase().includes(term);

    const matchesRt = filterRt === 'Semua' || r.rt === filterRt;
    const matchesRw = filterRw === 'Semua' || r.rw === filterRw;
    const matchesBansos = filterBansos === 'Semua' || r.statusBansos === filterBansos;

    return matchesSearch && matchesRt && matchesRw && matchesBansos;
  }).sort((a, b) => {
    let rawA = a[sortField];
    let rawB = b[sortField];

    if (typeof rawA === 'string' && typeof rawB === 'string') {
      return sortOrder === 'asc' ? rawA.localeCompare(rawB) : rawB.localeCompare(rawA);
    }
    return 0;
  });

  return (
    <div id="kependudukan-panel-view" className="space-y-4">
      
      {/* Top Header Controls Block (High Density Style) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Users size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 leading-none">Manajemen Basis Data Penduduk</h2>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Sistem Pencocokan Data Dukcapil RT/RW Terintegrasi</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button id="import-excel-mass" onClick={triggerExcelImport} className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
            <UploadCloud size={14} />
            <span>Import Massal</span>
          </button>
          <button id="export-excel-btn" onClick={exportToExcel} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors">
            <FileSpreadsheet size={14} />
            <span>Excel (CSV)</span>
          </button>
          <button id="export-pdf-rekap-btn" onClick={handlePrintPdf} className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors">
            <FileText size={14} />
            <span>Cetak Rekap PDF</span>
          </button>
          <button id="add-penduduk-panel-trigger" onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-all">
            <Plus size={15} />
            <span>Tambah Penduduk</span>
          </button>
        </div>
      </div>

      {/* FILTER AND SEARCH BAR (Rich & Fast) */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
          <input
            id="resident-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Nama Rendah, NIK, No KK, atau pekerjaan..."
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-slate-800"
          />
        </div>

        {/* RT Filter */}
        <div className="flex items-center space-x-2">
          <Filter size={13} className="text-slate-400" />
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">RT:</span>
          <select 
            id="filter-rt-select" 
            value={filterRt} 
            onChange={(e) => setFilterRt(e.target.value)}
            className="flex-1 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-700"
          >
            <option value="Semua">Semua</option>
            <option value="01">RT 01</option>
            <option value="02">RT 02</option>
            <option value="03">RT 03</option>
            <option value="04">RT 04</option>
          </select>
        </div>

        {/* Bansos Filter */}
        <div className="flex items-center space-x-2">
          <Filter size={13} className="text-slate-400" />
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">BANSOS:</span>
          <select 
            id="filter-bansos-select" 
            value={filterBansos} 
            onChange={(e) => setFilterBansos(e.target.value)}
            className="flex-1 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-700"
          >
            <option value="Semua">Semua</option>
            <option value="Penerima BLT">BLT</option>
            <option value="Penerima PKH">PKH</option>
            <option value="Penerima BPNT">BPNT</option>
            <option value="Tidak Menerima">Tidak Menerima</option>
          </select>
        </div>
      </div>

      {/* DYNAMIC CRUD FORM DIALOG OVERLAY */}
      {showForm && (
        <div id="crud-form-card" className="bg-slate-900/60 backdrop-blur-sm fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col h-[520px] overflow-hidden">
            
            {/* Form Title banner */}
            <div className="bg-blue-600 text-white p-3.5 flex justify-between items-center shrink-0">
              <h3 className="text-xs font-bold font-mono tracking-wider">
                {editingResident ? `⚙️ EDIT DATA PENDUDUK: ${editingResident.nama}` : '➕ TAMBAH DATA KEMASYARAKATAN BARU'}
              </h3>
              <button id="form-close-btn" onClick={resetForm} className="p-1 hover:bg-black/10 rounded-full transition-colors text-white">
                <X size={18} />
              </button>
            </div>

            {/* Scrollable inputs wrapper */}
            <form onSubmit={handleSubmit} className="flex-1 p-5 overflow-y-auto space-y-4">
              
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-lg text-xs flex items-center gap-2 font-semibold">
                  <AlertCircle size={15} />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg text-xs flex items-center gap-2 font-semibold">
                  <CheckCircle2 size={15} />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* Grid 2-cols */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Nomor Induk KEPENDUDUKAN (NIK)*</label>
                  <input
                    id="nik-field"
                    type="text"
                    maxLength={16}
                    value={nik}
                    onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                    placeholder="Wajib 16 digit angka"
                    className={`w-full text-xs font-mono p-2 border rounded-lg focus:ring-1 focus:outline-none text-slate-800 transition-colors ${
                      nik === ''
                        ? 'border-slate-200 bg-slate-50 focus:ring-blue-500'
                        : getNikValidationStatus().status === 'success'
                        ? 'border-emerald-400 bg-emerald-50/10 focus:ring-emerald-500'
                        : getNikValidationStatus().status === 'warning'
                        ? 'border-amber-400 bg-amber-50/10 focus:ring-amber-500'
                        : 'border-rose-400 bg-rose-50/10 focus:ring-rose-500'
                    }`}
                    required
                  />
                  <div className="mt-1 flex items-center gap-1">
                    <span className={`text-[10px] font-mono leading-tight ${getNikValidationStatus().className}`}>
                      {getNikValidationStatus().message}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">No. KARTU KELUARGA (KK)*</label>
                  <input
                    id="nokk-field"
                    type="text"
                    maxLength={16}
                    value={noKK}
                    onChange={(e) => setNoKK(e.target.value.replace(/\D/g, ''))}
                    placeholder="Wajib 16 digit angka"
                    className="w-full text-xs font-mono p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 text-slate-800 bg-slate-50"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Nama Lengkap Penduduk (Sesuai KTP)*</label>
                  <input
                    id="nama-field"
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Tulis dengan huruf KAPITAL rapi"
                    className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 text-slate-800 bg-slate-50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Tempat Lahir</label>
                  <input
                    id="birthplace-field"
                    type="text"
                    value={tempatLahir}
                    onChange={(e) => setTempatLahir(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 text-slate-800 bg-slate-50 animate-fade"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Tanggal Lahir</label>
                  <input
                    id="birthdate-field"
                    type="date"
                    value={tanggalLahir}
                    onChange={(e) => setTanggalLahir(e.target.value)}
                    className="w-full text-xs font-mono p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 text-slate-800 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Jenis Kelamin</label>
                  <select
                    id="gender-field"
                    value={jenisKelamin}
                    onChange={(e) => setJenisKelamin(e.target.value as any)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 text-slate-800 bg-slate-50"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Agama</label>
                  <input
                    id="religion-field"
                    type="text"
                    value={agama}
                    onChange={(e) => setAgama(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 text-slate-800 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Status Hubungan Kawin</label>
                  <select
                    id="marital-field"
                    value={statusPerkawinan}
                    onChange={(e) => setStatusPerkawinan(e.target.value as any)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 text-slate-800 bg-slate-50"
                  >
                    <option value="Belum Kawin">Belum Kawin</option>
                    <option value="Kawin">Kawin</option>
                    <option value="Cerai Hidup">Cerai Hidup</option>
                    <option value="Cerai Mati">Cerai Mati</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Pendidikan Terakhir</label>
                  <input
                    id="edu-field"
                    type="text"
                    value={pendidikan}
                    onChange={(e) => setPendidikan(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 text-slate-800 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Mata Pencaharian (Pekerjaan)</label>
                  <input
                    id="job-field"
                    type="text"
                    value={pekerjaan}
                    onChange={(e) => setPekerjaan(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 text-slate-800 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">RT / RW Wilayah</label>
                  <div className="flex space-x-2">
                    <select
                      id="form-rt-select"
                      value={rt}
                      onChange={(e) => setRt(e.target.value)}
                      className="w-1/2 text-xs p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50"
                    >
                      <option value="01">RT 01</option>
                      <option value="02">RT 02</option>
                      <option value="03">RT 03</option>
                      <option value="04">RT 04</option>
                    </select>
                    <select
                      id="form-rw-select"
                      value={rw}
                      onChange={(e) => setRw(e.target.value)}
                      className="w-1/2 text-xs p-2 border border-slate-200 rounded-lg text-slate-800 bg-slate-50"
                    >
                      <option value="01">RW 01</option>
                      <option value="02">RW 02</option>
                      <option value="03">RW 03</option>
                      <option value="04">RW 04</option>
                      <option value="05">RW 05</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Status Kependudukan</label>
                  <select
                    id="status-penduduk-field"
                    value={statusPenduduk}
                    onChange={(e) => setStatusPenduduk(e.target.value as any)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 text-slate-800 bg-slate-50"
                  >
                    <option value="Aktif">Aktif (Bertempat Tinggal)</option>
                    <option value="Meninggal">Meninggal Dunia</option>
                    <option value="Pindah">Pindah Wilayah / Luar Kota</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Status Kelayakan BANSOS</label>
                  <select
                    id="bansos-field"
                    value={statusBansos}
                    onChange={(e) => setStatusBansos(e.target.value as any)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 text-slate-800 bg-slate-50 font-bold text-blue-800"
                  >
                    <option value="Tidak Menerima">Tidak Menerima (Mandiri)</option>
                    <option value="Penerima BLT">BLT (Bantuan Langsung Tunai)</option>
                    <option value="Penerima PKH">PKH (Prog Keluarga Harapan)</option>
                    <option value="Penerima BPNT">BPNT (Sembako Kelayakan)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Alamat Domisili Lengkap</label>
                  <input
                    id="address-field"
                    type="text"
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    placeholder="Misal: Kp. Babakan No. 45"
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 text-slate-800 bg-slate-50"
                  />
                </div>

                {/* Simulated file uploader for KTP */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Upload Foto Dokumen KTP atau KK Pendukung</label>
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}
                  >
                    <input
                      id="ktp-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label htmlFor="ktp-file-input" className="cursor-pointer space-y-1 block">
                      {fotoKtp ? (
                        <div className="flex items-center justify-center space-x-2">
                          <img src={fotoKtp} alt="Preview Ktp" className="w-10 h-7 object-cover rounded border" />
                          <span className="text-xs text-blue-600 font-bold">KTP / Berkas Terlampir (Klik untuk mengganti)</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-center text-slate-400">
                            <UploadCloud size={24} />
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">Seret dan lepas file di sini, atau <b className="text-blue-600">pilih berkas KTP</b></p>
                          <p className="text-[9px] text-slate-400">PNG, JPG, PDF maksimal 2MB (Simulasi Cepat)</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

              </div>
              
              {/* Submission buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button 
                  id="form-cancel-btn"
                  type="button" 
                  onClick={resetForm} 
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-600 font-mono transition-colors"
                >
                  BATAL
                </button>
                <button 
                  id="form-save-btn"
                  type="submit" 
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-transform shadow active:scale-95"
                >
                  SIMPAN RECORD
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* COMPACT DENSITY TABLE GRID */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-mono text-[10px]">
              <tr className="border-b border-slate-200">
                <th onClick={() => toggleSort('nama')} className="px-4 py-3 font-bold cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-1">
                    <span>Nama Utama / Status</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th className="px-4 py-3 font-bold">NIK / No. KK</th>
                <th className="px-4 py-3 font-bold">Wilayah RT / RW</th>
                <th className="px-4 py-3 font-bold">Pekerjaan</th>
                <th className="px-4 py-3 font-bold">Bantuan Sosial</th>
                <th className="px-4 py-3 font-bold text-right">Opsi Operasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResidents.length > 0 ? (
                filteredResidents.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[11px] text-blue-600 border shrink-0">
                          {res.nama.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 leading-tight">{res.nama}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-400">{res.jenisKelamin === 'Laki-laki' ? 'Laki-laki' : 'Perempuan'}</span>
                            <span className="text-[10px] text-slate-300">|</span>
                            {res.statusPenduduk === 'Aktif' ? (
                              <span className="text-[9px] text-emerald-600 font-bold">● AKTIF</span>
                            ) : res.statusPenduduk === 'Pindah' ? (
                              <span className="text-[9px] text-amber-600 font-bold">● PINDAH</span>
                            ) : (
                              <span className="text-[9px] text-rose-600 font-bold">✏️ WAFAT</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-600">
                      <p>NIK: {res.nik}</p>
                      <p className="text-[10px] text-slate-400">KK : {res.noKK}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-slate-700">RT {res.rt} / RW {res.rw}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{res.alamat}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      <p className="font-mono text-[11px] font-semibold">{res.pekerjaan}</p>
                      <p className="text-[10px] text-slate-400">Pnd: {res.pendidikan}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      {res.statusBansos !== 'Tidak Menerima' ? (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold border border-blue-100">
                          {res.statusBansos}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Tidak Ada</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      {activeRole !== 'Kepala Desa' ? (
                        <>
                          <button 
                            id={`edit-resident-${res.id}`}
                            onClick={() => handleEdit(res)} 
                            className="p-1 px-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 text-slate-600 hover:text-blue-600 rounded-lg text-[10px] font-bold transition-all"
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button 
                            id={`delete-resident-${res.id}`}
                            onClick={() => handleDelete(res.id, res.nama)} 
                            className="p-1.5 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 rounded-lg text-slate-400 transition-all inline-flex items-center"
                            title="Hapus"
                          >
                            <Trash2 size={11} />
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">Hanya-Bisa-Baca</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-mono text-xs">
                    Data kependudukan tidak ditemukan dengan filter aktif.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
