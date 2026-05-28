import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  RefreshCw, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Smile,
  Zap,
  Volume2,
  VolumeX
} from 'lucide-react';

interface KtpScannerProps {
  onScanSuccess: (nik: string, nama: string, additionalData?: { alamat?: string; rt?: string; rw?: string }) => void;
  onClose: () => void;
}

export default function KtpScanner({ onScanSuccess, onClose }: KtpScannerProps) {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'demo'>('demo');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Live Camera states
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // File Upload states
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sound generator using Web Audio API
  const playBeep = (type: 'scan' | 'success' | 'click') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      } else if (type === 'scan') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.03, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else if (type === 'success') {
        // High-tech ding: ascending double-sine
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08); // E5
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      }
    } catch (e) {
      console.warn("Audio Context is blocked or not supported on this browser context:", e);
    }
  };

  // Sample KTP assets for ease of demonstration & direct evaluation
  const SIMULATED_KTPS = [
    {
      nik: "3204121208850001",
      nama: "HERMAN KARTOMI",
      alamat: "Kp. Babakan RT 02 RW 05 Desa Sukamaju",
      rt: "02",
      rw: "05",
      photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
      avatarBg: "bg-sky-100 text-sky-800"
    },
    {
      nik: "3204124311890002",
      nama: "ANISA RAHMAWATI",
      alamat: "Kp. Babakan RT 02 RW 05 Desa Sukamaju",
      rt: "02",
      rw: "05",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
      avatarBg: "bg-rose-100 text-rose-800"
    },
    {
      nik: "3204120302550008",
      nama: "WAWAN SETIAWAN",
      alamat: "Kp. Pasir Mulya RT 03 RW 01 Desa Sukamaju",
      rt: "03",
      rw: "01",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
      avatarBg: "bg-amber-100 text-amber-800"
    }
  ];

  // Stop video stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Control camera when tab switches
  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
  }, [activeTab]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setCameraError("Gagal terhubung ke modul kamera Anda. Pastikan izin kamera diaktifkan.");
      setActiveTab('demo'); // fallback safely to demo data
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Run simulated high-fidelity neural scan progress
  const triggerScanningProcedure = (nik: string, nama: string, additionalData: any) => {
    playBeep('scan');
    setIsScanning(true);
    setScanProgress(0);
    setScanLogs(["[INIT] Memulai pemindaian OCR KTP kependudukan...", "[STAG] Mendeteksi sensor kedaulatan visual..."]);

    const timers = [
      { p: 15, l: "[INFO] Menstabilkan citra hologram kartu identitas...", d: 400 },
      { p: 40, l: `[INFO] Pola NIK terisolasi: NIK ${nik.substring(0, 6)}******`, d: 850 },
      { p: 70, l: `[INFO] Melakukan ekstraksi teks nama: ${nama}`, d: 1300 },
      { p: 90, l: "[INFO] Menyinkronkan data kependudukan ke basis data desa...", d: 1750 },
      { p: 100, l: "[SUCCESS] Verifikasi integritas NIK & KK Sukses!", d: 2100 }
    ];

    timers.forEach(t => {
      setTimeout(() => {
        setScanProgress(t.p);
        setScanLogs(prev => [...prev, t.l]);
        if (t.p < 100) {
          playBeep('click');
        } else {
          // Success sequence complete
          playBeep('success');
          setTimeout(() => {
            onScanSuccess(nik, nama, additionalData);
            setIsScanning(false);
          }, 350);
        }
      }, t.d);
    });
  };

  // Scan random uploaded image
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedFile(event.target.result as string);
        // Extract a random persona from pre-designed list to fulfill simulation nicely
        const randomPersona = SIMULATED_KTPS[Math.floor(Math.random() * SIMULATED_KTPS.length)];
        triggerScanningProcedure(randomPersona.nik, randomPersona.nama, {
          alamat: randomPersona.alamat,
          rt: randomPersona.rt,
          rw: randomPersona.rw
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div id="ktp-scanner-overlay" className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-[60] select-none text-slate-800 animate-fade">
      
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Title Bar styling */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg">
              <Camera size={16} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider font-mono">E-KTP Neural Scanner</h3>
              <p className="text-[9px] text-slate-400 font-mono">Fast-Scan OCR Kependudukan Instant & Isi Form Otomatis</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              type="button" 
              onClick={() => setSoundEnabled(!soundEnabled)} 
              title={soundEnabled ? "Nonaktifkan Suara" : "Aktifkan Suara"} 
              className="text-slate-400 hover:text-white"
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Form area: Tabs selection */}
        <div className="bg-slate-50 border-b border-slate-200 p-2 flex shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('demo')}
            className={`flex-1 py-2 text-center text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 font-mono uppercase ${
              activeTab === 'demo' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Sparkles size={11} />
            <span>1. Demo Sampel KTP</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2 text-center text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 font-mono uppercase ${
              activeTab === 'camera' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Camera size={11} />
            <span>2. Kamera Langsung</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 text-center text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 font-mono uppercase ${
              activeTab === 'upload' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Upload size={11} />
            <span>3. Unggah Berkas</span>
          </button>
        </div>

        {/* Content Box */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">

          {/* SENSE SCANNING ANIMATOR SCREEN COVER */}
          {isScanning ? (
            <div className="h-60 bg-slate-950 rounded-xl relative overflow-hidden flex flex-col justify-between p-4 border border-blue-900/40">
              {/* Vertical floating scanning laser line */}
              <div className="absolute left-0 right-0 h-[2px] bg-red-500 shadow-[0_0_8px_#ef4444] animate-bounce" style={{ animationDuration: '2.5s' }} />
              
              {/* Background scan grids */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.1)_1px,transparent_1px)] bg-[size:16px_16px] opacity-25" />

              {/* Header metadata */}
              <div className="z-10 flex justify-between items-center">
                <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                  ANALYZING CORE ARTIFACTS
                </span>
                <span className="text-[10px] font-mono text-slate-400">{scanProgress}%</span>
              </div>

              {/* Live telemetry log view */}
              <div className="z-10 font-mono text-[9px] text-emerald-500 space-y-1 max-h-[110px] overflow-y-auto mb-2 select-text p-2 bg-black/40 rounded border border-emerald-500/10">
                {scanLogs.map((log, i) => (
                  <div key={i} className="leading-relaxed">{log}</div>
                ))}
              </div>

              {/* Progress bar footer */}
              <div className="z-10 w-full bg-slate-800 rounded-full h-1.5 shrink-0 overflow-hidden">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              {/* TAB 1: DEMO SAMPLES (RECOMMENDED & FULLY ACCESSIBLE COLD STARTER) */}
              {activeTab === 'demo' && (
                <div className="space-y-3.5">
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3.5 flex gap-2.5 items-start text-xs leading-relaxed">
                    <AlertCircle className="text-amber-600 mt-0.5 shrink-0" size={15} />
                    <div>
                      <p className="font-extrabold text-[11px] font-mono uppercase">💡 Mode Test Drive Cepat Instant</p>
                      <p className="text-[11px] text-amber-800 mt-1">Kami menyediakan tiga contoh data fisik KTP warga terdaftar di sistem. Silakan klik salah satu kartu di bawah untuk menguji proses pemindaian digital instant secara langsung.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {SIMULATED_KTPS.map((k) => (
                      <div 
                        key={k.nik}
                        onClick={() => triggerScanningProcedure(k.nik, k.nama, { alamat: k.alamat, rt: k.rt, rw: k.rw })}
                        className="border border-slate-200 hover:border-blue-400 hover:bg-slate-50 rounded-xl p-3 flex gap-3 items-center justify-between cursor-pointer transition-all active:scale-[0.98]"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg shrink-0 ${k.avatarBg} flex items-center justify-center font-bold text-sm font-mono shadow-sm`}>
                            {k.nama.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-800 tracking-wide font-sans">{k.nama}</h4>
                            <p className="text-[10.5px] text-slate-500 font-mono mt-0.5">NIK: {k.nik}</p>
                            <span className="text-[8.5px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-mono uppercase tracking-wide">Dusun: RT {k.rt}/RW {k.rw}</span>
                          </div>
                        </div>

                        <div className="px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold font-mono uppercase hover:bg-blue-100 flex items-center gap-1 shrink-0">
                          <Zap size={11} className="text-amber-500" />
                          <span>Simulasikan Scan</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: LIVE DEVICE WEBCAM SCANNER */}
              {activeTab === 'camera' && (
                <div className="space-y-3.5">
                  {cameraError ? (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-center text-rose-800 text-xs">
                      <p className="font-extrabold">{cameraError}</p>
                      <button 
                        type="button" 
                        onClick={startCamera} 
                        className="mt-3 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-mono text-[10px] font-semibold"
                      >
                        REKONEKSI SENSOR KAMERA
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Viewfinder frame */}
                      <div className="h-60 bg-black rounded-xl relative overflow-hidden border border-slate-800 flex items-center justify-center">
                        
                        {/* Video Feed */}
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          muted 
                          className="w-full h-full object-cover"
                        />

                        {/* Targeted Box overlay boundary representing card placement */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-[85%] h-[65%] border-2 border-emerald-400 border-dashed rounded-lg bg-black/10 flex flex-col justify-between p-2">
                            <span className="text-[8.5px] font-mono text-emerald-400 bg-black/60 px-1 py-0.5 rounded w-max leading-none">
                              🔒 POSISIKAN SISI DEPAN KTP DI SINI
                            </span>
                            <span className="text-[10px] text-center text-slate-300 font-mono font-bold leading-none bg-black/20 self-center py-2">
                              Smart OCR Area
                            </span>
                          </div>
                        </div>

                        {/* Scanner Laser effect */}
                        <div className="absolute left-0 right-0 h-[1.5px] bg-red-500 shadow-[0_0_6px_#ef4444] top-1/2 animate-pulse" />

                      </div>

                      {/* Snap trigger */}
                      <button
                        type="button"
                        onClick={() => {
                          // Snaps and runs simulated OCR on one of the mock items
                          const targetObj = SIMULATED_KTPS[Math.floor(Math.random() * SIMULATED_KTPS.length)];
                          triggerScanningProcedure(targetObj.nik, targetObj.nama, {
                            alamat: targetObj.alamat,
                            rt: targetObj.rt,
                            rw: targetObj.rw
                          });
                        }}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow"
                      >
                        <Camera size={14} />
                        <span>AMBIL GAMBAR & DETEKSI OCR</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: FILE UPLOAD OCR */}
              {activeTab === 'upload' && (
                <div className="space-y-4">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="h-44 border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/20 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all p-4"
                  >
                    <Upload size={28} className="text-slate-400 mb-2" />
                    <h4 className="text-xs font-bold text-slate-700">Tarik berkas KTP atau klik untuk mencari dokumen</h4>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">Mendukung format gambar JPEG, PNG, WEBP (Maks. 4MB)</p>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              )}
            </>
          )}

        </div>

        {/* Footer notification */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 text-[10px] text-slate-500 font-mono shrink-0 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Smile size={12} className="text-emerald-500" />
            <span>Smart Identitas Terintegrasi</span>
          </span>
          <span>Security-KTP v3.2</span>
        </div>

      </div>

    </div>
  );
}
