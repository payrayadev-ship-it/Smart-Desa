import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Activity, 
  AlertOctagon, 
  CheckCircle2, 
  Wrench,
  X 
} from 'lucide-react';
import { VillageAsset, Role } from '../types';

interface AsetViewProps {
  assets: VillageAsset[];
  saveAssets: (data: VillageAsset[]) => void;
  activeRole: Role;
  onLogAction: (action: string, module: string) => void;
}

export default function AsetView({
  assets: initialAssets,
  saveAssets,
  activeRole,
  onLogAction
}: AsetViewProps) {
  const [assets, setAssets] = useState<VillageAsset[]>(initialAssets);
  const [search, setSearch] = useState('');
  const [filterCondition, setFilterCondition] = useState('Semua');

  // New Asset Form states
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Mesin & Kendaraan');
  const [quantity, setQuantity] = useState('1');
  const [condition, setCondition] = useState<'Baik' | 'Rusak Ringan' | 'Rusak Berat'>('Baik');
  const [location, setLocation] = useState('Gedung Balai Desa');
  const [acquisitionValue, setAcquisitionValue] = useState('');

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !acquisitionValue) {
      alert("Mohon isi nama barang dan taksiran harga perolehan!");
      return;
    }

    const newAsset: VillageAsset = {
      id: `ast-${Date.now()}`,
      name: name.trim(),
      category,
      quantity: Number(quantity),
      condition,
      location,
      acquisitionValue: Number(acquisitionValue),
      serialNumber: `INV-${Date.now().toString().slice(-6)}`,
      purchasedAt: new Date().getFullYear().toString()
    };

    const payload = [newAsset, ...assets];
    setAssets(payload);
    saveAssets(payload);
    onLogAction(`Mendaftarkan aset inventaris baru: ${name}`, 'Aset Desa');

    // Reset Form
    setName('');
    setQuantity('1');
    setAcquisitionValue('');
    setShowForm(false);
  };

  const deleteAsset = (id: string, assetName: string) => {
    if (window.confirm(`Hapus pencatatan inventaris "${assetName}"? Tindakan ini dimonitor.`)) {
      const payload = assets.filter(a => a.id !== id);
      setAssets(payload);
      saveAssets(payload);
      onLogAction(`Menghapus pencatatan aset inventaris: ${assetName}`, 'Aset Desa');
    }
  };

  const updateAssetCondition = (id: string, newCond: VillageAsset['condition']) => {
    const payload = assets.map(a => {
      if (a.id === id) {
        return { ...a, condition: newCond };
      }
      return a;
    });
    setAssets(payload);
    saveAssets(payload);
    const targetName = assets.find(a => a.id === id)?.name || 'Barang';
    onLogAction(`Mengubah status kelayakan barang ${targetName} menjadi ${newCond}`, 'Aset Desa');
  };

  // Filter
  const filteredAssets = assets.filter(a => {
    const term = search.toLowerCase();
    const queryMatch = 
      a.name.toLowerCase().includes(term) || 
      a.serialNumber.toLowerCase().includes(term) || 
      a.location.toLowerCase().includes(term);

    const conditionMatch = filterCondition === 'Semua' || a.condition === filterCondition;
    return queryMatch && conditionMatch;
  });

  return (
    <div id="aset-view-wrapper" className="space-y-4 animate-fade">
      
      {/* Header element */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Building2 size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 leading-none">Buku Inventaris & Aset Desa Sukamaju</h2>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Pengawasan Prasarana, Konstruksi, dan Barang Milik Daerah Realtime</p>
          </div>
        </div>

        {activeRole !== 'Masyarakat' && (
          <button
            id="add-asset-btn-trigger"
            onClick={() => setShowForm(true)}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow self-start"
          >
            <Plus size={14} />
            <span>Mendaftarkan Barang (Aset)</span>
          </button>
        )}
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative md:col-span-2">
          <Search className="absolute left-2.5 top-2.5 text-slate-400" size={13} />
          <input
            id="asset-search-field"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama barang, nomor scan inventaris, lokasi penempatan..."
            className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          />
        </div>

        <select
          id="filter-asset-condition"
          value={filterCondition}
          onChange={(e) => setFilterCondition(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-700"
        >
          <option value="Semua">Semua Tingkat Kelaikan</option>
          <option value="Baik">🟢 Kondisi Baik (Optimal)</option>
          <option value="Rusak Ringan">🔧 Rusak Ringan (Perlu Servis)</option>
          <option value="Rusak Berat">🚨 Rusak Berat (Afkir)</option>
        </select>
      </div>

      {/* NEW ASSET FORM MODAL */}
      {showForm && (
        <div id="new-asset-modal-backdrop" className="bg-slate-900/60 backdrop-blur-sm fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
            
            <div className="bg-blue-600 text-white p-3.5 flex justify-between items-center text-xs font-bold font-mono tracking-wider shrink-0">
              <span>PENDAFTARAN RECORD INVENTARIS DESA</span>
              <button id="close-asset-modal" onClick={() => setShowForm(false)} className="text-white hover:text-slate-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Nama Barang / Nama Inventaris*</label>
                <input
                  id="asset-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Lampu PJU Merk Philips"
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Kategori Aset</label>
                  <select
                    id="asset-cat-field"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800"
                  >
                    <option value="Bangunan & Gedung">Bangunan & Gedung</option>
                    <option value="Mesin & Kendaraan">Mesin & Kendaraan</option>
                    <option value="Elektronik & Komputer">Elektronik & Komputer</option>
                    <option value="Lahan Pertanian">Lahan Pertanian / Sawah</option>
                    <option value="Peralatan Kantor">Peralatan Kantor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Jumlah Koleksi (Qty)</label>
                  <input
                    id="asset-qty-field"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 font-mono"
                    min={1}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Kondisi Fisik Saat Ini</label>
                  <select
                    id="asset-cond-field"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800"
                  >
                    <option value="Baik">Konfisi Baik (Ready)</option>
                    <option value="Rusak Ringan">Rusak Ringan</option>
                    <option value="Rusak Berat">Rusak Berat (Wreck)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Nilai Pembelian Awal (IDR)*</label>
                  <input
                    id="asset-value-field"
                    type="number"
                    value={acquisitionValue}
                    onChange={(e) => setAcquisitionValue(e.target.value)}
                    placeholder="Rp."
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Gedung / Lokasi Penempatan</label>
                <input
                  id="asset-location-field"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Instansi / Dusun / RT Penempatan"
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold font-mono"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  id="submit-asset-btn"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  SIMPAN INVENTARIS
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* INVENTARIS ASSETS TABLE (High Density Style) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-mono text-[10px]">
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 font-bold">Barkode Inventaris / Kode Seri</th>
                <th className="px-4 py-3 font-bold">Nama Barang Milik Desa</th>
                <th className="px-4 py-3 font-bold">Lokasi Penempatan</th>
                <th className="px-4 py-3 font-bold">Nilai Perolehan</th>
                <th className="px-4 py-3 font-bold">Kondisi Kelaikan</th>
                <th className="px-4 py-3 font-bold text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssets.length > 0 ? (
                filteredAssets.map((ast) => (
                  <tr key={ast.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-600">
                      <span className="font-bold text-slate-800 inline-block bg-slate-100 px-1.5 py-0.5 rounded leading-none mb-1 text-[10px]">
                        {ast.serialNumber}
                      </span>
                      <p className="text-[10px] text-slate-400">Tahun Beli: {ast.purchasedAt}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-800 leading-tight">{ast.name}</p>
                      <p className="text-[9px] text-indigo-600 font-mono mt-0.5">Kategori: {ast.category} ({ast.quantity} Unit)</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium">{ast.location}</td>
                    <td className="px-4 py-3.5 text-slate-900 font-bold font-mono">{formatIDR(ast.acquisitionValue)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1">
                        {ast.condition === 'Baik' ? (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full text-[9px] font-bold w-max">🟢 BAIK / OPTIMAL</span>
                        ) : ast.condition === 'Rusak Ringan' ? (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-100 rounded-full text-[9px] font-bold w-max">🔩 SURVIVAL SERVIS</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-100 rounded-full text-[9px] font-bold w-max">🚨 AFKIR / RUSAK</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      {activeRole === 'Super Admin' || activeRole === 'Sekretaris' || activeRole === 'Operator' ? (
                        <div className="flex justify-end gap-1.5">
                          <select
                            id={`change-asset-cond-${ast.id}`}
                            value={ast.condition}
                            onChange={(e) => updateAssetCondition(ast.id, e.target.value as any)}
                            className="text-[9px] font-bold border border-slate-200 bg-white rounded p-1"
                          >
                            <option value="Baik">Ubah: Baik</option>
                            <option value="Rusak Ringan">Ubah: Rusak Ringan</option>
                            <option value="Rusak Berat">Ubah: Rusak Berat</option>
                          </select>
                          <button
                            id={`delete-asset-${ast.id}`}
                            onClick={() => deleteAsset(ast.id, ast.name)}
                            className="p-1 hover:bg-rose-50 border border-transparent hover:border-slate-200 rounded text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">Batas Akses</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-mono text-xs">Daftar Aset desa untuk kondisi filter ini kosong.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
