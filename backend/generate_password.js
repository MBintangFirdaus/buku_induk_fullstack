const bcrypt = require('bcrypt');

async function generatePassword() {
  const adminHash = await bcrypt.hash('admin123', 10);
  const pegawaiHash = await bcrypt.hash('pegawai123', 10);
  
  console.log('=== COPY HASH INI ===\n');
  console.log('Admin hash:');
  console.log(adminHash);
  console.log('\nPegawai hash:');
  console.log(pegawaiHash);
  console.log('\n=== UPDATE DI DATABASE ===');
  console.log(`UPDATE users SET password = '${adminHash}' WHERE username = 'admin';`);
  console.log(`UPDATE users SET password = '${pegawaiHash}' WHERE username = 'pegawai1';`);
}

generatePassword();