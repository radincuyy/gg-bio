# GG-Bio Web Profile

Proyek ini adalah web profile yang terinspirasi dari platform e-z.bio. Template ini memiliki tampilan modern dengan tema gelap dan berbagai fitur interaktif yang menarik.

## Fitur

- **Landing Page Menarik**: Halaman landing dengan efek blur dan animasi teks "Click Anywhere"
- **Efek Typing**: Animasi mengetik untuk nama dan bio saat halaman utama dimuat
- **Efek Glitch**: Efek distorsi digital pada nama profil untuk tampilan yang unik
- **Desain Modern**: Tampilan gelap dengan efek blur dan transparansi
- **Profil Pengguna**: Tampilkan foto profil, nama, dan bio
- **Sosial Media**: Tombol untuk berbagai platform sosial media
- **Pemutar Musik**: Pemutar musik interaktif dengan playlist lagu lokal
- **Integrasi Spotify**: Widget playlist Spotify yang dapat diakses dengan tombol
- **Responsif**: Tampilan yang menyesuaikan dengan berbagai ukuran layar
- **Efek 3D**: Efek tilt 3D pada kartu profil menggunakan Vanilla Tilt
- **Integrasi Discord**: Menampilkan profil Discord dengan avatar dan username
- **Autoplay Musik**: Fitur autoplay musik saat navigasi dari landing page

## Struktur File

- `index.html` - Halaman utama dengan landing page dan profil
- `css/style.css` - Stylesheet utama untuk halaman profil
- `js/script.js` - JavaScript untuk fungsionalitas musik player dan fitur lainnya
- `js/discord.js` - JavaScript untuk integrasi Discord
- `audio/` - Direktori berisi file musik lokal (MP3)
  - Samurai.mp3
  - Kawaki wo Ameku.mp3
  - See You Again.mp3
  - Cancer.mp3
  - Disenchanted.mp3
  - Radio.mp3
  - Young and Beautiful.mp3
  - Igloo.mp3

## Cara Menjalankan Proyek Secara Lokal

1. Clone repositori ini ke direktori lokal Anda:
   ```bash
   git clone https://github.com/radincuyy/gg-bio.git
   ```
2. Buka folder proyek:
   ```bash
   cd gg-bio
   ```
3. Buka file `index.html` di browser Anda atau gunakan server lokal seperti Live Server di VSCode.
4. Klik di mana saja pada halaman landing untuk masuk ke halaman profil utama.

## Deployment

Untuk deployment di Vercel, Netlify, atau hosting lainnya:
1. Upload semua file ke hosting Anda
2. Pastikan `index.html` adalah halaman utama
3. Tidak diperlukan konfigurasi khusus karena proyek ini menggunakan HTML, CSS, dan JavaScript murni

## Kustomisasi

### Mengubah Profil

Edit bagian berikut di `index.html`:

```javascript
// Efek typing untuk nama dan bio
// Data untuk typing effect
const profileName = "Radinka Alifasya";
const profileBio = "Memento Mori";
```

### Mengubah Foto Profil

Ubah URL gambar profil di `index.html`:

```html
<img src="https://64.media.tumblr.com/ce963442a850aeab75787da9db78925b/96e3853056a61acc-21/s1280x1920/ee9b0679501230c8e73b6b3f6f905653e7c41679.gifv" alt="Profile Picture" id="profile-picture">
```

### Mengubah Background

Ubah URL gambar background di `css/style.css`:

```css
body::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url('https://64.media.tumblr.com/cecbbeb4e89ae1e24d2d25363fce031e/3057d72f20fbb610-a2/s500x750/b2f45e54f96860d61efbaba8d340be30f98cc3f5.gifv') no-repeat center center;
    background-size: cover;
    filter: none;
    transform: scale(1.02);
    z-index: -2;
}
```

### Mengubah Lagu

Tambahkan atau ubah file MP3 di folder `audio/` dan perbarui array `songs` di file `js/script.js`.

### Mengubah Playlist Spotify

Ubah URL iframe Spotify di `index.html`:

```html
<iframe style="border-radius:12px" src="https://open.spotify.com/embed/playlist/4kM2ZYjfPO48E8Qb3lK8xD?utm_source=generator&theme=0" width="100%" height="152" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
```

### Mengatur Integrasi Discord

Edit file `js/discord.js` untuk mengubah Discord User ID dan Discord Tag.

## Fitur Khusus

### Efek Typing

Nama dan bio ditampilkan dengan efek mengetik saat halaman dimuat, memberikan kesan interaktif.

### Efek Glitch

Nama profil memiliki efek glitch digital yang memberikan tampilan unik dan modern.

### Pemutar Musik

Pemutar musik mendukung:
- Putar/jeda lagu
- Navigasi lagu (sebelumnya/selanjutnya)
- Pengaturan volume
- Progress bar interaktif
- Mode shuffle
- Integrasi dengan playlist Spotify
- Autoplay saat navigasi dari landing page

## Pembaruan Terbaru

- Perbaikan layout untuk tampilan yang lebih kompak
- Penambahan fitur autoplay musik
- Perbaikan posisi tombol shuffle
- Optimasi untuk performa yang lebih baik
- Perbaikan integrasi Discord

## Catatan Teknis

- Website menggunakan HTML, CSS, dan JavaScript murni tanpa framework
- Pemutar musik menggunakan HTML5 Audio API untuk memutar file MP3 lokal
- Efek 3D menggunakan library Vanilla Tilt
- Integrasi Discord menggunakan pendekatan statis dengan avatar yang dimuat dari CDN Discord
- Animasi menggunakan AOS (Animate On Scroll) library

## Lisensi

Bebas digunakan untuk keperluan pribadi maupun komersial. 
