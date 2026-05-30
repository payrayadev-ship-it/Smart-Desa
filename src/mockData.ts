import { Resident, Letter, FinanceTransaction, SocialAssistance, VillageAsset, Complaint, VillageAnnouncement, VillageAgenda, RtRwFinance, AuditLog, VillageProfile, PortalCredential } from './types';

export const INITIAL_VILLAGE_PROFILE: VillageProfile = {
  name: "Desa Sukamaju",
  subdistrict: "Kecamatan Paseh",
  regency: "Kabupaten Bandung",
  province: "Provinsi Jawa Barat",
  logoUrl: "https://images.unsplash.com/photo-1590005354167-6da97870c913?auto=format&fit=crop&q=80&w=200", // placeholder for clean gov avatar
  kepalaDesa: "H. Dadang Sulaeman, S.IP.",
  sekretarisDesa: "Ahmad Fauzi, S.Kom.",
  bendaharaDesa: "Siti Rahmawati, A.Md.",
  operatorDesa: "Budi Santoso",
  phone: "0812-3456-7890",
  email: "info@sukamaju-bandung.desa.id",
  address: "Jl. Raya Paseh No. 123, Sukamaju, Bandung, Jawa Barat 40383",
  sejarah: "Desa Sukamaju terbentuk sejak tahun 1968, bermula dari wilayah pertanian subur di lereng bukit Paseh. Melalui gotong royong dan semangat kebersamaan, kini desa bertransformasi menjadi desa mandiri digital percontohan tingkat provinsi.",
  visi: "Mewujudkan Desa Sukamaju yang Mandiri, Sejahtera, Transparan, Berkelanjutan dengan Dukungan Teknologi Digital Modern Berlandaskan Gotong Royong.",
  misi: [
    "Meningkatkan kualitas pelayanan administrasi publik desa cepat 5 menit selesai mandiri gratis.",
    "Mengembangkan transparansi anggaran APBDes berbasis real-time publikasi digital.",
    "Mendorong potensi ekonomi lokal melalui digitalisasi UMKM Desa dan BUMDes Sukamaju Utama.",
    "Mengoptimalkan penyaluran ketahanan pangan dan bantuan sosial adil menggunakan verifikasi data AI."
  ],
  signatureUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=150",
  signatureType: "image"
};

// Initial realistic residents data
const INITIAL_RESIDENTS: Resident[] = [
  {
    id: "res-1",
    nik: "3204121208850001",
    noKK: "3204122501100003",
    nama: "Herman Kartomi",
    tempatLahir: "Bandung",
    tanggalLahir: "1985-08-12",
    jenisKelamin: "Laki-laki",
    agama: "Islam",
    statusPerkawinan: "Kawin",
    pendidikan: "D3",
    pekerjaan: "Wiraswasta",
    alamat: "Kp. Babakan RT 02 RW 05",
    rt: "02",
    rw: "05",
    statusPenduduk: "Aktif",
    statusBansos: "Tidak Menerima",
    fotoKtp: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: "res-2",
    nik: "3204124311890002",
    noKK: "3204122501100003",
    nama: "Anisa Rahmawati",
    tempatLahir: "Bandung",
    tanggalLahir: "1989-11-03",
    jenisKelamin: "Perempuan",
    agama: "Islam",
    statusPerkawinan: "Kawin",
    pendidikan: "SLTA",
    pekerjaan: "Mengurus Rumah Tangga",
    alamat: "Kp. Babakan RT 02 RW 05",
    rt: "02",
    rw: "05",
    statusPenduduk: "Aktif",
    statusBansos: "Tidak Menerima",
    fotoKtp: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: "res-3",
    nik: "3204120302550008",
    noKK: "3204120101050015",
    nama: "Slamet Rahardja",
    tempatLahir: "Semarang",
    tanggalLahir: "1955-02-03",
    jenisKelamin: "Laki-laki",
    agama: "Islam",
    statusPerkawinan: "Kawin",
    pendidikan: "SD",
    pekerjaan: "Petani",
    alamat: "Asrama Baru RT 01 RW 02",
    rt: "01",
    rw: "02",
    statusPenduduk: "Aktif",
    statusBansos: "Penerima BLT",
    fotoKtp: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: "res-4",
    nik: "3204124405590001",
    noKK: "3204120101050015",
    nama: "Sukarni",
    tempatLahir: "Bandung",
    tanggalLahir: "1959-05-04",
    jenisKelamin: "Perempuan",
    agama: "Islam",
    statusPerkawinan: "Kawin",
    pendidikan: "SD",
    pekerjaan: "Buruh Tani",
    alamat: "Asrama Baru RT 01 RW 02",
    rt: "01",
    rw: "02",
    statusPenduduk: "Aktif",
    statusBansos: "Penerima PKH"
  },
  {
    id: "res-5",
    nik: "3204122105950003",
    noKK: "3204121512180004",
    nama: "Rian Hermawan",
    tempatLahir: "Bandung",
    tanggalLahir: "1995-05-21",
    jenisKelamin: "Laki-laki",
    agama: "Kristen",
    statusPerkawinan: "Belum Kawin",
    pendidikan: "S1",
    pekerjaan: "Karyawan Swasta",
    alamat: "Kp. Pasir Mulya RT 03 RW 01",
    rt: "03",
    rw: "01",
    statusPenduduk: "Aktif",
    statusBansos: "Tidak Menerima"
  },
  {
    id: "res-6",
    nik: "3204126201000004",
    noKK: "3204121512180004",
    nama: "Dian Safitri",
    tempatLahir: "Sumedang",
    tanggalLahir: "2000-01-22",
    jenisKelamin: "Perempuan",
    agama: "Islam",
    statusPerkawinan: "Belum Kawin",
    pendidikan: "SLTA",
    pekerjaan: "Buruh Harian Lepas",
    alamat: "Kp. Pasir Mulya RT 03 RW 01",
    rt: "03",
    rw: "01",
    statusPenduduk: "Aktif",
    statusBansos: "Penerima BPNT"
  },
  {
    id: "res-7",
    nik: "3204121404450005",
    noKK: "3204120808020001",
    nama: "Mbah Suroso",
    tempatLahir: "Solo",
    tanggalLahir: "1945-04-14",
    jenisKelamin: "Laki-laki",
    agama: "Islam",
    statusPerkawinan: "Cerai Mati",
    pendidikan: "Tidak Sekolah",
    pekerjaan: "Pensiunan",
    alamat: "Kp. Bojong RT 01 RW 04",
    rt: "01",
    rw: "04",
    statusPenduduk: "Aktif",
    statusBansos: "Penerima BLT"
  },
  {
    id: "res-8",
    nik: "3204122810900010",
    noKK: "3204121909150009",
    nama: "Yanto Wijaya",
    tempatLahir: "Bandung",
    tanggalLahir: "1990-10-28",
    jenisKelamin: "Laki-laki",
    agama: "Islam",
    statusPerkawinan: "Kawin",
    pendidikan: "SLTP",
    pekerjaan: "Sopir",
    alamat: "Kp. Bojong RT 02 RW 04",
    rt: "02",
    rw: "04",
    statusPenduduk: "Aktif",
    statusBansos: "Tidak Menerima"
  },
  {
    id: "res-9",
    nik: "3204125510940003",
    noKK: "3204121909150009",
    nama: "Kurniawati",
    tempatLahir: "Garut",
    tanggalLahir: "1994-10-15",
    jenisKelamin: "Perempuan",
    agama: "Islam",
    statusPerkawinan: "Kawin",
    pendidikan: "SLTA",
    pekerjaan: "Selesai Sekolah",
    alamat: "Kp. Bojong RT 02 RW 04",
    rt: "02",
    rw: "04",
    statusPenduduk: "Aktif",
    statusBansos: "Tidak Menerima"
  },
  {
    id: "res-10",
    nik: "3204121509120002",
    noKK: "3204121909150009",
    nama: "Alya Wijaya",
    tempatLahir: "Bandung",
    tanggalLahir: "2012-09-15",
    jenisKelamin: "Perempuan",
    agama: "Islam",
    statusPerkawinan: "Belum Kawin",
    pendidikan: "SD",
    pekerjaan: "Pelajar",
    alamat: "Kp. Bojong RT 02 RW 04",
    rt: "02",
    rw: "04",
    statusPenduduk: "Aktif",
    statusBansos: "Tidak Menerima"
  }
];

// Initial realistic letters
const INITIAL_LETTERS: Letter[] = [
  {
    id: "let-1",
    letterNumber: "470/024/SKD-SM/V/2026",
    type: "Surat Keterangan Domisili",
    requesterName: "Rian Hermawan",
    requesterNik: "3204122105950003",
    status: "Selesai",
    rtApproval: true,
    fields: {
      keperluan: "Pengajuan pembukaan rekening bank Syariah",
      alamatAsal: "Kp. Pasir Mulya RT 03 RW 01 Desa Sukamaju",
      lamaTinggal: "5 Tahun"
    },
    trackingLogs: [
      { status: "Diajukan", date: "2026-05-10T09:15:00Z", note: "Diajukan secara online oleh warga." },
      { status: "Ditinjau", date: "2026-05-11T08:30:00Z", note: "Berkas dan NIK divalidasi oleh Operator." },
      { status: "Disetujui Kades", date: "2026-05-12T10:00:00Z", note: "Surat ditandatangani digital oleh Kepala Desa." },
      { status: "Selesai", date: "2026-05-12T10:05:00Z", note: "QR-code validasi digenerate. Surat selesai dapat didownload." }
    ],
    signedBy: "H. Dadang Sulaeman, S.IP.",
    signedAt: "2026-05-12T10:00:00Z",
    qrCodeDataUrl: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=VALID_SMART_DESA_let-1",
    createdAt: "2026-05-10T09:15:00Z"
  },
  {
    id: "let-2",
    letterNumber: "400/012/SKTM-SM/V/2026",
    type: "Surat Keterangan Tidak Mampu (SKTM)",
    requesterName: "Sukarni",
    requesterNik: "3204124405590001",
    status: "Ditinjau",
    rtApproval: true,
    fields: {
      tujuanPengajuan: "Keringanan Biaya Rumah Sakit",
      namaAnak: "Budi Santoso",
      pekerjaanOrtu: "Buruh Tani"
    },
    trackingLogs: [
      { status: "Diajukan", date: "2026-05-25T14:20:00Z", note: "Diajukan lewat sekretariat RT." },
      { status: "Ditinjau", date: "2026-05-26T09:12:00Z", note: "Sedang divalidasi kelayakannya berdasarkan data bansos PKH." }
    ],
    createdAt: "2026-05-25T14:20:00Z"
  },
  {
    id: "let-3",
    letterNumber: "510/003/SKU-SM/V/2026",
    type: "Surat Keterangan Usaha",
    requesterName: "Herman Kartomi",
    requesterNik: "3204121208850001",
    status: "Diajukan",
    rtApproval: false,
    fields: {
      namaUsaha: "Warung Makan Sunda 'Rasa Mulya'",
      jenisUsaha: "Kuliner",
      alamatUsaha: "Kp. Babakan RT 02 RW 05 Desa Sukamaju",
      lamaUsaha: "2 Tahun"
    },
    trackingLogs: [
      { status: "Diajukan", date: "2026-05-28T02:00:00Z", note: "Warga mengajukan secara mandiri di portal warga." }
    ],
    createdAt: "2026-05-28T02:00:00Z"
  }
];

// APBDes realistic transactions
const INITIAL_FINANCES: FinanceTransaction[] = [
  // Revenues
  {
    id: "fin-1",
    type: "Pemasukan",
    category: "Dana Desa (DD)",
    description: "Penerimaan penyaluran Dana Desa Tahap I APBN 2026",
    amount: 540000000,
    date: "2026-03-10",
    source: "APBN Pusat",
    status: "Disetujui Kades",
    createdAt: "2026-03-10T08:00:00Z"
  },
  {
    id: "fin-2",
    type: "Pemasukan",
    category: "Alokasi Dana Desa (ADD)",
    description: "ADD Kabupaten Bandung Triwulan I",
    amount: 220000000,
    date: "2026-03-15",
    source: "APBD Kabupaten",
    status: "Disetujui Kades",
    createdAt: "2026-03-15T09:10:00Z"
  },
  {
    id: "fin-3",
    type: "Pemasukan",
    category: "Pendapatan Asli Desa (PAD)",
    description: "Pendapatan sewa tanah bengkok / aset desa dan pasar desa",
    amount: 35000000,
    date: "2026-04-05",
    source: "Hasil Usaha Desa",
    status: "Disetujui Kades",
    createdAt: "2026-04-05T10:15:00Z"
  },
  // Expenses
  {
    id: "fin-4",
    type: "Pengeluaran",
    category: "Pembangunan Desa",
    description: "Pembangunan rabat beton jalan lingkungan Kp. Babakan RW 05",
    amount: 125000000,
    date: "2026-04-12",
    source: "DD",
    status: "Disetujui Kades",
    createdAt: "2026-04-12T07:44:00Z"
  },
  {
    id: "fin-5",
    type: "Pengeluaran",
    category: "Pembinaan Kemasyarakatan",
    description: "Operasional dan insentif Kader Posyandu serta PKK",
    amount: 18000000,
    date: "2026-04-20",
    source: "ADD",
    status: "Disetujui Kades",
    createdAt: "2026-04-20T08:20:00Z"
  },
  {
    id: "fin-6",
    type: "Pengeluaran",
    category: "Penyelenggaraan Pemerintahan",
    description: "Belanja ATK, jaringan internet, internet desa pintar, dan listrik kantor",
    amount: 12000000,
    date: "2026-05-01",
    source: "ADD",
    status: "Disetujui Kades",
    createdAt: "2026-05-01T09:20:00Z"
  },
  {
    id: "fin-7",
    type: "Pengeluaran",
    category: "Pemberdayaan Masyarakat",
    description: "Pelatihan budidaya maggot dan hidroponik ketahanan pangan mandiri",
    amount: 25000000,
    date: "2026-05-18",
    source: "DD",
    status: "Disetujui Bendahara",
    createdAt: "2026-05-18T10:30:00Z"
  },
  {
    id: "fin-8",
    type: "Pengeluaran",
    category: "Penanggulangan Bencana",
    description: "Pengadaan logistik masker dan pencegahan DBD (Fogging) wilayah RT/RW",
    amount: 8500000,
    date: "2026-05-25",
    source: "PAD",
    status: "Pending",
    createdAt: "2026-05-25T11:00:00Z"
  }
];

// Bansos lists
const INITIAL_BANSOS: SocialAssistance[] = [
  {
    id: "ban-1",
    name: "Bantuan Langsung Tunai (BLT-DD) Triwulan II",
    type: "BLT Dana Desa",
    period: "April - Juni 2026",
    budgetPerRecipient: 300000,
    status: "Penyaluran",
    recipientsCount: 2,
    recipientsNiks: ["3204120302550008", "3204121404450005"], // Slamet, Mbah Suroso
    createdAt: "2026-04-01T04:00:00Z"
  },
  {
    id: "ban-2",
    name: "Penyaluran Bansos PKH Tahap II",
    type: "PKH (Program Keluarga Harapan)",
    period: "Mei 2026",
    budgetPerRecipient: 750000,
    status: "Selesai",
    recipientsCount: 1,
    recipientsNiks: ["3204124405590001"], // Sukarni
    createdAt: "2026-05-01T04:00:00Z"
  },
  {
    id: "ban-3",
    name: "Bansos Sembako BPNT Kemensos",
    type: "BPNT (Sembako)",
    period: "Mei - Juni 2026",
    budgetPerRecipient: 200000,
    status: "Disetujui",
    recipientsCount: 1,
    recipientsNiks: ["3204126201000004"], // Dian Safitri
    createdAt: "2026-05-20T04:00:00Z"
  }
];

// Village Assets (Aset Desa)
const INITIAL_ASSETS: VillageAsset[] = [
  {
    id: "ast-1",
    code: "AST-3204-001",
    name: "Tanah Bengkok Desa (Tanah Kas Desa)",
    category: "Tanah Desa",
    condition: "Baik",
    purchaseDate: "1972-04-12",
    purchaseValue: 45000000,
    currentValue: 1200000000,
    location: "Blok Sawah Tengah No. 44"
  },
  {
    id: "ast-2",
    code: "AST-3204-002",
    name: "Gedung Balai Desa & Kantor Sekretariat",
    category: "Bangunan Desa",
    condition: "Baik",
    purchaseDate: "1988-08-17",
    purchaseValue: 135000000,
    currentValue: 850000000,
    location: "Jl. Raya Paseh No. 123"
  },
  {
    id: "ast-3",
    code: "AST-3204-003",
    name: "Mobil Ambulans Desa Siaga (Suzuki APV)",
    category: "Kendaraan",
    condition: "Baik",
    purchaseDate: "2021-12-20",
    purchaseValue: 215000000,
    currentValue: 160000000,
    location: "Garasi Kantor Balai Desa"
  },
  {
    id: "ast-4",
    code: "AST-3204-004",
    name: "Laptop Asus Kerja Operator Pelayanan (5 Unit)",
    category: "Peralatan Kantor",
    condition: "Rusak Ringan",
    purchaseDate: "2023-05-15",
    purchaseValue: 42000000,
    currentValue: 25000000,
    location: "Ruang Pelayanan Loket"
  }
];

// Complaints
const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: "comp-1",
    title: "Tiang Lampu Jalan Mati di Tanjakan Kp. Pasir Mulya",
    category: "Infrastruktur",
    description: "Sudah hampir 1 minggu tiang lampu jalan di tanjakan dekat gapura Kp. Pasir Mulya padam. Jalanan menjadi gelap gulita saat malam hari dan rawan menimbulkan kecelakaan bagi warga yang melintas.",
    reporterName: "Rian Hermawan",
    reporterNik: "3204122105950003",
    status: "Selesai",
    date: "2026-05-20",
    responses: [
      {
        id: "rep-1",
        senderName: "Budi Santoso",
        senderRole: "Operator",
        message: "Laporan diterima. Segera kami tugaskan Seksi Kesejahteraan Desa untuk berkoordinasi dengan RT setempat demi perbaikan lampu.",
        date: "2026-05-21T09:00:00Z"
      },
      {
        id: "rep-2",
        senderName: "Rian Hermawan",
        senderRole: "Masyarakat",
        message: "Terima kasih responnya sangat cepat! Lampu sudah diganti bohlam baru sore ini oleh teknisi dibantu ketua RT.",
        date: "2026-05-22T17:30:00Z"
      }
    ]
  },
  {
    id: "comp-2",
    title: "Daftar Calon Penerima BLT Kemasyarakatan Kurang Tepat",
    category: "Sosial/Bansos",
    description: "Kami dari pengurus RW mengamati ada satu kepala keluarga di RT 01 yang kondisinya sangat berkecukupan namun mendapatkan bantuan BLT, sementara janda tua di sebelahnya justru tidak masuk daftar.",
    reporterName: "Yanto Wijaya",
    reporterNik: "3204122810900010",
    status: "Diproses",
    date: "2026-05-27",
    responses: [
      {
        id: "rep-3",
        senderName: "Ahmad Fauzi, S.Kom.",
        senderRole: "Sekretaris",
        message: "Sangat berterima kasih atas koreksinya Pak Yanto. Kami sedang menjadwalkan verifikasi lapangan bersama ketua RT 01 guna memperbarui data di DTKS desa.",
        date: "2026-05-27T15:20:00Z"
      }
    ]
  }
];

// Achievements & Announcements
const INITIAL_ANNOUNCEMENTS: VillageAnnouncement[] = [
  {
    id: "ann-1",
    title: "Jadwal Pelayanan KB Gratis Puskesmas Sukamaju",
    content: "Diberitahukan kepada seluruh ibu-ibu di lingkungan desa Sukamaju, Puskesmas Pembantu desa akan menyelenggarakan program KB gratis, imunisasi polio, dan pemeriksaan gizi balita pada hari Selasa, 2 Juni 2026 bertempat di Posyandu Melati 1.",
    category: "Kesehatan",
    author: "Tim PKK Desa Sukamaju",
    date: "2026-05-27",
    isActive: true
  },
  {
    id: "ann-2",
    title: "Pemberitahuan Penyaluran Cadangan Beras Pemerintah (CBP)",
    content: "Sebanyak 142 Kepala Keluarga penerima bantuan sosial beras bulanan diharapkan hadir di GOR Serbaguna pada hari Kamis, 29 Mei 2026 dengan membawa KK asli dan KTP. Pengambilan tidak boleh diwakili kecuali satu KK.",
    category: "Bantuan Sosial",
    author: "Seksi Kesra Desa",
    date: "2026-05-26",
    isActive: true
  },
  {
    id: "ann-3",
    title: "Pemanfaatan Aplikasi Smart Desa Digital Mulai Juni 2026",
    content: "Mulai tanggal 1 Juni 2026, seluruh pengajuan surat pengantar seperti domisili, SKU, dan SKTM wajib diproses secara digital mandiri maupun dibantu ketua RT/RW setempat demi kemudahan integrasi data.",
    category: "Pemberitahuan",
    author: "Sekretariat Desa",
    date: "2026-05-24",
    isActive: true
  }
];

// Agendas
const INITIAL_AGENDAS: VillageAgenda[] = [
  {
    id: "age-1",
    title: "Rapat Koordinasi & Evaluasi Kinerja RT / RW Semester I",
    description: "Evaluasi iuran warga, iuran sampah, pemantauan warga baru paska Lebaran, serta peluncuran website digital Smart Desa Sukamaju.",
    date: "2026-05-29",
    time: "19:30 - selesai",
    location: "Aula Pertemuan Balai Desa",
    attendees: "Seluruh Ketua RT dan RW (12 orang)"
  },
  {
    id: "age-2",
    title: "Musyawarah Perencanaan Pembangunan Desa (Musrenbangdes) 2027",
    description: "Penyusunan RKPDes tahun anggaran 2027, usulan prioritas perbaikan irigasi bukit timur dan ketahanan pangan nabati desa.",
    date: "2026-06-05",
    time: "09:00 - 13:00",
    location: "GOR Desa Sukamaju Paseh",
    attendees: "Kepala Desa, BPD, Lembaga Kemasyarakatan Desa, Tokoh Agama & Perempuan"
  }
];

// RT RW Finance
const INITIAL_RT_FINANCES: RtRwFinance[] = [
  {
    id: "rtf-1",
    rt: "01",
    rw: "04",
    month: "Mei 2026",
    iuranWarga: 350000,
    kasRt: 2450000,
    pengeluaranRt: 120000,
    agendaRt: "Kerja bakti membersihkan saluran parit utama",
    namaRt: "RT 01 Bojong Indah",
    pin: "010401"
  },
  {
    id: "rtf-2",
    rt: "02",
    rw: "05",
    month: "Mei 2026",
    iuranWarga: 420000,
    kasRt: 3800000,
    pengeluaranRt: 250000,
    agendaRt: "Pembelian tempat sampah pilah lingkungan",
    namaRt: "RT 02 Babakan Makmur",
    pin: "020502"
  }
];

// Audit logs
const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-1",
    userId: "sys-admin",
    userName: "Budi Santoso",
    userRole: "Operator",
    action: "Verifikasi Berkas Surat Domisili ID - let-1",
    module: "Surat Menyurat",
    timestamp: "2026-05-28T03:10:00Z"
  }
];

export function getInitialData<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(`smart_desa_${key}`);
  if (!data) {
    localStorage.setItem(`smart_desa_${key}`, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(data) as T;
  } catch {
    return defaultValue;
  }
}

export function saveData<T>(key: string, data: T): void {
  localStorage.setItem(`smart_desa_${key}`, JSON.stringify(data));
}

// Global state controller helper
export class LocalDb {
  static getResidents() { return getInitialData<Resident[]>('residents', INITIAL_RESIDENTS); }
  static saveResidents(data: Resident[]) { saveData('residents', data); }

  static getLetters() { return getInitialData<Letter[]>('letters', INITIAL_LETTERS); }
  static saveLetters(data: Letter[]) { saveData('letters', data); }

  static getFinances() { return getInitialData<FinanceTransaction[]>('finances', INITIAL_FINANCES); }
  static saveFinances(data: FinanceTransaction[]) { saveData('finances', data); }

  static getBansos() { return getInitialData<SocialAssistance[]>('bansos', INITIAL_BANSOS); }
  static saveBansos(data: SocialAssistance[]) { saveData('bansos', data); }

  static getAssets() { return getInitialData<VillageAsset[]>('assets', INITIAL_ASSETS); }
  static saveAssets(data: VillageAsset[]) { saveData('assets', data); }

  static getComplaints() { return getInitialData<Complaint[]>('complaints', INITIAL_COMPLAINTS); }
  static saveComplaints(data: Complaint[]) { saveData('complaints', data); }

  static getAnnouncements() { return getInitialData<VillageAnnouncement[]>('announcements', INITIAL_ANNOUNCEMENTS); }
  static saveAnnouncements(data: VillageAnnouncement[]) { saveData('announcements', data); }

  static getAgendas() { return getInitialData<VillageAgenda[]>('agendas', INITIAL_AGENDAS); }
  static saveAgendas(data: VillageAgenda[]) { saveData('agendas', data); }

  static getRtFinances() { return getInitialData<RtRwFinance[]>('rt_finances', INITIAL_RT_FINANCES); }
  static saveRtFinances(data: RtRwFinance[]) { saveData('rt_finances', data); }

  static getAuditLogs() { return getInitialData<AuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS); }
  static saveAuditLogs(data: AuditLog[]) { saveData('audit_logs', data); }

  static getVillageProfile() { return getInitialData<VillageProfile>('village_profile', INITIAL_VILLAGE_PROFILE); }
  static saveVillageProfile(data: VillageProfile) { saveData('village_profile', data); }

  static getPortalCredentials() { return getInitialData<{ credentials: PortalCredential[] }>('portal_credentials', INITIAL_PORTAL_CREDENTIALS); }
  static savePortalCredentials(data: { credentials: PortalCredential[] }) { saveData('portal_credentials', data); }
}

export const INITIAL_PORTAL_CREDENTIALS: { credentials: PortalCredential[] } = {
  credentials: [
    { type: 'staf', role: 'Super Admin', name: 'Admin Utama', pin: '123456' },
    { type: 'staf', role: 'Operator', name: 'Budi Santoso', pin: '123456' },
    { type: 'staf', role: 'Kepala Desa', name: 'H. Dadang Sulaeman, S.IP.', pin: '123456' },
    { type: 'staf', role: 'Sekretaris', name: 'Ahmad Fauzi, S.Kom.', pin: '101010' },
    { type: 'staf', role: 'Bendahara', name: 'Siti Rahmawati, A.Md.', pin: '202020' },
    { type: 'staf', role: 'RT/RW', name: 'Bpk. Yanto (RT)', pin: '020502' },
    { type: 'warga', nik: '3204121208850001', name: 'Herman Kartomi', pin: '123456' },
    { type: 'warga', nik: '3204124311890002', name: 'Anisa Rahmawati', pin: '123456' },
    { type: 'warga', nik: '3204120302550008', name: 'Slamet Rahardja', pin: '123456' }
  ]
};
