# Kadkahwin — Demo Portfolio

Koleksi dua kad jemputan perkahwinan menggunakan Vite dan JavaScript. Semua pasangan, keluarga dan butiran majlis adalah rekaan untuk portfolio.

| URL | Template |
| --- | --- |
| `/` dan hash asal | **Klasik Elegan** — Adam & Sara, burgundy dan gold |
| `/editorial/` | **JANJI** — Hana Sofea & Danish Hakimi, ivory dan olive |
| `/koleksi/` | Katalog kedua-dua template dengan screenshot desktop dan telefon |

Versi burgundy asal disimpan pada tag `template/burgundy-v1` (commit `9012aea`). Fail halaman, gaya, kandungan dan navigasi burgundy tidak diubah ketika JANJI ditambah.

## JANJI — Botani Elegan

- Kad menegak dengan sampul berseal, bunga putih dan daun sage, kaligrafi serta aksen champagne gold. Cormorant Garamond, Great Vibes dan Manrope dihoskan sendiri.
- Menu tetamu di bawah: Hubungi, Lokasi, Hadiah dan RSVP/ucapan. Doa pengantin, atur cara, swatch pakaian, peta dan kalendar `.ics`.
- Countdown menggunakan waktu Malaysia: 22 Mei 2027, 11.00 pagi–4.30 petang; mesej berubah semasa/selepas majlis.
- Petikan TULUS sedia ada bermula selepas sampul dibuka; pemain inline di penutup kad, fallback interaksi dan pilihan jeda sepanjang lawatan.
- RSVP disimulasikan dalam memori dengan validasi bersama daripada `src/rsvp.js`; tiada penghantaran atau simpanan data.
- Pembukaan sampul sekitar 2 saat dan reveal seksyen yang menghormati reduced motion. Kandungan kekal boleh digunakan jika foto gagal dimuatkan.
- Halaman masuk: `editorial/index.html`; gaya/fungsi: `src/editorial/`; katalog: `koleksi/index.html` dan `src/catalog/`.
- [Dokumentasi JANJI](docs/JANJI.md) dan [prompt fotografi](docs/janji-image-prompts.md).

## Ciri Klasik Elegan

- Enam halaman dengan peralihan mendatar, navigasi papan kekunci, swipe dan menu mudah alih.
- Jemputan, dress code interaktif, lokasi contoh, RSVP dan surat penutup.
- 15 item pakaian dan aksesori boleh diseret menggunakan tetikus atau sentuhan. Tab Wanita/Lelaki pada telefon, anak panah untuk alih item dan Escape untuk pulihkan kedudukan asal. Susunan kekal semasa bertukar halaman dalam sesi yang sama.
- Mod jemputan pihak lelaki dan perempuan.
- Tema burgundy dengan tulisan gold, kesan foil dan kilauan halus.
- Petikan 40 saat TULUS — Teman Hidup cuba autoplay semasa kad dibuka, dengan fade lembut dan kawalan play/pause. Jika autoplay disekat browser, muzik bermula selepas interaksi; butiran dalam [docs/MUSIC.md](docs/MUSIC.md).
- Font dihoskan sendiri dan sokongan reduced motion; animasi kilauan dihentikan mengikut tetapan pengguna.
- RSVP divalidasi dan disimulasikan dalam memori pelayar sahaja. Tiada API, Google Sheets, credentials, localStorage atau sessionStorage.
- Nombor hubungan hanyalah placeholder; pautan WhatsApp dinyahaktifkan.

## Jalankan

Gunakan Node.js 22.12+ dan pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
pnpm preview
```

Pilihan varian: `pnpm dev:bride` atau `pnpm dev:groom`. Preview biasa menyokong `?invite=perempuan` dan `?invite=lelaki`.

## Ujian

```sh
pnpm exec playwright install chromium
pnpm test
```

## Deploy ke Vercel

Import repo ini sebagai **projek Vercel baharu**. Build: `pnpm build`; output: `dist`. Tiada environment variable diperlukan. Jangan sambungkan projek Vercel atau domain klien kepada repo demo.

Selepas domain demo ditetapkan, gunakan URL mutlak domain itu untuk metadata `og:image` dan `twitter:image` dalam `index.html`. Aset perkongsian demo tersedia di `public/assets/og-demo.png`.

## Kandungan dan aset

Edit `src/content.js` untuk butiran majlis dan `src/config/` untuk teks jemputan. Aset dalam `public/assets/` merangkumi hiasan vektor, kad perkongsian demo dan atlas pakaian janaan untuk lookbook interaktif; tiada foto klien disertakan. Asal aset pakaian direkodkan dalam [docs/ASSETS.md](docs/ASSETS.md).

Repo demo mempunyai sejarah Git baharu. Repo, konfigurasi deployment, domain dan sejarah projek klien dikekalkan secara berasingan.
