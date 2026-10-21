# Muzik kad

- Lagu: **TULUS — Teman Hidup**, daripada MP3 yang diberikan pengguna.
- Petikan dipilih: **00:43–01:23**, 40 saat, merangkumi chorus pertama dengan mesej teman hidup dan kebersamaan.
- Fade masuk: 1.4 saat. Fade keluar: 3 saat. Eksport: MP3 stereo 44.1 kHz / 128 kbps.
- Hanya petikan dimuatkan dalam `public/assets/teman-hidup-wedding.mp3`; rakaman penuh tidak dimasukkan ke repo.
- Audio dimuatkan dan cuba dimainkan terus apabila kad dibuka. Jika browser menyekat autoplay bersuara, klik/sentuhan pertama akan mencuba semula; butang muzik juga sentiasa tersedia.
- Volume awal: 35%. Petikan diulang dan terus dimainkan semasa bertukar halaman. Pilihan pause kekal sepanjang sesi halaman.
- Satu elemen audio berada di luar aplikasi yang diklon untuk animasi peralihan, supaya muzik tidak bertindih atau bermula semula.

Untuk eksport semula, pasang PyAV dan NumPy pada Python, kemudian jalankan:

```sh
python scripts/prepare-music.py "path/to/Tulus - Teman Hidup.mp3"
```
