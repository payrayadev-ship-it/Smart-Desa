import React, { useState } from 'react';
import { 
  Heart, 
  FileText, 
  PhoneCall, 
  HelpCircle, 
  Sparkles, 
  Bell, 
  User, 
  FileCheck, 
  ArrowRight,
  TrendingDown,
  Navigation,
  Clock,
  Copy,
  Check
} from 'lucide-react';
import { Resident, Letter, CitizenComplaint, Role } from '../types';

interface PelayananWargaViewProps {
  residents: Resident[];
  letters: Letter[];
  complaints: CitizenComplaint[];
  onNavigate: (view: string) => void;
  openAiAssistant: () => void;
  currentUser?: { name: string; role: Role; nik?: string } | null;
}

export default function PelayananWargaView({
  residents,
  letters,
  complaints,
  onNavigate,
  openAiAssistant,
  currentUser
}: PelayananWargaViewProps) {
  
  // Resolve citizen's actual authenticated NIK, defaulting to mock user if not specified
  const citizenNik = currentUser?.nik || '3204101201930005';
  const myResidentInfo = residents.find(r => r.nik === citizenNik) || residents[0];

  // Specific filtered letters / complaints for this citizen
  const myLetters = letters.filter(l => l.requesterNik === citizenNik);
  const myComplaints = complaints.filter(c => c.residentNik === citizenNik);

  // Copy to clipboard state
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  return (
    <div id="warga-portal-panel" className="space-y-5 animate-fade max-w-7xl mx-auto px-1 sm:px-2">
      
      {/* Banner greetings */}
      <div className="bg-gradient-to-tr from-blue-700 via-indigo-850 to-indigo-905 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden gap-4">
        {/* Background decorative shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full -ml-10 -mb-10 blur-xl pointer-events-none"></div>

        <div className="z-10 space-y-2.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="bg-white/10 text-white border border-white/20 text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Sukasari Citizen Hub (Masyarakat)
            </span>
            <span className="bg-amber-400 text-slate-900 text-[10px] font-black font-mono px-2.5 py-0.5 rounded uppercase tracking-wider">
              RT {myResidentInfo?.rt || '01'} / RW {myResidentInfo?.rw || '04'}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-black font-mono tracking-wide leading-tight animate-fade">
            Sampurasun, {myResidentInfo?.nama || 'Warga Sukamaju'}!
          </h2>
          <p className="text-[11px] sm:text-xs text-indigo-100 font-medium leading-relaxed">
            Selamat datang di Portal Digital mandiri Anda. Ajukan keperluan surat administrasi, laporkan infrastruktur jalan berlubang, atau manfaatkan asisten pintar kami untuk konsultasi 24 jam.
          </p>
        </div>
        
        <div className="flex flex-col items-start md:items-end z-10 shrink-0 select-none bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md font-mono w-full md:w-auto">
          <span className="text-xs text-indigo-200 uppercase tracking-widest block mb-0.5 font-bold">Wilayah Domisili</span>
          <span className="text-lg sm:text-xl font-black text-amber-300">RT {myResidentInfo?.rt || '01'} / RW {myResidentInfo?.rw || '04'}</span>
          <span className="text-[10px] text-indigo-100 font-semibold">Dusun Paseh Lama, Sukamaju</span>
        </div>
      </div>

      {/* QUICK ASSISTANT FLOATER DECORATION Banner */}
      <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md animate-fade">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <Sparkles className="animate-pulse text-amber-500" size={20} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-indigo-900 leading-snug">Butuh Bimbingan Berkas Kependudukan?</h4>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-mono">Konsultasi interaktif gratis dengan bot SukaAsisten (Gemini AI)</p>
          </div>
        </div>
        <button
          id="warga-chat-ai-trigger"
          onClick={openAiAssistant}
          className="w-full md:w-auto px-5 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer select-none"
        >
          <span>Mulai Chat SukaAsisten</span>
          <ArrowRight size={14} className="shrink-0" />
        </button>
      </div>

      {/* PERSONAL RESIDENT CITIZEN CARD REGISTER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-fade">
        
        {/* KK / KTP Register Info card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm lg:col-span-1 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <User size={15} className="text-indigo-600" />
              <span>Identifikasi KTP Anda</span>
            </h3>
            <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-md text-[9px] font-black font-mono">TERVERIFIKASI</span>
          </div>

          <div className="space-y-3">
            {/* NIK with interactive Copy */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-2 hover:border-slate-200 transition-all">
              <div className="min-w-0 flex-1">
                <span className="text-[8.5px] text-slate-400 block uppercase font-mono tracking-wider font-extrabold">No. Induk Kependudukan (NIK)</span>
                <b className="font-mono text-slate-800 text-[11px] sm:text-xs select-all block mt-0.5 break-all leading-none">{myResidentInfo?.nik}</b>
              </div>
              <button 
                onClick={() => handleCopy(myResidentInfo?.nik || '', 'nik')}
                className="p-2 text-slate-500 hover:text-indigo-600 active:scale-90 hover:bg-indigo-50 rounded-lg transition-all shrink-0 cursor-pointer"
                title="Salin NIK ke Clipboard"
              >
                {copiedField === 'nik' ? (
                  <Check size={13} className="text-emerald-600 animate-bounce" />
                ) : (
                  <Copy size={13} />
                )}
              </button>
            </div>

            {/* KK with interactive Copy */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-2 hover:border-slate-200 transition-all">
              <div className="min-w-0 flex-1">
                <span className="text-[8.5px] text-slate-400 block uppercase font-mono tracking-wider font-extrabold">No. Kartu Keluarga (KK)</span>
                <b className="font-mono text-slate-800 text-[11px] sm:text-xs select-all block mt-0.5 break-all leading-none">{myResidentInfo?.noKK}</b>
              </div>
              <button 
                onClick={() => handleCopy(myResidentInfo?.noKK || '', 'kk')}
                className="p-2 text-slate-500 hover:text-indigo-600 active:scale-90 hover:bg-indigo-50 rounded-lg transition-all shrink-0 cursor-pointer"
                title="Salin KK ke Clipboard"
              >
                {copiedField === 'kk' ? (
                  <Check size={13} className="text-emerald-600 animate-bounce" />
                ) : (
                  <Copy size={13} />
                )}
              </button>
            </div>

            {/* Detail Grid */}
            <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
              <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 flex flex-col justify-between">
                <span className="text-slate-400 block uppercase font-mono text-[8px] font-bold">Pekerjaan</span>
                <b className="text-slate-700 block truncate mt-0.5">{myResidentInfo?.pekerjaan}</b>
              </div>
              <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 flex flex-col justify-between">
                <span className="text-slate-400 block uppercase font-mono text-[8px] font-bold">Status Hubungan</span>
                <b className="text-slate-700 block truncate mt-0.5">{myResidentInfo?.statusPerkawinan}</b>
              </div>
              <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 flex flex-col justify-between">
                <span className="text-slate-400 block uppercase font-mono text-[8px] font-bold">Bantuan Bansos</span>
                <b className="text-blue-700 block truncate mt-0.5 font-bold">{myResidentInfo?.statusBansos}</b>
              </div>
              <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 flex flex-col justify-between">
                <span className="text-slate-400 block uppercase font-mono text-[8px] font-bold">Tipe Kependudukan</span>
                <b className="text-emerald-600 block truncate mt-0.5 font-bold">{myResidentInfo?.statusPenduduk}</b>
              </div>
            </div>
          </div>
        </div>

        {/* CITIZEN SUBMITTED SERVICES LIST */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm lg:col-span-2 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider flex items-center gap-2">
              <FileCheck size={15} className="text-indigo-600" />
              <span>Pelacakan Status Berkas Kuasa Anda ({myLetters.length})</span>
            </h3>
            <button 
              id="warga-req-letter-btn" 
              onClick={() => onNavigate('surat')}
              className="text-[11px] text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 rounded-lg font-bold uppercase transition-all duration-150 flex items-center justify-center gap-1 active:scale-95 text-center cursor-pointer font-sans shadow-sm w-full sm:w-auto"
            >
              + Ajukan Blangko Baru
            </button>
          </div>

          <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
            {myLetters.length > 0 ? (
              myLetters.map((letItem) => (
                <div key={letItem.id} className="p-3.5 bg-slate-50/70 hover:bg-slate-50 hover:shadow-xs rounded-xl border border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all">
                  <div className="flex items-start gap-2.5">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      letItem.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {letItem.status === 'Selesai' ? <FileCheck size={16} /> : <Clock size={16} />}
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 block tracking-wider uppercase">{letItem.letterNumber}</span>
                      <h4 className="text-xs font-extrabold text-indigo-950 leading-tight block mt-0.5">{letItem.type}</h4>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                          letItem.rtApproval ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <span>RT: {letItem.rtApproval ? '✔ Disetujui' : '⌛ Menunggu'}</span>
                        </span>
                        <span className="text-[9px] text-slate-300 font-mono">|</span>
                        <span className="text-[9px] text-slate-500 font-sans">Sandi RT: RT {myResidentInfo?.rt || '01'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="self-start sm:self-auto shrink-0 font-mono">
                    <span className={`px-2.5 py-1 text-[9.5px] font-black tracking-wider uppercase inline-block rounded-full border ${
                      letItem.status === 'Selesai' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                     }`}>
                      {letItem.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs italic bg-slate-50/40 rounded-xl border border-dashed border-slate-200">
                Anda belum mengajukan blangko surat apapun tahun ini.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DETAILED EMERGENCY & GENERAL ANNOUNCEMENTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade">
        
        {/* Left col: My complaints */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Heart size={14} className="text-rose-500" />
              <span>Keluhan / Aspirasi Anda ({myComplaints.length})</span>
            </h3>
            <button 
              onClick={() => onNavigate('pengaduan')} 
              className="text-[11px] text-amber-600 hover:text-amber-700 active:scale-95 transition-all font-bold uppercase cursor-pointer"
            >
              Laporkan Masalah +
            </button>
          </div>

          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {myComplaints.length > 0 ? (
              myComplaints.map((comp) => (
                <div key={comp.id} className="p-3.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-150 rounded-xl text-xs flex flex-col gap-2 transition-all">
                  <div className="flex justify-between items-center text-[9px] font-mono">
                    <span className="bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                      {comp.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-black tracking-wider uppercase border text-[8.5px] ${
                      comp.status === 'Selesai' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-250'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-250'
                    }`}>
                      {comp.status}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 leading-snug">{comp.title}</h4>
                  
                  {comp.response ? (
                    <div className="text-[10px] text-indigo-900 bg-indigo-50/45 p-2.5 rounded-lg border border-indigo-100/60 font-mono leading-relaxed space-y-1">
                      <div className="flex items-center gap-1 font-bold text-indigo-950">
                        <FileText size={11} className="text-indigo-600" />
                        <span>TANGGAPAN ADMIN :</span>
                      </div>
                      <p className="text-indigo-800 font-sans mt-0.5 leading-relaxed">{comp.response}</p>
                    </div>
                  ) : (
                    <div className="text-[9px] text-slate-400 italic flex items-center gap-1 pt-1 border-t border-slate-200/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                      <span>Menunggu koordinasi / tanggapan Balai Desa...</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs italic bg-slate-50/40 rounded-xl border border-dashed border-slate-200">
                Anda belum mengirimkan laporan keluhan publik apapun.
              </div>
            )}
          </div>
        </div>

        {/* Right col: Dial Emergency numbers */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <PhoneCall size={14} className="text-rose-500" />
              <span>Nomor Darurat &amp; Siaga Bencana Dusun</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <a 
              href="tel:081244022300"
              className="p-3 bg-rose-50 hover:bg-rose-100/70 border border-rose-100 rounded-xl flex flex-col gap-0.5 transition-all text-left hover:scale-[1.01] cursor-pointer"
            >
              <span className="text-[9px] text-rose-500 font-bold uppercase font-mono">Ambulans Desa Siaga</span>
              <b className="font-mono text-rose-800 text-[11.5px] sm:text-xs">0812-4402-2300</b>
              <span className="text-[8px] text-rose-450 font-mono mt-0.5 flex items-center gap-1 font-semibold">📞 Hubungi Langsung</span>
            </a>
            <a 
              href="tel:085322014433"
              className="p-3 bg-blue-50 hover:bg-blue-100/70 border border-blue-100 rounded-xl flex flex-col gap-0.5 transition-all text-left hover:scale-[1.01] cursor-pointer"
            >
              <span className="text-[9px] text-blue-600 font-bold uppercase font-mono">Babinkamtibmas</span>
              <b className="font-mono text-blue-800 text-[11.5px] sm:text-xs">0853-2201-4433</b>
              <span className="text-[8px] text-blue-450 font-mono mt-0.5 flex items-center gap-1 font-semibold">📞 Hubungi Langsung</span>
            </a>
            <a 
              href="tel:0811340991"
              className="p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl flex flex-col gap-0.5 transition-all text-left hover:scale-[1.01] cursor-pointer"
            >
              <span className="text-[9px] text-slate-500 font-bold uppercase font-mono">Kantor Damkar Kab.</span>
              <b className="font-mono text-slate-800 text-[11.5px] sm:text-xs">0811-340-991</b>
              <span className="text-[8px] text-slate-450 font-mono mt-0.5 flex items-center gap-1 font-semibold">📞 Hubungi Langsung</span>
            </a>
            <a 
              href="tel:089833412290"
              className="p-3 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-100 rounded-xl flex flex-col gap-0.5 transition-all text-left hover:scale-[1.01] cursor-pointer"
            >
              <span className="text-[9px] text-emerald-600 font-bold uppercase font-mono">Layanan Air PAM Desa</span>
              <b className="font-mono text-emerald-800 text-[11.5px] sm:text-xs">0898-3341-2290</b>
              <span className="text-[8px] text-emerald-450 font-mono mt-0.5 flex items-center gap-1 font-semibold">📞 Hubungi Langsung</span>
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
