import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Search, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Download,
  Info
} from 'lucide-react';
import { Resident, Role } from '../types';

interface BansosViewProps {
  residents: Resident[];
  saveResidents: (data: Resident[]) => void;
  activeRole: Role;
  onLogAction: (action: string, module: string) => void;
}

export default function BansosView({
  residents,
  saveResidents,
  activeRole,
  onLogAction
}: BansosViewProps) {
  const [search, setSearch] = useState('');
  const [filterBansos, setFilterBansos] = useState('Semua');

  // Change recipient's aid status
  const updateResidentBansos = (id: string, newType: Resident['statusBansos']) => {
    const payload = residents.map(r => {
      if (r.id === id) {
        return {
          ...r,
          statusBansos: newType,
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    });
    saveResidents(payload);
    const updatedName = residents.find(r => r.id === id)?.nama || 'Warga';
    onLogAction(`Mengubah kelayakan bansos ${updatedName} menjadi ${newType}`, 'Bantuan Sosial');
  };

  const bansosRecipients = residents.filter(r => r.statusBansos !== 'Tidak Menerima');

  // Filter logic
  const filteredRecipients = residents.filter(r => {
    const term = search.toLowerCase();
    const matchesSearch = 
      r.nama.toLowerCase().includes(term) || 
      r.nik.includes(term) || 
      r.alamat.toLowerCase().includes(term);

    const matchesType = filterBansos === 'Semua' || r.statusBansos === filterBansos;
    return matchesSearch && matchesType;
  });

  return (
    <div id="bansos-view-wrapper" className="space-y-4 animate-fade">
      
      {/* Header info */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
            <HeartHandshake size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 leading-none">Penyaluran Bantuan Sosial Desa (Sulamaju PKH/BLT)</h2>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Sistem Pengendalian Kemiskinan Ekstrem & Penyaluran Sembako Berkeadilan</p>
          </div>
        </div>

        <div className="text-xs bg-slate-50 p-2 border border-slate-100 rounded-lg font-mono">
          🚨 Total Penerima Aktif: <b className="text-rose-600">{bansosRecipients.length} KK/Jiwa</b>
        </div>
      </div>

      {/* STATS INFO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-full font-mono text-xs font-bold w-10 h-10 flex items-center justify-center">BLT</div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase font-mono">Bantuan Langsung Tunai</p>
            <h4 className="text-base font-extrabold text-slate-800 font-mono leading-none">
              {residents.filter(r => r.statusBansos === 'Penerima BLT').length} Penerima
            </h4>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-full font-mono text-xs font-bold w-10 h-10 flex items-center justify-center">PKH</div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase font-mono">Prog Keluarga Harapan</p>
            <h4 className="text-base font-extrabold text-slate-800 font-mono leading-none">
              {residents.filter(r => r.statusBansos === 'Penerima PKH').length} Penerima
            </h4>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-full font-mono text-xs font-bold w-10 h-10 flex items-center justify-center">BPNT</div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase font-mono">Bantuan Pangan Non-Tunai</p>
            <h4 className="text-base font-extrabold text-slate-800 font-mono leading-none">
              {residents.filter(r => r.statusBansos === 'Penerima BPNT').length} Penerima
            </h4>
          </div>
        </div>
      </div>

      {/* CONTROLS AREA */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex flex-wrap gap-2 items-center">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono pl-1">Status Saluran:</span>
        <button
          onClick={() => setFilterBansos('Semua')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${filterBansos === 'Semua' ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'}`}
        >
          Semua Penduduk
        </button>
        <button
          onClick={() => setFilterBansos('Penerima BLT')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${filterBansos === 'Penerima BLT' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'}`}
        >
          BLT
        </button>
        <button
          onClick={() => setFilterBansos('Penerima PKH')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${filterBansos === 'Penerima PKH' ? 'bg-purple-600 text-white border-purple-600' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'}`}
        >
          PKH
        </button>
        <button
          onClick={() => setFilterBansos('Penerima BPNT')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${filterBansos === 'Penerima BPNT' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'}`}
        >
          BPNT
        </button>
        
        <span className="text-slate-300">|</span>

        {/* Input search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2 text-slate-400" size={13} />
          <input
            id="bansos-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ketik nama atau NIK warga..."
            className="w-full text-xs pl-8 pr-3 py-1 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none"
          />
        </div>
      </div>

      {/* DATA RECIPIENTS BOARD */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-mono text-[10px]">
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 font-bold">Identitas Penerima KK</th>
                <th className="px-4 py-3 font-bold">NIK / Alamat</th>
                <th className="px-4 py-3 font-bold">Pekerjaan</th>
                <th className="px-4 py-3 font-bold">Program Bansos Aktif</th>
                <th className="px-4 py-3 font-bold text-right">Opsi Ganti Model</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecipients.length > 0 ? (
                filteredRecipients.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-800 leading-tight">{res.nama}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Status: {res.statusPenduduk}</p>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px]">
                      <p>{res.nik}</p>
                      <p className="text-[10px] text-slate-400">Kp. {res.alamat} RT {res.rt}/RW {res.rw}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-mono text-[11px] font-semibold">{res.pekerjaan}</td>
                    <td className="px-4 py-3.5">
                      {res.statusBansos !== 'Tidak Menerima' ? (
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold font-mono tracking-wider text-white ${
                          res.statusBansos === 'Penerima BLT' 
                            ? 'bg-blue-600 shadow-sm shadow-blue-250' 
                            : res.statusBansos === 'Penerima PKH'
                            ? 'bg-purple-650 bg-purple-600 shadow-purple-250 shadow-sm'
                            : 'bg-emerald-600 shadow-sm shadow-emerald-250'
                        }`}>
                          🎁 {res.statusBansos}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Independen / Mandiri</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      {activeRole === 'Operator' || activeRole === 'Sekretaris' || activeRole === 'Super Admin' ? (
                        <select
                          id={`change-bansos-select-${res.id}`}
                          value={res.statusBansos}
                          onChange={(e) => updateResidentBansos(res.id, e.target.value as any)}
                          className="text-[10px] font-bold border border-slate-200 bg-white hover:bg-slate-50 rounded-lg p-1.5 focus:outline-none"
                        >
                          <option value="Tidak Menerima">Tidak Menerima</option>
                          <option value="Penerima BLT">Ganti ke BLT</option>
                          <option value="Penerima PKH">Ganti ke PKH</option>
                          <option value="Penerima BPNT">Ganti ke BPNT</option>
                        </select>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">Batas Akses</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400 font-mono text-xs">Tidak ada data penerima bansos sesuai filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
