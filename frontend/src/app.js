import StatistikPage from './StatistikPage.jsx';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, Plus, Edit2, Trash2, Download, Save, X, Users, FileText, LogOut, 
  Home, BarChart3, Settings, BookOpen, CheckCircle, XCircle, Moon, Sun,
  Briefcase, Clock, Award, TrendingUp, ChevronLeft, ChevronRight, AlertTriangle,
  Eye, EyeOff, Upload, UserCheck, Filter, Calendar
} from 'lucide-react';
// --- PERUBAHAN 1: Impor logAPI ---
import { studentAPI, authAPI, socket, logAPI } from './services/api';

// BARU: Tentukan BASE_URL backend Anda di sini
// Ini penting agar gambar bisa dimuat
const BASE_URL = 'http://localhost:5000'; 

// Komponen Loading
const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };
  
  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full border-b-2 border-indigo-600 ${sizes[size]}`}></div>
    </div>
  );
};

// Komponen Pagination
const Pagination = ({ currentPage, totalPages, onPageChange, darkMode }) => {
  // ... (Kode pagination Anda tidak berubah) ...
  const pages = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Halaman {currentPage} dari {totalPages}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg transition ${
            currentPage === 1
              ? 'opacity-50 cursor-not-allowed text-gray-400'
              : darkMode
              ? 'text-gray-400 hover:bg-gray-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-lg transition font-medium ${
              currentPage === page
                ? 'bg-indigo-600 text-white'
                : darkMode
                ? 'text-gray-400 hover:bg-gray-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg transition ${
            currentPage === totalPages
              ? 'opacity-50 cursor-not-allowed text-gray-400'
              : darkMode
              ? 'text-gray-400 hover:bg-gray-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// Komponen Confirm Modal
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, type = 'delete', loading }) => {
  // ... (Kode ConfirmModal Anda tidak berubah) ...
  if (!isOpen) return null;

  const buttonStyles = {
    delete: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700'
  };

  return (
    //  👇 PERUBAHAN DI SINI: z-50 diubah menjadi z-[60]
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-full ${
              type === 'delete' ? 'bg-red-100 text-red-600' :
              type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition font-medium disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`px-6 py-2 text-white rounded-lg transition font-medium disabled:opacity-50 ${buttonStyles[type]}`}
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Ya, Lanjutkan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(true);
  const [editingStudent, setEditingStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [filters, setFilters] = useState({
    kejuruan: '',
    jenis_kelamin: '',
    fisik: '',
    status: ''
  });
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [popup, setPopup] = useState({ show: false, type: '', message: '' });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    type: 'delete',
    onConfirm: null,
    loading: false
  });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State untuk modal "Lihat Data Siswa"
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewedStudent, setViewedStudent] = useState(null);

  // State untuk file foto yang dipilih
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    nama: '',
    ttl: '',
    alamat: '',
    no_hp: '',
    no_induk: '',
    pendidikan: '',
    jenis_kelamin: 'Laki-laki',
    fisik: '',
    tb_bb: '',
    kejuruan: '',
    tahun_masuk: new Date().getFullYear(),
    status: 'Aktif',
    nik: '',
    email: '',
    keterangan: '',
  });

  const [formErrors, setFormErrors] = useState({});
  
  // --- PERUBAHAN 2: State baru untuk Activity Log ---
  const [activityLogs, setActivityLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoginOpen(false);
      loadStudents();
      connectSocket();
    }

    // Cleanup function untuk mencegah duplicate listeners
    return () => {
      socket.off('studentCreated');
      socket.off('studentUpdated');
      socket.off('studentDeleted');
    };
  }, []);
  
  // --- PERUBAHAN 3: useEffect baru untuk memuat log saat tab Pengaturan aktif ---
  useEffect(() => {
    if (activeMenu === 'pengaturan' && user) {
      loadLogs();
    }
  }, [activeMenu, user]); // Akan dipanggil setiap kali activeMenu atau user berubah

  // Di dalam file app.js

  const connectSocket = () => {
    // ... (Kode connectSocket Anda tidak berubah) ...
    socket.connect();
    
    socket.off('studentCreated');
    socket.off('studentUpdated');
    socket.off('studentDeleted');
    
    socket.on('studentCreated', (student) => {
      console.log('Socket: Student created:', student);
      setStudents(prev => {
        const exists = prev.find(s => s.id === student.id);
        if (exists) return prev;
        return [student, ...prev];
      });
    });
    
    socket.on('studentUpdated', (updatedStudent) => {
      console.log('Socket: Student updated:', updatedStudent);
      
      setStudents(prev => {
        const index = prev.findIndex(s => s.id === updatedStudent.id);
        if (index === -1) {
          return prev; 
        }
        
        const existingStudent = prev[index];
        
        if (new Date(updatedStudent.updated_at) < new Date(existingStudent.updated_at)) {
          console.log('Socket: Stale update event ignored.');
          return prev;
        }
        
        const newList = [...prev];
        newList[index] = updatedStudent;
        return newList;
      });

      if (isViewModalOpen && viewedStudent && viewedStudent.id === updatedStudent.id) {
        if (new Date(updatedStudent.updated_at) >= new Date(viewedStudent.updated_at)) {
           setViewedStudent(updatedStudent);
        }
      }
    });
    
    socket.on('studentDeleted', ({ id }) => {
      console.log('Socket: Student deleted:', id);
      setStudents(prev => prev.filter(s => s.id !== id));
    });
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      const response = await studentAPI.getAll();
      setStudents(response.data);
    } catch (error) {
      console.error('Error loading students:', error);
      if (error.response?.status === 401) handleLogout();
    } finally {
      setLoading(false);
    }
  };
  
  // --- PERUBAHAN 4: Fungsi baru untuk memuat log aktivitas ---
  const loadLogs = async () => {
    setLogsLoading(true);
    try {
      const response = await logAPI.getAll();
      setActivityLogs(response.data);
    } catch (error) {
      console.error('Gagal memuat log:', error);
      showPopup('error', 'Gagal memuat riwayat aktivitas');
    } finally {
      setLogsLoading(false);
    }
  };
  
  // ... (Kode handleLogin, handleLogout, handleInputChange, handleFileChange tidak berubah) ...
  const validateForm = () => {
    const errors = {};
    
    if (!formData.nama.trim()) errors.nama = 'Nama harus diisi';
    if (!formData.ttl.trim()) errors.ttl = 'TTL harus diisi';
    if (formData.no_hp && !/^\d+$/.test(formData.no_hp)) errors.no_hp = 'No HP harus angka';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Email tidak valid';
    if (formData.nik && !/^\d+$/.test(formData.nik)) errors.nik = 'NIK harus angka';
    if (formData.tahun_masuk && (formData.tahun_masuk < 2000 || formData.tahun_masuk > new Date().getFullYear())) {
      errors.tahun_masuk = 'Tahun masuk tidak valid';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const response = await authAPI.login(loginForm);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      setIsLoginOpen(false);
      loadStudents();
      connectSocket();
      showPopup('success', 'Login berhasil!');
    } catch (error) {
      showPopup('error', 'Login gagal, periksa kembali username & password!');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleLogout = () => {
    setConfirmModal({
      show: true,
      title: 'Konfirmasi Logout',
      message: 'Apakah Anda yakin ingin logout?',
      type: 'warning',
      onConfirm: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsLoginOpen(true);
        socket.disconnect();
        setConfirmModal(prev => ({ ...prev, show: false }));
      },
      loading: false
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async () => {
    // ... (Kode handleSubmit Anda tidak berubah) ...
    if (!validateForm()) {
      showPopup('error', 'Terdapat kesalahan dalam form. Silakan periksa kembali.');
      return;
    }

    setSubmitLoading(true);
    try {
      console.log('🟡 Submitting student data:', formData);
      
      let finalStudentData;

      if (editingStudent) {
        // --- LOGIKA EDIT ---
        const textResponse = await studentAPI.update(editingStudent.id, formData);
        finalStudentData = textResponse.data.data; 

        if (selectedFile) {
          console.log(`🟡 Uploading photo for student ID: ${editingStudent.id}`);
          const photoFormData = new FormData();
          photoFormData.append('foto_profil', selectedFile);

          try {
            const uploadResponse = await studentAPI.uploadFoto(editingStudent.id, photoFormData);
            finalStudentData = uploadResponse.data.data;
          } catch (uploadError) {
            console.error('❌ Photo upload failed:', uploadError);
            showPopup('warning', `Data siswa diperbarui, tapi upload foto gagal.`);
          }
        }
        
        setStudents(prev => prev.map(s => s.id === finalStudentData.id ? finalStudentData : s));
        
        if (isViewModalOpen && viewedStudent && viewedStudent.id === finalStudentData.id) {
          setViewedStudent(finalStudentData);
        }
        
        showPopup('success', 'Data siswa berhasil diperbarui!');

      } else {
        // --- LOGIKA CREATE ---
        const createResponse = await studentAPI.create(formData);
        finalStudentData = createResponse.data.data;

        if (selectedFile) {
          console.log(`🟡 Uploading photo for new student ID: ${finalStudentData.id}`);
          const photoFormData = new FormData();
          photoFormData.append('foto_profil', selectedFile);
          
          try {
            const uploadResponse = await studentAPI.uploadFoto(finalStudentData.id, photoFormData);
            finalStudentData = uploadResponse.data.data;
          } catch (uploadError) {
            console.error('❌ Photo upload failed:', uploadError);
            showPopup('warning', `Siswa dibuat, tapi upload foto gagal.`);
          }
        }
        
        setStudents(prev => {
           const exists = prev.find(s => s.id === finalStudentData.id);
           if (exists) {
             return prev.map(s => s.id === finalStudentData.id ? finalStudentData : s);
           }
           return [finalStudentData, ...prev];
        });
        
        if (isViewModalOpen && viewedStudent && viewedStudent.id === finalStudentData.id) {
          setViewedStudent(finalStudentData);
        }

        showPopup('success', 'Data siswa berhasil ditambahkan!');
      }

      resetForm();
      setIsModalOpen(false);
      
    } catch (error) {
      console.error('❌ Error in handleSubmit:', error);
      
      if (error.response) {
        console.error('Response error:', error.response.data);
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message ||
                          'Gagal menyimpan data';
      
      showPopup('error', `Error: ${errorMessage}`);
    } finally {
      setSubmitLoading(false);
    }
  };
  
  // ... (Kode handleEdit, handleDelete, handleView, resetForm, showPopup, dll tidak berubah) ...
  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      nama: student.nama || '',
      ttl: student.ttl || '',
      alamat: student.alamat || '',
      no_hp: student.no_hp || '',
      no_induk: student.no_induk || '',
      pendidikan: student.pendidikan || '',
      jenis_kelamin: student.jenis_kelamin || 'Laki-laki',
      fisik: student.fisik || '',
      tb_bb: student.tb_bb || '',
      kejuruan: student.kejuruan || '',
      tahun_masuk: student.tahun_masuk || new Date().getFullYear(),
      status: student.status || 'Aktif',
      nik: student.nik || '',
      email: student.email || '',
      keterangan: student.keterangan || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    setConfirmModal({
      show: true,
      title: 'Hapus Data Siswa',
      message: 'Data yang dihapus tidak dapat dikembalikan. Yakin ingin menghapus?',
      type: 'delete',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }));
        try {
          await studentAPI.delete(id);
          showPopup('success', 'Data siswa berhasil dihapus!');
          setConfirmModal(prev => ({ ...prev, show: false }));
          setIsModalOpen(false);
          resetForm();
        } catch (error) {
          showPopup('error', error.response?.data?.message || 'Gagal menghapus data');
          setConfirmModal(prev => ({ ...prev, loading: false }));
        }
      },
      loading: false
    });
  };

  const handleView = (student) => {
    setViewedStudent(student);
    setIsViewModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nama: '',
      ttl: '',
      alamat: '',
      no_hp: '',
      no_induk: '',
      pendidikan: '',
      jenis_kelamin: 'Laki-laki',
      fisik: '',
      tb_bb: '',
      kejuruan: '',
      tahun_masuk: new Date().getFullYear(),
      status: 'Aktif',
      nik: '',
      email: '',
      keterangan: '',
    });
    setEditingStudent(null);
    setFormErrors({});
    setSelectedFile(null);
  };

  const showPopup = (type, message) => {
    setPopup({ show: true, type, message });
    setTimeout(() => setPopup({ show: false, type: '', message: '' }), 3000);
  };

  const handleResetFilters = () => {
    setShowResetConfirm(true);
  };

  const confirmResetFilters = () => {
    setFilters({
      kejuruan: '',
      jenis_kelamin: '',
      fisik: '',
      status: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
    setShowResetConfirm(false);
    showPopup('success', 'Semua filter berhasil direset!');
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = 
        s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.ttl && s.ttl.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.no_hp && s.no_hp.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.no_induk && s.no_induk.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.pendidikan && s.pendidikan.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.jenis_kelamin && s.jenis_kelamin.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.fisik && s.fisik.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.kejuruan && s.kejuruan.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesKejuruan = !filters.kejuruan || s.kejuruan === filters.kejuruan;
      const matchesJenisKelamin = !filters.jenis_kelamin || s.jenis_kelamin === filters.jenis_kelamin;
      const matchesFisik = !filters.fisik || s.fisik === filters.fisik;
      const matchesStatus = !filters.status || s.status === filters.status;

      return matchesSearch && matchesKejuruan && matchesJenisKelamin && matchesFisik && matchesStatus;
    });
  }, [students, searchTerm, filters]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);

  const uniqueKejuruan = useMemo(() => [...new Set(students.map(s => s.kejuruan).filter(Boolean))], [students]);
  const uniqueFisik = useMemo(() => [...new Set(students.map(s => s.fisik).filter(Boolean))], [students]);

  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
  };

  const exportToCSV = () => {
    const headers = [
      'No', 'Nama', 'TTL', 'Alamat', 'No HP', 'No Induk',
      'Pendidikan', 'Jenis Kelamin', 'Fisik', 'TB/BB',
      'Kejuruan', 'Tahun Masuk', 'Status', 'NIK', 'Email', 'Keterangan', 'Foto URL'
    ];
    const rows = filteredStudents.map((s, i) => [
      i + 1, s.nama, s.ttl, s.alamat, s.no_hp, s.no_induk,
      s.pendidikan, s.jenis_kelamin, s.fisik, s.tb_bb,
      s.kejuruan, s.tahun_masuk, s.status, s.nik, s.email, s.keterangan,
      s.foto_url ? `${BASE_URL}${s.foto_url}` : ''
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => (csv += row.map(cell => `"${cell || ''}"`).join(',') + '\n'));

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Buku_Induk_BLK_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const Popup = ({ type, message }) => (
    //  👇 PERUBAHAN DI SINI: z-50 diubah menjadi z-[70]
    <div className={`fixed top-6 right-6 z-[70] flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold transition-all duration-500 ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`}>
      {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
      {message}
    </div>
  );

  const DetailItem = ({ label, value }) => (
    <div className="py-2 grid grid-cols-3 gap-4 border-b border-gray-200 dark:border-gray-700">
      <dt className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</dt>
      <dd className={`col-span-2 text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>{value || '-'}</dd>
    </div>
  );


  if (isLoginOpen) {
    // ... (Kode modal Login Anda tidak berubah) ...
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-100 to-indigo-200'} flex items-center justify-center p-4`}>
        {popup.show && <Popup type={popup.type} message={popup.message} />}
        <form onSubmit={handleLogin} className={`${darkMode ? 'bg-gray-800 border-2 border-gray-700' : 'bg-white'} p-10 rounded-2xl shadow-xl w-full max-w-md relative`}>
          <button
            type="button"
            onClick={toggleDarkMode}
            className={`absolute top-4 right-4 p-2 rounded-lg transition ${darkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <div className="text-center mb-8">
            <img 
              src="/logo-blk.jpg" 
              alt="Logo BLK" 
              className="w-48 h-20 mx-auto mb-4 object-contain drop-shadow-md" 
            />
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>MyBLK LOGIN</h1>
            <p className={`font-medium mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Sistem Buku Induk Siswa</p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>UPTD BLK Kabupaten Karawang</p>
          </div>
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Username</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:border-indigo-500 focus:outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200'}`}
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:border-indigo-500 focus:outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200'}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={submitLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-indigo-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitLoading ? <LoadingSpinner size="sm" /> : null}
              {submitLoading ? 'Loading...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <>
      {popup.show && <Popup type={popup.type} message={popup.message} />}
      <ConfirmModal
        isOpen={confirmModal.show}
        onClose={() => setConfirmModal(prev => ({ ...prev, show: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        loading={confirmModal.loading}
      />
      
      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        //  👇 PERUBAHAN DI SINI: z-50 diubah menjadi z-[60]
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          {/* ... (Kode modal Reset Anda tidak berubah) ... */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Reset Filter</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Apakah Anda yakin ingin mereset semua filter dan pencarian? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={confirmResetFilters}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Ya, Reset Semua
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal "Lihat Data Siswa" */}
      {/* z-50 di sini sudah benar, tidak perlu diubah */}
      {isViewModalOpen && viewedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          {/* ... (Kode modal Lihat Data Anda tidak berubah) ... */}
          <div className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl`}>
            {/* Header Modal */}
            <div className={`sticky top-0 ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 border-b-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Detail Data Siswa
              </h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Konten Modal */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="md:col-span-1 flex flex-col items-center text-center">
                  {viewedStudent.foto_url ? (
                    <img
                      src={`${BASE_URL}${viewedStudent.foto_url}`}
                      alt={viewedStudent.nama}
                      className="w-40 h-40 rounded-full object-cover border-4 border-indigo-200 shadow-md mb-4"
                    />
                  ) : (
                    <div className={`w-40 h-40 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center mb-4`}>
                      <Users className={`w-24 h-24 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    </div>
                  )}
                  
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{viewedStudent.nama}</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No. Induk: {viewedStudent.no_induk || '-'}</p>
                  <span className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                    viewedStudent.status === 'Aktif' ? 'bg-green-100 text-green-700' :
                    viewedStudent.status === 'Lulus' ? 'bg-blue-100 text-blue-700' :
                    viewedStudent.status === 'Tidak AktIF' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {viewedStudent.status}
                  </span>
                </div>
                
                <div className="md:col-span-2">
                  <h4 className={`text-lg font-semibold mb-3 pb-2 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-800'}`}>
                    Data Personal
                  </h4>
                  <dl>
                    <DetailItem label="TTL" value={viewedStudent.ttl} />
                    <DetailItem label="Jenis Kelamin" value={viewedStudent.jenis_kelamin} />
                    <DetailItem label="NIK" value={viewedStudent.nik} />
                    <DetailItem label="No HP" value={viewedStudent.no_hp} />
                    <DetailItem label="Email" value={viewedStudent.email} />
                    <DetailItem label="Alamat" value={viewedStudent.alamat} />
                  </dl>

                  <h4 className={`text-lg font-semibold mt-6 mb-3 pb-2 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-800'}`}>
                    Data Akademik & Fisik
                  </h4>
                  <dl>
                    <DetailItem label="Kejuruan" value={viewedStudent.kejuruan} />
                    <DetailItem label="Pendidikan" value={viewedStudent.pendidikan} />
                    <DetailItem label="Tahun Masuk" value={viewedStudent.tahun_masuk} />
                    <DetailItem label="Kondisi Fisik" value={viewedStudent.fisik} />
                    <DetailItem label="TB/BB" value={viewedStudent.tb_bb} />
                    <DetailItem label="Keterangan" value={viewedStudent.keterangan} />
                  </dl>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className={`sticky bottom-0 ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 border-t-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-end`}>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className={`px-6 py-3 border-2 rounded-xl font-semibold transition ${
                  darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}


      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
        <nav className={`${darkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-white'} shadow-lg sticky top-0 z-40`}>
          {/* ... (Kode Navigasi Anda tidak berubah) ... */}
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src="/logo-blk.jpg" alt="Logo BLK" className="w-16 h-16 object-contain" />
                <div>
                  <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Buku Induk Siswa BLK</h1>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>UPTD BLK Kabupaten Karawang</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setActiveMenu('dashboard'); setCurrentPage(1); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    activeMenu === 'dashboard' ? 'bg-indigo-600 text-white' : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-indigo-50'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span className="font-medium">Dashboard</span>
                </button>
                <button
                  onClick={() => { setActiveMenu('data'); setCurrentPage(1); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    activeMenu === 'data' ? 'bg-indigo-600 text-white' : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-indigo-50'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="font-medium">Data Siswa</span>
                </button>
                <button
                  onClick={() => setActiveMenu('statistik')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    activeMenu === 'statistik' ? 'bg-indigo-600 text-white' : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-indigo-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="font-medium">Statistik</span>
                </button>
                <button
                  onClick={() => setActiveMenu('pengaturan')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    activeMenu === 'pengaturan' ? 'bg-indigo-600 text-white' : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-indigo-50'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span className="font-medium">Pengaturan</span>
                </button>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-lg transition ${darkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  title={darkMode ? 'Light Mode' : 'Dark Mode'}
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user?.nama_lengkap || user?.username}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="p-8">
          {activeMenu === 'dashboard' && (
            <div className="space-y-6">
              {/* ... (Kode Dashboard Anda tidak berubah) ... */}
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-2xl shadow-lg`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Siswa</p>
                      <h3 className="text-3xl font-bold text-indigo-600 mt-2">{students.length}</h3>
                    </div>
                    <div className="bg-indigo-100 p-4 rounded-xl">
                      <Users className="w-8 h-8 text-indigo-600" />
                    </div>
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-2xl shadow-lg`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Siswa Aktif</p>
                      <h3 className="text-3xl font-bold text-green-600 mt-2">
                        {students.filter(s => s.status === 'Aktif').length}
                      </h3>
                    </div>
                    <div className="bg-green-100 p-4 rounded-xl">
                      <UserCheck className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-2xl shadow-lg`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Siswa Lulus</p>
                      <h3 className="text-3xl font-bold text-blue-600 mt-2">
                        {students.filter(s => s.status === 'Lulus').length}
                      </h3>
                    </div>
                    <div className="bg-blue-100 p-4 rounded-xl">
                      <Award className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-2xl shadow-lg`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tidak Aktif</p>
                      <h3 className="text-3xl font-bold text-red-600 mt-2">
                        {students.filter(s => s.status === 'Tidak Aktif' || s.status === 'Mengundurkan Diri').length}
                      </h3>
                    </div>
                    <div className="bg-red-100 p-4 rounded-xl">
                      <Users className="w-8 h-8 text-red-600" />
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-2xl shadow-lg`}>
                <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>MANAJEMEN SISWA</h2>
                <div className="flex gap-4 flex-wrap">
                  <button
                    onClick={() => { setActiveMenu('data'); resetForm(); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition font-medium"
                  >
                    <Plus className="w-5 h-5" /> Tambah Siswa Baru
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition font-medium"
                  >
                    <Download className="w-5 h-5" /> Export Data CSV
                  </button>
                  <button
                    onClick={() => setActiveMenu('data')}
                    className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition font-medium"
                  >
                    <BookOpen className="w-5 h-5" /> Lihat Semua Data
                  </button>
                </div>
              </div>

              {/* Ringkasan Kejuruan */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-2xl shadow-lg`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Ringkasan per Kejuruan</h2>
                  <Briefcase className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-indigo-600'}`} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {uniqueKejuruan.length > 0 ? (
                    uniqueKejuruan.map((kejuruan, index) => {
                      const count = students.filter(s => s.kejuruan === kejuruan).length;
                      const colors = [
                        { bg: 'bg-purple-100', text: 'text-purple-600', icon: 'bg-purple-500' },
                        { bg: 'bg-green-100', text: 'text-green-600', icon: 'bg-green-500' },
                        { bg: 'bg-yellow-100', text: 'text-yellow-600', icon: 'bg-yellow-500' },
                        { bg: 'bg-red-100', text: 'text-red-600', icon: 'bg-red-500' },
                        { bg: 'bg-blue-100', text: 'text-blue-600', icon: 'bg-blue-500' },
                      ];
                      const colorScheme = colors[index % colors.length];
                      
                      return (
                        <div key={kejuruan} className={`${darkMode ? 'bg-gray-700' : colorScheme.bg} p-5 rounded-xl transition hover:shadow-lg cursor-pointer`}>
                          <div className={`${colorScheme.icon} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
                            <Award className="w-6 h-6 text-white" />
                          </div>
                          <h3 className={`font-bold text-2xl ${darkMode ? 'text-white' : colorScheme.text} mb-1`}>{count}</h3>
                          <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{kejuruan}</p>
                        </div>
                      );
                    })
                  ) : (
                    <div className={`col-span-full text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Belum ada data kejuruan
                    </div>
                  )}
                </div>
              </div>

              {/* Siswa Terbaru */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-2xl shadow-lg`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Siswa Terbaru</h2>
                  <div className="flex items-center gap-2">
                    <Clock className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-indigo-600'}`} />
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>10 data terakhir</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <tr>
                        <th className={`px-4 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>No</th>
                        <th className={`px-4 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nama</th>
                        <th className={`px-4 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Kejuruan</th>
                        <th className={`px-4 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tahun Masuk</th>
                        <th className={`px-4 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                        <th className={`px-4 py-3 text-center text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {students.length > 0 ? (
                        students.slice(0, 10).map((student, index) => (
                          <tr key={student.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition`}>
                            <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{index + 1}</td>
                            <td className={`px-4 py-3 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{student.nama}</td>
                            <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-indigo-100 text-indigo-700'}`}>
                                {student.kejuruan || '-'}
                              </span>
                            </td>
                            <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{student.tahun_masuk}</td>
                            <td className={`px-4 py-3 text-sm`}>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                student.status === 'Aktif' ? 'bg-green-100 text-green-700' :
                                student.status === 'Lulus' ? 'bg-blue-100 text-blue-700' :
                                student.status === 'Tidak Aktif' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {student.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button 
                                onClick={() => { setActiveMenu('data'); handleEdit(student); }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className={`px-4 py-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Belum ada data siswa
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {students.length > 10 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setActiveMenu('data')}
                      className={`text-sm font-medium ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'} transition`}
                    >
                      Lihat semua siswa ({students.length}) →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMenu === 'data' && (
            <>
              {/* ... (Kode Data Siswa Anda tidak berubah) ... */}
              <div className={`mb-6 p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg space-y-4`}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="relative w-full md:w-1/3">
                    <input
                      type="text"
                      placeholder="Cari siswa (nama, TTL, kejuruan)..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className={`w-full px-5 py-3 pl-12 border-2 rounded-xl focus:border-indigo-500 focus:outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200'}`}
                    />
                    <Search className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex gap-3 w-full md:w-auto flex-wrap">
                    <button onClick={exportToCSV} className="flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-3 rounded-xl hover:bg-green-700 transition font-medium">
                      <Download className="w-5 h-5" /> Export CSV
                    </button>
                    <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl hover:bg-indigo-700 transition font-medium">
                      <Plus className="w-5 h-5" /> Tambah Siswa
                    </button>
                  </div>
                </div>

                <div className={`flex flex-col md:flex-row items-center gap-3 pt-4 border-t-2 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                  <span className={`text-sm font-semibold whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Filter className="w-4 h-4 inline mr-1" />
                    Filter:
                  </span>
                  
                  <select 
                    value={filters.kejuruan} 
                    onChange={(e) => handleFilterChange('kejuruan', e.target.value)}
                    className={`px-4 py-2 border-2 rounded-lg focus:border-indigo-500 focus:outline-none text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                  >
                    <option value="">Semua Kejuruan</option>
                    {uniqueKejuruan.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>

                  <select 
                    value={filters.jenis_kelamin} 
                    onChange={(e) => handleFilterChange('jenis_kelamin', e.target.value)}
                    className={`px-4 py-2 border-2 rounded-lg focus:border-indigo-500 focus:outline-none text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                  >
                    <option value="">Semua JK</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>

                  <select 
                    value={filters.fisik} 
                    onChange={(e) => handleFilterChange('fisik', e.target.value)}
                    className={`px-4 py-2 border-2 rounded-lg focus:border-indigo-500 focus:outline-none text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                  >
                    <option value="">Semua Fisik</option>
                    {uniqueFisik.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>

                  <select 
                    value={filters.status} 
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className={`px-4 py-2 border-2 rounded-lg focus:border-indigo-500 focus:outline-none text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                  >
                    <option value="">Semua Status</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak Aktif">Tidak Aktif</option> 
                    <option value="Lulus">Lulus</option>
                    <option value="Mengundurkan Diri">Mengundurkan Diri</option>
                  </select>

                  <select 
                    value={itemsPerPage} 
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className={`px-4 py-2 border-2 rounded-lg focus:border-indigo-500 focus:outline-none text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                  >
                    <option value={10}>10 data</option>
                    <option value={25}>25 data</option>
                    <option value={50}>50 data</option>
                    <option value={100}>100 data</option>
                  </select>

                  {(filters.kejuruan || filters.jenis_kelamin || filters.fisik || filters.status || searchTerm) && (
                    <button 
                      onClick={handleResetFilters}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium whitespace-nowrap"
                    >
                      <X className="w-4 h-4" />
                      Reset Semua Filter
                    </button>
                  )}
                </div>
              </div>

              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden`}>
                {loading ? (
                  <div className="flex justify-center items-center py-16">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <tr>
                            <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>No</th>
                            <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nama</th>
                            <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>TTL</th>
                            <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>No HP</th>
                            <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Jenis Kelamin</th>
                            <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Kejuruan</th>
                            <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                            <th className={`px-6 py-4 text-center text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Aksi</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                          {currentStudents.length > 0 ? (
                            currentStudents.map((student, index) => (
                              <tr key={student.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition`}>
                                <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {(currentPage - 1) * itemsPerPage + index + 1}
                                </td>
                                <td className={`px-6 py-4 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{student.nama}</td>
                                <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{student.ttl}</td>
                                <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{student.no_hp}</td>
                                <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{student.jenis_kelamin}</td>
                                <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-indigo-100 text-indigo-700'}`}>
                                    {student.kejuruan || '-'}
                                  </span>
                                </td>
                                <td className={`px-6 py-4 text-sm`}>
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    student.status === 'Aktif' ? 'bg-green-100 text-green-700' :
                                    student.status === 'Lulus' ? 'bg-blue-100 text-blue-700' :
                                    student.status === 'Tidak Aktif' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {student.status}
                                  </span>
                                </td>
                                
                                <td className="px-6 py-4">
                                  <div className="flex justify-center gap-2">
                                    <button 
                                      onClick={() => handleView(student)}
                                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition"
                                      title="Lihat Detail"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    
                                    <button 
                                      onClick={() => handleEdit(student)}
                                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                      title="Edit"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="8" className={`px-6 py-16 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                <div className="flex flex-col items-center gap-3">
                                  <FileText className="w-12 h-12 opacity-50" />
                                  <p className="text-lg font-medium">Tidak ada data siswa</p>
                                  <p className="text-sm">Coba ubah pencarian atau filter yang digunakan</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    
                    {filteredStudents.length > 0 && (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        darkMode={darkMode}
                      />
                    )}
                  </>
                )}
              </div>
            </>
          )}

          {activeMenu === 'statistik' && (
            <StatistikPage students={students} darkMode={darkMode} />
          )}

          {/* --- PERUBAHAN 5 (REVISI): Menampilkan Pengaturan & Log Berdampingan --- */}
          {activeMenu === 'pengaturan' && (
            // Gunakan grid untuk menampung 2 kolom: Pengaturan & Log Aktivitas
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              
              {/* Kolom 1: Pengaturan Sistem (lebar 2/5) */}
              <div className="lg:col-span-2">
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-2xl shadow-lg h-full`}>
                  <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Pengaturan Sistem</h2>
                  <div className="space-y-6">
                    
                    {/* Dark Mode Toggle (KODE LAMA ANDA) */}
                    <div className={`flex items-center justify-between p-4 border-2 rounded-xl ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div>
                        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Dark Mode</h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ubah tampilan aplikasi</p>
                      </div>
                      <button
                        onClick={toggleDarkMode}
                        className={`p-3 rounded-lg transition ${darkMode ? 'bg-yellow-400 text-gray-900' : 'bg-gray-200 text-gray-700'}`}
                      >
                        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    {/* Informasi Akun (KODE LAMA ANDA) */}
                    <div className={`p-4 border-2 rounded-xl ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Informasi Akun</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Username</span>
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user?.username}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Nama Lengkap</span>
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user?.nama_lengkap}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Role</span>
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user?.role}</span>
                        </div>
                      </div>
                    </div>

                    {/* Statistik Data (KODE LAMA ANDA) */}
                    <div className={`p-4 border-2 rounded-xl ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Statistik Data</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Data Siswa</span>
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{students.length} siswa</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Jumlah Kejuruan</span>
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{uniqueKejuruan.length} kejuruan</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Data Tampil per Halaman</span>
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{itemsPerPage} data</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom 2: Activity Log (lebar 3/5) (FITUR BARU ANDA) */}
              <div className="lg:col-span-3">
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg`}>
                  <h2 className={`text-xl font-bold p-6 border-b ${darkMode ? 'text-white border-gray-700' : 'text-gray-800 border-gray-200'}`}>
                    Riwayat Aktivitas (Activity Log)
                  </h2>
                  
                  <div className="p-6">
                    {logsLoading ? (
                      <div className="flex justify-center items-center py-16">
                        <LoadingSpinner />
                      </div>
                    ) : (
                      <ul className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'} max-h-[70vh] overflow-y-auto`}>
                        {activityLogs.length > 0 ? (
                          activityLogs.map(log => (
                            <li key={log.id} className="py-4">
                              <div className="flex justify-between items-center mb-1">
                                <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {log.user_name}
                                </p>
                                <span className={`text-xs font-medium ${
                                  log.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                                  log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                                  'bg-red-100 text-red-700'
                                } px-2 py-0.5 rounded-full`}>
                                  {log.action}
                                </span>
                              </div>
                              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                {log.details}
                              </p>
                              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                {new Date(log.created_at).toLocaleString('id-ID')}
                              </p>
                            </li>
                          ))
                        ) : (
                          <p className={`text-center py-10 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Belum ada aktivitas tercatat.
                          </p>
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}
          {/* --- AKHIR PERUBAHAN REVISI --- */}
          
        </div>
      </div>

      {/* Modal Form (Edit/Add) */}
      {/* z-50 di sini sudah benar, tidak perlu diubah */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          {/* ... (Kode modal Form Anda tidak berubah) ... */}
          <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl`}>
            <div className={`sticky top-0 ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 border-b-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {editingStudent ? 'Edit Data Siswa' : 'Tambah Data Siswa'}
              </h2>
              <button
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Nama Lengkap *
                    {formErrors.nama && <span className="text-red-500 text-xs ml-1">{formErrors.nama}</span>}
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:border-indigo-500 focus:outline-none ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                    } ${formErrors.nama ? 'border-red-500' : ''}`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Foto Profil (Opsional)
                  </label>
                  <input
                    type="file"
                    name="foto_profil"
                    accept="image/png, image/jpeg"
                    onChange={handleFileChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:border-indigo-500 focus:outline-none ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                    } file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${
                      darkMode ? 'file:bg-gray-600 file:text-gray-200 hover:file:bg-gray-500' : 'file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100'
                    }`}
                  />
                  {selectedFile && (
                    <p className="text-xs text-gray-500 mt-1">
                      File dipilih: {selectedFile.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    TTL (Tempat, Tanggal Lahir) *
                    {formErrors.ttl && <span className="text-red-500 text-xs ml-1">{formErrors.ttl}</span>}
                  </label>
                  <input
                    type="text"
                    name="ttl"
                    value={formData.ttl}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:border-indigo-500 focus:outline-none ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                    } ${formErrors.ttl ? 'border-red-500' : ''}`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Alamat</label>
                  <textarea
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:border-indigo-500 focus:outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    No HP
                    {formErrors.no_hp && <span className="text-red-500 text-xs ml-1">{formErrors.no_hp}</span>}
                  </label>
                  <input
                    type="text"
                    name="no_hp"
                    value={formData.no_hp}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:border-indigo-500 focus:outline-none ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                    } ${formErrors.no_hp ? 'border-red-500' : ''}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>No Induk</label>
                  <input
                    type="text"
                    name="no_induk"
                    value={formData.no_induk}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:border-indigo-500 focus:outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Pendidikan Terakhir</label>
                  <input
                    type="text"
                    name="pendidikan"
                    value={formData.pendidikan}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:border-indigo-500 focus:outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Jenis Kelamin</label>
                  <select
                    name="jenis_kelamin"
                    value={formData.jenis_kelamin}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:border-indigo-500 focus:outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Kondisi Fisik</label>
                  <input
                    type="text"
                    name="fisik"
                    value={formData.fisik}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:border-indigo-500 focus:outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>TB/BB</label>
                  <input
                    type="text"
                    name="tb_bb"
                    value={formData.tb_bb}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:border-indigo-500 focus:outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Kejuruan</label>
                  <input
                    type="text"
                    name="kejuruan"
                    value={formData.kejuruan}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:border-indigo-500 focus:outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tahun Masuk
                    {formErrors.tahun_masuk && <span className="text-red-500 text-xs ml-1">{formErrors.tahun_masuk}</span>}
                  </label>
                  <input
                    type="number"
                    name="tahun_masuk"
                    value={formData.tahun_masuk}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:border-indigo-500 focus:outline-none ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                    } ${formErrors.tahun_masuk ? 'border-red-500' : ''}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:border-indigo-500 focus:outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                    <option value="Lulus">Lulus</option>
                    <option value="Mengundurkan Diri">Mengundurkan Diri</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    NIK
                    {formErrors.nik && <span className="text-red-500 text-xs ml-1">{formErrors.nik}</span>}
                  </label>
                  <input
                    type="text"
                    name="nik"
                    value={formData.nik}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:border-indigo-500 focus:outline-none ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                    } ${formErrors.nik ? 'border-red-500' : ''}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email
                    {formErrors.email && <span className="text-red-500 text-xs ml-1">{formErrors.email}</span>}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:border-indigo-500 focus:outline-none ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                    } ${formErrors.email ? 'border-red-500' : ''}`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Keterangan</label>
                  <textarea
                    name="keterangan"
                    value={formData.keterangan}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:border-indigo-500 focus:outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center gap-3 mt-8 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                <div>
                  {editingStudent && (
                    <button
                      type="button"
                      onClick={() => handleDelete(editingStudent.id)}
                      disabled={submitLoading}
                      className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Hapus Siswa
                    </button>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setIsModalOpen(false); resetForm(); }}
                    disabled={submitLoading}
                    className={`px-6 py-3 border-2 rounded-xl font-semibold transition disabled:opacity-50 ${
                      darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitLoading}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitLoading ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
                    {submitLoading ? 'Menyimpan...' : (editingStudent ? 'Update Data' : 'Simpan Data')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
