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
  Navigation
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

  return (
    <div id="warga-portal-panel" className="space-y-4 animate-fade">
      
      {/* Banner greetings */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-xl p-5 shadow-md flex justify-between items-center relative overflow-hidden">
        <div className="z-10 space-y-1.5">
          <span className="bg-white/10 text-white border border-white/20 text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Sukasari Citizen Hub (Masyarakat)
          </span>
          <h2 className="text-base font-extrabold font-mono tracking-wide">
            Sampurasun, {myResidentInfo?.nama || 'Warga Sukamaju'}!
          </h2>
          <p className="text-[11px] text-indigo-100 font-medium max-w-md">
            Selamat datang di Portal Digital mandiri Anda. Ajukan keperluan surat administrasi, laporkan infrastruktur jalan berlubang, atau manfaatkan asisten pintar kami.
          </p>
        </div>
        <div className="hidden md:flex flex-col items-end z-10 shrink-0 select-none">
          <span className="text-xl font-bold font-mono text-amber-300">RT {myResidentInfo?.rt || '01'} / RW {myResidentInfo?.rw || '04'}</span>
          <span className="text-[10px] text-indigo-200">Dusun Paseh Lama, Sukamaju</span>
        </div>
      </div>

      {/* QUICK ASSISTANT FLOATER DECORATION Banner */}
      <div className="bg-white rounded-xl border border-blue-150 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <Sparkles className="animate-pulse text-amber-500" size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-indigo-900 leading-none">Butuh Bimbingan Berkas Kependudukan?</h4>
            <p className="text-[10px] text-slate-500 mt-0.5 font-mono">Konsultasi interaktif gratis dengan bot SukaAsisten (Gemini AI)</p>
          </div>
        </div>
        <button
          id="warga-chat-ai-trigger"
          onClick={openAiAssistant}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center space-x-1"
        >
          <span>Chat dengan Asisten AI</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* PERSONAL RESIDENT CITIZEN CARD REGISTER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* KK / KTP Register Info card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm lg:col-span-1 space-y-3.5">
          <div className="border-b pb-2 mb-1 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">Identifikasi KTP Anda</h3>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded text-[9px] font-bold font-mono">TERVERIFIKASI</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2 bg-slate-50 rounded">
              <span className="text-[9px] text-slate-400 block uppercase font-mono">No. Induk Kependudukan (NIK)</span>
              <b className="font-mono text-slate-800 text-[11px]">{myResidentInfo?.nik}</b>
            </div>
            <div className="p-2 bg-slate-50 rounded">
              <span className="text-[9px] text-slate-400 block uppercase font-mono">No. Kartu Keluarga (KK)</span>
              <b className="font-mono text-slate-800 text-[11px]">{myResidentInfo?.noKK}</b>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-slate-400 block uppercase font-mono">Pekerjaan</span>
                <b className="text-slate-700">{myResidentInfo?.pekerjaan}</b>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-mono">Status Kawin</span>
                <b className="text-slate-700">{myResidentInfo?.statusPerkawinan}</b>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-mono">Bantuan Bansos</span>
                <b className="text-blue-700">{myResidentInfo?.statusBansos}</b>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-mono">Status Kependudukan</span>
                <b className="text-emerald-600">{myResidentInfo?.statusPenduduk}</b>
              </div>
            </div>
          </div>
        </div>

        {/* CITIZEN SUBMITTED SERVICES LIST */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm lg:col-span-2 space-y-4">
          <div className="border-b border-slate-100 pb-2 mb-1 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">
              Pelacakan Status Berkas Kuasa Anda ({myLetters.length})
            </h3>
            <button 
              id="warga-req-letter-btn" 
              onClick={() => onNavigate('surat')}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-bold uppercase"
            >
              Ajukan Blangko Baru
            </button>
          </div>

          <div className="space-y-3.5 max-h-[220px] overflow-y-auto">
            {myLetters.length > 0 ? (
              myLetters.map((letItem) => (
                <div key={letItem.id} className="p-3 bg-slate-50 rounded-lg border border-slate-150 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-slate-400 block">{letItem.letterNumber}</span>
                    <h4 className="text-xs font-extrabold text-indigo-950 leading-tight">{letItem.type}</h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Pengantar RT: {letItem.rtApproval ? '✔ DISETUJUI' : '⌛ MENUNGGU'}</p>
                  </div>
                  <div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wider uppercase inline-block ${
                      letItem.status === 'Selesai' 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {letItem.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                Anda belum mengajukan blangko surat apapun tahun ini.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DETAILED EMERGENCY & GENERAL ANNOUNCEMENTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Left col: My complaints */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2 mb-1 flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">Keluhan / Aspirasi Anda ({myComplaints.length})</h3>
            <button onClick={() => onNavigate('pengaduan')} className="text-[11px] text-amber-600 hover:text-amber-700 font-bold uppercase transition-colors">Laporkan Masalah</button>
          </div>

          <div className="space-y-3 max-h-[160px] overflow-y-auto">
            {myComplaints.length > 0 ? (
              myComplaints.map((comp) => (
                <div key={comp.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono">
                    <span>{comp.category}</span>
                    <span>{comp.status}</span>
                  </div>
                  <h4 className="font-extrabold text-slate-800">{comp.title}</h4>
                  {comp.response ? (
                    <p className="text-[10px] text-blue-700 bg-blue-50 p-1.5 rounded-md mt-1 border border-blue-100 font-mono">
                      <b>Balasan :</b> {comp.response}
                    </p>
                  ) : (
                    <span className="text-[9.5px] text-slate-400 italic">Menunggu tanggapan Balai Desa...</span>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                Anda belum mengirimkan laporan keluhan publik apapun.
              </div>
            )}
          </div>
        </div>

        {/* Right col: Dial Emergency numbers */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3.5">
          <div className="border-b border-slate-100 pb-2 mb-1">
            <h3 className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">Nomor Darurat & Siaga Bencana Dusun</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-rose-50 border border-rose-100 rounded-lg flex flex-col gap-0.5">
              <span className="text-[9px] text-rose-500 font-bold uppercase font-mono">Ambulans Desa Siaga</span>
              <b className="font-mono text-rose-800">0812-4402-2300</b>
            </div>
            <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg flex flex-col gap-0.5">
              <span className="text-[9px] text-blue-600 font-bold uppercase font-mono">Babinkamtibmas</span>
              <b className="font-mono text-blue-800">0853-2201-4433</b>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-0.5">
              <span className="text-[9px] text-slate-500 font-bold uppercase font-mono">Kantor Damkar Kab.</span>
              <b className="font-mono text-slate-800">0811-340-991</b>
            </div>
            <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg flex flex-col gap-0.5">
              <span className="text-[9px] text-emerald-600 font-bold uppercase font-mono">Layanan Air PAM Desa</span>
              <b className="font-mono text-emerald-800">0898-3341-2290</b>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
