import React from 'react';
import { 
  Users, 
  UserCheck, 
  HeartHandshake, 
  TrendingUp, 
  FileText, 
  Megaphone, 
  CalendarDays, 
  Activity,
  UserPlus2,
  FileSpreadsheet,
  PlusCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Resident, Letter, FinanceTransaction, VillageAnnouncement, VillageAgenda, AuditLog } from '../types';

interface DashboardViewProps {
  residents: Resident[];
  letters: Letter[];
  finances: FinanceTransaction[];
  announcements: VillageAnnouncement[];
  agendas: VillageAgenda[];
  auditLogs: AuditLog[];
  onNavigate: (view: string) => void;
  openAiAssistant: () => void;
}

export default function DashboardView({
  residents,
  letters,
  finances,
  announcements,
  agendas,
  auditLogs,
  onNavigate,
  openAiAssistant
}: DashboardViewProps) {
  
  // Calculate stats based on real State array values
  const totalResidents = residents.length;
  const activeResidents = residents.filter(r => r.statusPenduduk === 'Aktif').length;
  const totalFamiliesCount = Array.from(new Set(residents.map(r => r.noKK))).length;
  
  const maleCount = residents.filter(r => r.jenisKelamin === 'Laki-laki').length;
  const femaleCount = residents.filter(r => r.jenisKelamin === 'Perempuan').length;

  const bansosCount = residents.filter(r => r.statusBansos !== 'Tidak Menerima').length;

  // Real APBDes calculations
  const totalRevenue = finances
    .filter(f => f.type === 'Pemasukan' && f.status.includes('Disetujui'))
    .reduce((sum, f) => sum + f.amount, 0);

  const totalExpense = finances
    .filter(f => f.type === 'Pengeluaran' && f.status.includes('Disetujui'))
    .reduce((sum, f) => sum + f.amount, 0);

  const pendingExpense = finances
    .filter(f => f.type === 'Pengeluaran' && f.status === 'Pending')
    .reduce((sum, f) => sum + f.amount, 0);

  // Formatting currency IDR
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // Recharts: Gender breakdown data
  const genderData = [
    { name: 'Laki-laki', value: maleCount, color: '#3b82f6' },
    { name: 'Perempuan', value: femaleCount, color: '#ec4899' }
  ];

  // Recharts: Age distribution calculation
  const calculateAge = (birthDateStr: string) => {
    const today = new Date();
    const birthDate = new Date(birthDateStr);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const ageGroups = {
    '0-12 (Anak-anak)': 0,
    '13-18 (Remaja)': 0,
    '19-45 (Produktif)': 0,
    '46-60 (Paruh Baya)': 0,
    '61+ (Lansia)': 0
  };

  residents.forEach(res => {
    const age = calculateAge(res.tanggalLahir);
    if (age <= 12) ageGroups['0-12 (Anak-anak)']++;
    else if (age <= 18) ageGroups['13-18 (Remaja)']++;
    else if (age <= 45) ageGroups['19-45 (Produktif)']++;
    else if (age <= 60) ageGroups['46-60 (Paruh Baya)']++;
    else ageGroups['61+ (Lansia)']++;
  });

  const ageChartData = Object.entries(ageGroups).map(([group, count]) => ({
    name: group,
    Jumlah: count
  }));

  // Work distribution calculation for charting
  const jobCounts: Record<string, number> = {};
  residents.forEach(r => {
    jobCounts[r.pekerjaan] = (jobCounts[r.pekerjaan] || 0) + 1;
  });
  const jobChartData = Object.entries(jobCounts).slice(0, 5).map(([job, count]) => ({
    name: job.substring(0, 15),
    Jumlah: count
  }));

  // Filter letters with pending operator attention
  const pendingLetters = letters.filter(l => l.status === 'Diajukan' || l.status === 'Ditinjau').slice(0, 5);

  return (
    <div id="dashboard-view-wrapper" className="space-y-4">
      {/* Dynamic Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat Card 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider font-mono">Total Penduduk</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight font-mono">{totalResidents} <span className="text-xs font-normal text-slate-400">Jiwa</span></h3>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">● {activeResidents} Status Aktif kependudukan</p>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(activeResidents / (totalResidents || 1)) * 100}%` }}></div>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider font-mono">Kepala Keluarga (KK)</span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <UserCheck size={16} />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight font-mono">{totalFamiliesCount} <span className="text-xs font-normal text-slate-400">KK</span></h3>
            <p className="text-[10px] text-slate-500 mt-1">Rasio Kependudukan: {(totalResidents / (totalFamiliesCount || 1)).toFixed(1)} jiwa per KK</p>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1">
            <div className="bg-teal-500 h-full rounded-full" style={{ width: '65%' }}></div>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider font-mono">Penerima Bansos</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <HeartHandshake size={16} />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight font-mono">{bansosCount} <span className="text-xs font-normal text-slate-400">Jiwa</span></h3>
            <p className="text-[10px] text-rose-600 font-semibold mt-1">Proporsi Bansos: {((bansosCount / (totalResidents || 1)) * 100).toFixed(0)}% Penduduk</p>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(bansosCount / (totalResidents || 1)) * 100}%` }}></div>
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider font-mono">Saldo APBDes Aktif</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-lg font-black text-slate-800 tracking-tight text-blue-800 font-mono" title={formatIDR(totalRevenue - totalExpense)}>
              {formatIDR(totalRevenue - totalExpense)}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Pemasukan: {formatIDR(totalRevenue)}</p>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(totalExpense / (totalRevenue || 1)) * 100}%` }}></div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS & EXECUTOR SERVICES MENU */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded">
            <Activity size={14} className="animate-spin" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 leading-none">Menu Akses Cepat Operator</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Sulamaju Intelligent System</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button id="quick-add-penduduk" onClick={() => onNavigate('kependudukan')} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center space-x-1 transition-all">
            <UserPlus2 size={13} />
            <span>+ Penduduk Baru</span>
          </button>
          <button id="quick-create-surat" onClick={() => onNavigate('surat')} className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium flex items-center space-x-1 transition-all">
            <FileText size={13} className="text-blue-500" />
            <span>+ Surat Pelayanan</span>
          </button>
          <button id="quick-budget-advice" onClick={openAiAssistant} className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all">
            <Sparkles size={13} className="text-amber-500" />
            <span>Minta Saran AI</span>
          </button>
        </div>
      </div>

      {/* CHARTS CONTAINER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart 1: Age Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm lg:col-span-2">
          <div className="border-b border-slate-100 pb-2 mb-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">Statistik Rentang Usia Penduduk Desa</h3>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Bar dataKey="Jumlah" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Gender Pie Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="border-b border-slate-100 pb-2 mb-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">Rasio Jenis Kelamin</h3>
          </div>
          <div className="h-44 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Center counter */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-slate-800 font-mono">{totalResidents}</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold font-mono">JIWA</span>
            </div>
          </div>
          {/* Legend customized */}
          <div className="flex justify-around text-xs mt-3">
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <span className="text-slate-600">Laki-laki: <b className="font-mono text-slate-800">{maleCount}</b></span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-pink-500"></div>
              <span className="text-slate-600">Perempuan: <b className="font-mono text-slate-800">{femaleCount}</b></span>
            </div>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: NOTIFICATION queue & LOGS & AGENDAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left col: Pending Letters list */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm lg:col-span-8 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">Antrean Surat Menunggu Persetujuan</h3>
            <button onClick={() => onNavigate('surat')} className="text-[10px] text-blue-600 hover:text-blue-700 font-bold uppercase tracking-tight">Lihat Semua Antrean</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-mono text-[10px]">
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-2.5 font-bold">No. Surat / Pengaju</th>
                  <th className="px-4 py-2.5 font-bold">Jenis Pelayanan</th>
                  <th className="px-4 py-2.5 font-bold">Persetujuan RT</th>
                  <th className="px-4 py-2.5 font-bold">Status</th>
                  <th className="px-4 py-2.5 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pendingLetters.length > 0 ? (
                  pendingLetters.map((letItem) => (
                    <tr key={letItem.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800 truncate max-w-[150px]">{letItem.requesterName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{letItem.requesterNik}</p>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">{letItem.type}</td>
                      <td className="px-4 py-3">
                        {letItem.rtApproval ? (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold">SUDAH SETUJU</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold">BELUM SETUJU</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-[10px] font-bold uppercase">
                          {letItem.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => onNavigate('surat')}
                          className="bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors"
                        >
                          Verifikasi
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400">Tidak ada pengajuan surat yang tertunda. Semua pelayanan bersih!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right col: LOG & ACTIVE AGENDAS */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-2 mb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">Agenda Desa Terbaru</h3>
              <span className="px-2 py-px bg-blue-50 text-blue-600 rounded-full text-[9px] font-semibold font-mono font-bold animate-pulse">{agendas.length} Aktif</span>
            </div>
            <div className="space-y-3">
              {agendas.slice(0, 3).map((age) => (
                <div key={age.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-all flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase font-mono">
                    <span>📅 {age.date}</span>
                    <span>⌚ {age.time}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 leading-tight">{age.title}</h4>
                  <p className="text-[10px] text-slate-500 line-clamp-1">{age.description}</p>
                  <p className="text-[9px] text-indigo-600 font-semibold mt-0.5">Peserta: {age.attendees}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mb-2">
              <span>SINKRONISASI SISTEM</span>
              <span className="text-emerald-500 font-bold">● ONLINE YA</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">Data kependudukan, pengajuan surat desa, APBDes dan bansos telah tersinkronisasi realtime.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
