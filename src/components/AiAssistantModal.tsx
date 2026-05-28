import React from 'react';
import { Sparkles, Send, X, AlertCircle, RefreshCw, BarChart2, ShieldAlert } from 'lucide-react';
import { FinanceTransaction } from '../types';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  finances?: FinanceTransaction[];
}

export default function AiAssistantModal({ isOpen, onClose, finances = [] }: AiAssistantModalProps) {
  const [activeTab, setActiveTab] = React.useState<'chat' | 'predict' | 'draft'>('chat');
  
  // Chat state
  const [messages, setMessages] = React.useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Halo! Saya SukaAsisten, asisten AI pintar Desa Sukamaju. Anda dapat menanyakan info kependudukan, regulasi surat, atau meminta bantuan analisis APBDes desa.' }
  ]);
  const [inputMessage, setInputMessage] = React.useState('');
  const [chatLoading, setChatLoading] = React.useState(false);
  const [chatError, setChatError] = React.useState('');

  // Budget prediction state
  const [villageGoals, setVillageGoals] = React.useState('Optimalkan ketahanan pangan mandiri rukun tetangga, perbaikan jalan berlubang Kp. Babakan, dan peningkatan bantuan bibit lele.');
  const [predictResult, setPredictResult] = React.useState('');
  const [predictLoading, setPredictLoading] = React.useState(false);

  // Complaint draft state
  const [draftTitle, setDraftTitle] = React.useState('Lampu jalan mati di tanjakan RT 02');
  const [draftCategory, setDraftCategory] = React.useState('Infrastruktur');
  const [draftDesc, setDraftDesc] = React.useState('Lampu jalan sudah mati lebih dari semeninggu sehingga berbahaya di malam hari.');
  const [draftResult, setDraftResult] = React.useState('');
  const [draftLoading, setDraftLoading] = React.useState(false);

  if (!isOpen) return null;

  // Handler for chat send
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || chatLoading) return;

    const userMsg = inputMessage.trim();
    const newMsgs = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(newMsgs);
    setInputMessage('');
    setChatLoading(true);
    setChatError('');

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs }),
      });
      const data = await response.json();
      if (response.ok && data.text) {
        setMessages([...newMsgs, { role: 'assistant', content: data.text }]);
      } else {
        setChatError(data.error || 'Terjadi kesalahan sistem.');
      }
    } catch (err) {
      setChatError('Gagal menghubungi server asisten AI.');
    } finally {
      setChatLoading(false);
    }
  };

  // Handler for APBDes predict
  const generateBudgetPrediction = async () => {
    setPredictLoading(true);
    try {
      const response = await fetch('/api/ai/budget-predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentFinance: finances, villageGoals }),
      });
      const data = await response.json();
      if (response.ok && data.text) {
        setPredictResult(data.text);
      } else {
        setPredictResult(`Error: ${data.error || 'Gagal generate prediksi.'}`);
      }
    } catch {
      setPredictResult('Koneksi server terganggu saat menganalisis anggaran desa.');
    } finally {
      setPredictLoading(false);
    }
  };

  // Handler for Complaint Draft response
  const generateComplaintDraft = async () => {
    setDraftLoading(true);
    try {
      const response = await fetch('/api/ai/complaint-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaintTitle: draftTitle,
          complaintCategory: draftCategory,
          complaintDesc: draftDesc
        }),
      });
      const data = await response.json();
      if (response.ok && data.text) {
        setDraftResult(data.text);
      } else {
        setDraftResult(`Error: ${data.error || 'Gagal membuat draf tanggapan.'}`);
      }
    } catch {
      setDraftResult('Koneksi server gagal saat merancang respons surat.');
    } finally {
      setDraftLoading(false);
    }
  };

  return (
    <div id="ai-assistant-modal-backdrop" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div id="ai-assistant-modal-box" className="bg-white rounded-2xl w-full max-w-3xl h-[600px] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-white/10 rounded-lg">
              <Sparkles className="text-amber-300 animate-pulse" size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-wide">Pusat Asisten AI Smart Desa</h2>
              <p className="text-[10px] text-indigo-200 font-mono">Ditenagai oleh Gemini 3.5-Flash (Server-Side)</p>
            </div>
          </div>
          <button id="ai-modal-close" onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-rose-100 bg-slate-50 shrink-0 text-xs font-semibold p-1 gap-1">
          <button
            id="tab-ai-chat"
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 text-center rounded-lg transition-all ${activeTab === 'chat' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            💬 Konsultasi Warga
          </button>
          <button
            id="tab-ai-predict"
            onClick={() => {
              setActiveTab('predict');
              if (!predictResult && finances.length > 0) generateBudgetPrediction();
            }}
            className={`flex-1 py-2 text-center rounded-lg transition-all ${activeTab === 'predict' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            📊 Analisis APBDes & Anggaran
          </button>
          <button
            id="tab-ai-draft"
            onClick={() => setActiveTab('draft')}
            className={`flex-1 py-2 text-center rounded-lg transition-all ${activeTab === 'draft' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            ✍️ Auto-Draft Surat Pengaduan
          </button>
        </div>

        {/* Body content based on tab */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
          
          {/* TAB 1: Chat */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-full justify-between">
              <div className="flex-grow space-y-3 overflow-y-auto pr-1">
                {messages.map((ms, i) => (
                  <div key={i} className={`flex ${ms.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                      ms.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}>
                      <p className="font-semibold text-[9px] uppercase tracking-wider mb-1 opacity-70 font-mono">
                        {ms.role === 'user' ? 'Warga / Staf' : 'SukaAsisten AI'}
                      </p>
                      <span className="whitespace-pre-line">{ms.content}</span>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl p-3 text-xs text-slate-500 rounded-tl-none flex items-center space-x-2 shadow-sm font-mono">
                      <RefreshCw className="animate-spin text-blue-500" size={13} />
                      <span>Sedang merumuskan jawaban terbaik...</span>
                    </div>
                  </div>
                )}
                {chatError && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-xl text-xs flex items-center space-x-2">
                    <AlertCircle size={15} />
                    <span>{chatError}</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="mt-3 flex items-center space-x-2 bg-white rounded-xl border border-slate-200 p-1">
                <input
                  id="chat-input-text"
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Tanyakan seperti: 'Bagaimana syarat mengurus Surat Domisili?'"
                  className="flex-1 text-xs px-3 py-2 bg-transparent focus:outline-none focus:ring-0 text-slate-800"
                />
                <button
                  id="chat-btn-submit"
                  type="submit"
                  disabled={chatLoading || !inputMessage.trim()}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shrink-0 disabled:opacity-50"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Budget Advisor */}
          {activeTab === 'predict' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Identifikasi Prioritas Pembangunan Desa</label>
                <div className="flex gap-2">
                  <textarea
                    id="predict-goals-textarea"
                    value={villageGoals}
                    onChange={(e) => setVillageGoals(e.target.value)}
                    rows={2}
                    className="flex-1 text-xs border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 font-mono bg-slate-50 text-slate-800"
                  />
                  <button
                    id="predict-ai-calc"
                    onClick={generateBudgetPrediction}
                    disabled={predictLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-60 shrink-0"
                  >
                    <BarChart2 size={16} />
                    <span>Lapor AI</span>
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm min-h-[250px] flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <h4 className="text-xs font-bold text-slate-800 font-mono tracking-wider">💡 REKOMENDASI ANALITIS AI</h4>
                  {predictLoading && (
                    <span className="text-[10px] text-blue-600 font-semibold flex items-center space-x-1 font-mono">
                      <RefreshCw className="animate-spin" size={12} />
                      <span>Mensistematisasi data keuangan...</span>
                    </span>
                  )}
                </div>

                {predictResult ? (
                  <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed font-mono">
                    {predictResult}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    <BarChart2 size={36} className="mx-auto text-slate-300 mb-2" />
                    <p>Klik tombol "Lapor AI" untuk menyajikan analisis APBDes berjenjang, penyeimbangan neraca pengeluaran, dan prediksi kesesuaian masterplan desa.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Complaint Draft Auto responder */}
          {activeTab === 'draft' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Subjek Pengaduan Warga</label>
                  <input
                    id="draft-title-input"
                    type="text"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    className="w-full text-xs font-semibold border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-blue-500 bg-slate-50 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Kategori Layanan</label>
                  <select
                    id="draft-cat-select"
                    value={draftCategory}
                    onChange={(e) => setDraftCategory(e.target.value)}
                    className="w-full text-xs font-semibold border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-blue-500 bg-slate-50 text-slate-800"
                  >
                    <option value="Pelayanan">Pelayanan</option>
                    <option value="Infrastruktur">Infrastruktur</option>
                    <option value="Keamanan">Keamanan</option>
                    <option value="Bencana Alam">Bencana Alam</option>
                    <option value="Sosial/Bansos">Sosial/Bansos</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Isi Pengaduan / Keluhan</label>
                  <textarea
                    id="draft-desc-textarea"
                    value={draftDesc}
                    onChange={(e) => setDraftDesc(e.target.value)}
                    rows={2}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-blue-500 font-mono bg-slate-50 text-slate-800"
                  />
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <button
                    id="draft-ai-generate-btn"
                    onClick={generateComplaintDraft}
                    disabled={draftLoading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center space-x-1.5 transition-colors disabled:opacity-50 font-mono"
                  >
                    <RefreshCw className={draftLoading ? 'animate-spin' : ''} size={14} />
                    <span>Draf Jawaban Solutif Kepala Desa</span>
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm min-h-[160px] flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <h4 className="text-xs font-bold text-slate-800 font-mono tracking-wider flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-orange-500" />
                    <span>DRAF RESPONS RESMI KANTOR BALAI DESA (SIAP SALIN)</span>
                  </h4>
                  {draftLoading && (
                    <span className="text-[10px] text-indigo-600 font-semibold animate-pulse font-mono">Draf sedang ditulis otomatis...</span>
                  )}
                </div>

                {draftResult ? (
                  <div className="text-xs text-slate-800 whitespace-pre-line leading-relaxed font-mono bg-slate-50 p-3 rounded-lg border border-slate-100 relative">
                    {draftResult}
                    <button 
                      id="draft-copy-btn"
                      onClick={() => navigator.clipboard.writeText(draftResult)}
                      className="absolute top-2 right-2 px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-[10px] font-bold rounded shadow transition-colors"
                    >
                      Salin Teks
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    <p>Rumuskan balasan diplomatis, sopan, dan solutif otomatis dalam hitungan detik untuk meredam kecemasan warga serta memberikan rencana aksi teratur.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-3 flex justify-between items-center text-[10px] text-slate-500 font-mono border-t border-slate-200 shrink-0">
          <span>Identifikasi Pengguna: Staf Operasional - Sukamaju</span>
          <span>© 2026 Smart Desa Digital. All Rights Reserved.</span>
        </div>

      </div>
    </div>
  );
}
