// Generate proper BCrypt hashes for seed data
const bcrypt = require('bcryptjs');

async function generateHashes() {
    console.log('Generating BCrypt hashes...\n');
    
    // Admin password: Admin@12345
    const adminHash = await bcrypt.hash('Admin@12345', 10);
    console.log('Admin Password: Admin@12345');
    console.log('Admin Hash:', adminHash);
    console.log('');
    
    // Patient password: patient123
    const patientHash = await bcrypt.hash('patient123', 10);
    console.log('Patient Password: patient123');
    console.log('Patient Hash:', patientHash);
    console.log('');
    
    console.log('✅ Hashes generated successfully!');
    console.log('\nUpdate seed-node.js with these hashes.');
}

generateHashes();
