import React, { useState } from 'react';
import { 
  Globe, 
  Image, 
  FileText, 
  Map, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Eye, 
  SlidersHorizontal,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Role } from '../types';

interface WebDesaViewProps {
  activeRole: Role;
  onLogAction: (action: string, module: string) => void;
}

export default function WebDesaView({
  activeRole,
  onLogAction
}: WebDesaViewProps) {
  
  // Slider states
  const [slides, setSlides] = useState([
    { id: 1, title: 'Selamat Datang di Sukamaju Hebat', subtitle: 'Penerima Penghargaan Desa Mandiri Nasional Terbaik 2026', image: 'https://images.unsplash.com/photo-1596251261491-031e4284bfa4?auto=format&fit=crop&w=800&q=80' },
    { id: 2, title: 'Paving Mandiri Gotong Royong', subtitle: 'Layanan jalan mulus di seluruh kawasan pemukiman warga', image: 'https://images.unsplash.com/photo-1542382257-201b72a21a99?auto=format&fit=crop&w=800&q=80' }
  ]);
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [newSlideSub, setNewSlideSub] = useState('');
  const [newSlideImage, setNewSlideImage] = useState('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80');

  // News states
  const [news, setNews] = useState([
    { id: 1, title: 'Rencana Pelaksanaan Posyandu Terintegrasi Balita RT 02 Dusun Timur', date: '28 Mei 2026', views: 120 },
    { id: 2, title: 'Sosialisasi Program Bantuan BPNT Sembako Tahap IV di Aula Balai Desa', date: '26 Mei 2026', views: 89 },
    { id: 3, title: 'Kerjasama BUMDes Sukamaju dan Dinas UMKM Jawa Barat Terkait Ekspor Kerupuk Rambak', date: '22 Mei 2026', views: 231 }
  ]);
  const [newNewsTitle, setNewNewsTitle] = useState('');

  // Potential Village Tourism States
  const [potentials, setPotentials] = useState([
    { id: 1, name: 'Curug Cigentis Sukamaju', category: 'Wisata Alam', description: 'Curug indah berudara sejuk dengan rute pendakian ringan.' },
    { id: 2, name: 'Sawah Organik Kadus II', category: 'Agrowisata', description: 'Pengolahan padi zero-chemical berstandar nasional.' }
  ]);
  const [newPotName, setNewPotName] = useState('');
  const [newPotDesc, setNewPotDesc] = useState('');

  const [activeTab, setActiveTab] = useState<'slider' | 'news' | 'tourism'>('slider');

  // Slider controls
  const handleAddSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlideTitle.trim()) return;

    const added = {
      id: Date.now(),
      title: newSlideTitle.trim(),
      subtitle: newSlideSub.trim() || 'Desa Sukamaju Mandiri',
      image: newSlideImage
    };
    setSlides([...slides, added]);
    onLogAction(`Menambahkan banner slider web : ${newSlideTitle}`, 'Web Portal');
    setNewSlideTitle('');
    setNewSlideSub('');
  };

  const handleDeleteSlide = (id: number) => {
    setSlides(slides.filter(s => s.id !== id));
  };

  // News controls
  const handleAddNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNewsTitle.trim()) return;
    const added = {
      id: Date.now(),
      title: newNewsTitle.trim(),
      date: 'Hari Ini',
      views: 0
    };
    setNews([added, ...news]);
    onLogAction(`Menerbitkan berita desa baru : ${newNewsTitle}`, 'Web Portal');
    setNewNewsTitle('');
  };

  // Tourism controls
  const handleAddPotential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPotName.trim()) return;
    const added = {
      id: Date.now(),
      name: newPotName.trim(),
      category: 'Wisata Kuliner / Alam',
      description: newPotDesc.trim() || 'Potensi andalan kemakmuran warga lokal.'
    };
    setPotentials([...potentials, added]);
    onLogAction(`Mengunggah potensi pariwisata: ${newPotName}`, 'Web Portal');
    setNewPotName('');
    setNewPotDesc('');
  };

  return (
    <div id="web-desa-view-wrapper" className="space-y-4 animate-fade">
      
      {/* Header Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Globe size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 leading-none">Manajemen Publikasi Portal Digital Publik</h2>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Edit Carousel Slider Utama, Terbitkan Berita Dusun & Unggah Keunggulan Wisata</p>
          </div>
        </div>

        <a 
          href="https://wisata-sukamaju.com" 
          target="_blank" 
          rel="noreferrer" 
          onClick={(e) => { e.preventDefault(); alert("Simulasi: Mengalihkan ke alamat website publik terdesentralisasi: https://www.sukamajudesa.id"); }}
          className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-105 border border-blue-200 text-blue-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 self-start"
        >
          <Eye size={13} />
          <span>Lihat Live Website</span>
        </a>
      </div>

      {/* GRID LAYOUT: LEFT CMS PANEL EDITOR, RIGHT MOCK PREVIEW DESKTOP SCREEN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT COLUMN (CMS EDITOR CONTROLS) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm lg:col-span-5 overflow-hidden flex flex-col h-[520px]">
          
          {/* Internal tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 p-1 gap-1 shrink-0">
            <button
              onClick={() => setActiveTab('slider')}
              className={`flex-1 py-2 text-center rounded-lg transition-all ${activeTab === 'slider' ? 'bg-blue-600 text-white shadow' : 'hover:bg-slate-100'}`}
            >
              🖼️ Carousel Slider
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`flex-1 py-2 text-center rounded-lg transition-all ${activeTab === 'news' ? 'bg-blue-600 text-white shadow' : 'hover:bg-slate-100'}`}
            >
              📰 Berita Desa
            </button>
            <button
              onClick={() => setActiveTab('tourism')}
              className={`flex-1 py-2 text-center rounded-lg transition-all ${activeTab === 'tourism' ? 'bg-blue-600 text-white shadow' : 'hover:bg-slate-100'}`}
            >
              ⛰️ Keunggulan Wisata
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* SUBTAB 1: Slider editor */}
            {activeTab === 'slider' && (
              <div className="space-y-4">
                {activeRole !== 'Masyarakat' && (
                  <form onSubmit={handleAddSlide} className="bg-slate-50 p-3 rounded-lg border border-slate-150 space-y-2.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block">Banner Slider Baru</span>
                    <input
                      id="slide-title-input"
                      type="text"
                      placeholder="Judul Banner utama (Headline)"
                      value={newSlideTitle}
                      onChange={(e) => setNewSlideTitle(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-none"
                      required
                    />
                    <input
                      id="slide-sub-input"
                      type="text"
                      placeholder="Anak judul / Deskripsi singat"
                      value={newSlideSub}
                      onChange={(e) => setNewSlideSub(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-none"
                    />
                    <button
                      type="submit"
                      id="submit-slide-btn"
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded transition-colors"
                    >
                      + Tambahkan Hero Baru
                    </button>
                  </form>
                )}

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">Daftar Banner Aktif</span>
                  {slides.map(s => (
                    <div key={s.id} className="p-2.5 bg-white border border-slate-2 py-2.5 rounded-lg flex items-center justify-between gap-2 shadow-sm">
                      <div className="flex items-center gap-2">
                        <img src={s.image} alt="Thumb" className="w-10 h-7 object-cover rounded border" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{s.title}</h4>
                          <p className="text-[9px] text-slate-400 line-clamp-1">{s.subtitle}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteSlide(s.id)} className="text-slate-400 hover:text-rose-600">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUBTAB 2: News editor */}
            {activeTab === 'news' && (
              <div className="space-y-4">
                {activeRole !== 'Masyarakat' && (
                  <form onSubmit={handleAddNews} className="bg-slate-50 p-3 rounded-lg border border-slate-150 space-y-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block">Rilis Berita Kegiatan Baru</span>
                    <input
                      id="news-title-input"
                      type="text"
                      placeholder="Judul Berita (e.g. Pembagian Bansos Sembako)"
                      value={newNewsTitle}
                      onChange={(e) => setNewNewsTitle(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-none"
                      required
                    />
                    <button
                      type="submit"
                      id="submit-news-btn"
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded"
                    >
                      Terbitkan ke Portal
                    </button>
                  </form>
                )}

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">Daftar Berita Aktif</span>
                  {news.map(n => (
                    <div key={n.id} className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between gap-2 hover:border-blue-200 transition-all border border-slate-100">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{n.title}</h4>
                        <p className="text-[9px] text-slate-400 font-mono">Terbit: {n.date} | 👁️ {n.views} Pembaca</p>
                      </div>
                      {activeRole !== 'Masyarakat' && (
                        <button onClick={() => setNews(news.filter(x => x.id !== n.id))} className="text-slate-400 hover:text-rose-600">
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUBTAB 3: Tourism potentials */}
            {activeTab === 'tourism' && (
              <div className="space-y-4">
                {activeRole !== 'Masyarakat' && (
                  <form onSubmit={handleAddPotential} className="bg-slate-50 p-3 rounded-lg border border-slate-150 space-y-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block">Materi Potensi Baru</span>
                    <input
                      id="pot-name-input"
                      type="text"
                      placeholder="Nama Objek Wisata / Sentra Kerajinan"
                      value={newPotName}
                      onChange={(e) => setNewPotName(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                    <textarea
                      id="pot-desc-input"
                      placeholder="Uraian keunggulan..."
                      value={newPotDesc}
                      onChange={(e) => setNewPotDesc(e.target.value)}
                      rows={1}
                      className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-none"
                    />
                    <button
                      type="submit"
                      id="submit-pot-btn"
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded"
                    >
                      Publikasikan Objek Wisata
                    </button>
                  </form>
                )}

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">Sentra Komoditas Terdaftar</span>
                  {potentials.map(p => (
                    <div key={p.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex flex-col gap-0.5">
                      <h4 className="text-xs font-bold text-slate-800">{p.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono leading-tight">{p.description}</p>

                      {activeRole !== 'Masyarakat' && (
                        <button 
                          onClick={() => setPotentials(potentials.filter(po => po.id !== p.id))} 
                          className="text-[9px] text-rose-500 font-bold font-mono self-end hover:underline"
                        >
                          Hapus Komoditas
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN (MOCK PREVIEW PORTAL SCREEN - AMAZING REALISM!) */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm lg:col-span-7 h-[520px] overflow-hidden flex flex-col relative bg-slate-100 select-none">
          
          {/* Iframe Desktop Header Bar simulator */}
          <div className="bg-slate-800 text-slate-400 p-2 flex items-center justify-between text-[10px] uppercase font-bold shrink-0 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-[9px] text-slate-500 lowercase">https://sukamaju-digital.desa.id</span>
            </span>
            <span className="text-white">PREVIEW AKTIF</span>
          </div>

          {/* Simulated Web portal page content structure */}
          <div className="flex-grow overflow-y-auto bg-white flex flex-col">
            
            {/* Top Navbar */}
            <div className="bg-blue-900 text-white p-3 flex justify-between items-center text-xs shadow-md shrink-0">
              <span className="font-extrabold tracking-wider font-mono uppercase text-[10px]">🌐 SUKAMAJU DIGITAL PORTAL</span>
              <div className="flex gap-2.5 text-[9px] font-bold text-slate-200 uppercase">
                <span>Profil</span>
                <span>Regulasi</span>
                <span>BUMDes</span>
                <span>Wisata</span>
              </div>
            </div>

            {/* Simulated Hero Slider screen banner displaying the 1st slide dynamically */}
            {slides.length > 0 ? (
              <div 
                className="h-36 w-full text-white bg-cover bg-center flex flex-col justify-end p-4 relative" 
                style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.1)), url(${slides[0].image})` }}
              >
                <div className="z-10 space-y-0.5">
                  <h3 className="text-xs font-bold leading-tight font-mono text-amber-300">{slides[0].title}</h3>
                  <p className="text-[9.5px] text-slate-100 line-clamp-1">{slides[0].subtitle}</p>
                </div>
              </div>
            ) : null}

            {/* News and announcements section */}
            <div className="p-3.5 grid grid-cols-1 md:grid-cols-2 gap-3.5 flex-grow">
              
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-blue-900 border-b border-blue-50 pb-1 font-mono uppercase">BERITA & JURNAL UTAMA</h4>
                <div className="space-y-1.5">
                  {news.slice(0, 3).map(n => (
                    <div key={n.id} className="text-[10px] hover:text-blue-600 cursor-pointer">
                      <p className="font-extrabold text-slate-800 leading-tight block">{n.title}</p>
                      <p className="text-[8px] text-slate-400 font-mono">{n.date}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <h4 className="text-[10px] font-bold text-slate-700 border-b pb-1 font-mono uppercase">POTENSI KOMODITAS UNGGULAN</h4>
                <div className="space-y-2">
                  {potentials.slice(0, 2).map(p => (
                    <div key={p.id}>
                      <span className="text-[9.5px] font-extrabold text-slate-800 leading-none block">⛰️ {p.name}</span>
                      <p className="text-[8.5px] text-slate-500 leading-tight mt-0.5">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Public footer */}
            <div className="bg-slate-900 text-slate-400 text-center py-2 text-[8px] border-t font-mono mt-auto shrink-0 uppercase">
              PEMERINTAH DESA SUKAMAJU KABUPATEN BANDUNG © 2026
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
