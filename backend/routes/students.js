const express = require('express');
const db = require('../config/database.js'); 
const multer = require('multer'); 
const fs = require('fs'); 
const path = require('path'); 

const router = express.Router();

// --- FUNGSI HELPER BARU ---
// Fungsi untuk mencatat aktivitas ke database
const logActivity = async (userName, action, entityId, details) => {
  try {
    const logSql = `INSERT INTO activity_logs (user_name, action, entity_id, details) 
                    VALUES (?, ?, ?, ?)`;
    // 'req.user' didapat dari middleware 'authenticateToken'
    const finalUserName = userName || 'Sistem';
    await db.query(logSql, [finalUserName, action, entityId, details]);
    console.log(`✅ Activity logged: ${finalUserName} ${action} ${details}`);
  } catch (logError) {
    console.error('❌ Error logging activity:', logError);
    // Kita tidak menghentikan proses utama jika logging gagal
  }
};
// --- AKHIR FUNGSI HELPER ---

// Konfigurasi Multer (dari file Anda)
const uploadDir = 'public/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Pastikan req.params.id ada, jika tidak (misal 'create'), beri nama sementara
    const id = req.params.id || 'new';
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, 'student-' + id + '-' + uniqueSuffix);
  }
});
const upload = multer({ storage: storage });

// GET all students
router.get('/', async (req, res) => {
  // (Tidak ada perubahan di sini, tidak perlu log untuk GET)
  try {
    console.log('🟡 Fetching students from database...');
    const sql = 'SELECT * FROM students ORDER BY id DESC';
    const [results] = await db.query(sql); 
    console.log(`✅ Successfully fetched ${results.length} students`);
    res.json(results);
  } catch (err) { 
    console.error('❌ Error fetching students:', err);
    res.status(500).json({ 
      message: 'Database error',
      error: err.message 
    });
  }
});

// CREATE student
router.post('/', async (req, res) => {
  try {
    console.log('🟡 Creating new student:', req.body);
    
    // --- KODE YANG DIPERBAIKI ---
    const { 
      nama, ttl, alamat, no_hp, no_induk, pendidikan, 
      jenis_kelamin, fisik, tb_bb, kejuruan, tahun_masuk, 
      status, nik, email, keterangan 
    } = req.body;
    
    // Ambil user ID dari token
    const created_by = req.user.id; 

    if (!nama || !ttl) {
      return res.status(400).json({ message: 'Nama dan TTL harus diisi' });
    }

    const sql = `INSERT INTO students 
                 (nama, ttl, alamat, no_hp, no_induk, pendidikan, jenis_kelamin, fisik, tb_bb, kejuruan, tahun_masuk, status, nik, email, keterangan, created_by) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      nama, ttl, alamat, no_hp, no_induk, pendidikan, 
      jenis_kelamin, fisik, tb_bb, kejuruan, tahun_masuk, 
      status, nik, email, keterangan, created_by
    ];
    // --- AKHIR KODE YANG DIPERBAIKI ---

    const [result] = await db.query(sql, values);
    const [newStudent] = await db.query('SELECT * FROM students WHERE id = ?', [result.insertId]);
    
    console.log('✅ Student created successfully:', newStudent[0]);
    
    // --- BARU: Panggil logActivity ---
    const userName = req.user.nama_lengkap || req.user.username;
    const details = `Membuat siswa baru: '${newStudent[0].nama}' (ID: ${newStudent[0].id})`;
    await logActivity(userName, 'CREATE', newStudent[0].id, details);
    // --- AKHIR BARU ---

    if (req.app.get('io')) {
      req.app.get('io').emit('studentCreated', newStudent[0]);
    }
    res.status(201).json({
      success: true,
      data: newStudent[0]
    });
    
  } catch (err) {
    // --- KODE YANG DIPERBAIKI ---
    console.error('❌ Error creating student:', err);
    res.status(500).json({ 
      message: 'Database error',
      error: err.message 
    });
    // --- AKHIR KODE YANG DIPERBAIKI ---
  }
});

// UPDATE student
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🟡 Updating student ${id}:`, req.body);

    // --- KODE YANG DIPERBAIKI ---
    const { 
      nama, ttl, alamat, no_hp, no_induk, pendidikan, 
      jenis_kelamin, fisik, tb_bb, kejuruan, tahun_masuk, 
      status, nik, email, keterangan 
    } = req.body;

    if (!nama || !ttl) {
      return res.status(400).json({ message: 'Nama dan TTL harus diisi' });
    }

    const sql = `UPDATE students SET 
                 nama = ?, ttl = ?, alamat = ?, no_hp = ?, no_induk = ?, pendidikan = ?, 
                 jenis_kelamin = ?, fisik = ?, tb_bb = ?, kejuruan = ?, tahun_masuk = ?, 
                 status = ?, nik = ?, email = ?, keterangan = ?
                 WHERE id = ?`;
    const values = [
      nama, ttl, alamat, no_hp, no_induk, pendidikan, 
      jenis_kelamin, fisik, tb_bb, kejuruan, tahun_masuk, 
      status, nik, email, keterangan,
      id // id untuk WHERE clause
    ];
    // --- AKHIR KODE YANG DIPERBAIKI ---

    const [result] = await db.query(sql, values);

    // --- KODE YANG DIPERBAIKI ---
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Siswa tidak ditemukan' });
    }
    // --- AKHIR KODE YANG DIPERBAIKI ---

    const [updatedStudent] = await db.query('SELECT * FROM students WHERE id = ?', [id]);
    console.log('✅ Student updated successfully:', updatedStudent[0]);

    // --- BARU: Panggil logActivity ---
    const userName = req.user.nama_lengkap || req.user.username;
    const details = `Memperbarui siswa: '${updatedStudent[0].nama}' (ID: ${updatedStudent[0].id})`;
    await logActivity(userName, 'UPDATE', updatedStudent[0].id, details);
    // --- AKHIR BARU ---

    if (req.app.get('io')) {
      req.app.get('io').emit('studentUpdated', updatedStudent[0]);
    }
    res.json({
      success: true,
      data: updatedStudent[0]
    });

  } catch (err) {
    // --- KODE YANG DIPERBAIKI ---
    console.error(`❌ Error updating student ${req.params.id}:`, err);
    res.status(500).json({ 
      message: 'Database error',
      error: err.message 
    });
    // --- AKHIR KODE YANG DIPERBAIKI ---
  }
});

// DELETE student
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🟡 Deleting student ${id}`);
    
    // --- DIPERBARUI: Ambil data siswa SEBELUM dihapus ---
    const [student] = await db.query('SELECT nama FROM students WHERE id = ?', [id]);
    const studentName = student.length > 0 ? student[0].nama : `ID: ${id}`;
    // --- AKHIR DIPERBARUI ---
    
    const sql = 'DELETE FROM students WHERE id = ?';
    const [result] = await db.query(sql, [id]);
    
    // --- KODE YANG DIPERBAIKI ---
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Siswa tidak ditemukan' });
    }
    // --- AKHIR KODE YANG DIPERBAIKI ---
    
    console.log(`✅ Student ${id} deleted successfully`);
    
    // --- BARU: Panggil logActivity ---
    const userName = req.user.nama_lengkap || req.user.username;
    const details = `Menghapus siswa: '${studentName}' (ID: ${id})`;
    await logActivity(userName, 'DELETE', parseInt(id), details);
    // --- AKHIR BARU ---
    
    if (req.app.get('io')) {
      req.app.get('io').emit('studentDeleted', { id: parseInt(id) });
    }
    // --- KODE YANG DIPERBAIKI ---
    res.json({ success: true, message: 'Siswa berhasil dihapus' });
    // --- AKHIR KODE YANG DIPERBAIKI ---
    
  } catch (err) {
    // --- KODE YANG DIPERBAIKI ---
    console.error(`❌ Error deleting student ${req.params.id}:`, err);
    res.status(500).json({ 
      message: 'Database error',
      error: err.message 
    });
    // --- AKHIR KODE YANG DIPERBAIKI ---
  }
});

// UPLOAD FOTO
router.post('/:id/upload-foto', upload.single('foto_profil'), async (req, res) => {
  try {
    const { id } = req.params;

    // --- KODE YANG DIPERBAIKI ---
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang diupload' });
    }
    // --- AKHIR KODE YANG DIPERBAIKI ---

    const fotoUrl = `/uploads/${req.file.filename}`; 
    const sql = 'UPDATE students SET foto_url = ? WHERE id = ?';
    const [result] = await db.query(sql, [fotoUrl, id]);

    // --- KODE YANG DIPERBAIKI ---
    if (result.affectedRows === 0) {
      // Hapus file yang sudah terupload jika update gagal
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Siswa tidak ditemukan' });
    }
    // --- AKHIR KODE YANG DIPERBAIKI ---

    const [updatedStudent] = await db.query('SELECT * FROM students WHERE id = ?', [id]);

    // --- BARU: Panggil logActivity ---
    const userName = req.user.nama_lengkap || req.user.username;
    const details = `Mengupload foto untuk siswa: '${updatedStudent[0].nama}' (ID: ${id})`;
    await logActivity(userName, 'UPDATE', updatedStudent[0].id, details);
    // --- AKHIR BARU ---

    if (req.app.get('io')) {
      req.app.get('io').emit('studentUpdated', updatedStudent[0]);
    }
    // --- KODE YANG DIPERBAIKI ---
    res.json({ 
      success: true, 
      message: 'Foto berhasil diupload',
      data: updatedStudent[0]
    });
    // --- AKHIR KODE YANG DIPERBAIKI ---

  } catch (err) {
    // --- KODE YANG DIPERBAIKI ---
    console.error(`❌ Error uploading photo for student ${req.params.id}:`, err);
    res.status(500).json({ 
      message: 'Server error',
      error: err.message 
    });
    // --- AKHIR KODE YANG DIPERBAIKI ---
  }
});

module.exports = router;
