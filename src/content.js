export const wedding = {
  bride: 'Sara Amani',
  groom: 'Adam Hakim',
  date: '14 Februari 2027',
  hijriDate: 'Demo Portfolio',
  dateISO: '2027-02-14',
  day: 'Ahad',
  time: '11.00 pagi – 4.30 petang',
  timezone: 'Asia/Kuala_Lumpur',
  venue: 'Dewan Seri Impian',
  location: 'Kuala Lumpur',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Kuala%20Lumpur',
  assistanceHeading: 'Untuk Sebarang Bantuan / Pertanyaan Berkaitan Majlis',
  parkingNote: 'Contoh maklumat parkir: tetamu boleh menggunakan ruang letak kenderaan berhampiran dewan. Butiran majlis ini adalah rekaan untuk demo portfolio.',
  parents: {
    groom: ['Ismail Rahman', 'Mariam Abdullah'],
    bride: ["Zainal Hassan", 'Aisyah Ibrahim'],
  },
  contacts: [
    { name: 'Wakil Keluarga Sara', side: 'Pihak perempuan', phone: '01X XXX XXXX', international: '' },
    { name: 'Penyelaras Majlis', side: 'Pihak perempuan', phone: '01X XXX XXXX', international: '' },
    { name: 'Wakil Keluarga Adam', side: 'Pihak lelaki', phone: '01X XXX XXXX', international: '' },
  ],
  eventDetails: {
    dressCode: 'Tradisional / Smart Casual',
    dressCodeNote: 'Apa sahaja warna pilihan anda kecuali putih & silver.',
    schedule: [
      { time: '11:00 am', title: 'Ketibaan para tetamu' },
      { time: '12:30 pm', title: 'Ketibaan pengantin', description: 'Bacaan doa & salam restu' },
      { time: '11:00 am – 4:30 pm', title: 'Jamuan makan & beramah mesra' },
    ],
    menu: [
      'Biryani',
      'Hidangan Sampingan & Pembuka Selera',
      'Buah-buahan',
      'Kuih-muih Melayu & Manisan',
      'Minuman sejuk & panas',
      'Air mineral',
    ],
  },
  closing: [
    'This day would not feel complete without you. Your doa, your prayers, your restu have made this day happen.',
    'Dalam setiap doa dan restu yang diterima, kami dipertemukan dan ditakdirkan sampai ke sini. Our takdir has always been cared for and guided in the most beautiful ways through you.',
    'Terima kasih daripada kami untuk semua doa-doa yang baik. Terima kasih sudi luangkan masa untuk raikan kami. Semoga hari kita nanti diberkati dan menjadi satu memori yang indah untuk semua.',
    'Jumpa nanti, we can’t wait to see you!',
  ],
};

export const pages = [
  { id: 'home', label: 'Utama', eyebrow: 'Jemputan' },
  { id: 'invitation', label: 'Jemputan', eyebrow: 'Walimatulurus' },
  { id: 'dresscode', label: 'Dresscode', eyebrow: 'Inspirasi gaya' },
  { id: 'location', label: 'Lokasi', eyebrow: 'Lokasi majlis' },
  { id: 'rsvp', label: 'RSVP', eyebrow: 'Tempat untuk anda' },
  { id: 'note', label: '🤍', eyebrow: 'Daripada kami' },
];
