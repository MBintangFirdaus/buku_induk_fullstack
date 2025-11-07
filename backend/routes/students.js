const express = require('express');
const db = require('../config/database.js'); // ini sudah benar

const router = express.Router();

// GET all students - TAMBAHKAN LOGGING
router.get('/', async (req, res) => {
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

// CREATE student - TAMBAHKAN VALIDASI & LOGGING
router.post('/', async (req, res) => {
  try {
    console.log('🟡 Creating new student:', req.body);
    
    const { 
      nama, ttl, jenis_kelamin, alamat, pendidikan, kejuruan, tahun_masuk, status,
      no_induk, nik, no_hp, email, keterangan, fisik, tb_bb
    } = req.body;
    
    // Validasi
    if (!nama || !ttl) {
      return res.status(400).json({ 
        success: false,
        message: 'Nama and TTL are required' 
      });
    }

    const sql = `INSERT INTO students 
                 (nama, ttl, jenis_kelamin, alamat, pendidikan, kejuruan, 
                  tahun_masuk, status, no_induk, nik, no_hp, email, 
                  keterangan, fisik, tb_bb)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const values = [
      nama, 
      ttl, 
      jenis_kelamin || 'Laki-laki', 
      alamat || '', 
      pendidikan || '', 
      kejuruan || '', 
      tahun_masuk || new Date().getFullYear(), 
      status || 'Aktif',
      no_induk || '', 
      nik || '', 
      no_hp || '', 
      email || '', 
      keterangan || '',
      fisik || 'NON DIPABLE', 
      tb_bb || ''
    ];

    console.log('🟡 Executing SQL:', sql);
    console.log('🟡 With values:', values);

    const [result] = await db.query(sql, values);
    console.log('✅ Insert result:', result);

    // Ambil data yang baru dibuat
    const [newStudent] = await db.query(
      'SELECT * FROM students WHERE id = ?', 
      [result.insertId]
    );
    
    console.log('✅ Student created successfully:', newStudent[0]);
    
    // Socket emit
    if (req.app.get('io')) {
      req.app.get('io').emit('studentCreated', newStudent[0]);
    }
    
    res.status(201).json({
      success: true,
      data: newStudent[0]
    });
    
  } catch (err) {
    console.error('❌ Error creating student:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create student',
      error: err.message,
      sqlMessage: err.sqlMessage 
    });
  }
});

// UPDATE student
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🟡 Updating student ${id}:`, req.body);

    const { 
      nama, ttl, jenis_kelamin, alamat, pendidikan, kejuruan, tahun_masuk, status,
      no_induk, nik, no_hp, email, keterangan, fisik, tb_bb
    } = req.body;

    if (!nama || !ttl) {
      return res.status(400).json({ 
        success: false,
        message: 'Nama and TTL are required' 
      });
    }

    const sql = `UPDATE students SET 
                 nama = ?, ttl = ?, jenis_kelamin = ?, alamat = ?, 
                 pendidikan = ?, kejuruan = ?, tahun_masuk = ?, status = ?,
                 no_induk = ?, nik = ?, no_hp = ?, email = ?, keterangan = ?, 
                 fisik = ?, tb_bb = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`;

    const values = [
      nama, ttl, jenis_kelamin, alamat, pendidikan, kejuruan, 
      tahun_masuk, status, no_induk, nik, no_hp, email, keterangan,
      fisik, tb_bb, id
    ];

    const [result] = await db.query(sql, values);
    console.log('✅ Update result:', result);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Student not found' 
      });
    }

    // Ambil data terupdate
    const [updatedStudent] = await db.query(
      'SELECT * FROM students WHERE id = ?', 
      [id]
    );

    console.log('✅ Student updated successfully:', updatedStudent[0]);

    if (req.app.get('io')) {
      req.app.get('io').emit('studentUpdated', updatedStudent[0]);
    }

    res.json({
      success: true,
      data: updatedStudent[0]
    });

  } catch (err) {
    console.error('❌ Error updating student:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update student',
      error: err.message
    });
  }
});

// DELETE student
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🟡 Deleting student ${id}`);
    
    const sql = 'DELETE FROM students WHERE id = ?';
    const [result] = await db.query(sql, [id]);
    
    console.log('✅ Delete result:', result);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Student not found' 
      });
    }
    
    console.log(`✅ Student ${id} deleted successfully`);
    
    if (req.app.get('io')) {
      req.app.get('io').emit('studentDeleted', { id: parseInt(id) });
    }
    
    res.json({ 
      success: true,
      message: 'Student deleted successfully',
      deletedId: parseInt(id)
    });
    
  } catch (err) {
    console.error('❌ Error deleting student:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete student',
      error: err.message 
    });
  }
});

module.exports = router;
