const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students'); 
const logRoutes = require('./routes/logs'); // <-- BARU
const { authenticateToken } = require('./middleware/auth.js'); // <-- INI BENAR

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Buat folder 'public/uploads' bisa diakses secara statis
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'))); 

// Routes
app.use('/api/auth', authRoutes);

// --- PERUBAHAN DI SINI ---
// Lindungi rute student dan logs dengan middleware
// Semua permintaan ke /api/students dan /api/logs SEKARANG HARUS punya Token
app.use('/api/students', authenticateToken, studentRoutes); 
app.use('/api/logs', authenticateToken, logRoutes); // <-- BARU
// --- AKHIR PERUBAHAN ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready for real-time updates`);
});
