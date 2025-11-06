Aplikasi Buku Induk Siswa (Full-Stack)

Selamat datang di repositori Aplikasi Buku Induk Siswa! Ini adalah aplikasi web full-stack yang berfungsi sebagai sistem manajemen "Buku Induk Digital" untuk siswa.

Aplikasi ini dibangun menggunakan React untuk frontend, Node.js (Express) untuk backend, dan MySQL sebagai database. Salah satu fitur utamanya adalah pembaruan data secara real-time menggunakan Socket.io.

Fitur Utama Aplikasi ini memiliki fungsionalitas sebagai berikut:

* **Autentikasi Admin:** Sistem login dan logout aman menggunakan JSON Web Token (JWT).
* **Manajemen Siswa (CRUD):**
    * **Create:** Menambah data siswa baru melalui form modal.
    * **Read:** Menampilkan semua data siswa dalam tabel dengan paginasi (10, 25, 50, atau 100 data per halaman).
    * **Update:** Mengedit data siswa yang sudah ada.
    * **Delete:** Menghapus data siswa dengan modal konfirmasi.
* **Dashboard Interaktif:** Menampilkan statistik kunci:
    * Total Siswa
    * Siswa Aktif
    * Siswa Lulus
    * Siswa Tidak Aktif
    * Ringkasan jumlah siswa per Kejuruan.
    * Daftar 10 siswa terbaru yang ditambahkan.
* **Pembaruan Real-Time (Socket.io):**
    * Jika satu admin menambah, mengedit, atau menghapus data, data di browser semua admin lain yang sedang online akan ter-update secara otomatis tanpa perlu me-refresh halaman.
* **Pencarian & Filter:**
    * Fitur pencarian instan berdasarkan nama, TTL, kejuruan, dll.
    * Filter data berdasarkan Kejuruan, Jenis Kelamin, Kondisi Fisik, dan Status.
    * Tombol untuk mereset semua filter.
* **Ekspor ke CSV:** Fungsionalitas untuk mengunduh data siswa yang sedang ditampilkan (sudah terfilter) ke dalam format file `.csv`.
* **Dark Mode:** Tombol untuk mengubah tampilan antara mode terang (Light Mode) dan mode gelap (Dark Mode).

Tumpukan Teknologi (Tech Stack)

| Bagian | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Frontend** | React 18 | Pustaka utama UI. |
| | TailwindCSS | Untuk styling dan desain responsif. |
| | Axios | Mengelola request HTTP ke backend. |
| | Socket.io-Client | Menerima & mengirim event real-time. |
| | Lucide-React | Untuk ikonografi. |
| **Backend** | Node.js | Lingkungan runtime server. |
| | Express.js | Framework untuk membangun API. |
| | Socket.io | Server untuk koneksi WebSocket real-time. |
| | MySQL2 | Driver untuk terhubung ke database MySQL. |
| | CORS | Mengatur Cross-Origin Resource Sharing. |
| | JSON Web Token (JWT) | Untuk autentikasi dan otorisasi. |
| | dotenv | Mengelola variabel lingkungan. |
| **Database** | MySQL | Database relasional untuk menyimpan data. |

Panduan Instalasi & Menjalankan Proyek

Untuk menjalankan proyek ini di komputer lokal Anda, ikuti langkah-langkah berikut:

1. Syarat Penggunaan aplikasi mempunyai software berikut ini
- Node.js (v16 atau lebih baru)
- XAMPP (atau server MySQL lainnya)
- Git

2. Clone Repositori
buka git bash lalu masukkan command
"git clone [https://github.com/MBintangFirdaus/buku_induk_fullstack.git](https://github.com/MBintangFirdaus/buku_induk_fullstack.git)
cd buku_induk_fullstack"

3. Setup Database (Langkah-langkah)
1. Buka phpMyAdmin (http://localhost/phpmyadmin).
2. Buat database baru (contoh: buku_induk_blk).
3. Pilih database tersebut, buka tab "Import".
4. Klik "Choose File" dan pilih file 'database/buku_induk_blk.sql'.
5. Klik "Go" atau "Kirim" di bagian bawah.

4. Setup Backend (Perintah Terminal
1. Buka terminal lalu masukan command "cd backend npm install"
2. Setelah selesai, buat file baru bernama .env di dalam folder backend dan salin (copy) semua teks di bawah ini ke dalamnya:
" DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=buku_induk_blk
PORT=5000
FRONTEND_URL=http://localhost:3000
JWT_SECRET=ini_adalah_kunci_rahasia_anda_yang_sangat_aman"

Setelah file .env disimpan, kembali ke terminal Anda dan jalankan server:
"node server.js"

5. Setup Frontend (Perintah Terminal)
Buka terminal BARU (biarkan terminal backend tetap berjalan). Mulai dari folder proyek (buku_induk_fullstack):
lalu masukkan command
"cd frontend
npm install
npm start"
