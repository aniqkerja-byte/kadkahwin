# JANJI — panduan penyelenggaraan

## Halaman dan pengasingan

Vite 8 membina tiga input HTML: `index.html`, `editorial/index.html`, `koleksi/index.html`. Ketiga-tiganya boleh dimuatkan terus dan direfresh. JANJI dan katalog tidak mengimport stylesheet, renderer hash atau navigasi penuh skrin burgundy. Hanya validasi RSVP tulen dikongsi. Tag `template/burgundy-v1` menunjuk kepada commit `9012aea` sebelum perubahan.

## Kandungan dan masa

Teks dan struktur JANJI berada dalam `editorial/index.html`. Tarikh countdown dan fail kalendar berada dalam `src/editorial/event.js`; kedua-dua tempat perlu dikemas kini jika tarikh majlis berubah. Acara bermula pada `2027-05-22T11:00:00+08:00` dan tamat pada `2027-05-22T16:30:00+08:00`. ICS menyimpan detik yang sama dalam UTC (03:00–08:30Z) untuk keserasian kalendar dan penukaran zon waktu pengguna.

RSVP ialah demonstrasi dalam memori sahaja. Ia tidak memanggil API, menyimpan cookie atau menulis localStorage/sessionStorage. `submitRsvp` digunakan bersama kad asal. Pengesahan muncul inline dan fokus dipindahkan kepada mesej; ralat memfokuskan medan pertama yang perlu dibetulkan.

## Foto dan screenshot

- Originals: `references/editorial/{hero,walk,portrait,details}-v1.png`.
- Web: `public/assets/editorial/{name}-{480,960,1600}.webp`.
- Empat foto dijana dengan built-in imagegen; [prompt dan rujukan](janji-image-prompts.md).
- `node scripts/export-editorial.mjs` menukar saiz/format sahaja, tanpa perubahan warna atau komposisi.
- `node scripts/capture-catalog.mjs` mengambil screenshot viewport desktop 1440×1000 dan telefon 390×844 daripada server tempatan 5173. Ia menggunakan reduced motion supaya screenshot memaparkan keadaan akhir. Jalankan selepas perubahan visual template.
- Katalog tidak memuatkan audio. Pautan demo dibuka dalam tab sama.

## Muzik dan animasi

JANJI menggunakan sumber petikan 40 saat serta cover TULUS yang sama dengan burgundy, tetapi controller dan UI sendiri dalam `src/editorial/music.js`. Autoplay dicuba; apabila disekat, klik pengguna atau Enter/Space mencuba lagi. Klik jeda menghentikan percubaan automatik sepanjang dokumen hidup. Reload memulakan lawatan baharu. Muzik tidak dipasang pada sticky/fixed container.

Animasi hero bergerak skala 1.025→1 selama 2.4 saat. Teks dan seksyen menggunakan opacity/translateY maksimum 12px selama 720ms. IntersectionObserver memainkan reveal seksyen sekali. CSS tidak menyembunyikan kandungan secara default; kegagalan JavaScript atau foto tidak meninggalkan halaman kosong. Reduced motion membatalkan animasi dan menggunakan scroll segera. Dialog native menyediakan modal focus containment dan Escape; fokus kembali ke pencetus apabila ditutup.

## Semakan

`pnpm test --workers=2` menjalankan semua ujian burgundy dan JANJI. Ujian JANJI merangkumi 320/390/768/1440px, aset, refresh, anchor, validasi RSVP, tiada penghantaran data, countdown, muat turun ICS, autoplay dibenarkan/disekat, pause/seek, lightbox/fokus dan foto gagal dimuatkan. `pnpm build` menghasilkan semua halaman dalam `dist/`.

Preview production: `pnpm preview --port 4180 --strictPort`. Tiada domain atau deployment baharu disambungkan dalam fasa ini.
