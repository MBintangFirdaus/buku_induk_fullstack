import axios from 'axios';
import { io } from 'socket.io-client';

// -------------------------------------------------------------------------
// PENTING: Ganti URL ini dengan alamat backend Anda
// (Jika backend di port 5000, maka gunakan http://localhost:5000)
// -------------------------------------------------------------------------
const BASE_URL = 'http://localhost:5000'; 

// 1. Membuat Instance Axios (bernama 'api')
// Ini yang digunakan oleh studentAPI dan authAPI
const api = axios.create({
  baseURL: `${BASE_URL}/api`, // Asumsi semua rute backend ada di bawah /api
                              // Jika tidak, ganti jadi: baseURL: BASE_URL
});

// Interceptor untuk otomatis menambahkan Token ke setiap request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// 2. Membuat Instance Socket (INI YANG HILANG)
// Kita ekspor 'socket' agar bisa di-import di app.js
// autoConnect: false agar koneksi baru dibuat setelah login berhasil
export const socket = io(BASE_URL, {
  autoConnect: false,
});

// 3. Mengekspor authAPI (ini juga diimpor oleh app.js)
export const authAPI = {
  login: async (credentials) => {
    try {
      // Pastikan rute '/auth/login' ini sesuai dengan backend Anda
      const response = await api.post('/auth/login', credentials); 
      return response;
    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  }
};

// 4. Mengekspor studentAPI (dari file yang Anda berikan)
// (Pastikan rutenya benar, misal '/students' atau '/api/students')
export const studentAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/students');
      return response;
    } catch (error) {
      console.error('GET Students Error:', error);
      throw error;
    }
  },
  
  create: async (data) => {
    try {
      console.log('🟡 Sending student data to API:', data);
      const response = await api.post('/students', data);
      console.log('✅ Create student response:', response);
      return response;
    } catch (error) {
      console.error('CREATE Student Error:', error);
      throw error;
    }
  },
  
  update: async (id, data) => {
    try {
      console.log(`🟡 Updating student ${id}:`, data);
      const response = await api.put(`/students/${id}`, data);
      console.log('✅ Update student response:', response);
      return response;
    } catch (error) {
      console.error('UPDATE Student Error:', error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await api.delete(`/students/${id}`);
      return response;
    } catch (error) {
      console.error('DELETE Student Error:', error);
      throw error;
    }
  }
};