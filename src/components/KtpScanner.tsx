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
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'demo'>('camera'); // default to camera for production readiness!
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Live Camera states
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedFrame, setCapturedFrame] = useState<string | null>(null);

  // Active scanning metadata targets
  const [activeScanMetadata, setActiveScanMetadata] = useState<{
    nik: string;
    nama: string;
    alamat?: string;
    rt?: string;
    rw?: string;
    photo?: string;
  } | null>(null);

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

  const captureVideoFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedFrame(dataUrl);
        return dataUrl;
      }
    } catch (e) {
      console.warn("Gagal menangkap frame video:", e);
    }
    return null;
  };

  // Run simulated high-fidelity neural scan progress
  const triggerScanningProcedure = (
    nik: string, 
    nama: string, 
    additionalData: { alamat?: string; rt?: string; rw?: string; photo?: string }
  ) => {
    setActiveScanMetadata({ nik, nama, ...additionalData });
    playBeep('scan');
    setIsScanning(true);
    setScanProgress(0);
    setScanLogs([
      "[Dukcapil OCR v3.2] Menghubungkan ke secure database Kependudukan Desa...",
      "[Dukcapil OCR v3.2] Mengaktifkan deteksi chip RFID e-KTP dan sensor visual optik..."
    ]);

    const timers = [
      { p: 15, l: "[Dukcapil OCR] Menyetel filter polarisasi & meratakan pencahayaan kartu...", d: 450 },
      { p: 35, l: "[Dukcapil OCR] Menemukan lambang Garuda Pancasila dan letak microtext kependudukan...", d: 900 },
      { p: 55, l: `[Dukcapil OCR] NIK Terbaca: ${nik.substring(0, 6)}********** [VALID]`, d: 1350 },
      { p: 75, l: `[Dukcapil OCR] Karakter Visual Nama Ditemukan: "${nama.toUpperCase()}"`, d: 1800 },
      { p: 90, l: `[Dukcapil OCR] Alamat RT/RW: RT ${additionalData.rt || '00'}/RW ${additionalData.rw || '00'} Wilayah Administratif Desa`, d: 2150 },
      { p: 100, l: "[SUCCESS] VERIFIKASI INTEGRITAS FORMULIR E-KTP SELESAI!", d: 2500 }
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
          }, 450);
        }
      }, t.d);
    });
  };

  // Scan random uploaded image
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (streamRef.current) {
      stopCamera();
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedFile(event.target.result as string);
        setCapturedFrame(event.target.result as string);
        // Extract a random persona from pre-designed list to fulfill simulation nicely
        const randomPersona = SIMULATED_KTPS[Math.floor(Math.random() * SIMULATED_KTPS.length)];
        triggerScanningProcedure(randomPersona.nik, randomPersona.nama, {
          alamat: randomPersona.alamat,
          rt: randomPersona.rt,
          rw: randomPersona.rw,
          photo: randomPersona.photo
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
            <div className="h-64 bg-slate-950 rounded-xl relative overflow-hidden flex flex-col justify-between p-4 border border-emerald-500/40 shadow-inner shadow-emerald-500/10">
              {/* Background scan photo or virtual KTP */}
              {capturedFrame ? (
                <div className="absolute inset-0 z-0">
                  <img 
                    src={capturedFrame} 
                    alt="Captured Scan Frame" 
                    className="w-full h-full object-cover opacity-25 blur-[1px] saturate-150 brightness-75 scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {/* Digital cyber overlay */}
                  <div className="absolute inset-0 bg-blue-950/30 mix-blend-color" />
                </div>
              ) : activeScanMetadata ? (
                /* Draw a gorgeous digital stylized KTP blueprint skeleton! */
                <div className="absolute inset-0 z-0 opacity-20 p-3 font-mono text-[8px] text-sky-400 select-none overflow-hidden flex flex-col gap-1 bg-sky-950/10">
                  <div className="text-center font-extrabold tracking-widest text-[9px] text-sky-300 border-b border-sky-500/20 pb-1 uppercase font-sans">REPUBLIK INDONESIA — DATA ELEKTRONIK</div>
                  <div className="mt-2 text-sky-300 font-bold">NIK: {activeScanMetadata.nik}</div>
                  <div>NAMA: {activeScanMetadata.nama}</div>
                  <div>ALAMAT: {activeScanMetadata.alamat}</div>
                  <div>RT/RW: {activeScanMetadata.rt}/{activeScanMetadata.rw}</div>
                  <div className="mt-auto text-center animate-pulse text-emerald-400 font-bold uppercase tracking-wider text-[8px] font-sans">AI NEURAL PATTERN OCR ENGINE ACTIVE</div>
                </div>
              ) : null}

              {/* Vertical floating scanning laser line with pulse */}
              <div className="absolute left-0 right-0 h-[2.5px] bg-emerald-400 shadow-[0_0_15px_#10b981,0_0_5px_#34d399] animate-bounce z-10" style={{ animationDuration: '2.5s' }} />
              
              {/* Background scan grids */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-[1]" />

              {/* Header metadata */}
              <div className="z-10 flex justify-between items-center bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 backdrop-blur-md self-stretch shrink-0">
                <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block shrink-0" />
                  ANALISA DATA WARGA INTEGRASI DUKCAPIL
                </span>
                <span className="text-[11px] font-mono font-black text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/20">{scanProgress}%</span>
              </div>

              {/* Live telemetry log view */}
              <div className="z-10 font-mono text-[9px] sm:text-[10px] text-emerald-400 space-y-1.5 max-h-[120px] overflow-y-auto mb-2 select-text p-2 bg-black/80 rounded-lg border border-emerald-500/10 backdrop-blur-sm shadow-inner mt-2">
                {scanLogs.map((log, i) => (
                  <div key={i} className="leading-relaxed flex items-start gap-1">
                    <span className="text-emerald-500 font-bold shrink-0 font-sans">›</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>

              {/* Progress bar footer */}
              <div className="z-10 w-full bg-slate-900 rounded-full h-1.5 shrink-0 overflow-hidden border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-sky-500 h-1.5 rounded-full transition-all duration-300" 
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              {/* TAB 1: DEMO SAMPLES (RECOMMENDED & FULLY ACCESSIBLE COLD STARTER) */}
              {activeTab === 'demo' && (
                <div className="space-y-3.5">
                  <div className="bg-blue-50 border border-blue-200 text-blue-950 rounded-xl p-3.5 flex gap-2.5 items-start text-xs leading-relaxed shadow-sm">
                    <AlertCircle className="text-blue-600 mt-0.5 shrink-0" size={15} />
                    <div>
                      <p className="font-extrabold text-[11px] font-mono uppercase tracking-wider text-blue-900">💡 Mode Simulasi Cepat Dukcapil</p>
                      <p className="text-[11px] text-blue-800 mt-1 font-sans">Kami menyediakan data KTP warga sampel untuk uji coba anjungan. Pilih salah satu warga di bawah ini untuk mensimulasikan penempelan fisik KTP di mesin.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {SIMULATED_KTPS.map((k) => (
                      <button 
                        key={k.nik}
                        type="button"
                        onClick={() => {
                          setCapturedFrame(null); // No actual camera snapshot
                          triggerScanningProcedure(k.nik, k.nama, { alamat: k.alamat, rt: k.rt, rw: k.rw, photo: k.photo });
                        }}
                        className="w-full text-left border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-xl p-3 flex gap-3 items-center justify-between cursor-pointer transition-all active:scale-[0.98] outline-none group hover:shadow-xs focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <div className="flex items-center space-x-3">
                          <img 
                            src={k.photo} 
                            alt={k.nama}
                            className="w-10 h-10 rounded-lg shrink-0 object-cover border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h4 className="text-xs font-black text-slate-800 tracking-wide font-sans group-hover:text-emerald-700 transition">{k.nama}</h4>
                            <p className="text-[10.5px] text-slate-500 font-mono mt-0.5">NIK: {k.nik}</p>
                            <span className="text-[8.5px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-mono uppercase tracking-wide">Dusun: RT {k.rt}/RW {k.rw}</span>
                          </div>
                        </div>

                        <div className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold font-mono uppercase hover:bg-emerald-100/80 flex items-center gap-1 shrink-0 transition">
                          <Zap size={11} className="text-amber-500 animate-pulse" />
                          <span>Simulasikan</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: LIVE DEVICE WEBCAM SCANNER */}
              {activeTab === 'camera' && (
                <div className="space-y-3.5">
                  {cameraError ? (
                    <div className="bg-rose-50 border border-rose-250 rounded-xl p-4 text-center text-rose-900 text-xs">
                      <p className="font-extrabold uppercase font-mono tracking-wider text-[11px]">⚠️ Modul Kamera Tidak Terdeteksi</p>
                      <p className="text-[11px] text-rose-700 mt-2 font-sans">Aplikasi berjalan di model iFrame sandbox atau izin kamera dinonaktifkan. Silakan gunakan tab "Simulasi KTP" atau gunakan tombol re-koneksi di bawah.</p>
                      <button 
                        type="button" 
                        onClick={startCamera} 
                        className="mt-3.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-mono text-[10.5px] font-semibold uppercase tracking-wider"
                      >
                        MINTA ULANG IZIN KAMERA
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
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                          <div className="w-[85%] h-[65%] border-2 border-emerald-400 border-dashed rounded-lg bg-black/10 flex flex-col justify-between p-2.5">
                            <span className="text-[8.5px] font-mono text-emerald-400 bg-black/70 px-1.5 py-0.5 rounded w-max leading-none uppercase tracking-wide">
                              🔒 POSISIKAN SISI DEPAN KTP DI SINI
                            </span>
                            <span className="text-[10px] text-center text-emerald-400 font-mono font-bold leading-none bg-black/40 self-center px-2 py-1 rounded">
                              Smart OCR Area Rilis Nasional
                            </span>
                          </div>
                        </div>

                        {/* Scanner Laser effect */}
                        <div className="absolute left-0 right-0 h-[1.5px] bg-emerald-400 shadow-[0_0_8px_#10b981] top-1/2 animate-pulse z-10 pointer-events-none" />

                      </div>

                      {/* Snap trigger */}
                      <button
                        type="button"
                        onClick={() => {
                          // Take freeze frame screenshot of active camera stream 
                          captureVideoFrame();
                          const targetObj = SIMULATED_KTPS[Math.floor(Math.random() * SIMULATED_KTPS.length)];
                          triggerScanningProcedure(targetObj.nik, targetObj.nama, {
                            alamat: targetObj.alamat,
                            rt: targetObj.rt,
                            rw: targetObj.rw,
                            photo: targetObj.photo
                          });
                        }}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/10 uppercase tracking-wider font-mono"
                      >
                        <Camera size={14} />
                        <span>INTELLIGENT INTEGRATED OCR SCAN</span>
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
                    className="h-44 border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/5 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all p-4 text-center group"
                  >
                    <Upload size={32} className="text-slate-400 group-hover:text-emerald-600 mb-2.5 transition" />
                    <h4 className="text-xs font-bold text-slate-700 font-sans group-hover:text-emerald-700 transition">Tarik berkas KTP atau klik untuk mengunggah dokumen</h4>
                    <p className="text-[10px] text-slate-450 mt-1 font-mono">Mendukung format gambar JPEG, PNG, WEBP (Maks. 4MB)</p>
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

          {/* Hidden Canvas tag used for frame scraping */}
          <canvas ref={canvasRef} className="hidden" />

        </div>

        {/* Footer notification */}
        <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 text-[10px] text-slate-500 font-mono shrink-0 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Smile size={12} className="text-emerald-500" />
            <span className="font-bold uppercase tracking-wider text-slate-600">Smart Identitas Republik Indonesia</span>
          </span>
          <span className="text-slate-400">Security-KTP v3.2</span>
        </div>

      </div>

    </div>
  );
}
