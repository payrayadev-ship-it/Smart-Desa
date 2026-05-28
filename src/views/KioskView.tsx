import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  FileText, 
  Monitor, 
  CheckCircle2, 
  Trash2, 
  Printer, 
  Clock, 
  ShieldCheck, 
  Touchpad, 
  Undo,
  Volume2,
  VolumeX,
  Sparkles,
  HelpCircle,
  FileCheck2,
  Ticket,
  ChevronRight,
  Info
} from 'lucide-react';
import { Letter, LetterType, Role, VillageProfile } from '../types';
import KtpScanner from '../components/KtpScanner';
import { LETTER_CATALOG } from '../letterCatalog';

interface KioskViewProps {
  letters: Letter[];
  saveLetters: (letters: Letter[]) => void;
  onLogAction: (action: string, module: string) => void;
  villageProfile: VillageProfile;
}

export default function KioskView({
  letters,
  saveLetters,
  onLogAction,
  villageProfile
}: KioskViewProps) {
  // Navigation steps inside kiosk: 'welcome' | 'select-service' | 'fill-detail' | 'success-print'
  const [kioskStep, setKioskStep] = useState<'welcome' | 'select-service' | 'fill-detail' | 'success-print'>('welcome');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showScanner, setShowScanner] = useState(false);

  // Kiosk User Data
  const [requesterNik, setRequesterNik] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [selectedType, setSelectedType] = useState<LetterType>('Surat Keterangan Domisili');
  const [keperluan, setKeperluan] = useState('');
  const [karcisNo, setKarcisNo] = useState('');
  const [activeTab, setActiveTab2] = useState<'num-pad' | 'manual'>('num-pad');

  // Dynamic state for kiosk categories & custom fields
  const [kioskCat, setKioskCat] = useState<string>('Surat Keterangan');
  const [kioskSearch, setKioskSearch] = useState<string>('');
  const [dynamicFields, setDynamicFields] = useState<Record<string, string>>({});

  const handleKioskTypeSelect = (type: LetterType) => {
    setSelectedType(type);
    const template = LETTER_CATALOG.find(t => t.name === type);
    const initialFields: Record<string, string> = {};
    if (template) {
      template.fields.forEach(f => {
        initialFields[f] = '';
      });
    }
    setDynamicFields(initialFields);
    setKioskStep('fill-detail');
  };

  // Live Timer for Lobby Monitor Display
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Audio synthesize function for arcade/lobby sounds
  const playKioskSound = (type: 'beep' | 'success' | 'click' | 'print') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (type === 'print') {
        // Mock matrix dot printer sound
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
        
        setTimeout(() => {
          const osc2 = audioCtx.createOscillator();
          const gainNode2 = audioCtx.createGain();
          osc2.connect(gainNode2);
          gainNode2.connect(audioCtx.destination);
          osc2.type = 'sawtooth';
          osc2.frequency.setValueAtTime(1200, audioCtx.currentTime);
          gainNode2.gain.setValueAtTime(0.02, audioCtx.currentTime);
          osc2.start();
          osc2.stop(audioCtx.currentTime + 0.08);
        }, 150);
      } else if (type === 'success') {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(261.63, audioCtx.currentTime); // C4
        osc.frequency.setValueAtTime(329.63, audioCtx.currentTime + 0.1); // E4
        osc.frequency.setValueAtTime(392.00, audioCtx.currentTime + 0.2); // G4
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime + 0.3); // C5
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } else if (type === 'click') {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      } else if (type === 'beep') {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(330, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      }
    } catch (e) {
      console.warn("Lobby audio rejected:", e);
    }
  };

  // Virtual Keyboard Input for NIK
  const handleNumPadPress = (num: string) => {
    playKioskSound('click');
    if (requesterNik.length < 16) {
      setRequesterNik(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    playKioskSound('click');
    setRequesterNik(prev => prev.slice(0, -1));
  };

  const handleClearNik = () => {
    playKioskSound('click');
    setRequesterNik('');
  };

  // Submitting Draft to State and generate real ticket queue code
  const handleSubmitKioskLetter = () => {
    // Validate that all required dynamic fields are filled out
    const template = LETTER_CATALOG.find(t => t.name === selectedType);
    if (template) {
      const missingField = template.fields.find(f => !dynamicFields[f]?.trim());
      if (missingField) {
        playKioskSound('beep');
        alert(`Harap lengkapi isian tambahan: ${missingField}!`);
        return;
      }
    }

    if (!requesterNik || !requesterName || !keperluan) {
      playKioskSound('beep');
      alert("Harap lengkapi seluruh data pemohon & deskripsi keperluan dahulu!");
      return;
    }

    const uniqueId = `LTR-${Date.now().toString().slice(-6)}`;
    const randomTicketNo = `A-${Math.floor(100 + Math.random() * 900)}`;

    const newLetterItem: Letter = {
      id: uniqueId,
      letterNumber: `510/${Math.floor(100 + Math.random() * 900)}/PEM/${new Date().getFullYear()}`,
      type: selectedType,
      requesterName: requesterName,
      requesterNik: requesterNik,
      status: 'Diajukan',
      rtApproval: false,
      fields: {
        "Keperluan Warga": keperluan,
        "Diinput Melalui": "Anjungan Kiosk Mandiri Kantor Desa",
        ...dynamicFields
      },
      trackingLogs: [
        {
          status: 'Diajukan',
          date: new Date().toISOString(),
          note: `Registrasi mandiri via Mesin KIOSK Anjungan Mandiri Digital Kantor Kepala ${villageProfile.name}.`
        }
      ],
      createdAt: new Date().toISOString()
    };

    const updatedLetters = [newLetterItem, ...letters];
    saveLetters(updatedLetters);
    setKarcisNo(randomTicketNo);
    onLogAction(`Warga ${requesterName} mengajukan surat ${selectedType} via Kiosk`, 'Surat_Kiosk');
    
    playKioskSound('success');
    setKioskStep('success-print');
  };

  // Quick reset for next user
  const handleResetKiosk = () => {
    playKioskSound('beep');
    setRequesterNik('');
    setRequesterName('');
    setKeperluan('');
    setKioskSearch('');
    setDynamicFields({});
    setKioskStep('welcome');
  };

  // Auto trigger printer simulator
  const handlePrintTrigger = () => {
    playKioskSound('print');
    setTimeout(() => playKioskSound('print'), 150);
    setTimeout(() => playKioskSound('print'), 300);
    
    // Actually trigger browser print window for the paper card element if desired
    const printContent = document.getElementById("kiosk-printed-ticket");
    if (!printContent) return;

    const printWin = window.open('', '', 'width=400,height=550');
    if (printWin) {
      printWin.document.write(`
        <html>
          <head>
            <title>KiosK Ticket: ${karcisNo}</title>
            <style>
              body { font-family: 'Courier New', Courier, monospace; text-align: center; color: #000; padding: 25px; line-height: 1.4; font-size: 13px; }
              .header { border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 15px; }
              .logo-txt { font-weight: bold; font-size: 16px; margin: 0; text-transform: uppercase; }
              .sub-logo { font-size: 11px; margin: 3px 0; }
              .ticket-no { font-size: 32px; font-weight: bold; margin: 15px 0; border: 1px solid black; display: inline-block; padding: 5px 20px; }
              .info-tbl { text-align: left; width: 100%; margin: 15px 0; font-size: 11px; }
              .info-tbl td { padding: 3px 0; }
              .footer { border-top: 2px dashed #000; padding-top: 10px; margin-top: 15px; font-size: 11px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2 class="logo-txt">KANTOR KEPALA ${villageProfile.name.toUpperCase()}</h2>
              <p class="sub-logo">Sistem Informasi Anjungan Kiosk Mandiri</p>
              <p style="font-size: 9px; margin: 0;">${villageProfile.address}</p>
            </div>
            <p style="font-weight: bold; text-transform: uppercase;">KARCIS ANTRIAN SELESAI KIRIM</p>
            <div class="ticket-no">${karcisNo}</div>
            <table class="info-tbl">
              <tr><td>WAKTU DRAFT</td><td>: ${new Date().toLocaleTimeString('id-ID')}</td></tr>
              <tr><td>NIK WARGA</td><td>: ${requesterNik}</td></tr>
              <tr><td>NAMA WARGA</td><td>: ${requesterName}</td></tr>
              <tr><td>JENIS LAYANAN</td><td>: ${selectedType}</td></tr>
            </table>
            <p style="font-size: 10px; font-style: italic;">Simpan nomor karcis ini sebagai alat bukti pengambilan berkas fisik di loket pelayanan administrasi desa.</p>
            <div class="footer">
              <p>Terima Kasih Atas Partisipasi Anda</p>
              <p>#SmartDesaMandiriDigital</p>
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWin.document.close();
    }
  };

  return (
    <div id="lobby-kiosk-view" className="bg-slate-900 border border-slate-950 text-white p-4 sm:p-6 lg:p-8 rounded-3xl shadow-2xl relative overflow-hidden animate-fade max-w-7xl mx-auto flex flex-col gap-6 select-none">
      
      {/* Dynamic scan glowing ambient background lights */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Lobby Kiosk top layout header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-slate-950/60 p-5 rounded-2xl border border-slate-800 gap-4 shrink-0 shadow-lg">
        <div className="flex items-center space-x-4">
          {villageProfile.logoUrl ? (
            <img 
              src={villageProfile.logoUrl} 
              className="w-12 h-12 bg-white p-1 rounded-xl object-contain shadow-md shadow-blue-500/10" 
              alt="Logo Pemda"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-lg">
              SD
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black tracking-widest text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 font-mono animate-pulse">● LIVE INTERACTIVE</span>
              <h1 className="text-sm font-black tracking-wide bg-gradient-to-r from-blue-400 to-indigo-200 bg-clip-text text-transparent uppercase font-mono">ANJUNGAN MANDIRI KIOSK DESA</h1>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">Sistem Layar Monitor Sentuh Pembuatan Surat Warga Kantor {villageProfile.name}</p>
          </div>
        </div>

        {/* Lobby Watch & Sound toggles */}
        <div className="flex items-center space-x-4">
          <button 
            type="button" 
            onClick={() => setSoundEnabled(!soundEnabled)} 
            className="p-2.5 bg-slate-800/80 hover:bg-slate-700/80 hover:text-white text-slate-300 rounded-xl border border-slate-700 font-mono text-xs flex items-center gap-1.5 transition-all"
          >
            {soundEnabled ? (
              <>
                <Volume2 size={15} className="text-emerald-400 animate-bounce" />
                <span>Audio Aktif</span>
              </>
            ) : (
              <>
                <VolumeX size={15} className="text-rose-400" />
                <span>Audio Senyap</span>
              </>
            )}
          </button>

          <div className="flex items-center space-x-1.5 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 text-slate-200 font-mono text-xs">
            <Clock size={14} className="text-sky-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>{currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB</span>
          </div>
        </div>
      </div>

      {/* Main double column Workspace GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: STEP NAVIGATION GUIDE & REALTIME TICKET STREAM */}
        <div className="lg:col-span-4 flex flex-col gap-5 justify-between">
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 shadow-md">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 font-mono mb-4 flex items-center gap-1.5">
              <Touchpad size={13} className="text-blue-400" />
              <span>Petunjuk Alur Penggunaan</span>
            </h3>

            {/* Vertical high visual map indicator */}
            <div className="space-y-4 relative">
              <div className="absolute left-4 top-1 bottom-1 w-0.5 bg-slate-800 z-0" />

              <div className="flex items-center space-x-3.5 relative z-10">
                <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center font-bold text-xs font-mono border ${
                  kioskStep === 'welcome' 
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30 font-black scale-110' 
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}>
                  1
                </div>
                <div>
                  <h4 className={`text-xs font-bold leading-tight ${kioskStep === 'welcome' ? 'text-blue-300' : 'text-slate-400'}`}>Masukkan KTP / NIK</h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Identifikasi kualifikasi warga</p>
                </div>
              </div>

              <div className="flex items-center space-x-3.5 relative z-10">
                <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center font-bold text-xs font-mono border ${
                  kioskStep === 'select-service' 
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30' 
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}>
                  2
                </div>
                <div>
                  <h4 className={`text-xs font-bold leading-tight ${kioskStep === 'select-service' ? 'text-blue-300' : 'text-slate-400'}`}>Pilih Layanan Surat</h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Pilih blangko yang Anda butuhkan</p>
                </div>
              </div>

              <div className="flex items-center space-x-3.5 relative z-10">
                <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center font-bold text-xs font-mono border ${
                  kioskStep === 'fill-detail' 
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30' 
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}>
                  3
                </div>
                <div>
                  <h4 className={`text-xs font-bold leading-tight ${kioskStep === 'fill-detail' ? 'text-blue-300' : 'text-slate-400'}`}>Lengkapi Keterangan</h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Ketik keperluan surat menyurat</p>
                </div>
              </div>

              <div className="flex items-center space-x-3.5 relative z-10">
                <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center font-bold text-xs font-mono border ${
                  kioskStep === 'success-print' 
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30' 
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}>
                  4
                </div>
                <div>
                  <h4 className={`text-xs font-bold leading-tight ${kioskStep === 'success-print' ? 'text-blue-300' : 'text-slate-400'}`}>Cetak Karcis Mandiri</h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Selesai terkirim ke server Desa</p>
                </div>
              </div>
            </div>
          </div>

          {/* REALTIME LOBBY BROADCAST STATS SECTION */}
          <div className="bg-slate-950/45 p-4 rounded-2xl border border-slate-800/80 flex flex-col justify-between flex-grow shadow-inner">
            <div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                <span className="text-[10px] font-black tracking-wider text-slate-400 font-mono uppercase flex items-center gap-1">
                  <span className="w-1 px-1 h-3 bg-blue-500 inline-block rounded" />
                  Papan Informasi Antrean Baru
                </span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-900">AKTIF</span>
              </div>

              {/* Dynamic scroll indicator of last 3 files processed */}
              <div className="space-y-2 max-h-[160px] overflow-y-auto">
                {letters.slice(0, 3).map((l, i) => (
                  <div key={l.id} className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl flex justify-between items-center gap-2">
                    <div className="truncate">
                      <p className="text-[11px] font-bold text-slate-200 truncate">{l.requesterName}</p>
                      <p className="text-[9px] font-mono text-blue-400 truncate">{l.type}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-[8.5px] px-1.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono uppercase">Diajukan</span>
                      <p className="text-[8px] text-slate-500 font-mono mt-0.5">{new Date(l.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-3 text-[10px] text-slate-400 mt-4 leading-normal flex items-start gap-1.5 font-mono">
              <Info className="text-amber-500 shrink-0 mt-0.5" size={13} />
              <span>Jika tidak membawa E-KTP fisik, warga tetap bisa melakukan pengetikan manual melalui tombol keyboard di layar monitor ini.</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MAIN INTERACTIVE CANVAS AREA WHICH EVOLVES STEP BY STEP */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 shadow-2xl rounded-2xl flex flex-col justify-between overflow-hidden relative">

          {/* STEP 1: WELCOME SCREEN (ENTER NIK OR CHOOSE SCAN CAMERA) */}
          {kioskStep === 'welcome' && (
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between transition-all duration-300">
              <div className="text-center py-6">
                <div className="inline-flex justify-center items-center p-3 bg-blue-600/10 text-blue-400 border border-blue-900/30 rounded-full mb-3.5 shadow-inner">
                  <Touchpad size={32} className="animate-bounce" />
                </div>
                <h2 className="text-lg font-black tracking-wide font-mono bg-gradient-to-r from-blue-400 via-indigo-200 to-sky-300 bg-clip-text text-transparent uppercase">Selamat Datang di Kantor Desa</h2>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">Silakan identifikasi diri Anda dengan memindai E-KTP atau input NIK manual untuk meluncurkan sistem administrasi cepat.</p>
              </div>

              {/* INPUT CONTAINER */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch my-2">
                
                {/* 1A: FAST SCAN CAM TRIGGER */}
                <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl text-center flex flex-col justify-between gap-4">
                  <div>
                    <span className="text-[9px] px-2 py-0.5 bg-blue-900/40 border border-blue-800 rounded font-mono font-bold text-blue-300 tracking-wider">REKOMENDASI</span>
                    <h3 className="text-xs font-black uppercase text-slate-200 mt-2.5">Opsi A: Scan E-KTP Cepat</h3>
                    <p className="text-[10.5px] text-slate-400 leading-normal mt-1">Gunakan sensor camera optical OCR atau dummy data KTP warga secara instant.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playKioskSound('click');
                      setShowScanner(true);
                    }}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-blue-600/20"
                  >
                    <Camera size={16} />
                    <span>LUNCURKAN SENSOR KAMERA</span>
                  </button>
                </div>

                {/* 1B: VIRTUAL NUMPAD ENTERING */}
                <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-black uppercase text-slate-200 tracking-wide">Opsi B: Ketik NIK Manual</h3>
                    <p className="text-[10.5px] text-slate-400 leading-normal mt-0.5">Input nomor induk kependudukan di keyboard sentuh.</p>
                    
                    {/* Visual entry line */}
                    <div className="bg-black border border-slate-800 text-center font-mono text-base font-black tracking-[0.2em] text-emerald-400 py-3 rounded-xl mt-3 overflow-hidden shadow-inner flex items-center justify-center">
                      {requesterNik || <span className="text-slate-600 font-sans tracking-normal text-xs font-normal">Ketik 16 Digit NIK</span>}
                    </div>
                  </div>

                  {/* High visual mini pad keys */}
                  <div className="space-y-1.5 select-none">
                    <div className="grid grid-cols-3 gap-1.5">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => handleNumPadPress(n)}
                          className="py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white rounded-lg border border-slate-800 hover:border-slate-700 font-mono text-sm font-black transition-all active:scale-95"
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={handleBackspace}
                        className="py-2.5 bg-slate-950 text-amber-500 hover:bg-slate-800 rounded-lg border border-slate-800 text-xs font-black uppercase font-mono"
                      >
                        BACK
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNumPadPress('0')}
                        className="py-2.5 bg-slate-950 text-slate-200 hover:bg-slate-800 rounded-lg border border-slate-800 font-mono text-sm font-black"
                      >
                        0
                      </button>
                      <button
                        type="button"
                        onClick={handleClearNik}
                        className="py-2.5 bg-slate-950 text-rose-500 hover:bg-slate-800 rounded-lg border border-slate-800 text-xs font-black uppercase font-mono"
                      >
                        CLEAR
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* NEXT SWITCH */}
              <div className="border-t border-slate-800 p-4 mt-2 flex justify-end">
                <button
                  type="button"
                  disabled={requesterNik.length < 16}
                  onClick={() => {
                    playKioskSound('success');
                    // Autofill name based on NIK if available in sample profile KTPs
                    if (requesterNik === '3204121208850001') {
                      setRequesterName('HERMAN KARTOMI');
                    } else if (requesterNik === '3204124311890002') {
                      setRequesterName('ANISA RAHMAWATI');
                    } else if (requesterNik === '3204120302550008') {
                      setRequesterName('WAWAN SETIAWAN');
                    } else {
                      setRequesterName('Warga Sukamaju Mandiri');
                    }
                    setKioskStep('select-service');
                  }}
                  className={`px-6 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow uppercase font-mono ${
                    requesterNik.length === 16 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 animate-pulse' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <span>Langkah Berikutnya</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: LAYANAN SELECT GRID */}
          {kioskStep === 'select-service' && (
            <div className="p-6 sm:p-8 flex-grow flex flex-col justify-between transition-all duration-300">
              <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[9px] text-blue-400 font-mono font-medium">IDENTITAS TERVERIFIKASI IN LINE</span>
                    <h3 className="text-base font-black text-slate-200 font-sans uppercase">Pilih Menu Pelayanan Surat ({LETTER_CATALOG.length} Surat)</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 bg-slate-900 border border-slate-800 text-emerald-400 rounded-lg font-mono">
                      NIK: {requesterNik}
                    </span>
                  </div>
                </div>

                {/* Tactile Category Tab Selector & Touch Search Box */}
                <div className="space-y-3 mb-4">
                  <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                    {[
                      'Surat Izin',
                      'Surat Keterangan',
                      'Lainnya',
                      'Surat Kuasa & Administrasi'
                    ].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          playKioskSound('click');
                          setKioskCat(cat);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex-grow sm:flex-grow-0 ${
                          kioskCat === cat
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={kioskSearch}
                      onChange={(e) => setKioskSearch(e.target.value)}
                      placeholder='Cari pelayanan surat (Contoh: "pindah", "nikah", "izin suami")...'
                      className="w-full bg-slate-950 text-xs text-white border border-slate-800 rounded-xl pl-4 pr-10 py-2.5 placeholder-slate-500 focus:border-blue-500 font-mono focus:ring-1 focus:ring-blue-500"
                    />
                    {kioskSearch && (
                      <button
                        type="button"
                        onClick={() => setKioskSearch('')}
                        className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 text-xs font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Scrollable 3x3 Grid size */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1 select-none scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                  {(() => {
                    const filtered = LETTER_CATALOG.filter(t => {
                      const matchesCat = t.category === kioskCat;
                      const matchesSearch = t.name.toLowerCase().includes(kioskSearch.toLowerCase()) || 
                                            t.code.toLowerCase().includes(kioskSearch.toLowerCase());
                      return matchesCat && matchesSearch;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="col-span-full text-center py-10 border border-dashed border-slate-800 rounded-xl text-slate-500 font-mono text-xs">
                          Blangko layanan surat "{kioskSearch}" tidak ditemukan di kategori ini.
                        </div>
                      );
                    }

                    return filtered.map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => {
                          playKioskSound('click');
                          handleKioskTypeSelect(item.name);
                        }}
                        className={`p-3 text-left border rounded-xl flex flex-col justify-between gap-1 transition-all active:scale-98 ${
                          selectedType === item.name 
                            ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg' 
                            : 'bg-slate-900 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="p-1 px-1.5 bg-slate-950/80 border border-slate-800 text-[8px] font-black font-mono text-cyan-400 rounded w-max tracking-wide uppercase">
                          {item.code}
                        </div>
                        <div>
                          <h4 className="text-[11px] font-bold text-slate-100 line-clamp-1">{item.name}</h4>
                          <p className="text-[9px] text-slate-500 mt-0.5 leading-tight truncate">Isian: {item.fields.join(', ')}</p>
                        </div>
                      </button>
                    ));
                  })()}
                </div>
              </div>

              {/* Bottom reset / back controls */}
              <div className="border-t border-slate-800 pt-3 mt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => {
                    playKioskSound('beep');
                    setKioskStep('welcome');
                  }}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-all font-mono"
                >
                  <Undo size={12} />
                  <span>KEMBALI KE DEPAN</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DATA DETAIL ENTRY DETAILS */}
          {kioskStep === 'fill-detail' && (
            <div className="p-6 sm:p-8 flex-grow flex flex-col justify-between transition-all duration-300">
              <div>
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[9px] text-emerald-400 font-mono">LANGKAH TERAKHIR FORMULIR</span>
                    <h3 className="text-base font-black text-slate-200 mt-0.5">{selectedType}</h3>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-slate-900 border border-slate-800 text-blue-400 rounded-lg font-mono">
                    NIK: {requesterNik}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Nama Pemohon (Sesuai KTP)</label>
                    <input
                      type="text"
                      value={requesterName}
                      onChange={(e) => setRequesterName(e.target.value)}
                      placeholder="Ketik Nama Lengkap Anda"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-blue-500 transition-all font-semibold font-sans placeholder-slate-600"
                    />
                  </div>

                  {/* Dynamic Fields for chosen template */}
                  {(() => {
                    const template = LETTER_CATALOG.find(t => t.name === selectedType);
                    if (!template || template.fields.length === 0) return null;
                    return (
                      <div className="space-y-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                        <p className="text-[10px] font-bold text-cyan-400 font-mono uppercase tracking-wider">
                          Isian Blangko Tambahan ({template.code})*
                        </p>
                        {template.fields.map((field) => (
                          <div key={field}>
                            <label className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                              {field}*
                            </label>
                            <input
                              type="text"
                              value={dynamicFields[field] || ''}
                              onChange={(e) => setDynamicFields(prev => ({
                                ...prev,
                                [field]: e.target.value
                              }))}
                              placeholder={`Masukkan ${field.toLowerCase()}...`}
                              className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-blue-500 transition-all font-semibold font-sans placeholder-slate-600"
                              required
                            />
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  <div>
                    <label className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Keperluan Khusus Pembuatan Surat*</label>
                    <textarea
                      value={keperluan}
                      onChange={(e) => setKeperluan(e.target.value)}
                      rows={3}
                      placeholder="Contoh: Mengurus pendaftaran siswa baru, administrasi BPJS, lamaran kerja, dsb..."
                      className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-blue-500 transition-all font-sans placeholder-slate-600 leading-relaxed"
                    />
                    <span className="text-[9px] text-slate-500 font-mono mt-1 block font-sans">Silakan rincikan keperluan administrasi Anda secara benar demi kelancaran verifikasi mandiri aparat desa.</span>
                  </div>
                </div>
              </div>

              {/* Bottom submission triggers */}
              <div className="border-t border-slate-800 pt-4 mt-6 flex justify-between items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    playKioskSound('beep');
                    setKioskStep('select-service');
                  }}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <Undo size={12} />
                  <span>KEMBALI</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmitKioskLetter}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-xl text-xs font-black uppercase font-mono tracking-wider flex items-center gap-1.5 shadow"
                >
                  <CheckCircle2 size={13} />
                  <span>KIRIM & BUAT SURAT</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS DOCUMENT PRINT SIMULATION SCREEN */}
          {kioskStep === 'success-print' && (
            <div className="p-6 sm:p-8 flex-grow flex flex-col justify-between items-center text-center transition-all duration-300">
              <div className="space-y-3.5 my-auto">
                <div className="inline-flex justify-center items-center p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-950 rounded-full">
                  <CheckCircle2 size={40} className="animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-emerald-400 tracking-wide font-mono uppercase">SURAT BERHASIL REGISTERED!</h2>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-normal">Permohonan administrasi Anda sudah masuk unit server antrean administrasi kantor {villageProfile.name}.</p>
                </div>

                {/* VISUAL PAPER RECEIPT TICKET COIN */}
                <div 
                  id="kiosk-printed-ticket" 
                  className="bg-white text-slate-900 p-5 rounded-lg border-2 border-slate-200 border-dashed max-w-[280px] mx-auto text-left leading-relaxed font-mono text-xs select-text shadow-xl"
                >
                  <div className="text-center border-b border-slate-300 pb-2.5 mb-2.5 uppercase">
                    <h4 className="font-extrabold text-[12px] whitespace-nowrap overflow-hidden text-ellipsis leading-tight">{villageProfile.name} KIOSK</h4>
                    <p className="text-[9px] text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis">{villageProfile.subdistrict}</p>
                  </div>

                  <p className="font-bold text-center text-[10px] uppercase text-slate-500">KODE TICKET ANTRIAN</p>
                  <h3 className="text-2xl font-black text-center text-slate-900 tracking-wider my-2 border border-slate-400 rounded py-1.5 bg-slate-50">{karcisNo}</h3>

                  <div className="space-y-1 text-[9.5px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">LAYANAN:</span>
                      <span className="font-bold text-right truncate max-w-[130px]">{selectedType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">NAMA:</span>
                      <span className="font-bold truncate max-w-[130px]">{requesterName.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">WAKTU:</span>
                      <span>{currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                    </div>
                  </div>

                  <div className="text-center border-t border-slate-300 pt-2.5 mt-2.5 text-[8px] text-slate-500 leading-normal font-sans">
                    *Tunjukkan struk ini langsung ke petugas pelayanan publik di loket kantor Kepala Desa.
                  </div>
                </div>

                {/* Print button click */}
                <div className="flex gap-3 justify-center">
                  <button
                    type="button"
                    onClick={handlePrintTrigger}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <Printer size={13} />
                    <span>CETAK STRUK KARCIS</span>
                  </button>
                </div>
              </div>

              {/* Bottom reset / restart */}
              <div className="border-t border-slate-800 pt-4 w-full flex justify-center">
                <button
                  type="button"
                  onClick={handleResetKiosk}
                  className="px-6 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 rounded-lg text-xs font-black font-mono tracking-widest uppercase transition-all"
                >
                  ← KEMBALI KE BERANDA SELESAI
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* SCANNER OVERLAY BOUNDS */}
      {showScanner && (
        <KtpScanner 
          onScanSuccess={(nik, name, add) => {
            setRequesterNik(nik);
            setRequesterName(name);
            setKioskStep('select-service');
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}

    </div>
  );
}
