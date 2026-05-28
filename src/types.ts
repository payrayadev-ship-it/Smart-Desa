export type Role = 
  | 'Super Admin' 
  | 'Kepala Desa' 
  | 'Sekretaris' 
  | 'Bendahara' 
  | 'Operator' 
  | 'RT/RW' 
  | 'Masyarakat';

export interface VillageProfile {
  name: string;
  subdistrict: string;
  regency: string;
  province: string;
  logoUrl: string;
  kepalaDesa: string;
  sekretarisDesa: string;
  bendaharaDesa: string;
  operatorDesa: string;
  phone: string;
  email: string;
  address: string;
  sejarah: string;
  visi: string;
  misi: string[];
  signatureUrl?: string;
  signatureType?: 'image' | 'barcode';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  nik?: string; // If role is RT/RW or Masyarakat
  rt?: string;
  rw?: string;
}

export interface Resident {
  id: string;
  nik: string;
  noKK: string;
  nama: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  agama: string;
  statusPerkawinan: 'Belum Kawin' | 'Kawin' | 'Cerai Hidup' | 'Cerai Mati';
  pendidikan: string;
  pekerjaan: string;
  alamat: string;
  rt: string;
  rw: string;
  statusPenduduk: 'Aktif' | 'Meninggal' | 'Pindah';
  statusBansos: 'Penerima BLT' | 'Penerima PKH' | 'Penerima BPNT' | 'Tidak Menerima';
  fotoKtp?: string;
  updatedAt?: string;
}

export type LetterType = 
  | 'Surat Keterangan Domisili'
  | 'Surat Keterangan Usaha'
  | 'Surat Keterangan Tidak Mampu (SKTM)'
  | 'Surat Keterangan Kelahiran'
  | 'Surat Keterangan Kematian'
  | 'Surat Keterangan Pindah'
  | 'Surat Pengantar Nikah'
  | 'Surat Izin Keramaian'
  | 'Surat Keterangan Umum';

export interface LetterTrackingLog {
  status: 'Diajukan' | 'Ditinjau' | 'Disetujui Kades' | 'Ditolak' | 'Selesai';
  date: string;
  note: string;
}

export interface Letter {
  id: string;
  letterNumber: string;
  type: LetterType;
  requesterName: string;
  requesterNik: string;
  status: 'Diajukan' | 'Ditinjau' | 'Disetujui Kades' | 'Ditolak' | 'Selesai';
  rtApproval: boolean;
  fields: Record<string, string>; // custom fields depending on letter type
  trackingLogs: LetterTrackingLog[];
  signedBy?: string;
  signedAt?: string;
  qrCodeDataUrl?: string;
  createdAt: string;
}

export interface FinanceTransaction {
  id: string;
  type: 'Pemasukan' | 'Pengeluaran';
  category: string; // Dana Desa, Alokasi Dana Desa, Pendapatan Asli Desa, Pembangunan, Pemberdayaan, Operasional Kantor, dll
  description: string;
  amount: number;
  date: string;
  source: string; // DD, ADD, PAD, dll
  status: 'Pending' | 'Disetujui Bendahara' | 'Disetujui Kades';
  approvedBy?: string;
  createdAt: string;
}

export interface SocialAssistance {
  id: string;
  name: string;
  type: 'BLT Dana Desa' | 'PKH (Program Keluarga Harapan)' | 'BPNT (Sembako)' | 'BST (Bantuan Sosial Tunai)';
  period: string; // e.g. "Mei 2026"
  budgetPerRecipient: number;
  status: 'Disetujui' | 'Penyaluran' | 'Selesai';
  recipientsCount: number;
  recipientsNiks: string[]; // references of resident NIKs
  createdAt: string;
}

export interface VillageAsset {
  id: string;
  code?: string;
  serialNumber?: string;
  name: string;
  category: string;
  condition: 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
  purchaseDate?: string;
  purchasedAt?: string;
  purchaseValue?: number;
  acquisitionValue?: number;
  currentValue?: number;
  quantity?: number;
  location: string;
  qrCodeUrl?: string;
}

export interface ComplaintResponse {
  id: string;
  senderName: string;
  senderRole: Role;
  message: string;
  date: string;
}

export interface Complaint {
  id: string;
  title: string;
  category: string;
  description: string;
  reporterName?: string;
  reporterNik?: string;
  residentNik?: string;
  status: 'Pending' | 'Diproses' | 'Selesai' | 'Diajukan';
  date?: string;
  createdAt?: string;
  photoUrl?: string;
  dispositionTo?: string; // Unit yang didisposisikan, e.g. "Kasi Kesejahteraan"
  responses?: ComplaintResponse[];
  response?: string;
  respondedBy?: string;
  respondedAt?: string;
}

export interface VillageAnnouncement {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  date: string;
  isActive?: boolean;
}

export interface VillageAgenda {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: string; // e.g., "Seluruh RT/RW", "Warga Penerima Bansos", "BPD & Tokoh Masyarakat"
  notulen?: string;
  documentationUrls?: string[];
}

export interface RtRwFinance {
  id: string;
  rt: string;
  rw: string;
  month: string; // e.g., "2026-05"
  iuranWarga: number;
  kasRt: number;
  pengeluaranRt: number;
  agendaRt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  module: string;
  timestamp: string;
}

export interface PortalCredential {
  type: 'staf' | 'warga';
  role?: Role;
  name: string;
  nik?: string;
  pin: string;
}

export type CitizenComplaint = Complaint;

