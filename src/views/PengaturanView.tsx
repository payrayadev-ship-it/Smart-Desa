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
import { VillageProfile } from '../types';

interface PengaturanViewProps {
  profile: VillageProfile;
  saveProfile: (data: VillageProfile) => void;
  onLogAction: (action: string, module: string) => void;
}

export default function PengaturanView({
  profile,
  saveProfile,
  onLogAction
}: PengaturanViewProps) {
  const [formProfile, setFormProfile] = useState<VillageProfile>({ ...profile });
  const [newMission, setNewMission] = useState('');
  const [signatureMode, setSignatureMode] = useState<'upload' | 'draw'>('upload');
  
  // Canvas signature states
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // File Inputs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  // Synchronize state when props update
  useEffect(() => {
    setFormProfile({ ...profile });
  }, [profile]);

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
              />
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
              <div className="w-full h-28 bg-slate-50/70 border border-dashed border-slate-200 rounded-lg p-3 flex flex-col justify-center items-center overflow-hidden relative shadow-inner select-none">
                {formProfile.signatureUrl ? (
                  <img 
                    src={formProfile.signatureUrl} 
                    alt="Tanda Tangan Kades" 
                    className="max-h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-[10px] text-slate-400 italic">Tanda tangan kosong. Upload atau gambar baru.</span>
                )}
                <div className="absolute top-1.5 right-1.5 px-2 py-0.5 bg-white border rounded text-[8px] font-mono text-slate-400 uppercase font-black tracking-wider leading-none">
                  TTD Aktif
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
