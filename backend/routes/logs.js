// routes/logs.js
const express = require('express');
const db = require('../config/database.js'); 
const router = express.Router();

// GET all activity logs
router.get('/', async (req, res) => {
  try {
    // Ambil 50 log terbaru
    const sql = 'SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 50';
    const [logs] = await db.query(sql); 
    
    res.json(logs);
  } catch (err) { 
    console.error('❌ Error fetching activity logs:', err);
    res.status(500).json({ 
      message: 'Database error',
      error: err.message 
    });
  }
});

module.exports = router;