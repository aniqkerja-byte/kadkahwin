# Aset visual

## Monogram AS daripada imej pengguna (aktif)

Logo AS kaligrafi menggunakan imej yang dipilih pengguna. Built-in imagegen digunakan untuk menukar dakwat hitam kepada gold rata dan menjadikan latar putih telus, tanpa menambah ampersand atau hiasan. [Prompt edit](branding/monogram-as-reference-v3-prompt.md).

- Imej pengguna: `references/branding/monogram-as-user-original-v3.png`.
- Hasil edit: `references/branding/monogram-as-reference-gold-source-v3.png`.
- Logo web: `public/assets/monogram-as-reference-gold-v3.webp` (768 × 768).
- Favicon: `public/assets/monogram-as-reference-gold-favicon-v3.png` (128 × 128).
- Eksport semula: `node scripts/export-monogram.mjs v3`.

## Monogram AS minimal v2 (arkib)

Versi terdahulu menggunakan huruf **AS bersatu**, tanpa ampersand, hiasan, glow atau kesan 3D. Bentuk huruf serif Cormorant Garamond 500 ditukar kepada path SVG, dengan satu warna gold rata `#e8c985` dan latar telus. Tidak lagi digunakan oleh laman.

- Logo vektor: `public/assets/monogram-as-minimal-v2.svg`.
- Bina semula: pasang FontTools pada Python, kemudian jalankan `python scripts/build-minimal-monogram.py` selepas `pnpm install`.

## Monogram A&S gold v1 (arkib)

Versi terdahulu dijana menggunakan built-in imagegen pada 21 Oktober 2026: huruf berjalin, kemasan gold foil dan hiasan daun halus pada latar telus. Tidak lagi digunakan oleh laman. [Prompt penuh](branding/monogram-as-gold-v1-prompt.md).

- Sumber asal: `references/branding/monogram-as-gold-source-v1.png`.
- Logo web: `public/assets/monogram-as-gold-v1.webp` (768 × 564).
- Favicon: `public/assets/monogram-as-gold-favicon-v1.png` (128 × 128).
- Eksport semula: `node scripts/export-monogram.mjs`. Warna dan alpha asal dikekalkan; hanya margin telus, saiz dan format eksport disesuaikan.

## Dresscode

`public/assets/dresscode-pieces.png` ialah atlas PNG telus 4 × 4, 1254 × 1254 piksel, dijana untuk lookbook pakaian pada projek asal. Ia mengandungi pakaian dan aksesori sahaja, tanpa foto individu atau data klien.

Komponen interaktif dipulihkan daripada versi terdahulu projek (commit `983a606`). 15 item digunakan: empat atasan, empat bawahan, selendang, sampin, songkok dan empat pasangan kasut. Setiap item ialah butang berasingan yang menyokong seretan, sentuhan dan papan kekunci.

Pakaian dipaparkan dalam warna asal atlas (navy, hijau lembut/zaitun, coklat dan kelabu arang), tanpa filter sketch, grayscale atau gold. Tema gold hanya digunakan untuk hiasan dan teks kad, supaya ilustrasi pakaian tidak mengelirukan tetamu tentang pilihan warna.
