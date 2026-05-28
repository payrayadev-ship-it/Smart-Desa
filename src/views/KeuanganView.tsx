import React, { useState } from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  FileSpreadsheet, 
  FileText, 
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Sparkles,
  X
} from 'lucide-react';
import { FinanceTransaction, Role } from '../types';

interface KeuanganViewProps {
  finances: FinanceTransaction[];
  saveFinances: (data: FinanceTransaction[]) => void;
  activeRole: Role;
  onLogAction: (action: string, module: string) => void;
  openAiAssistant: () => void;
}

export default function KeuanganView({
  finances: initialFinances,
  saveFinances,
  activeRole,
  onLogAction,
  openAiAssistant
}: KeuanganViewProps) {
  const [transactions, setTransactions] = useState<FinanceTransaction[]>(initialFinances);
  const [filterType, setFilterType] = useState('Semua');
  const [filterSource, setFilterSource] = useState('Semua');

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<'Pemasukan' | 'Pengeluaran'>('Pengeluaran');
  const [category, setCategory] = useState('Pembangunan Desa');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('2026-05-28');
  const [source, setSource] = useState('DD'); // DD, ADD, PAD

  // Category listing
  const categoriesMap = {
    Pemasukan: ['Dana Desa (DD)', 'Alokasi Dana Desa (ADD)', 'Pendapatan Asli Desa (PAD)', 'Bantuan Keuangan Provinsi', 'Lain-lain'],
    Pengeluaran: ['Penyelenggaraan Pemerintahan', 'Pembangunan Desa', 'Pembinaan Kemasyarakatan', 'Pemberdayaan Masyarakat', 'Penanggulangan Bencana', 'Operasional Kantor']
  };

  // Balance Calculations
  const approvedTransactions = transactions.filter(t => t.status.includes('Disetujui'));

  const totalIncomes = approvedTransactions
    .filter(t => t.type === 'Pemasukan')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = approvedTransactions
    .filter(t => t.type === 'Pengeluaran')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingExpenditures = transactions
    .filter(t => t.type === 'Pengeluaran' && t.status === 'Pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentCashBalance = totalIncomes - totalExpenses;

  // Formatting helper
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || Number(amount) <= 0) {
      alert("Mohon masukkan deskripsi lengkap dan nominal nominal anggaran!");
      return;
    }

    const nextId = `fin-${Date.now()}`;
    const newTx: FinanceTransaction = {
      id: nextId,
      type,
      category,
      description: description.trim(),
      amount: Number(amount),
      date,
      source,
      status: activeRole === 'Bendahara' ? 'Disetujui Bendahara' : 'Pending',
      createdAt: new Date().toISOString()
    };

    const payload = [newTx, ...transactions];
    setTransactions(payload);
    saveFinances(payload);
    onLogAction(`Menambahkan transaksi APBDes: ${description} seharga ${formatIDR(newTx.amount)}`, 'Keuangan');

    // Reset Form
    setDescription('');
    setAmount('');
    setShowForm(false);
  };

  // Transaction state changes
  const approveTransaction = (id: string, roleApproved: 'Bendahara' | 'Kades') => {
    const payload = transactions.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: roleApproved === 'Kades' ? 'Disetujui Kades' as const : 'Disetujui Bendahara' as const,
          approvedBy: activeRole
        };
      }
      return t;
    });

    setTransactions(payload);
    saveFinances(payload);
    onLogAction(`Menyetujui transaksi APBDes nomor ID ${id}`, 'Keuangan');
  };

  // Delete transaction
  const handleDeleteTransaction = (id: string, name: string) => {
    if (window.confirm(`Hapus catatan transaksi keuangan "${name}"? Tindakan ini akan memicu penyesuaian neraca kas desa.`)) {
      const payload = transactions.filter(t => t.id !== id);
      setTransactions(payload);
      saveFinances(payload);
      onLogAction(`Menghapus transaksi keuangan: ${name}`, 'Keuangan');
    }
  };

  // EXPORT ledger as Excel Comma Separated file
  const exportLedgerToCSV = () => {
    const headers = 'ID,Tanggal,Tipe,Sumber,Kategori,Deskripsi,Nominal,Status\r\n';
    const rows = transactions.map(t => 
      `"${t.id}","${t.date}","${t.type}","${t.source}","${t.category}","${t.description.replace(/"/g, '""')}","${t.amount}","${t.status}"`
    ).join('\r\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Buku_Keuangan_APBDes_Sukamaju_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onLogAction("Mengekspor buku besar keuangan APBDes format CSV/Excel", "Keuangan");
  };

  // PRINTING BOOK REPORT LAYOUT
  const handlePrintLedgerReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>BUKU KAS DESA & APBDes SUKAMAJU</title>
          <style>
            body { font-family: monospace; padding: 30px; font-size: 11px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid black; padding: 7px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header-info { text-align: center; margin-bottom: 25px; line-height: 1.4; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          <div class="header-info">
            <h2>PEMERINTAH KABUPATEN BANDUNG</h2>
            <h3>LAPORAN HISTORIS BUKU KAS APBDes SUKAMAJU</h3>
            <p>Tahun Anggaran: 2026 | Cetakan Tanggal: ${new Date().toLocaleDateString('id-ID')}</p>
            <hr/>
          </div>

          <div style="font-weight: bold; margin-bottom: 5px;">
            TOTAL PENDAPATAN : ${formatIDR(totalIncomes)}<br/>
            TOTAL REAlISASI PENGELUARAN : ${formatIDR(totalExpenses)}<br/>
            NERACA KAS SAAT INI : ${formatIDR(currentCashBalance)}
          </div>

          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Sumber</th>
                <th>Tipe</th>
                <th>Kategori</th>
                <th>Deskripsi Transaksi</th>
                <th class="text-right">Nominal Anggaran</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.map(t => `
                <tr>
                  <td>${t.date}</td>
                  <td>${t.source}</td>
                  <td><b>${t.type}</b></td>
                  <td>${t.category}</td>
                  <td>${t.description}</td>
                  <td class="text-right"><b>${formatIDR(t.amount)}</b></td>
                  <td>${t.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p style="margin-top: 40px; text-align: right;">Mengetahui,<br/>Bendahara Desa Sukamaju<br/><br/><br/><br/>Siti Rahmawati, A.Md.</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesType = filterType === 'Semua' || t.type === filterType;
    const matchesSource = filterSource === 'Semua' || t.source === filterSource;
    return matchesType && matchesSource;
  });

  return (
    <div id="keuangan-view-wrapper" className="space-y-4 animate-fade">
      
      {/* Keuangan Header Grid Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <CreditCard size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 leading-none">Pertanggungjawaban Keuangan & APBDes 2026</h2>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Buku Bank, Pajak Mandiri, Transparansi Dana Desa (DD) Realtime</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* AI Predictor Trigger inside Finance View */}
          <button id="ai-budget-predict" onClick={openAiAssistant} className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-all">
            <Sparkles className="text-amber-500 animate-bounce" size={13} />
            <span>AI Budget Advisor</span>
          </button>
          
          <button id="export-keuangan-excel" onClick={exportLedgerToCSV} className="px-3 py-1.5 bg-emerald-55 text-emerald-700 border border-emerald-100 hover:bg-emerald-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
            <FileSpreadsheet size={14} />
            <span>Export Excel</span>
          </button>
          <button id="print-keuangan-pdf" onClick={handlePrintLedgerReport} className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
            <FileText size={14} />
            <span>Cetak Buku Kas</span>
          </button>

          {activeRole === 'Bendahara' || activeRole === 'Super Admin' ? (
            <button 
              id="add-tx-btn-trigger" 
              onClick={() => setShowForm(true)}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow transition-all"
            >
              <Plus size={14} />
              <span>Input Pemasukan/Pengeluaran</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* THREE VALUE NERACA CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Income Total approved */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono block">Pendapatan Desa Realisasi</span>
            <h3 className="text-xl font-bold text-emerald-600 font-mono leading-none">{formatIDR(totalIncomes)}</h3>
            <p className="text-[9px] text-slate-400">Total penerimaan transfer dana transfer daerah</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
            <TrendingUp size={20} />
          </div>
        </div>

        {/* Expense Total approved */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono block">Belanja Desa Terpakai</span>
            <h3 className="text-xl font-bold text-rose-600 font-mono leading-none">{formatIDR(totalExpenses)}</h3>
            <p className="text-[9px] text-slate-400">Total belanja pembangunan, gaji & operasional</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-full">
            <TrendingDown size={20} />
          </div>
        </div>

        {/* Free unused cash */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono block">Neraca / Sisa Anggaran Kas</span>
            <h3 className="text-xl font-bold text-blue-700 font-mono leading-none">{formatIDR(currentCashBalance)}</h3>
            <p className="text-[9px] text-indigo-550 font-bold block">Sisa dana cadangan siap pakai</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <DollarSign size={20} />
          </div>
        </div>
      </div>

      {/* REALTIME TRANSACTION SUBMIT FORM */}
      {showForm && (
        <div id="finance-form-modal-container" className="bg-slate-900/60 backdrop-blur-sm fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
            
            <div className="bg-blue-600 text-white p-3.5 flex justify-between items-center text-xs font-bold font-mono tracking-wider shrink-0">
              <span>INPUT TRANSAKSI ANGGARAN APBDes</span>
              <button id="close-finance-form" onClick={() => setShowForm(false)} className="text-white hover:text-slate-100 p-0.5">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="p-5 space-y-4">
              
              {/* Type Selection Tabs */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setType('Pemasukan');
                    setCategory(categoriesMap.Pemasukan[0]);
                  }}
                  className={`py-1.5 text-center rounded-md transition-all ${type === 'Pemasukan' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600'}`}
                >
                  🟢 MASUKAN
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType('Pengeluaran');
                    setCategory(categoriesMap.Pengeluaran[0]);
                  }}
                  className={`py-1.5 text-center rounded-md transition-all ${type === 'Pengeluaran' ? 'bg-rose-600 text-white shadow' : 'text-slate-600'}`}
                >
                  🔴 KELUARAN
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Sumber Dana</label>
                <select
                  id="source-field"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800"
                >
                  <option value="DD">DD (Dana Desa APBN)</option>
                  <option value="ADD">ADD (Alokasi Dana Desa APBD)</option>
                  <option value="PAD">PAD (Pendapatan Asli Desa Sewa)</option>
                  <option value="Provinsi">Provinsi (Bantuan Gubernur)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Klasifikasi Kategori</label>
                <select
                  id="category-field"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs font-bold p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800"
                >
                  {type === 'Pemasukan' 
                    ? categoriesMap.Pemasukan.map(cat => <option key={cat} value={cat}>{cat}</option>)
                    : categoriesMap.Pengeluaran.map(cat => <option key={cat} value={cat}>{cat}</option>)
                  }
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Nominal Transaksi (Rupiah)*</label>
                <input
                  id="amount-field"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Rp. e.g. 15000000"
                  className="w-full text-xs font-mono p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Uraian / Deskripsi Lengkap*</label>
                <input
                  id="desc-field"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Sebutkan instansi, keperluan, atau no kwitansi"
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Tanggal Transaksi</label>
                <input
                  id="date-field"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs font-mono p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800"
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
                  id="submit-tx-btn"
                  className={`px-5 py-2 text-white text-xs font-bold rounded-lg shadow-sm ${type === 'Pemasukan' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                >
                  REKAM TRANSAKSI
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* FITER CONTROLS ROW */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex flex-wrap gap-2 text-xs font-semibold">
        <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider self-center font-mono pl-1">Filter Buku:</span>
        
        {/* Type select */}
        <button
          onClick={() => setFilterType('Semua')}
          className={`px-3 py-1 rounded-lg border transition-all ${filterType === 'Semua' ? 'bg-slate-800 text-white border-slate-800 shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'}`}
        >
          Semua Akun
        </button>
        <button
          onClick={() => setFilterType('Pemasukan')}
          className={`px-3 py-1 rounded-lg border transition-all ${filterType === 'Pemasukan' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'}`}
        >
          🟢 Pemasukan saja
        </button>
        <button
          onClick={() => setFilterType('Pengeluaran')}
          className={`px-3 py-1 rounded-lg border transition-all ${filterType === 'Pengeluaran' ? 'bg-rose-650 bg-rose-6050 bg-rose-600 text-white border-rose-600 shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'}`}
        >
          🔴 Pengeluaran saja
        </button>

        <span className="text-slate-300 self-center">|</span>

        {/* Source select */}
        <select
          id="finance-source-select"
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1 text-slate-700 font-semibold"
        >
          <option value="Semua">Semua Sumber Dana</option>
          <option value="DD">DD (Dana Desa)</option>
          <option value="ADD">ADD (Alokasi Dana Desa)</option>
          <option value="PAD">PAD (Pendapatan Asli Desa)</option>
        </select>
      </div>

      {/* BOOKKEEPING LEDGER LIST */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-mono text-[10px]">
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 font-bold">Tanggal</th>
                <th className="px-4 py-3 font-bold">Dana</th>
                <th className="px-4 py-3 font-bold">Klasifikasi Program / Kategori</th>
                <th className="px-4 py-3 font-bold">Uraian Pengeluaran / Penerimaan</th>
                <th className="px-4 py-3 font-bold text-right">Nominal</th>
                <th className="px-4 py-3 font-bold">Persetujuan Bendahara</th>
                <th className="px-4 py-3 font-bold text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-slate-600">{tx.date}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-700">{tx.source}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-slate-800">{tx.category}</p>
                      <p className="text-[9px] text-slate-400 font-mono">Tx ID: {tx.id}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 pr-4 max-w-[250px] truncate" title={tx.description}>
                      {tx.description}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-[11px]">
                      <b className={tx.type === 'Pemasukan' ? 'text-emerald-600 font-extrabold' : 'text-slate-800 font-extrabold'}>
                        {tx.type === 'Pemasukan' ? '+' : '-'} {formatIDR(tx.amount)}
                      </b>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wider w-max ${
                          tx.status === 'Disetujui Kades' 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                            : tx.status === 'Disetujui Bendahara' 
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                        }`}>
                          {tx.status}
                        </span>
                        {tx.approvedBy && (
                          <span className="text-[8px] text-slate-400 font-mono uppercase block">Approved by {tx.approvedBy}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1 whitespace-nowrap">
                      {/* Bendahara Actions */}
                      {tx.status === 'Pending' && activeRole === 'Bendahara' && (
                        <button
                          id={`approve-bendahara-${tx.id}`}
                          onClick={() => approveTransaction(tx.id, 'Bendahara')}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold border border-emerald-200 transition-colors"
                        >
                          Klik Setuju
                        </button>
                      )}

                      {/* Kepala Desa Approvals */}
                      {tx.status === 'Disetujui Bendahara' && activeRole === 'Kepala Desa' && (
                        <button
                          id={`approve-kades-finance-${tx.id}`}
                          onClick={() => approveTransaction(tx.id, 'Kades')}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold shadow-sm transition-colors"
                        >
                          TTD-SP2D Kades
                        </button>
                      )}

                      {activeRole === 'Bendahara' || activeRole === 'Super Admin' ? (
                        <button
                          id={`delete-finance-${tx.id}`}
                          onClick={() => handleDeleteTransaction(tx.id, tx.description)}
                          className="p-1 text-slate-400 hover:text-rose-600 border border-transparent hover:border-slate-200 rounded transition-colors inline-block"
                        >
                          <Trash2 size={12} />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">Lock-R/O</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-mono text-xs">Arsip pembukuan APBDes kosong dengan filter aktif.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
