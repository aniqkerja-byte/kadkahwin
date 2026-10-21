# Kadkahwin — Demo Portfolio

Kad jemputan perkahwinan interaktif menggunakan Vite dan JavaScript. Demo ini menggunakan pasangan rekaan **Adam & Sara**, keluarga rekaan, ilustrasi vektor dan butiran majlis contoh.

## Ciri

- Enam halaman dengan peralihan mendatar, navigasi papan kekunci, swipe dan menu mudah alih.
- Jemputan, dress code interaktif, lokasi contoh, RSVP dan surat penutup.
- 15 item pakaian dan aksesori boleh diseret menggunakan tetikus atau sentuhan. Tab Wanita/Lelaki pada telefon, anak panah untuk alih item dan Escape untuk pulihkan kedudukan asal. Susunan kekal semasa bertukar halaman dalam sesi yang sama.
- Mod jemputan pihak lelaki dan perempuan.
- Tema burgundy dengan tulisan gold, kesan foil dan kilauan halus.
- Petikan 40 saat TULUS — Teman Hidup dengan fade lembut dan kawalan play/pause; butiran dalam [docs/MUSIC.md](docs/MUSIC.md).
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
