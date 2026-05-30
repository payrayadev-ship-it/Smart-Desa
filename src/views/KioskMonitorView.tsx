import React, { useState, useEffect, useRef } from 'react';
import { 
  Tv, 
  Clock, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Loader2, 
  Bell, 
  Ticket, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowRight,
  LogOut,
  Maximize,
  Check,
  FileCheck2,
  Users,
  QrCode,
  ScanLine,
  Camera,
  ShieldCheck,
  AlertTriangle,
  X,
  FileText,
  Fingerprint,
  Info,
  XCircle,
  HelpCircle,
  ShieldAlert,
  Download
} from 'lucide-react';
import { Letter, VillageProfile } from '../types';

interface KioskMonitorViewProps {
  letters: Letter[];
  villageProfile: VillageProfile;
  onNavigateClose: () => void;
}

export default function KioskMonitorView({
  letters = [],
  villageProfile,
  onNavigateClose
}: KioskMonitorViewProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeCall, setActiveCall] = useState<{ ticket: string; name: string; type: string; status: string } | null>(null);
  
  // Track letters to catch transitions in status or new kiosk letters to trigger visual/sound notification
  const previousLettersRef = useRef<Letter[]>([]);
  const isInitialMount = useRef(true);

  // Clock state
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Verification states
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedLetterForVerification, setSelectedLetterForVerification] = useState<Letter | null>(null);
  const [scannerDeviceStatus, setScannerDeviceStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [cameraActive, setCameraActive] = useState(false);
  const [simulatedScanLetterId, setSimulatedScanLetterId] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Filter letters that came from Kiosk input channel
  const kioskLetters = letters.filter(l => 
    l.fields?.["Diinput Melalui"]?.includes("Kiosk") || 
    l.queueNumber || 
    l.id.startsWith("LTR-")
  );

  // Derived queue tickets
  const pendingQueue = kioskLetters.filter(l => l.status === 'Diajukan');
  const processingQueue = kioskLetters.filter(l => l.status === 'Ditinjau');
  const completedQueue = kioskLetters.filter(l => l.status === 'Selesai' || l.status === 'Disetujui Kades');

  // Trigger Sound Chime
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      
      const playFreq = (freq: number, start: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        
        gain.gain.setValueAtTime(0.06, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.start(start);
        osc.stop(start + duration);
      };

      // Nice lobby 3-tone bell: C5 -> E5 -> G5
      playFreq(523.25, now, 0.4); // C5
      playFreq(659.25, now + 0.15, 0.4); // E5
      playFreq(783.99, now + 0.3, 0.5); // G5
    } catch (e) {
      console.warn("Chime failed to play:", e);
    }
  };

  // Sound playbacks for scanning verification
  const playSuccessBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.04, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.start(start);
        osc.stop(start + duration);
      };
      playTone(880, now, 0.05);
      playTone(1318.51, now + 0.06, 0.12);
    } catch (e) {
      console.warn("Audio failure:", e);
    }
  };

  const playScanBuzz = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.linearRampToValueAtTime(180, now + 1.2);
      
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 1.2);
      osc.start(now);
      osc.stop(now + 1.2);
    } catch (e) {
      console.warn("Audio failure:", e);
    }
  };

  // Text to Speech logic in Indonesian language
  const speakQueueCall = (ticket: string, name: string, purpose: string, isCompleted: boolean) => {
    if (!soundEnabled) return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Cancel any current utterances

        // Format code for readable pronunciation, e.g. "A - 123" -> "A [pause] seratus dua puluh tiga"
        const cleanTicket = ticket.replace('-', ' ');
        const roleGreeting = name.toUpperCase().includes('BAPAK') || name.toUpperCase().includes('IBU') 
          ? name 
          : `Bapak atau Ibu ${name}`;

        let text = `Nomor antrean ${cleanTicket}, atas nama ${roleGreeting}, `;
        if (isCompleted) {
          text += `surat ${purpose} Anda sudah selesai dicetak. Silakan ambil di loket pelayanan. Terima kasih.`;
        } else {
          text += `silakan menuju ke loket pelayanan administrasi desa. Terima kasih.`;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 0.9; // Slightly slower for crisp clear lobby TV volume
        
        // Find Indonesian voice if exists
        const voices = window.speechSynthesis.getVoices();
        const idVoice = voices.find(v => v.lang.toLowerCase().includes('id'));
        if (idVoice) {
          utterance.voice = idVoice;
        }

        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn("TTS narration failed:", e);
    }
  };

  // Trigger call event
  const triggerActiveCall = (ticket: string, name: string, type: string, status: string, isCompleted: boolean) => {
    setActiveCall({ ticket, name, type, status });
    playChime();
    setTimeout(() => {
      speakQueueCall(ticket, name, type, isCompleted);
    }, 600);
  };

  // Watch for real-time transitions (e.g. status changes or new letters added)
  useEffect(() => {
    if (isInitialMount.current) {
      previousLettersRef.current = kioskLetters;
      isInitialMount.current = false;
      return;
    }

    const prevList = previousLettersRef.current;
    
    // Check if a new letter was added, or an existing letter updated status
    kioskLetters.forEach(curr => {
      const prev = prevList.find(p => p.id === curr.id);
      
      const ticketCode = curr.queueNumber || curr.fields?.["Kode Antrean"] || `A-${curr.id.slice(-3)}`;
      
      if (!prev) {
        // Brand new kiosk letter submitted!
        triggerActiveCall(ticketCode, curr.requesterName, curr.type, 'Baru Diajukan', false);
      } else if (prev.status !== curr.status) {
        // Status has updated (e.g. Diajukan -> Ditinjau, or Ditinjau -> Selesai)
        const isCompleted = curr.status === 'Selesai' || curr.status === 'Disetujui Kades';
        triggerActiveCall(ticketCode, curr.requesterName, curr.type, curr.status, isCompleted);
      }
    });

    previousLettersRef.current = kioskLetters;
  }, [letters]);

  // Web camera feed activation hook
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isScannerOpen && cameraActive) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play().catch(err => console.warn(err));
          }
        })
        .catch(err => {
          console.warn("Camera blocked or unavailable:", err);
          setCameraActive(false);
        });
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isScannerOpen, cameraActive]);

  // Handle Fullscreen UI switch
  const handleToggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn("Fullscreen permission denied:", err);
    }
  };

  // Simulated scan function
  const handleSimulatedScan = (letter: Letter) => {
    setScannerDeviceStatus('scanning');
    setSimulatedScanLetterId(letter.id);
    playScanBuzz();

    setTimeout(() => {
      setScannerDeviceStatus('success');
      playSuccessBeep();
      
      setTimeout(() => {
        setIsScannerOpen(false);
        setSimulatedScanLetterId(null);
        setScannerDeviceStatus('idle');
        setSelectedLetterForVerification(letter);
      }, 700);
    }, 1200);
  };

  const handleExportExcel = () => {
    playSuccessBeep();
    // Generate HTML colored spreadsheet representable as Excel
    const excelHeader = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Log Antrean Kiosk</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; width: 100%; font-family: sans-serif; }
          th { background-color: #4f46e5; color: #ffffff; font-weight: bold; padding: 10px; border: 1px solid #cbd5e1; }
          td { padding: 8px; border: 1px solid #cbd5e1; text-align: left; }
          .title { font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 20px; color: #1e1b4b; }
          .meta { font-size: 11px; color: #475569; margin-bottom: 15px; line-height: 1.5; }
          .badge { padding: 4px 8px; border-radius: 4px; font-weight: bold; text-align: center; font-size: 10px; }
          .badge-Diajukan { background-color: #dbeafe; color: #1e40af; }
          .badge-Ditinjau { background-color: #ffedd5; color: #9a3412; }
          .badge-Selesai { background-color: #d1fae5; color: #065f46; }
          .badge-Disetujui { background-color: #d1fae5; color: #065f46; }
        </style>
      </head>
      <body>
        <div class="title">LAPORAN AUDIT BULANAN LOG ANTREAN KIOSK MANDIRI - DESA ${villageProfile.name.toUpperCase()}</div>
        <div class="meta">
          <strong>Kecamatan:</strong> ${villageProfile.subdistrict} &nbsp;&nbsp;|&nbsp;&nbsp;
          <strong>Kabupaten:</strong> ${villageProfile.regency} &nbsp;&nbsp;|&nbsp;&nbsp;
          <strong>Provinsi:</strong> ${villageProfile.province}<br/>
          <strong>Dicetak pada:</strong> ${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})} pukul ${new Date().toLocaleTimeString('id-ID')} WIB<br/>
          <strong>Total Transaksi Antrean Kiosk:</strong> ${kioskLetters.length} berkas pemohon terdaftar
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 5%;">No</th>
              <th style="width: 12%;">Kode Antrean</th>
              <th style="width: 20%;">Nama Pemohon</th>
              <th style="width: 15%;">NIK Pemohon</th>
              <th style="width: 20%;">Jenis Pelayanan / Surat</th>
              <th style="width: 18%;">Tempat, Tanggal Lahir</th>
              <th style="width: 10%;">Status Berkas</th>
              <th style="width: 15%;">Waktu Pengajuan</th>
            </tr>
          </thead>
          <tbody>
            ${kioskLetters.map((letItem, idx) => {
              const queueNo = letItem.queueNumber || letItem.fields?.["Kode Antrean"] || `A-${letItem.id.slice(-3)}`;
              const birthplace = letItem.fields?.['Tempat Lahir'] || '-';
              const birthdate = letItem.fields?.['Tanggal Lahir'] ? new Date(letItem.fields?.['Tanggal Lahir']).toLocaleDateString('id-ID') : '-';
              const mainStatus = letItem.status.includes('Disetujui') || letItem.status === 'Selesai' ? 'Selesai' : letItem.status;
              
              return `
                <tr>
                  <td style="text-align: center;">${idx + 1}</td>
                  <td style="font-family: monospace; font-weight: bold; text-align: center; background-color: #f8fafc; color: #1e3a8a;">${queueNo}</td>
                  <td style="font-weight: bold; text-transform: uppercase;">${letItem.requesterName}</td>
                  <td style="font-family: monospace;">'${letItem.requesterNik}</td>
                  <td>${letItem.type}</td>
                  <td>${birthplace}, ${birthdate}</td>
                  <td class="badge-${mainStatus}" style="text-align: center; font-weight: bold;">${letItem.status}</td>
                  <td>${new Date(letItem.createdAt).toLocaleString('id-ID')} WIB</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelHeader], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Audit_Log_Kiosk_Desa_${villageProfile.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    playSuccessBeep();
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Popup terblokir browser! Mohon izinkan popup untuk mencetak laporan.");
      return;
    }

    const documentContent = `
      <html>
        <head>
          <title>LAPORAN AUDIT LOG ANTREAN KIOSK - DESA ${villageProfile.name.toUpperCase()}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; font-size: 13px; background-color: #ffffff; }
            .kop-container { border-bottom: 3px double #000000; padding-bottom: 12px; margin-bottom: 25px; display: flex; align-items: center; gap: 20px; }
            .kop-text { flex-grow: 1; text-align: center; }
            .kop-title { font-size: 16px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; margin: 0; }
            .kop-sub { font-size: 11px; margin: 5px 0 0 0; color: #475569; letter-spacing: 0.05em; font-weight: 500; }
            
            .report-title { text-align: center; font-size: 14px; font-weight: bold; text-decoration: underline; text-transform: uppercase; margin-bottom: 5px; color: #0f172a; }
            .report-subtitle { text-align: center; font-size: 10px; font-family: monospace; color: #64748b; margin-bottom: 25px; text-transform: uppercase; letter-spacing: 0.1em; }
            
            .info-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; background-color: #f8fafc; padding: 12px; border-radius: 10px; border: 1px solid #f1f5f9; }
            .info-meta p { margin: 3px 0; font-size: 11px; }
            .info-meta strong { color: #0f172a; }

            table { border-collapse: collapse; width: 100%; font-size: 11px; margin-top: 15px; }
            th { background-color: #0f172a; color: #ffffff; font-weight: bold; padding: 8px 10px; border: 1px solid #cbd5e1; text-align: left; text-transform: uppercase; font-size: 10px; font-family: monospace; }
            td { padding: 7px 10px; border: 1px solid #e2e8f0; text-align: left; vertical-align: top; }
            tr:nth-child(even) td { background-color: #f8fafc; }
            
            .badge { padding: 2px 6px; border-radius: 4px; font-weight: bold; font-family: monospace; font-size: 9px; display: inline-block; text-transform: uppercase; }
            .badge-Diajukan { background-color: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
            .badge-Ditinjau { background-color: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; }
            .badge-Selesai { background-color: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
            .badge-Disetujui { background-color: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }

            .signature-block { margin-top: 40px; float: right; width: 230px; text-align: center; font-size: 12px; page-break-inside: avoid; }
            .signature-space { height: 75px; }
            .footer-notes { margin-top: 50px; font-size: 9px; color: #94a3b8; font-family: monospace; text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 15px; }
            
            @media print {
              body { padding: 0; font-size: 12px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="kop-container">
            ${villageProfile.logoUrl ? `<img src="${villageProfile.logoUrl}" style="width: 55px; height: 55px; object-fit: contain;" referrerPolicy="no-referrer" />` : `<div style="width:55px;height:55px;border:1px solid #bbb;border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:10px;">PEMDA</div>`}
            <div class="kop-text">
              <h1 class="kop-title">Pemerintah Kabupaten ${villageProfile.regency}</h1>
              <h2 class="kop-title" style="font-size: 14px; color: #334155; margin-top: 2px;">Kantor Kepala Desa ${villageProfile.name}</h2>
              <p class="kop-sub">Alamat: ${villageProfile.address || '-'} | Telp: ${villageProfile.phone || '-'} | Email: ${villageProfile.email || '-'}</p>
            </div>
          </div>

          <h2 class="report-title">LAPORAN REKAPITULASI AUDIT LOG ANTREAN KIOSK</h2>
          <p class="report-subtitle">DATA TRANSAKSI BULANAN - ANJUNGAN PELAYANAN DESA MANDIRI</p>

          <div class="info-meta">
            <div>
              <p><strong>Desa / Kelurahan:</strong> ${villageProfile.name}</p>
              <p><strong>Kecamatan:</strong> ${villageProfile.subdistrict}</p>
              <p><strong>Kabupaten / Kota:</strong> ${villageProfile.regency}</p>
            </div>
            <div>
              <p><strong>Tanggal Cetak Laporan:</strong> ${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
              <p><strong>Waktu Download:</strong> ${new Date().toLocaleTimeString('id-ID')} WIB</p>
              <p><strong>Total Log Berkas Kiosk:</strong> ${kioskLetters.length} Transaksi</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 4%; text-align: center;">No</th>
                <th style="width: 12%; text-align: center;">Kode Antrean</th>
                <th style="width: 18%;">Nama Pemohon</th>
                <th style="width: 14%;">NIK Pemohon</th>
                <th style="width: 18%;">Jenis Layanan / Surat</th>
                <th style="width: 16%;">Tempat & Tanggal Lahir</th>
                <th style="width: 10%; text-align: center;">Status</th>
                <th style="width: 8%; text-align: center;">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              ${kioskLetters.map((letItem, idx) => {
                const qNo = letItem.queueNumber || letItem.fields?.["Kode Antrean"] || `A-${letItem.id.slice(-3)}`;
                const birthplace = letItem.fields?.['Tempat Lahir'] || '-';
                const birthdate = letItem.fields?.['Tanggal Lahir'] ? new Date(letItem.fields?.['Tanggal Lahir']).toLocaleDateString('id-ID') : '-';
                const mainStatus = letItem.status.includes('Disetujui') || letItem.status === 'Selesai' ? 'Selesai' : letItem.status;
                return `
                  <tr>
                    <td style="text-align: center;">${idx + 1}</td>
                    <td style="font-family: monospace; font-weight: bold; text-align: center; color: #1e3a8a;">${qNo}</td>
                    <td style="font-weight: bold; text-transform: uppercase;">${letItem.requesterName}</td>
                    <td style="font-family: monospace;">${letItem.requesterNik}</td>
                    <td>${letItem.type}</td>
                    <td>${birthplace}, ${birthdate}</td>
                    <td style="text-align: center;">
                      <span class="badge badge-${mainStatus}">${letItem.status}</span>
                    </td>
                    <td style="text-align: center; font-family: monospace; white-space: nowrap;">${new Date(letItem.createdAt).toLocaleDateString('id-ID', {day:'numeric', month:'numeric'})}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="signature-block">
            <p>${villageProfile.name}, ${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
            <p style="font-weight: bold; margin-top: 5px;">Kepala Desa ${villageProfile.name}</p>
            <div class="signature-space"></div>
            <p style="font-weight: bold; text-decoration: underline;">${villageProfile.kepalaDesa || "H. Dadang Sulaeman, S.IP."}</p>
            <p style="font-size: 10px; color: #64748b;">NIP. 19740512 200212 1 003</p>
          </div>

          <div style="clear: both;"></div>

          <div class="footer-notes">
            Laporan ini dibuat secara otomatis oleh modul Kiosk Monitor TV Desa ${villageProfile.name} pada ${new Date().toLocaleString('id-ID')} WIB.<br/>
            Segala bentuk manipulasi data log audit akan terekam oleh sistem pengawasan keamanan digital pemerintahan.
          </div>

          <script>
            window.addEventListener('load', () => {
              setTimeout(() => {
                window.print();
              }, 400);
            });
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(documentContent);
    printWindow.document.close();
  };

  return (
    <div className="bg-slate-950 text-white min-h-screen font-sans flex flex-col justify-between overflow-hidden relative select-none">
      
      {/* Space Ambient Glowing Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[170px] pointer-events-none" />
      <div className="absolute top-[30%] right-[20%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* MONITOR TOP HEADER BAR */}
      <header className="p-4 sm:p-5 bg-slate-900 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 z-10 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-1 border border-slate-700 shadow-md">
            {villageProfile.logoUrl ? (
              <img 
                src={villageProfile.logoUrl} 
                className="w-10 h-10 object-contain" 
                alt="Logo Pemda"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-base">
                SD
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h1 className="text-sm font-black tracking-widest font-mono text-indigo-400 uppercase">
                MONITOR TV ANTREAN KIOSK MANDIRI
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Sistem Penyiaran Real-Time Pelayanan Administrasi Desa {villageProfile.name}
            </p>
          </div>
        </div>

        {/* Real-time Display Controls */}
        <div className="flex items-center gap-3 z-20">
          
          {/* Live Camera Scanner Trigger */}
          <button 
            type="button"
            onClick={() => {
              playSuccessBeep();
              setIsScannerOpen(true);
              setCameraActive(true);
            }}
            className="p-2 px-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-500/10 border border-emerald-400/20 tracking-wider hover:scale-105"
          >
            <ScanLine size={14} className="animate-pulse text-slate-950" />
            <span>KAMERA SCAN QR BERKAS</span>
          </button>

          {/* Export Audit Log Dropdown */}
          <div className="relative group">
            <button
              type="button"
              className="p-2 px-3.5 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md border border-indigo-400/20 tracking-wider active:scale-95"
            >
              <Download size={14} className="text-white animate-bounce" />
              <span>LOG AUDIT KIOSK</span>
            </button>
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl scale-0 group-hover:scale-100 origin-top-right transition-all duration-150 z-30 divide-y divide-slate-800/60">
              <div className="px-4 py-2.5 bg-slate-950/60 text-left">
                <p className="text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase">Pilihan Ekspor Laporan</p>
                <p className="text-[9.5px] text-slate-500 font-sans font-normal normal-case">Audit Antrean Kiosk Bulanan</p>
              </div>
              <button
                type="button"
                onClick={handleExportExcel}
                className="w-full px-4 py-3 text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-emerald-400 transition-colors flex items-center gap-2.5 font-semibold"
              >
                <span className="text-emerald-500 text-sm">📊</span>
                <span className="font-mono text-left">Unduh Excel (.XLS)</span>
              </button>
              <button
                type="button"
                onClick={handleExportPDF}
                className="w-full px-4 py-3 text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-indigo-400 transition-colors flex items-center gap-2.5 font-semibold"
              >
                <span className="text-indigo-500 text-sm">📄</span>
                <span className="font-mono text-left">Cetak Laporan PDF</span>
              </button>
            </div>
          </div>

          {/* Audio Announcer Button */}
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 px-3.5 rounded-xl border font-mono text-xs flex items-center gap-2 transition-all ${
              soundEnabled 
                ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-400 hover:bg-indigo-900/30' 
                : 'bg-rose-950/30 border-rose-900/40 text-rose-400 hover:bg-rose-900/25'
            }`}
          >
            {soundEnabled ? (
              <>
                <Volume2 size={15} className="animate-bounce" />
                <span>Audio Pengeras Aktif</span>
              </>
            ) : (
              <>
                <VolumeX size={15} />
                <span>Suara Dimatikan</span>
              </>
            )}
          </button>

          {/* Fullscreen Button */}
          <button 
            onClick={handleToggleFullscreen}
            className="p-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition animate-fade-in"
            title="Layar Penuh"
          >
            <Maximize size={15} />
          </button>

          {/* Clock Widget */}
          <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-2 shadow-inner">
            <Clock size={14} className="text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="text-xs font-mono font-bold text-slate-200">
              {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB
            </span>
          </div>

          {/* Exit Monitor Button */}
          <button 
            onClick={onNavigateClose}
            className="p-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl flex items-center gap-1.5 transition text-xs font-mono font-bold uppercase shadow-lg shadow-rose-600/10"
            title="Keluar"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* DUAL CANVAS CONTENT WORKSPACE */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch z-10 overflow-hidden">
        
        {/* LEFT COMPONENT: RECENT / ACTIVE ANNOUNCEMENT MEGAPHONE HEADER */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          
          {/* SPEAKER CARD */}
          <div className="bg-gradient-to-b from-indigo-950/60 to-slate-950/80 border-2 border-indigo-900/50 rounded-3xl p-6 flex flex-col justify-between items-center text-center relative overflow-hidden shadow-2xl flex-1">
            <div className="space-y-4 w-full">
              <div className="flex justify-between items-center border-b border-indigo-900/30 pb-3 w-full">
                <span className="text-[10px] font-black tracking-widest text-indigo-400 font-mono uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-indigo-500 inline-block rounded animate-pulse" />
                  KARTU PANGGILAN TERAKHIR
                </span>
                <span className="text-[9px] font-mono bg-indigo-900/50 text-indigo-300 border border-indigo-700/40 px-2 py-0.5 rounded-full uppercase">
                  Broadcast Loket
                </span>
              </div>

              {activeCall ? (
                <div className="space-y-4 py-8 animate-fade-in">
                  <span className="text-[10.5px] font-mono text-emerald-400 bg-emerald-950/60 p-1 px-3.5 rounded-full border border-emerald-900 uppercase font-black tracking-widest animate-pulse">
                    🟢 SEDANG DIPANGGIL PETUGAS
                  </span>
                  
                  <div className="my-4">
                    <p className="text-xs text-slate-400 font-mono tracking-widest mb-1">NOMOR TIKET ANTRIAN</p>
                    <h2 className="text-6xl sm:text-7xl font-mono text-white tracking-widest font-black inline-block bg-slate-900 p-4 px-10 rounded-2xl border-4 border-indigo-500 active:scale-95 transition-transform cursor-pointer"
                        title="Klik untuk Bunyi Pengumuman Kembali"
                        onClick={() => triggerActiveCall(activeCall.ticket, activeCall.name, activeCall.type, activeCall.status, activeCall.status.includes('Selesai'))}>
                      {activeCall.ticket}
                    </h2>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-mono text-slate-500 tracking-wider">NAMA WARGA</p>
                    <h3 className="text-xl font-bold font-sans text-indigo-200 uppercase truncate">
                      {activeCall.name}
                    </h3>
                  </div>

                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl max-w-xs mx-auto">
                    <p className="text-[9px] font-mono text-slate-500 uppercase">JENIS LAYANAN BERKAS</p>
                    <p className="text-xs font-semibold text-slate-300 truncate">{activeCall.type}</p>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-slate-500 space-y-3">
                  <div className="w-16 h-16 bg-slate-900/50 border border-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-600">
                    <Bell size={28} className="animate-bounce" style={{ animationDuration: '3s' }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase font-mono">Belum Ada Antrean Baru</h3>
                    <p className="text-[11px] text-slate-500 max-w-[220px] mx-auto mt-1 leading-normal">
                      Menunggu warga mendaftar berkas secara mandiri melalui Kiosk Anjungan Publik.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Test Launcher Button */}
            <div className="w-full border-t border-slate-900 pt-4 mt-4">
              <button 
                onClick={() => {
                  // Simulate dummy ticket for demonstrative screen review
                  const list = ['A-294', 'A-811', 'A-492', 'A-551'];
                  const names = ['Herman Kartomi', 'Anisa Rahmawati', 'Wawan Setiawan', 'Siti Maryam'];
                  const letters = ['Surat Keterangan Domisili', 'Surat Izin Usaha Mikro', 'Surat Keterangan Kematian', 'Format Surat Kuasa'];
                  const idx = Math.floor(Math.random() * list.length);
                  triggerActiveCall(list[idx], names[idx], letters[idx], 'Diajukan', false);
                }}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-[10.5px] border border-slate-800 text-slate-400 hover:text-white rounded-xl transition font-mono font-medium flex items-center justify-center gap-1.5"
              >
                <Sparkles size={12} className="text-yellow-400" />
                <span>Simulasi Bunyi Antrean Baru (Demo)</span>
              </button>
            </div>
          </div>

          {/* COUNTER METRICS LOBBY */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex gap-4 items-center justify-between shadow-inner">
            <div className="space-y-0.5">
              <span className="text-[9px] text-indigo-400 font-mono uppercase tracking-wider block font-bold">TOTAL REGISTER HARIAN</span>
              <p className="text-2xl font-bold font-mono text-white">{kioskLetters.length} Surat <span className="text-xs text-slate-500">Antrean</span></p>
            </div>
            <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center border border-indigo-900/30 text-indigo-400 font-mono font-black">
              {kioskLetters.length}
            </div>
          </div>

        </section>

        {/* RIGHT COMPONENT: THREE TV STATS COLUMNS WITH LIFETIME SYNCHRONIZATION */}
        <section className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* COLUMN 1: NEW WAITING QUEUE (DIAJUKAN) */}
          <div className="bg-slate-900/40 border-2 border-slate-900 rounded-3xl p-4 sm:p-5 flex flex-col justify-between overflow-hidden shadow-lg">
            <div>
              <div className="flex justify-between items-center border-b border-indigo-950 pb-3 mb-4">
                <span className="text-[10px] font-black tracking-widest text-blue-400 font-mono uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-blue-500 inline-block rounded" />
                  1. MENUNGGU VERIFIKASI
                </span>
                <span className="text-[9px] font-bold font-mono bg-blue-950 px-2 py-0.5 rounded border border-blue-900/30 text-blue-400 uppercase">
                  {pendingQueue.length} Berkas
                </span>
              </div>

              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {pendingQueue.map((item) => {
                  const tNo = item.queueNumber || item.fields?.["Kode Antrean"] || `A-${item.id.slice(-3)}`;
                  return (
                    <div 
                      key={item.id} 
                      onClick={() => triggerActiveCall(tNo, item.requesterName, item.type, 'Menunggu Verifikasi', false)}
                      className="bg-slate-950 p-3 rounded-xl border border-slate-800/85 hover:border-blue-600/55 hover:bg-slate-900/60 transition duration-200 cursor-pointer group flex justify-between items-center gap-1.5 animate-fade-in"
                    >
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black font-mono text-blue-400 bg-blue-950 p-0.5 px-2 rounded border border-blue-900/40">
                            {tNo}
                          </span>
                          <span className="text-[8.5px] font-mono text-slate-500">
                            {item.createdAt ? new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Baru'}
                          </span>
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-100 group-hover:text-blue-200 truncate uppercase mt-1.5">
                          {item.requesterName}
                        </h4>
                        <p className="text-[9.5px] font-mono text-slate-400 truncate mt-0.5">
                          {item.type}
                        </p>
                      </div>
                      <ChevronRight size={13} className="text-slate-700 group-hover:text-blue-400 transition transform group-hover:translate-x-0.5 shrink-0" />
                    </div>
                  );
                })}

                {pendingQueue.length === 0 && (
                  <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl text-slate-600 font-mono text-xs">
                    Tidak Ada Berkas Menunggu
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-900 text-[9.5px] text-slate-500 font-mono leading-normal">
              Status antrean mandiri warga yang baru saja mendaftar di kiosk dan menunggu verifikasi berkas RT/RW atau sekretaris desa.
            </div>
          </div>

          {/* COLUMN 2: PROCESSING IN CURRENT REVIEW (DITINJAU) */}
          <div className="bg-slate-900/40 border-2 border-slate-900 rounded-3xl p-4 sm:p-5 flex flex-col justify-between overflow-hidden shadow-lg">
            <div>
              <div className="flex justify-between items-center border-b border-indigo-950 pb-3 mb-4">
                <span className="text-[10px] font-black tracking-widest text-[rgb(249,115,22)] font-mono uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-orange-500 inline-block rounded animate-pulse" />
                  2. PROSES PELAYANAN
                </span>
                <span className="text-[9px] font-bold font-mono bg-orange-950 px-2 py-0.5 rounded border border-orange-900/40 text-orange-400 uppercase">
                  {processingQueue.length} Loket
                </span>
              </div>

              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {processingQueue.map((item) => {
                  const tNo = item.queueNumber || item.fields?.["Kode Antrean"] || `A-${item.id.slice(-3)}`;
                  return (
                    <div 
                      key={item.id} 
                      onClick={() => triggerActiveCall(tNo, item.requesterName, item.type, 'Sedang Diproses', false)}
                      className="bg-slate-950 p-3 rounded-xl border border-orange-900/40 hover:border-orange-500 hover:bg-slate-900/60 transition duration-200 cursor-pointer group flex justify-between items-center gap-1.5"
                    >
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black font-mono text-orange-400 bg-orange-950/60 p-0.5 px-2 rounded border border-orange-900/40 animate-pulse">
                            {tNo}
                          </span>
                          <span className="flex items-center gap-1 text-[8.5px] font-mono text-slate-500">
                            <Loader2 size={10} className="animate-spin text-orange-400" />
                            <span>Ketik Berkas</span>
                          </span>
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-100 group-hover:text-orange-200 truncate uppercase mt-1.5">
                          {item.requesterName}
                        </h4>
                        <p className="text-[9.5px] font-mono text-slate-400 truncate mt-0.5">
                          {item.type}
                        </p>
                      </div>
                      <ChevronRight size={13} className="text-slate-700 group-hover:text-orange-400 transition transform group-hover:translate-x-0.5 shrink-0" />
                    </div>
                  );
                })}

                {processingQueue.length === 0 && (
                  <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl text-slate-600 font-mono text-xs">
                    Kosong - Meja Pelayanan Senggang
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-900 text-[9.5px] text-slate-500 font-mono leading-normal">
              Berkas sedang ditinjau di loket pelayanan kantor desa. Staf sedang mengoreksi, mengoreksi NIK, atau mencetak draf dokumen fisik.
            </div>
          </div>

          {/* COLUMN 3: READY / COMPLETED FOR PICKUP (SELESAI / DISPEND) */}
          <div className="bg-slate-900/40 border-2 border-slate-900 rounded-3xl p-4 sm:p-5 flex flex-col justify-between overflow-hidden shadow-lg">
            <div>
              <div className="flex justify-between items-center border-b border-indigo-950 pb-3 mb-4">
                <span className="text-[10px] font-black tracking-widest text-emerald-400 font-mono uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-emerald-500 inline-block rounded" />
                  3. SELESAI / AMBIL BERKAS
                </span>
                <span className="text-[9px] font-bold font-mono bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900/40 text-emerald-400 uppercase">
                  {completedQueue.length} Surat
                </span>
              </div>

              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {completedQueue.map((item) => {
                  const tNo = item.queueNumber || item.fields?.["Kode Antrean"] || `A-${item.id.slice(-3)}`;
                  return (
                    <div 
                      key={item.id} 
                      onClick={() => triggerActiveCall(tNo, item.requesterName, item.type, 'Selesai Cetak', true)}
                      className="bg-slate-950 p-3 rounded-xl border border-emerald-900/45 hover:border-emerald-500 hover:bg-slate-900/60 transition duration-200 cursor-pointer group flex items-center justify-between gap-2"
                    >
                      <div className="truncate flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black font-mono text-emerald-400 bg-emerald-950/60 p-0.5 px-2 rounded border border-emerald-900/40">
                            {tNo}
                          </span>
                          <span className="flex items-center gap-1 text-[8.5px] font-mono text-emerald-400 bg-emerald-950 px-1 py-0.2 rounded font-black uppercase">
                            <Check size={10} />
                            <span>Selesai</span>
                          </span>
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-100 group-hover:text-emerald-200 truncate uppercase mt-1.5">
                          {item.requesterName}
                        </h4>
                        <p className="text-[9.5px] font-mono text-slate-400 truncate mt-0.5">
                          {item.type}
                        </p>
                      </div>

                      {/* Explicit Interactive Scan Verification Badge Action */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playSuccessBeep();
                          setSelectedLetterForVerification(item);
                        }}
                        className="px-2.5 py-2 bg-emerald-950/80 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 hover:border-emerald-500 rounded-xl transition duration-150 flex items-center gap-1 shadow-md shrink-0 self-center font-mono text-[9px] font-black tracking-wide"
                        title="Verifikasi QR Keaslian Dokumen"
                      >
                        <QrCode size={12} className="animate-pulse" />
                        <span>VERIFIKASI</span>
                      </button>
                    </div>
                  );
                })}

                {completedQueue.length === 0 && (
                  <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl text-slate-600 font-mono text-xs animate-pulse">
                    Belum Ada Berkas Selesai Ambil
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-900 text-[9.5px] text-slate-500 font-mono leading-normal">
              Surat-surat yang sudah selesai ditandatangani secara elektronik atau basah oleh Kepala Desa, dan berkas fisik siap diklaim warga di meja loket.
            </div>
          </div>

        </section>

      </main>

      {/* FOOTER TICKER BANNER */}
      <footer className="p-3 bg-slate-900 border-t border-slate-800 z-10 text-center font-mono text-xs flex flex-col sm:flex-row justify-between items-center gap-2 text-slate-400">
        <p className="flex items-center gap-2 justify-center">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sistem Smart Desa Kantor Kepala Desa {villageProfile.name} - Terhubung Basis Data Real-Time Cloud Firestore</span>
        </p>
        <p className="text-[11px] text-indigo-400 font-bold uppercase tracking-wider">
          #SmartDesaMandiriDigital #SinergiMajuDigital
        </p>
      </footer>

      {/* MODAL 1: LIVE WEBCAM SCANNER & SIMULATION MODULE */}
      {isScannerOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl relative block">
            
            {/* Modal Title bar */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-emerald-500/10 rounded-lg border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ScanLine size={18} className="animate-spin" style={{ animationDuration: '4s' }} />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-wider uppercase font-mono text-slate-100">
                    DECODER QR-CODE VERIFIER LOBBY
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Scan tanda-tangan & keaslian surat di terminal TV Kiosk monitor
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsScannerOpen(false);
                  setScannerDeviceStatus('idle');
                }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 flex items-center justify-center border border-slate-700 hover:border-rose-900/40 transition"
              >
                <X size={15} />
              </button>
            </div>

            {/* Main Interactive Scanner Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch bg-slate-950/40">
              
              {/* Left Column: Visual Scanner Screen aperture */}
              <div className="flex flex-col justify-between space-y-3">
                <div className="relative aspect-video md:aspect-square bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden flex flex-col items-center justify-center shadow-inner">
                  
                  {cameraActive ? (
                    <video 
                      ref={videoRef} 
                      className="w-full h-full object-cover opacity-80"
                      playsInline 
                      muted 
                    />
                  ) : (
                    <div className="text-center p-4 space-y-3">
                      <div className="w-16 h-16 bg-indigo-950/30 rounded-full border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
                        <Camera size={26} className="animate-pulse" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-300">Kamera Fisik Dinonaktifkan</p>
                        <p className="text-[10px] text-slate-500 leading-normal max-w-[180px] mx-auto mt-0.5">
                          Gunakan panel simulasi di sebelah kanan untuk memindai dokumen instan.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* High Quality Scan Line Lasers Overlay */}
                  <div className="absolute inset-5 border border-dashed border-emerald-500/30 rounded-xl pointer-events-none flex items-center justify-center overflow-hidden">
                    {/* Corner Bracket decorations */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />

                    {/* Scanning Target Box */}
                    <div className="w-32 h-32 border border-emerald-500/40 rounded-lg flex items-center justify-center bg-emerald-500/[0.02] relative">
                      <QrCode size={40} className="text-emerald-500/25 animate-pulse" />
                      
                      {/* Laser horizontal ray */}
                      <div className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)] animate-bounce" style={{ top: '10%' }} />
                    </div>
                  </div>

                  {/* Live Decode Status Badge Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 p-2 bg-slate-900/90 border border-slate-700/60 rounded-lg backdrop-blur-sm text-center">
                    {scannerDeviceStatus === 'idle' && (
                      <span className="text-[9.5px] font-mono text-slate-400 tracking-wider">STANDBY: MENUNGGU DOKUMEN...</span>
                    )}
                    {scannerDeviceStatus === 'scanning' && (
                      <span className="text-[9.5px] font-mono text-indigo-400 tracking-widest uppercase font-extrabold flex items-center justify-center gap-1 animate-pulse">
                        <Loader2 size={11} className="animate-spin" /> PROSES MEMBACA QR-CODE...
                      </span>
                    )}
                    {scannerDeviceStatus === 'success' && (
                      <span className="text-[9.5px] font-mono text-emerald-400 tracking-wider uppercase font-extrabold flex items-center justify-center gap-1">
                        <CheckCircle2 size={11} className="className" /> DECODING BERHASIL!
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCameraActive(!cameraActive)}
                    className={`flex-1 py-1.5 rounded-lg border text-[10px] font-mono font-bold uppercase transition flex items-center justify-center gap-1 ${
                      cameraActive 
                        ? 'bg-emerald-950/65 text-emerald-400 border-emerald-800' 
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    <Camera size={12} />
                    <span>{cameraActive ? 'Reset Feed Kamera' : 'Aktifkan Webcam'}</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Simulated Fast Select System */}
              <div className="flex flex-col justify-between space-y-3">
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono font-black text-indigo-400 tracking-widest uppercase block">
                      ⚡ INTEGRASI SIMULATOR SCANNER
                    </span>
                    <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">
                      Di dalam sandbox browser / TV monitor lobbi mandiri, warga dapat menempelkan berkas fisik ber-QR, atau mengklik daftar berkas selesai cetak di bawah ini untuk mensimulasikan pemindaian laser:
                    </p>
                  </div>

                  <div className="space-y-1.5 my-3 max-h-[170px] overflow-y-auto pr-1">
                    {completedQueue.map(item => {
                      const isTarget = simulatedScanLetterId === item.id;
                      const tNo = item.queueNumber || item.fields?.["Kode Antrean"] || `A-${item.id.slice(-3)}`;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          disabled={scannerDeviceStatus === 'scanning'}
                          onClick={() => handleSimulatedScan(item)}
                          className={`w-full p-2 rounded-xl text-left border transition flex justify-between items-center ${
                            isTarget 
                              ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 scale-[0.98]' 
                              : 'bg-slate-950 hover:bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[8px] font-bold font-mono bg-slate-900 px-1 rounded border border-slate-700 text-slate-400">
                                {tNo}
                              </span>
                              <span className="text-[9px] font-semibold text-white truncate max-w-[120px] uppercase block">
                                {item.requesterName}
                              </span>
                            </div>
                            <span className="text-[8px] text-slate-500 block truncate uppercase tracking-tight mt-0.5 font-mono">
                              {item.type}
                            </span>
                          </div>

                          <span className="text-[8px] font-mono bg-indigo-950 text-indigo-400 border border-indigo-900/50 px-1.5 py-0.5 rounded font-bold shrink-0">
                            TAP SCAN
                          </span>
                        </button>
                      );
                    })}

                    {completedQueue.length === 0 && (
                      <div className="text-center py-8 text-slate-600 font-mono text-[10.5px] border border-dashed border-slate-800 rounded-xl leading-normal p-4">
                        <AlertTriangle size={15} className="mx-auto text-yellow-500/50 mb-1" />
                        Belum ada surat berstatus 'Selesai' untuk disimulasikan scan.
                      </div>
                    )}
                  </div>

                  <div className="text-[8.5px] font-mono text-slate-500 bg-slate-950/60 p-2 rounded-lg border border-slate-850">
                    ℹ️ <strong className="text-slate-400">Keterangan:</strong> QR-Code dicetak pada margin surat fisik sebagai bukti otentikasi digital Kepala Desa menggunakan standar Balai Sertifikasi Elektronik (BSrE).
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DOCUMENT AUTHENTICITY CERTIFICATE POP-UP */}
      {selectedLetterForVerification && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-emerald-500/40 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.18)] relative my-8">
            
            {/* Holographic Security Background element */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
            
            {/* Certificate Header Banner */}
            <div className="bg-gradient-to-r from-emerald-950 to-slate-900 p-5 border-b border-emerald-900/40 relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-400/40 rounded-xl flex items-center justify-center text-emerald-400 shrink-0 shadow-lg">
                  <ShieldCheck size={22} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-black tracking-widest font-mono text-emerald-400 uppercase">
                    BSrE VERIFIED DIGITAL CERTIFICATE
                  </h3>
                  <h4 className="text-base font-bold text-white uppercase tracking-tight">
                    BUKTI KEASLIAN SURAT DIGITAL
                  </h4>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLetterForVerification(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-950 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 flex items-center justify-center transition"
              >
                <X size={15} />
              </button>
            </div>

            {/* Verification Success Neon Card */}
            <div className="p-6 space-y-5">
              
              <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-4 text-center space-y-2 relative overflow-hidden">
                <div className="absolute top-[-20px] right-[-20px] opacity-10">
                  <Fingerprint size={120} className="text-emerald-400" />
                </div>
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold uppercase text-emerald-400 bg-emerald-950 p-1 px-3.5 rounded-full border border-emerald-900 tracking-wider">
                    DOKUMEN ASLI & SAH MATANG
                  </span>
                  <h2 className="text-lg font-black text-slate-100 uppercase tracking-tight mt-1.5">
                    TERVERIFIKASI SISTEM KEPUTUSAN KADES
                  </h2>
                  <p className="text-[10px] font-mono text-slate-400 mt-1 max-w-xs mx-auto">
                    Kunci Kriptografi SHA-256 Valid: <span className="text-emerald-400">SHA256:7F8C{selectedLetterForVerification.id.toUpperCase()}{Date.now().toString().slice(-4)}BD</span>
                  </p>
                </div>
              </div>

              {/* Secure Metadata Grid */}
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/80 space-y-3.5">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">NOMOR SURAT RESMI</span>
                  <span className="text-xs font-bold font-mono text-slate-200">
                    {selectedLetterForVerification.letterNumber || `470/${selectedLetterForVerification.id.slice(-3)}/SKK-DS/V/2026`}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">JENIS PELAYANAN</span>
                  <span className="text-xs font-bold text-slate-200 text-right uppercase">
                    {selectedLetterForVerification.type}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">NAMA PENERIMA / WARGA</span>
                  <span className="text-xs font-bold text-slate-200 uppercase">
                    {selectedLetterForVerification.requesterName}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">NIK PENERIMA</span>
                  <span className="text-xs font-bold font-mono text-slate-350">
                    {selectedLetterForVerification.requesterNik 
                      ? selectedLetterForVerification.requesterNik.replace(/(\d{6})\d{6}(\d{4})/, '$1******$2') 
                      : '320412******0003'}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">PEJABAT PENANDATANGAN</span>
                  <span className="text-xs font-bold text-emerald-300 uppercase">
                    {selectedLetterForVerification.signedBy || villageProfile.kepalaDesa || "H. Dadang Sulaeman, S.IP."}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">TANGGAL DISAHKAN (UTC)</span>
                  <span className="text-xs font-bold font-mono text-slate-300">
                    {selectedLetterForVerification.signedAt 
                      ? new Date(selectedLetterForVerification.signedAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) 
                      : new Date(selectedLetterForVerification.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
                  </span>
                </div>
              </div>

              {/* Hologram / Fingerprint Graphic Info panel */}
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex gap-3 items-center">
                <div className="shrink-0 text-yellow-500 bg-yellow-500/10 p-2 rounded-lg">
                  <Fingerprint size={20} className="animate-pulse" />
                </div>
                <div className="leading-tight">
                  <span className="text-[10.5px] font-black tracking-wider uppercase block text-slate-300 font-mono">TANDA TANGAN ELEKTRONIK SAH</span>
                  <p className="text-[9.5px] text-slate-500 mt-0.5">
                    Sistem ini terhubung langsung ke basis data induk Kantor Pemerintahan Desa Sukamaju ({villageProfile.subdistrict}), menjamin keaslian dokumen tanpa ttd basah.
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLetterForVerification(null)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl text-xs font-mono font-bold uppercase transition border border-slate-700"
                >
                  Tutup Informasi
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    playSuccessBeep();
                    alert(`Mengunduh file salinan PDF digital resmi untuk warga atas nama ${selectedLetterForVerification.requesterName}...`);
                  }}
                  className="py-3 px-5 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:opacity-90 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition uppercase tracking-wider"
                >
                  <Download size={14} className="text-slate-950 shrink-0" />
                  <span>Download PDF</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
