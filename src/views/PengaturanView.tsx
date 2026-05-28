import React, { useState, useRef, useEffect } from 'react';
import { 
  Settings, 
  Building, 
  MapPin, 
  Image as ImageIcon, 
  PenTool, 
  Phone, 
  Mail, 
  Plus, 
  Trash2, 
  Save, 
  RefreshCw, 
  Upload, 
  Check, 
  FileLock, 
  Sparkles,
  Eraser
} from 'lucide-react';
import { VillageProfile, PortalCredential } from '../types';
import { saveTestConnectionDoc } from '../firebaseDb';

interface PengaturanViewProps {
  profile: VillageProfile;
  saveProfile: (data: VillageProfile) => void;
  onLogAction: (action: string, module: string) => void;
  portalCredentials: { credentials: PortalCredential[] };
  savePortalCredentials: (data: { credentials: PortalCredential[] }) => void;
  onSyncAllData: () => Promise<boolean>;
}

export default function PengaturanView({
  profile,
  saveProfile,
  onLogAction,
  portalCredentials,
  savePortalCredentials,
  onSyncAllData
}: PengaturanViewProps) {
  const [formProfile, setFormProfile] = useState<VillageProfile>({ ...profile });
  const [newMission, setNewMission] = useState('');
  const [signatureMode, setSignatureMode] = useState<'upload' | 'draw'>('upload');
  
  // Real-time editable portal credentials
  const [credentialsList, setCredentialsList] = useState<PortalCredential[]>([]);
  const [newCredType, setNewCredType] = useState<'staf' | 'warga'>('warga');
  const [newCredRole, setNewCredRole] = useState('Operator');
  const [newCredName, setNewCredName] = useState('');
  const [newCredNik, setNewCredNik] = useState('');
  const [newCredPin, setNewCredPin] = useState('');

  // Canvas signature states
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // File Inputs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'failed'>('idle');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'failed'>('idle');

  const handleTestConnection = async () => {
    setTestStatus('loading');
    try {
      const success = await saveTestConnectionDoc();
      setTestStatus(success ? 'success' : 'failed');
      onLogAction(`Menjalankan uji koneksi simpan dokumen test Firestore: ${success ? 'Berhasil' : 'Gagal'}`, "Pengaturan");
    } catch (e) {
      setTestStatus('failed');
      onLogAction("Menjalankan uji koneksi simpan dokumen test Firestore: Gagal dengan exception", "Pengaturan");
    }
    setTimeout(() => setTestStatus('idle'), 4000);
  };

  const handleForceSyncAll = async () => {
    setSyncStatus('loading');
    try {
      const success = await onSyncAllData();
      setSyncStatus(success ? 'success' : 'failed');
      if (success) {
        alert("Sinkronisasi Sukses! Seluruh data kependudukan, surat, keuangan, aset, pengaduan, pengumuman, agenda, audit log, dan profil desa telah berhasil diunggah ke cloud database Firebase.");
        onLogAction("Melakukan sinkronisasi paksa seluruh data lokal ke cloud Firestore", "Pengaturan");
      } else {
        alert("Sinkronisasi Gagal! Mohon periksa koneksi internet Anda atau pastikan aturan keamanan Firebase terpasang.");
        onLogAction("Melakukan sinkronisasi paksa seluruh data lokal ke cloud Firestore: GAGAL", "Pengaturan");
      }
    } catch (e) {
      setSyncStatus('failed');
      alert("Terjadi kesalahan sistem saat menyinkronkan data.");
    }
    setTimeout(() => setSyncStatus('idle'), 4000);
  };

  // Synchronize state when props update
  useEffect(() => {
    setFormProfile({ ...profile });
  }, [profile]);

  useEffect(() => {
    if (portalCredentials && Array.isArray(portalCredentials.credentials)) {
      setCredentialsList(JSON.parse(JSON.stringify(portalCredentials.credentials)));
    }
  }, [portalCredentials]);

  const handleEditCredField = (index: number, field: keyof PortalCredential, value: string) => {
    setCredentialsList(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleDeleteCred = (index: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus kredensial portal untuk baris ini?")) {
      const next = credentialsList.filter((_, i) => i !== index);
      setCredentialsList(next);
      onLogAction("Menghapus baris kredensial portal desa", "Pengaturan");
    }
  };

  const handleCreateCred = () => {
    if (newCredType === 'staf') {
      if (!newCredName.trim()) {
        alert("Nama Staf tidak boleh kosong.");
        return;
      }
      if (!newCredPin.trim() || newCredPin.length < 4) {
        alert("PIN Staf minimal 4 digit.");
        return;
      }
      if (credentialsList.some(c => c.type === 'staf' && c.role === newCredRole)) {
        alert(`Peran atau Portal ${newCredRole} sudah terdaftar. Silakan edit baris data yang sudah ada.`);
        return;
      }
      const newItem: PortalCredential = {
        type: 'staf',
        role: newCredRole as any,
        name: newCredName.trim(),
        pin: newCredPin.trim()
      };
      setCredentialsList(prev => [...prev, newItem]);
      onLogAction(`Menambahkan kredensial staf baru untuk peran ${newCredRole}`, "Pengaturan");
    } else {
      if (!newCredNik || newCredNik.length < 16) {
        alert("NIK Warga harus berupa 16 digit angka.");
        return;
      }
      if (!newCredName.trim()) {
        alert("Nama Warga tidak boleh kosong.");
        return;
      }
      if (!newCredPin.trim() || newCredPin.length < 4) {
        alert("PIN Warga minimal 4 digit.");
        return;
      }
      if (credentialsList.some(c => c.type === 'warga' && c.nik === newCredNik)) {
        alert("NIK ini sudah terdaftar!");
        return;
      }
      const newItem: PortalCredential = {
        type: 'warga',
        nik: newCredNik,
        name: newCredName.trim(),
        pin: newCredPin.trim()
      };
      setCredentialsList(prev => [...prev, newItem]);
      onLogAction(`Menambahkan kredensial warga baru dengan NIK ${newCredNik}`, "Pengaturan");
    }
    // Reset additions form
    setNewCredName('');
    setNewCredNik('');
    setNewCredPin('');
  };

  const handleSaveAllCredentials = () => {
    for (const cred of credentialsList) {
      if (!cred.name.trim()) {
        alert("Semua nama tidak boleh kosong!");
        return;
      }
      if (!cred.pin.trim() || cred.pin.length < 4) {
        alert(`Sandi PIN untuk ${cred.name} minimal 4 digit!`);
        return;
      }
      if (cred.type === 'warga') {
        if (!cred.nik || cred.nik.length < 16) {
          alert(`NIK warga ${cred.name} wajib berisi 16 digit.`);
          return;
        }
      }
    }
    savePortalCredentials({ credentials: credentialsList });
    onLogAction("Memperbarui konfigurası Sandi PIN & Kredensial seluruh Portal Desa", "Pengaturan");
    alert("Pengaturan PIN Kredensial berhasil disinkronisasikan ke Cloud!");
  };

  // Handle standard text inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Convert uploaded files to base64
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Format berkas harus berupa gambar.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormProfile(prev => ({
          ...prev,
          logoUrl: event.target!.result as string
        }));
        onLogAction("Mengunggah favicon/logo desa baru", "Pengaturan");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Format berkas harus berupa gambar.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormProfile(prev => ({
          ...prev,
          signatureUrl: event.target!.result as string
        }));
        onLogAction("Mengunggah gambar tanda tangan kades baru", "Pengaturan");
      }
    };
    reader.readAsDataURL(file);
  };

  // Mission list helpers
  const handleAddMission = () => {
    if (!newMission.trim()) return;
    setFormProfile(prev => ({
      ...prev,
      misi: [...prev.misi, newMission.trim()]
    }));
    setNewMission('');
  };

  const handleRemoveMission = (index: number) => {
    setFormProfile(prev => ({
      ...prev,
      misi: prev.misi.filter((_, i) => i !== index)
    }));
  };

  // Canvas Drawing Pad Methods (Mouse and Touch support)
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#0284c7'; // beautiful cyan-blue ink
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const coords = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const saveSignatureFromCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) {
      alert("Tulis coretan tanda tangan Anda terlebih dahulu di area kanvas!");
      return;
    }
    const dataUrl = canvas.toDataURL('image/png');
    setFormProfile(prev => ({
      ...prev,
      signatureUrl: dataUrl
    }));
    alert("Tanda tangan hasil goresan digital berhasil dimuat!");
    onLogAction("Membuat tanda tangan kades digital via Canvas", "Pengaturan");
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile(formProfile);
    onLogAction(`Memperbarui profil desa: ${formProfile.name}`, "Pengaturan");
    alert(`Konfigurasi profil ${formProfile.name} berhasil diperbarui di memori lokal server desa!`);
  };

  const handleResetDefault = () => {
    if (window.confirm("Apakah Anda yakin ingin mengembalikan seluruh identitas desa ke pengaturan default bawaan pabrik (Sukamaju)?")) {
      const defaultProfile: VillageProfile = {
        name: "Desa Sukamaju",
        subdistrict: "Kecamatan Paseh",
        regency: "Kabupaten Bandung",
        province: "Provinsi Jawa Barat",
        logoUrl: "https://images.unsplash.com/photo-1590005354167-6da97870c913?auto=format&fit=crop&q=80&w=200",
        kepalaDesa: "H. Dadang Sulaeman, S.IP.",
        sekretarisDesa: "Ahmad Fauzi, S.Kom.",
        bendaharaDesa: "Siti Rahmawati, A.Md.",
        operatorDesa: "Budi Santoso",
        phone: "0812-3456-7890",
        email: "info@sukamaju-bandung.desa.id",
        address: "Jl. Raya Paseh No. 123, Sukamaju, Bandung, Jawa Barat 40383",
        sejarah: "Desa Sukamaju terbentuk sejak tahun 1968, bermula dari wilayah pertanian subur di lereng bukit Paseh. Melalui gotong royong dan semangat kebersamaan, kini desa bertransformasi menjadi desa mandiri digital percontohan tingkat provinsi.",
        visi: "Mewujudkan Desa Sukamaju yang Mandiri, Sejahtera, Transparan, Berkelanjutan dengan Dukungan Teknologi Digital Modern Berlandaskan Gotong Royong.",
        misi: [
          "Meningkatkan kualitas pelayanan administrasi publik desa cepat 5 menit selesai mandiri gratis.",
          "Mengembangkan transparansi anggaran APBDes berbasis real-time publikasi digital.",
          "Mendorong potensi ekonomi lokal melalui digitalisasi UMKM Desa dan BUMDes Sukamaju Utama.",
          "Mengoptimalkan penyaluran ketahanan pangan dan bantuan sosial adil menggunakan verifikasi data AI."
        ],
        signatureUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=150"
      };
      setFormProfile(defaultProfile);
      saveProfile(defaultProfile);
      onLogAction("Me-reset profil desa kembali ke bawaan", "Pengaturan");
    }
  };

  return (
    <div id="pengaturan-view-wrapper" className="space-y-6 animate-fade">
      
      {/* Upper header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <Settings className="animate-spin-slow text-blue-600" size={22} />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider font-mono">Pusat Pengaturan Identitas & Kedaulatan Desa</h2>
            <p className="text-[10px] text-slate-400 font-mono mt-1">Otoritas Eksklusif Super Admin: Ganti Nama Desa, Alamat Surat, Logo Pemda, dan TTD Resmi Kepala Desa</p>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetDefault}
            className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg flex items-center gap-1 font-mono transition-all"
          >
            <RefreshCw size={13} />
            <span>Reset Bawaan</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveAll} className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
        
        {/* LEFT COLUMN: PRIMARY INPUTS */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section 1: Core Identity details */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono border-b pb-2 flex items-center gap-2">
              <Building size={14} className="text-blue-500" />
              <span>1. Identitas Inti Daerah & Pemerintahan</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">Nama Desa / Kelurahan*</label>
                <div className="relative">
                  <input
                    id="sett-name-input"
                    type="text"
                    name="name"
                    value={formProfile.name}
                    onChange={handleChange}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Contoh: Desa Sukamaju"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">Kecamatan*</label>
                <input
                  id="sett-subdistrict-input"
                  type="text"
                  name="subdistrict"
                  value={formProfile.subdistrict}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Kecamatan Paseh"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">Kabupaten / Kota*</label>
                <input
                  id="sett-regency-input"
                  type="text"
                  name="regency"
                  value={formProfile.regency}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Kabupaten Bandung"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">Provinsi*</label>
                <input
                  id="sett-province-input"
                  type="text"
                  name="province"
                  value={formProfile.province}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Provinsi Jawa Barat"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">Alamat Kantor Resmi (Ditampilkan Pada KOP Surat)*</label>
              <textarea
                id="sett-address-input"
                name="address"
                value={formProfile.address}
                onChange={handleChange}
                rows={2}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
                placeholder="Jl. Raya Utama No. 123, Rt 02/04, Bandung, Jawa Barat"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">Telepon Kantor</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-slate-400" size={13} />
                  <input
                    id="sett-phone-input"
                    type="text"
                    name="phone"
                    value={formProfile.phone}
                    onChange={handleChange}
                    className="w-full text-xs pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono focus:outline-none"
                    placeholder="0812-xxxx-xxxx"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">E-Mail Kantor Desa</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-slate-400" size={13} />
                  <input
                    id="sett-email-input"
                    type="email"
                    name="email"
                    value={formProfile.email}
                    onChange={handleChange}
                    className="w-full text-xs pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono focus:outline-none"
                    placeholder="kantor@desa.id"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Village Officers / Staff */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono border-b pb-2 flex items-center gap-2">
              <PenTool size={14} className="text-blue-500" />
              <span>2. Nama Penanggung Jawab / Aparatur Desa</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">Kepala Desa (Kades)</label>
                <input
                  id="sett-kades-input"
                  type="text"
                  name="kepalaDesa"
                  value={formProfile.kepalaDesa}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none"
                  placeholder="Nama Kepala Desa lengkap & gelar"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">Sekretaris Desa (Sekdes)</label>
                <input
                  id="sett-sekdes-input"
                  type="text"
                  name="sekretarisDesa"
                  value={formProfile.sekretarisDesa}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none"
                  placeholder="Nama Sekretaris Desa lengkap"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">Bendahara Desa</label>
                <input
                  id="sett-bendahara-input"
                  type="text"
                  name="bendaharaDesa"
                  value={formProfile.bendaharaDesa}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none"
                  placeholder="Nama Bendahara Desa lengkap"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">Operator Sipil Utama</label>
                <input
                  id="sett-operator-input"
                  type="text"
                  name="operatorDesa"
                  value={formProfile.operatorDesa}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none"
                  placeholder="Nama Operator pelayanan"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Vision, Mission & Sejarah Editor */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono border-b pb-2 flex items-center gap-2">
              <Sparkles size={14} className="text-amber-500 animate-pulse" />
              <span>3. Visi / Misi / Sejarah Umum Desa</span>
            </h3>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">Visi Utama Pembangunan Desa</label>
              <textarea
                id="sett-visi-input"
                name="visi"
                value={formProfile.visi}
                onChange={handleChange}
                rows={2}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-sans focus:outline-none"
                placeholder="Mewujudkan visi pembangunan berdaya saing..."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider leading-none mb-1">Misi / Program Kerja Unggulan ({formProfile.misi.length})</label>
              
              <div className="flex gap-2">
                <input
                  id="sett-new-mission-input"
                  type="text"
                  value={newMission}
                  onChange={(e) => setNewMission(e.target.value)}
                  placeholder="Tulis draf program kerja misi baru..."
                  className="flex-1 text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddMission}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 shrink-0"
                >
                  <Plus size={14} />
                  <span>Tambahkan</span>
                </button>
              </div>

              <div className="space-y-1.5 pt-2 max-h-[160px] overflow-y-auto">
                {formProfile.misi.map((m, i) => (
                  <div key={i} className="flex gap-2 items-start justify-between p-2 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                    <span className="font-mono text-slate-400 select-none">{i + 1}.</span>
                    <span className="flex-1 text-slate-700 leading-tight">{m}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMission(i)}
                      className="text-slate-400 hover:text-rose-600 shrink-0 self-center"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">Sejarah Ringkas Terbentuknya Desa</label>
              <textarea
                id="sett-sejarah-input"
                name="sejarah"
                value={formProfile.sejarah}
                onChange={handleChange}
                rows={3}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-sans focus:outline-none leading-relaxed"
                placeholder="Tulis urutan sejarah terbentuknya dusun kependudukan..."
                required
              />
            </div>
          </div>

          {/* Section 4: Credential and PIN Manager */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono border-b pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileLock size={14} className="text-blue-500 animate-pulse" />
                <span>4. Pengaturan Sandi PIN & Kredensial Login Portal</span>
              </span>
              <span className="text-[9px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-bold uppercase">
                Otoritas Super Admin ✓
              </span>
            </h3>

            <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
              Atur dan regulasi Nama Sesuai Portal serta sandi PIN rahasia untuk masing-masing Staf (Kepala Desa, Bendahara, Sekretaris, RT/RW, Operator, Super Admin) dan akun Warga (NIK) secara langsung. Tekan tombol <strong>SINKRONISASI KREDENSIAL</strong> untuk menerapkan perubahan ke real-time database.
            </p>

            {/* List of current credentials */}
            <div className="border border-slate-100 rounded-lg overflow-x-auto">
              <table className="w-full text-[11px] text-left border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 border-b border-slate-150 uppercase text-[9px] font-bold font-mono tracking-wider">
                    <th className="p-2.5">Tipe Portal</th>
                    <th className="p-2.5">Keterangan / NIK</th>
                    <th className="p-2.5">Nama Sesuai Portal (Username)</th>
                    <th className="p-2.5">Sandi PIN Rahasia</th>
                    <th className="p-2.5 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {credentialsList.map((cred, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-2.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase inline-block ${
                          cred.type === 'staf' 
                            ? 'bg-purple-50 text-purple-700 border border-purple-100' 
                            : 'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}>
                          {cred.type === 'staf' ? (cred.role || 'Staf') : 'Warga'}
                        </span>
                      </td>
                      <td className="p-2.5 whitespace-nowrap font-mono text-slate-500">
                        {cred.type === 'staf' ? (
                          <span className="text-[10px] uppercase font-bold text-slate-400">ROLE PORTAL</span>
                        ) : (
                          <input
                            type="text"
                            maxLength={16}
                            value={cred.nik || ''}
                            onChange={(e) => handleEditCredField(idx, 'nik', e.target.value.replace(/\D/g, ''))}
                            className="w-32 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 font-mono text-[10.5px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        )}
                      </td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={cred.name || ''}
                          onChange={(e) => handleEditCredField(idx, 'name', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 font-semibold text-slate-800 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Nama lengkap sesuai portal"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={cred.pin || ''}
                          onChange={(e) => handleEditCredField(idx, 'pin', e.target.value)}
                          className="w-20 bg-slate-50 border border-slate-200 rounded px-2 py-1 font-mono text-[11px] text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="PIN"
                        />
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteCred(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Hapus Kredensial"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {credentialsList.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 font-mono italic text-[10px]">
                        Belum ada data kredensial portal di database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Form for adding new credentials */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-150 space-y-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                ➕ Daftarkan Akun Portal Baru :
              </span>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                <div className="md:col-span-3">
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider font-mono mb-1">Tipe Portal</label>
                  <select
                    value={newCredType}
                    onChange={(e) => setNewCredType(e.target.value as 'staf' | 'warga')}
                    className="w-full bg-white border border-slate-250 text-slate-800 text-[11px] rounded px-2 py-1.5 focus:outline-none"
                  >
                    <option value="warga">Warga (NIK)</option>
                    <option value="staf">Aparat / Staf Desa</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  {newCredType === 'staf' ? (
                    <>
                      <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider font-mono mb-1">Peran / Role</label>
                      <select
                        value={newCredRole}
                        onChange={(e) => setNewCredRole(e.target.value)}
                        className="w-full bg-white border border-slate-250 text-slate-800 text-[11px] rounded px-2 py-1.5 focus:outline-none"
                      >
                        <option value="Operator">Operator</option>
                        <option value="Kepala Desa">Kepala Desa</option>
                        <option value="Sekretaris">Sekretaris</option>
                        <option value="Bendahara">Bendahara</option>
                        <option value="RT/RW">RT/RW</option>
                        <option value="Super Admin">Super Admin</option>
                      </select>
                    </>
                  ) : (
                    <>
                      <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider font-mono mb-1">NIK Warga (16 digit)</label>
                      <input
                        type="text"
                        maxLength={16}
                        value={newCredNik}
                        onChange={(e) => setNewCredNik(e.target.value.replace(/\D/g, ''))}
                        placeholder="Cth: 320412xxxxxxxxxx"
                        className="w-full bg-white border border-slate-250 text-slate-800 text-[11px] rounded px-2 py-1.5 focus:outline-none font-mono"
                      />
                    </>
                  )}
                </div>

                <div className="md:col-span-3">
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider font-mono mb-1">Nama Pengguna Sesuai Portal</label>
                  <input
                    type="text"
                    value={newCredName}
                    onChange={(e) => setNewCredName(e.target.value)}
                    placeholder="Nama Lengkap"
                    className="w-full bg-white border border-slate-250 text-slate-800 text-[11px] rounded px-2 py-1.5 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider font-mono mb-1">Sandi PIN</label>
                  <input
                    type="text"
                    value={newCredPin}
                    onChange={(e) => setNewCredPin(e.target.value)}
                    placeholder="Cth: 123456"
                    className="w-full bg-white border border-slate-250 text-slate-800 text-[11px] rounded px-2 py-1.5 focus:outline-none font-mono text-center"
                  />
                </div>

                <div className="md:col-span-1 flex items-end">
                  <button
                    type="button"
                    onClick={handleCreateCred}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded flex items-center justify-center gap-0.5 shadow transition-all"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleSaveAllCredentials}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg flex items-center gap-1.5 shadow-md shadow-emerald-50/20 active:scale-95 transition-all font-mono uppercase"
              >
                <Save size={13} />
                <span>Sinkronisasi Kredensial & Sandi PIN</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LOGO & SIGNATURE IMAGE UPLOAD & CANVAS WRITER */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Logo Upload Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono border-b pb-2 flex items-center gap-2">
              <ImageIcon size={14} className="text-blue-500" />
              <span>4. Logo / Lambang Desa</span>
            </h3>

            <div className="flex flex-col items-center space-y-3">
              <div className="w-24 h-24 rounded-full border border-slate-200 bg-slate-50 p-2 flex items-center justify-center overflow-hidden shadow-inner group relative">
                {formProfile.logoUrl ? (
                  <img 
                    src={formProfile.logoUrl} 
                    alt="Logo Desa"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain" 
                  />
                ) : (
                  <span className="text-xs text-slate-300 font-mono">No Logo</span>
                )}
              </div>

              <div className="w-full space-y-2">
                <p className="text-[9px] text-slate-400 text-center font-mono">Format PNG/JPG, disarankan rasio kotak persegi (max 500KB)</p>
                
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />

                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 border border-slate-205 transition-colors"
                  >
                    <Upload size={13} />
                    <span>Unggah Berkas Gambar</span>
                  </button>

                  <input
                    id="sett-logo-url-input"
                    type="text"
                    name="logoUrl"
                    value={formProfile.logoUrl}
                    onChange={handleChange}
                    placeholder="Atau tempel alamat tautan logo URL..."
                    className="w-full text-[10px] p-1.5 border border-slate-200 rounded font-mono text-slate-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Signature / TTD Kepala Desa Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono border-b pb-2 flex items-center gap-2">
              <PenTool size={14} className="text-blue-500" />
              <span>5. Tanda Tangan Kepala Desa (TTD)</span>
            </h3>

            {/* Signature view & change trigger */}
            <div className="flex flex-col items-center space-y-3">
              {/* Format Tanda Tangan Selector */}
              <div className="w-full space-y-2 border-b pb-3 border-slate-150">
                <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider leading-none mb-1">
                  Format Tanda Tangan Kepala Desa
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormProfile(prev => ({ ...prev, signatureType: 'image' }))}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                      formProfile.signatureType !== 'barcode'
                        ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>✍️ Gores TTD Basah (Gambar)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormProfile(prev => ({ ...prev, signatureType: 'barcode' }))}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                      formProfile.signatureType === 'barcode'
                        ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>📊 Barcode / QR Digital TTE</span>
                  </button>
                </div>
                <p className="text-[9px] text-slate-400 font-mono leading-normal pt-1">
                  {formProfile.signatureType === 'barcode'
                    ? 'Kombinasi data keaslian tanda tangan kepala desa langsung dikonversi ke Barcode QR-Code E-Signature (TTE) anti pemalsuan.'
                    : 'Menggunakan gambar coretan atau file scan tanda tangan fisik kepala desa secara langsung.'}
                </p>
              </div>

              {/* Signature Preview Panel */}
              <div className="w-full h-28 bg-slate-50/70 border border-dashed border-slate-200 rounded-lg p-3 flex flex-col justify-center items-center overflow-hidden relative shadow-inner select-none">
                {formProfile.signatureType === 'barcode' ? (
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=SMART_DESA_TTE_VERIFIED_${formProfile.kepalaDesa.replace(/\s+/g, '_')}`}
                      alt="TTE Barcode Preview" 
                      className="h-14 w-14 object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[8px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold border border-emerald-100 flex items-center gap-0.5 animate-pulse">
                      🔒 TTE BARCODE SCANNER AKTIF
                    </span>
                  </div>
                ) : formProfile.signatureUrl ? (
                  <img 
                    src={formProfile.signatureUrl} 
                    alt="Tanda Tangan Kades" 
                    className="max-h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-[10px] text-slate-400 italic">Tanda tangan kosong. Upload atau gambar baru.</span>
                )}
                <div className="absolute top-1.5 right-1.5 px-2 py-0.5 bg-white border rounded text-[8px] font-mono text-slate-400 uppercase font-bold tracking-wider leading-none">
                  Status TTD
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="flex border border-slate-200 rounded-lg overflow-hidden w-full text-[10px] font-bold text-center">
                <button
                  type="button"
                  onClick={() => setSignatureMode('upload')}
                  className={`flex-1 py-1.5 ${signatureMode === 'upload' ? 'bg-slate-800 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-500'}`}
                >
                  📁 Unggah File TTD
                </button>
                <button
                  type="button"
                  onClick={() => setSignatureMode('draw')}
                  className={`flex-1 py-1.5 ${signatureMode === 'draw' ? 'bg-slate-800 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-500'}`}
                >
                  🖊 Canvas Gores Digital
                </button>
              </div>

              {/* UPLOAD TTD BOX */}
              {signatureMode === 'upload' && (
                <div className="w-full space-y-2">
                  <input
                    type="file"
                    ref={signatureInputRef}
                    onChange={handleSignatureUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => signatureInputRef.current?.click()}
                    className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 border border-slate-200"
                  >
                    <Upload size={13} />
                    <span>Cari Gambar TTD</span>
                  </button>

                  <input
                    id="sett-sign-url-input"
                    type="text"
                    name="signatureUrl"
                    value={formProfile.signatureUrl}
                    onChange={handleChange}
                    placeholder="Atau tempel Link URL tanda tangan..."
                    className="w-full text-[10px] p-1.5 border border-slate-200 rounded font-mono text-slate-500 focus:outline-none"
                  />
                </div>
              )}

              {/* DRAW TTD CANVAS SIGN BOX */}
              {signatureMode === 'draw' && (
                <div className="w-full space-y-2.5">
                  <p className="text-[8.5px] text-slate-400 font-mono leading-tight">Goreskan kursor mouse atau sentuhan jari Anda pada kanvas bergaris biru di bawah:</p>
                  
                  <div className="border border-blue-150 rounded-lg bg-blue-50/20 overflow-hidden relative">
                    <canvas
                      ref={canvasRef}
                      width={280}
                      height={120}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="cursor-crosshair w-full block bg-white"
                    />
                    <div className="absolute bottom-1 right-1 flex gap-1">
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="p-1 bg-slate-100 border text-slate-600 rounded hover:bg-slate-200 transition-colors"
                        title="Hapus Coreta"
                      >
                        <Eraser size={11} />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={saveSignatureFromCanvas}
                    className="w-full py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1"
                  >
                    <Check size={13} />
                    <span>Gunakan Hasil Coretan Digital</span>
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Persistent security lock card */}
          <div className="bg-slate-100/80 border border-slate-200 p-4 rounded-xl space-y-2.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <FileLock size={12} className="text-emerald-500" />
              <span>Verifikasi Integritas Server</span>
            </span>
            <p className="text-[9.5px] text-slate-500 font-mono leading-tight">Seluruh perubahan yang disimpan akan langsung diinjeksikan secara real-time ke dalam KOP surat dinas resmi, berkas kependudukan, buku APBDes, dan portal publik.</p>
            
            <div className="pt-1.5 border-t border-slate-200/60 pb-1 space-y-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testStatus === 'loading'}
                className={`w-full py-2 px-3 border rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  testStatus === 'loading'
                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                    : testStatus === 'success'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm shadow-emerald-100'
                    : testStatus === 'failed'
                    ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-sm shadow-rose-100'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 active:scale-95 shadow-sm cursor-pointer'
                }`}
              >
                <RefreshCw size={12} className={`${testStatus === 'loading' ? 'animate-spin' : ''}`} />
                <span>
                  {testStatus === 'loading'
                    ? 'Menghubungkan ke Cloud...'
                    : testStatus === 'success'
                    ? 'Uji Koneksi Firestore: BERHASIL ✔'
                    : testStatus === 'failed'
                    ? 'Koneksi Gagal (Periksa Aturan/Sinyal) ❌'
                    : 'Uji Koneksi Simpan Dokumen Cloud'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleForceSyncAll}
                disabled={syncStatus === 'loading'}
                className={`w-full py-2 px-3 border rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  syncStatus === 'loading'
                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                    : syncStatus === 'success'
                    ? 'bg-cyan-50 border-cyan-300 text-cyan-700 shadow-sm shadow-cyan-100'
                    : syncStatus === 'failed'
                    ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-sm shadow-rose-100'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 border-transparent text-white active:scale-95 shadow-md cursor-pointer'
                }`}
              >
                <RefreshCw size={12} className={`${syncStatus === 'loading' ? 'animate-spin' : ''}`} />
                <span>
                  {syncStatus === 'loading'
                    ? 'Menyinkronkan Data Cloud...'
                    : syncStatus === 'success'
                    ? 'Sinkronisasi Cloud: SUKSES ✔'
                    : syncStatus === 'failed'
                    ? 'Sinkronisasi Gagal ❌'
                    : 'Sinkronkan Semua Data ke Firebase'}
                </span>
              </button>
            </div>

            <button
              type="submit"
              id="sett-save-all-btn"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 transition-transform active:scale-95"
            >
              <Save size={14} />
              <span>SIMPAN SELURUH KONFIGURASI</span>
            </button>
          </div>

        </div>

      </form>

    </div>
  );
}
