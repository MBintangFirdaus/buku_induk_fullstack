-- Buat Database
CREATE DATABASE IF NOT EXISTS buku_induk_blk;
USE buku_induk_blk;

-- Tabel Users (Pegawai BLK)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nama_lengkap VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role ENUM('admin', 'pegawai') DEFAULT 'pegawai',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Students (Siswa)
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama VARCHAR(100) NOT NULL,
    ttl VARCHAR(100),
    jenis_kelamin ENUM('Laki-laki', 'Perempuan') DEFAULT 'Laki-laki',
    alamat TEXT,
    pendidikan VARCHAR(50),
    jurusan VARCHAR(100),
    tahun_masuk INT,
    status ENUM('Aktif', 'Lulus', 'Tidak Aktif') DEFAULT 'Aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Insert Default Admin User (password: admin123)
INSERT INTO users (username, password, nama_lengkap, email, role) 
VALUES ('admin', '$2b$10$YourHashedPasswordHere', 'Administrator', 'admin@blk.go.id', 'admin');

-- Insert Sample Pegawai (password: pegawai123)
INSERT INTO users (username, password, nama_lengkap, email, role) 
VALUES ('pegawai1', '$2b$10$YourHashedPasswordHere', 'Pegawai BLK 1', 'pegawai1@blk.go.id', 'pegawai');