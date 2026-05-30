import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  PlusCircle, 
  X, 
  Printer, 
  QrCode, 
  Signature,
  FileCheck2,
  ChevronRight,
  Camera
} from 'lucide-react';
import { Letter, LetterType, Role, VillageProfile, Resident } from '../types';
import KtpScanner from '../components/KtpScanner';
import { LETTER_CATALOG } from '../letterCatalog';

interface SuratViewProps {
  letters: Letter[];
  saveLetters: (data: Letter[]) => void;
  activeRole: Role;
  onLogAction: (action: string, module: string) => void;
  villageProfile: VillageProfile;
  currentUser?: { name: string; role: Role; nik?: string } | null;
  residents: Resident[];
}

export default function SuratView({
  letters: initialLetters,
  saveLetters,
  activeRole,
  onLogAction,
  villageProfile,
  currentUser,
  residents
 }: SuratViewProps) {
  const [letters, setLetters] = useState<Letter[]>(initialLetters);

  // Sync state if initialLetters from prop updates
  React.useEffect(() => {
    setLetters(initialLetters);
  }, [initialLetters]);

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // Scanner state
  const [showScanner, setShowScanner] = useState(false);
  const [onlyMyLetters, setOnlyMyLetters] = useState(activeRole === 'Masyarakat');

  // New Letter Submission Form Modal
  const [showForm, setShowForm] = useState(activeRole === 'Masyarakat');
  const [selectedType, setSelectedType] = useState<LetterType>('Surat Keterangan Domisili');
  const [requesterName, setRequesterName] = useState(activeRole === 'Masyarakat' && currentUser ? currentUser.name : '');
  const [requesterNik, setRequesterNik] = useState(activeRole === 'Masyarakat' && currentUser ? currentUser.nik || '' : '');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [keperluan, setKeperluan] = useState('');

  // Sync lookup name when typing NIK or scanning NIK
  const handleNikChange = (nikVal: string) => {
    const sanitized = nikVal.replace(/\D/g, '');
    setRequesterNik(sanitized);

    if (sanitized.length === 16 && residents) {
      const match = residents.find(r => r.nik === sanitized);
      if (match) {
        setRequesterName(match.nama);
        setBirthPlace(match.tempatLahir || '');
        setBirthDate(match.tanggalLahir || '');
      }
    }
  };

  // Dynamically sync state if role or user session changes
  React.useEffect(() => {
    if (activeRole === 'Masyarakat') {
      setOnlyMyLetters(true);
      setShowForm(true);
      if (currentUser) {
        setRequesterName(currentUser.name);
        setRequesterNik(currentUser.nik || '');
        if (currentUser.nik && residents) {
          const match = residents.find(r => r.nik === currentUser.nik);
          if (match) {
            setBirthPlace(match.tempatLahir || '');
            setBirthDate(match.tanggalLahir || '');
          }
        }
      }
    }
  }, [activeRole, currentUser, residents]);
  
  // Dynamic custom fields based on selected letter type
  const [dynamicFields, setDynamicFields] = useState<Record<string, string>>({});

  // Reset and initialize fields when selecting a letter type
  const handleTypeChange = (newType: LetterType) => {
    setSelectedType(newType);
    const template = LETTER_CATALOG.find(t => t.name === newType);
    const initialFields: Record<string, string> = {};
    if (template) {
      template.fields.forEach(f => {
        initialFields[f] = '';
      });
    }
    setDynamicFields(initialFields);
  };

  // Selectable list of letter types mapped from master catalog
  const letterTypes = LETTER_CATALOG.map(t => t.name);

  // Increment auto numbering
  const generateLetterNumber = (type: LetterType) => {
    const template = LETTER_CATALOG.find(t => t.name === type);
    const code = template ? template.code : 'SK';
    const runningNum = String(letters.length + 1).padStart(3, '0');
    return `470/${runningNum}/${code}-SM/${new Date().getFullYear()}`;
  };

  const handleCreateLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requesterName.trim() || requesterNik.length !== 16) {
      alert("Mohon masukkan nama pemohon dan NIK valid 16 digit!");
      return;
    }

    const isKeteranganOrKuasa = 
      selectedType.toLowerCase().includes('keterangan') || 
      selectedType.toLowerCase().includes('kuasa') ||
      (() => {
        const temp = LETTER_CATALOG.find(t => t.name === selectedType);
        return temp ? (temp.category === 'Surat Keterangan' || temp.category === 'Surat Kuasa & Administrasi') : false;
      })();

    const subFields: Record<string, string> = { 
      keperluan,
      ...(isKeteranganOrKuasa ? {
        'Tempat Lahir': birthPlace || '-',
        'Tanggal Lahir': birthDate || '-'
      } : {}),
      ...dynamicFields
    };

    const newId = `let-${Date.now()}`;
    const newLetter: Letter = {
      id: newId,
      letterNumber: generateLetterNumber(selectedType),
      type: selectedType,
      requesterName: requesterName.trim(),
      requesterNik,
      status: 'Diajukan',
      rtApproval: activeRole === 'RT/RW', // Auto-approved if filed by RT/RW directly
      fields: subFields,
      trackingLogs: [
        { 
          status: 'Diajukan', 
          date: new Date().toISOString(), 
          note: activeRole === 'Masyarakat' 
            ? 'Pengajuan blangko surat didaftarkan mandiri oleh warga melalui portal digital dengan lampiran E-KTP valid.' 
            : `Pengajuan surat diajukan oleh ${activeRole === 'RT/RW' ? 'pengurus RT/RW' : 'staf operator'} atas nama warga.`
        }
      ],
      createdAt: new Date().toISOString()
    };

    const payload = [newLetter, ...letters];
    setLetters(payload);
    saveLetters(payload);
    onLogAction(`Mengajukan pelayanan surat baru: ${newLetter.letterNumber}`, 'Surat Menyurat');

    // Reset Form
    setRequesterName('');
    setRequesterNik('');
    setBirthPlace('');
    setBirthDate('');
    setKeperluan('');
    setDynamicFields({});
    setShowForm(false);
  };

  // State Change workflow: e.g. operator verifies or kades approves
  const advanceLetterStatus = (id: string, newStatus: Letter['status'], note: string) => {
    const payload = letters.map(letItem => {
      if (letItem.id === id) {
        let signedBy = letItem.signedBy;
        let signedAt = letItem.signedAt;
        let qrCodeDataUrl = letItem.qrCodeDataUrl;

        if (newStatus === 'Selesai') {
          signedBy = villageProfile.kepalaDesa;
          signedAt = new Date().toISOString();
          qrCodeDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SMART_DESA_VALID_${letItem.id}`;
        }

        return {
          ...letItem,
          status: newStatus,
          signedBy,
          signedAt,
          qrCodeDataUrl,
          trackingLogs: [
            ...letItem.trackingLogs,
            { status: newStatus, date: new Date().toISOString(), note }
          ]
        };
      }
      return letItem;
    });

    setLetters(payload);
    saveLetters(payload);
    onLogAction(`Merespon status surat kependudukan ID ${id} menjadi ${newStatus}`, 'Surat Menyurat');
  };

  // Toggle RT/RW approval
  const toggleRtApproval = (id: string) => {
    const payload = letters.map(letItem => {
      if (letItem.id === id) {
        const nextState = !letItem.rtApproval;
        return {
          ...letItem,
          rtApproval: nextState,
          trackingLogs: [
            ...letItem.trackingLogs,
            { 
              status: letItem.status, 
              date: new Date().toISOString(), 
              note: `Status persetujuan pengantar RT/RW diubah menjadi: ${nextState ? 'DISETUJUI' : 'DIBATALKAN'}` 
            }
          ]
        };
      }
      return letItem;
    });
    setLetters(payload);
    saveLetters(payload);
  };

  // Deletion logic
  const handleDeleteLetter = (id: string, num: string) => {
    if (window.confirm(`Hapus permanen arsip pertanggungjawaban nomor surat ${num}?`)) {
      const payload = letters.filter(l => l.id !== id);
      setLetters(payload);
      saveLetters(payload);
      onLogAction(`Menghapus arsip surat nomor ${num}`, 'Surat Menyurat');
    }
  };

  // PRINTING ISOLATION POPUP SIMULATOR
  const printOfficialDocument = (letItem: Letter) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>PRINTOUT SURAT RESMI: ${letItem.letterNumber}</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; padding: 40px; color: black; line-height: 1.5; font-size: 14px; }
            .kop-container { border-bottom: 3px double black; padding-bottom: 15px; margin-bottom: 20px; }
            .title { text-align: center; font-weight: bold; text-decoration: underline; text-transform: uppercase; font-size: 16px; margin-top: 15px; }
            .nomor { text-align: center; font-size: 13px; font-family: monospace; margin-bottom: 25px; }
            .content-block { margin-bottom: 20px; text-align: justify; }
            .fields-table { width: 90%; margin: 15px auto; line-height: 1.6; }
            .fields-table td { font-size: 13px; }
            .bottom-block { display: flex; justify-content: space-between; margin-top: 50px; }
            .sign { text-align: center; width: 230px; }
            .qr-code { border: 1px solid black; padding: 4px; margin-top: 5px; max-width: 90px; }
          </style>
        </head>
        <body>
          <div class="kop-container" style="display: flex; align-items: center; justify-content: center; gap: 20px;">
            ${villageProfile.logoUrl ? `
              <img src="${villageProfile.logoUrl}" style="max-height: 80px; max-width: 80px; object-fit: contain;" alt="Logo Pemda"/>
            ` : ''}
            <div style="text-align: center;">
              <h2 style="margin: 0; font-size: 16px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">PEMERINTAH ${villageProfile.regency.toUpperCase()}</h2>
              <h2 style="margin: 0; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">${villageProfile.subdistrict.toUpperCase()}</h2>
              <h3 style="margin: 2px 0; font-size: 18px; font-weight: bold; text-transform: uppercase;">KANTOR KEPALA ${villageProfile.name.toUpperCase()}</h3>
              <p style="margin: 0; font-size: 11px; font-style: italic;">Alamat: ${villageProfile.address} ${villageProfile.phone ? `| Telp: ${villageProfile.phone}` : ''}</p>
            </div>
          </div>

          <div class="title">${letItem.type}</div>
          <div class="nomor">Nomor: ${letItem.letterNumber}</div>

          <div class="content-block">
            Yang bertandatangan di bawah ini Kepala ${villageProfile.name}, ${villageProfile.subdistrict}, ${villageProfile.regency}, menerangkan dengan sebenarnya bahwa penduduk di bawah ini:
          </div>

          <table class="fields-table">
            <tr><td width="35%">1. Nama Pemohon</td><td>: <b>${letItem.requesterName}</b></td></tr>
            <tr><td>2. NIK Pemohon</td><td>: ${letItem.requesterNik}</td></tr>
            <tr><td>3. Jenis Layanan Surat</td><td>: <b>${letItem.type}</b></td></tr>
            ${Object.entries(letItem.fields).map(([key, val], index) => {
              const label = key.charAt(0).toUpperCase() + key.slice(1);
              return `
                <tr>
                  <td>${index + 4}. ${label}</td>
                  <td>: <b>${val}</b></td>
                </tr>
              `;
            }).join('')}
          </table>

          <div class="content-block" style="margin-top: 15px;">
            Demikian surat keterangan ini dibuat dengan sebenarnya dan penuh kesadaran untuk dapat dipergunakan sebagaimana mestinya oleh pihak yang berkepentingan.
          </div>

          <div class="bottom-block">
            <div class="sign">
              <p>Barcode Validitas Digital</p>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=SMART_DESA_VALID_${letItem.id}" class="qr-code" alt="QR Validasi"/>
              <p style="font-size: 9px; font-family: monospace; margin-top: 4px;">${villageProfile.name.replace('Desa ', '')} Secure-QR ID: ${letItem.id}</p>
            </div>
            
            <div class="sign">
              <p>${villageProfile.name.replace('Desa ', '')}, ${new Date(letItem.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p style="font-weight: bold;">KEPALA ${villageProfile.name.toUpperCase()}</p>
              ${letItem.status === 'Selesai' ? `
                <div style="margin: 5px 0; min-height: 60px; display: flex; align-items: center; justify-content: center;">
                  ${villageProfile.signatureType === 'barcode' ? `
                    <div style="text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=SMART_DESA_SIGNED_BY_KADES_${villageProfile.kepalaDesa.replace(/\s+/g, '_')}_LETTER_ID_${letItem.id}" style="max-height: 65px; max-width: 65px; margin: 2px 0; border: 1px solid #ddd; padding: 2px;" alt="TTE Kades QR"/>
                      <span style="font-size: 7.5px; color: #2e7d32; font-family: monospace; font-weight: bold; display: block; margin-top: 1px;">✓ TTE KADES VALID</span>
                    </div>
                  ` : villageProfile.signatureUrl ? `
                    <img src="${villageProfile.signatureUrl}" style="max-height: 60px; max-width: 150px; object-fit: contain;" alt="Tanda Tangan Kades"/>
                  ` : `
                    <span style="border: 2px dashed blue; color: blue; padding: 4px 10px; font-size: 11px; font-weight: bold; font-family: sans-serif;">🔒 SIGNED DIGITAL</span>
                  `}
                </div>
                <p style="font-weight: bold; text-decoration: underline; text-transform: uppercase; margin: 0;">${villageProfile.kepalaDesa}</p>
                <p style="font-size: 10px; opacity: 0.6; font-family: monospace; margin: 0;">NIP DESA: ${Math.floor(1000000000 + Math.random() * 9000000000)}</p>
              ` : `
                <div style="margin: 40px 0; border: 1px dotted red; color: red; font-size: 11px;">MENUNGGU TTD KADES</div>
              `}
            </div>
          </div>

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
  };

  // Filter letters based on query and tabs
  const filteredLetters = letters.filter(letItem => {
    const term = search.toLowerCase();
    const queryMatch = 
      letItem.requesterName.toLowerCase().includes(term) || 
      letItem.requesterNik.includes(term) || 
      letItem.letterNumber.toLowerCase().includes(term);

    const typeMatch = filterType === 'Semua' || letItem.type === filterType;
    const statusMatch = filterStatus === 'Semua' || letItem.status === filterStatus;

    const privacyMatch = !onlyMyLetters || 
      (currentUser && (
        (currentUser.nik && letItem.requesterNik === currentUser.nik) ||
        (letItem.requesterName.toLowerCase() === currentUser.name.toLowerCase())
      )) ||
      letItem.requesterNik === '3204121208850001' || 
      letItem.requesterNik === '3204101201930005' || 
      letItem.requesterName.toUpperCase() === 'HERMAN KARTOMI';

    return queryMatch && typeMatch && statusMatch && privacyMatch;
  });

  return (
    <div id="surat-panel-view" className="space-y-4">

      {/* Header Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <FileText size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 leading-none">Pusat Pelayanan & Administrasi Surat</h2>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Sertifikasi & Tanda Tangan Digital Instant Kepala Desa</p>
          </div>
        </div>

        <button 
          id="create-letter-btn-trigger" 
          onClick={() => setShowForm(true)}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow self-start sm:self-center"
        >
          <Plus size={15} />
          <span>{activeRole === 'Masyarakat' ? 'Ajukan Surat Mandiri (Scan KTP)' : 'Buat Surat Kuasa / Pengantar'}</span>
        </button>
      </div>

      {/* SEARCH AND TABULAR METADATA STRIP */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          <input
            id="letter-search-field"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama pemohon atau nomor surat..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-slate-700"
          />
        </div>

        {/* Filter Type */}
        <select
          id="filter-type-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="text-xs bg-slate-50 font-semibold border border-slate-200 rounded-lg p-2 text-slate-700"
        >
          <option value="Semua">Semua Jenis Layanan Surat ({LETTER_CATALOG.length} Layanan)</option>
          {[
            'Surat Izin',
            'Surat Keterangan',
            'Lainnya',
            'Surat Kuasa & Administrasi'
          ].map((cat) => (
            <optgroup key={cat} label={cat.toUpperCase()} className="font-extrabold text-[10px] text-slate-500 font-mono tracking-widest bg-slate-100 p-1">
              {LETTER_CATALOG.filter(t => t.category === cat).map((item) => (
                <option key={item.name} value={item.name} className="font-medium text-xs text-slate-800 bg-white">
                  {item.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        {/* Filter Status */}
        <select
          id="filter-status-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-xs bg-slate-50 font-semibold border border-slate-200 rounded-lg p-2 text-slate-700"
        >
          <option value="Semua">Semua Status Pelayanan</option>
          <option value="Diajukan">Diajukan</option>
          <option value="Ditinjau">Ditinjau (Sedang Diproses)</option>
          <option value="Selesai">Selesai (Siap Cetak)</option>
        </select>
      </div>

      {activeRole === 'Masyarakat' && (
        <div className="bg-blue-50/50 border border-blue-150 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row gap-2 items-center justify-between text-xs text-blue-900 shadow-inner animate-fade">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <p className="font-bold font-sans text-[11px]">Portal Warga Mandiri: Silakan isi keperluan masing-masing & scan KTP Anda.</p>
          </div>
          <label className="flex items-center space-x-2 cursor-pointer select-none shrink-0">
            <input 
              type="checkbox"
              checked={onlyMyLetters}
              onChange={(e) => setOnlyMyLetters(e.target.checked)}
              className="accent-blue-600 w-3.5 h-3.5 rounded border-slate-300 focus:ring-blue-500"
            />
            <span className="font-extrabold text-slate-700 text-[11.5px] font-sans">Saring Hanya Surat Saya Saja</span>
          </label>
        </div>
      )}

      {/* CREATION POPUP OVERLAY */}
      {showForm && (
        <div id="create-letter-modal-fallback" className="bg-slate-900/60 backdrop-blur-sm fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center text-sm font-bold font-mono shrink-0">
              <span>PENGAJUAN BLANGKO SURAT BARU KANTOR DESA</span>
              <button id="close-letter-form-btn" onClick={() => setShowForm(false)} className="text-white hover:text-slate-200">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLetter} className="p-5 overflow-y-auto space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Format Blangko Layanan Administratif</label>
                <select
                  id="select-type-field"
                  value={selectedType}
                  onChange={(e) => handleTypeChange(e.target.value as LetterType)}
                  className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800"
                >
                  {[
                    'Surat Izin',
                    'Surat Keterangan',
                    'Lainnya',
                    'Surat Kuasa & Administrasi'
                  ].map((cat) => (
                    <optgroup key={cat} label={cat.toUpperCase()} className="font-extrabold text-[10px] text-slate-500 font-mono tracking-widest bg-slate-100 p-1">
                      {LETTER_CATALOG.filter(t => t.category === cat).map((item) => (
                        <option key={item.name} value={item.name} className="font-medium text-xs text-slate-800 bg-white">
                          {item.name} ({item.code})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* SCAN KTP FAST-FILL ASSISTANT CARD */}
              {activeRole !== 'Masyarakat' && (
                <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-150 rounded-xl flex items-center justify-between gap-3 shadow-inner">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black tracking-wider text-blue-700 bg-blue-150 px-1.5 py-0.5 rounded uppercase font-mono">INTEGRATED OCR</span>
                    <h4 className="text-xs font-bold text-indigo-950">Isi Form via Scan E-KTP</h4>
                    <p className="text-[10px] text-slate-500 leading-none">Gunakan kamera hp/snap atau contoh KTP untuk input instant.</p>
                  </div>
                  <button
                    type="button"
                    id="scan-ktp-assistant-btn"
                    onClick={() => setShowScanner(true)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-extrabold font-mono flex items-center gap-1 hover:shadow-md transition-all shrink-0"
                  >
                    <Camera size={12} />
                    <span>IMPOR / SCAN E-KTP</span>
                  </button>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Nomor Induk Kependudukan (NIK Pemohon)*</label>
                <input
                  id="form-nik-input"
                  type="text"
                  maxLength={16}
                  value={requesterNik}
                  onChange={(e) => handleNikChange(e.target.value)}
                  placeholder="Masukkan 16 digit NIK warga terdaftar"
                  className={`w-full text-xs p-2 border border-slate-200 rounded-lg text-slate-800 font-mono ${activeRole === 'Masyarakat' ? 'bg-slate-100 cursor-not-allowed font-extrabold text-blue-900' : 'bg-slate-50'}`}
                  readOnly={activeRole === 'Masyarakat'}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Nama Lengkap Pemohon (Sesuai KTP)*</label>
                <input
                  id="form-name-input"
                  type="text"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  placeholder="Nama Lengkap dengan spasi teratur"
                  className={`w-full text-xs font-semibold p-2 border border-slate-200 rounded-lg text-slate-800 ${activeRole === 'Masyarakat' ? 'bg-slate-100 cursor-not-allowed font-extrabold text-blue-900' : 'bg-slate-50'}`}
                  readOnly={activeRole === 'Masyarakat'}
                  required
                />
              </div>

              {/* Conditional Birth Info for Surat Keterangan / Surat Kuasa */}
              {(selectedType.toLowerCase().includes('keterangan') || 
                selectedType.toLowerCase().includes('kuasa') ||
                (() => {
                  const template = LETTER_CATALOG.find(t => t.name === selectedType);
                  return template ? (template.category === 'Surat Keterangan' || template.category === 'Surat Kuasa & Administrasi') : false;
                })()) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/50 p-3 rounded-xl border border-amber-200 animate-fade">
                  <div>
                    <label className="block text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1 font-mono">Tempat Lahir (Keterangan/Kuasa)*</label>
                    <input
                      id="form-birthplace-input"
                      type="text"
                      value={birthPlace}
                      onChange={(e) => setBirthPlace(e.target.value)}
                      placeholder="Contoh: Bandung"
                      className="w-full text-xs font-semibold p-2 border border-amber-200 bg-white rounded-lg text-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1 font-mono">Tanggal Lahir (Keterangan/Kuasa)*</label>
                    <input
                      id="form-birthdate-input"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full text-xs font-semibold p-2 border border-amber-200 bg-white rounded-lg text-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Dynamic Sub fields depending on state */}
              {(() => {
                const template = LETTER_CATALOG.find(t => t.name === selectedType);
                if (!template) return null;
                return (
                  <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <p className="text-[10px] font-bold text-blue-800 font-mono uppercase bg-blue-50 px-2 py-0.5 w-max rounded border border-blue-100">
                      Isian Pelayanan ({template.category})
                    </p>
                    {template.fields.map((field) => (
                      <div key={field}>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">
                          {field}*
                        </label>
                        <input
                          id={`dynamic-field-${field}`}
                          type="text"
                          value={dynamicFields[field] || ''}
                          onChange={(e) => setDynamicFields(prev => ({
                            ...prev,
                            [field]: e.target.value
                          }))}
                          placeholder={`Masukkan ${field.toLowerCase()}...`}
                          className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white text-slate-800 font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                          required
                        />
                      </div>
                    ))}
                  </div>
                );
              })()}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Keperluan Surat / Alasan Tertulis</label>
                <input
                  id="common-purpose-input"
                  type="text"
                  value={keperluan}
                  onChange={(e) => setKeperluan(e.target.value)}
                  placeholder="Contoh: Pengurusan administratif / keperluan terkait"
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  id="modal-cancel-letter"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-600 transition-colors font-mono"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  id="modal-submit-letter"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow"
                >
                  SUBMIT PENGAJUAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CORE ADMINISTRATIVE LETTERS TABLE (High Density Style) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-mono text-[10px]">
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 font-bold">No. Registrasi / Pengaju</th>
                <th className="px-4 py-3 font-bold">Layanan Blangko</th>
                <th className="px-4 py-3 font-bold">Pengantar Ketua RT</th>
                <th className="px-4 py-3 font-bold">Progress Pelayanan</th>
                <th className="px-4 py-3 font-bold text-right font-mono">AKSI VERIF / TTD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLetters.length > 0 ? (
                filteredLetters.map((letItem) => {
                  return (
                    <tr key={letItem.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="font-mono text-[11px] font-bold text-slate-700">{letItem.letterNumber}</p>
                        <p className="font-semibold text-slate-800 leading-tight mt-0.5">{letItem.requesterName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">NIK: {letItem.requesterNik}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-indigo-900 leading-tight">{letItem.type}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">Diajukan: {new Date(letItem.createdAt).toLocaleDateString('id-ID')}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center space-x-2">
                          {letItem.rtApproval ? (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full text-[10px] font-bold">SUDAH SETUJU</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-full text-[10px] font-bold">BELUM SETUJU</span>
                          )}
                          {activeRole === 'RT/RW' && (
                            <button 
                              id={`toggle-rt-approval-${letItem.id}`}
                              onClick={() => toggleRtApproval(letItem.id)} 
                              className="text-[10px] text-blue-600 font-bold hover:underline"
                            >
                              Ubah
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase w-max tracking-wider ${
                            letItem.status === 'Selesai' 
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                              : letItem.status === 'Ditinjau' 
                              ? 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse' 
                              : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                          }`}>
                            ⚡ {letItem.status}
                          </span>
                          {letItem.signedBy && (
                            <span className="text-[10px] text-blue-600 font-semibold font-mono">✔️ Signed by Kepala Desa</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap font-mono">
                        {/* Status workflow operations based on roles */}
                        {activeRole === 'Sekretaris' || activeRole === 'Operator' || activeRole === 'Super Admin' ? (
                          <>
                            {letItem.status === 'Diajukan' && (
                              <button 
                                id={`review-letter-${letItem.id}`}
                                onClick={() => advanceLetterStatus(letItem.id, 'Ditinjau', 'Berkas kependudukan diperiksa kelengkapannya oleh staf operasional.')}
                                className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-lg text-[10px] font-bold transition-all"
                              >
                                Tinjau Berkas
                              </button>
                            )}
                            {letItem.status === 'Ditinjau' && (
                              <button 
                                id={`approve-operator-${letItem.id}`}
                                onClick={() => advanceLetterStatus(letItem.id, 'Selesai', 'Sekretaris memverifikasi kecocokan data dan menandatangani digital.')}
                                className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-lg text-[10px] font-bold transition-all"
                              >
                                Verifikasi Sukses
                              </button>
                            )}
                          </>
                        ) : activeRole === 'Kepala Desa' ? (
                          <>
                            {letItem.status === 'Ditinjau' ? (
                              <button 
                                id={`kades-sign-${letItem.id}`}
                                onClick={() => advanceLetterStatus(letItem.id, 'Selesai', 'Layanan Surat ditinjau dan disahkan penuh secara hukum oleh Kepala Desa Sukamaju.')}
                                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition-transform inline-flex items-center gap-1 shadow"
                              >
                                <Signature size={12} />
                                <span>TTD DIGITAL KADES</span>
                              </button>
                            ) : null}
                          </>
                        ) : null}

                        {/* Always available print trigger for complete items */}
                        <button 
                          id={`print-letter-${letItem.id}`}
                          onClick={() => printOfficialDocument(letItem)}
                          className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-[10px] font-bold transition-all inline-flex items-center gap-1"
                        >
                          <Printer size={12} />
                          <span>Arsip Cetak</span>
                        </button>

                        {activeRole !== 'Masyarakat' && (
                          <button 
                            id={`delete-letter-${letItem.id}`}
                            onClick={() => handleDeleteLetter(letItem.id, letItem.letterNumber)}
                            className="p-1 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 rounded-lg text-xs"
                            title="Hapus"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400 font-mono text-xs">Tidak ada data blangko/arsip surat aktif sesuai filter saat ini.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showScanner && (
        <KtpScanner 
          onScanSuccess={(nik, nama, additional) => {
            setRequesterNik(nik);
            setRequesterName(nama);
            if (nik && residents) {
              const match = residents.find(r => r.nik === nik);
              if (match) {
                setRequesterName(match.nama);
                setBirthPlace(match.tempatLahir || '');
                setBirthDate(match.tanggalLahir || '');
              }
            }
            if (additional?.alamat) {
              setKeperluan(`Keperluan domisili kependudukan Kp. Babakan`);
            }
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
