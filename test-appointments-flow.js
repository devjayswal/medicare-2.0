require('dotenv').config();
const http = require('http');

const API_URL = 'http://localhost:5007/api';

async function testAppointmentsFlow() {
  try {
    // Step 1: Login as patient
    console.log('🔓 Step 1: Logging in as patient...');
    const loginData = JSON.stringify({
      mobile: '8888888888',
      password: 'patient123'
    });

    const loginRes = await new Promise((resolve, reject) => {
      const req = http.request(`${API_URL}/patients/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(loginData)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data), headers: res.headers });
          } catch {
            resolve({ status: res.statusCode, body: data, headers: res.headers });
          }
        });
      });
      req.on('error', reject);
      req.write(loginData);
      req.end();
    });

    console.log('Login Status:', loginRes.status);
    console.log('Login Response:', JSON.stringify(loginRes.body, null, 2));

    if (loginRes.status !== 200) {
      console.error('❌ Login failed');
      return;
    }

    const token = loginRes.body.token;
    const patientId = loginRes.body.patient.id || loginRes.body.patient._id;
    console.log('✅ Login successful');
    console.log('   Patient object keys:', Object.keys(loginRes.body.patient));
    console.log('   Patient ID:', patientId);
    console.log('   Token:', token.substring(0, 50) + '...');

    // Step 2: Fetch patient appointments using token
    console.log('\n📋 Step 2: Fetching appointments...');
    const appointmentsRes = await new Promise((resolve, reject) => {
      const req = http.request(`${API_URL}/patients/${patientId}/appointments`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, body: data });
          }
        });
      });
      req.on('error', reject);
      req.end();
    });

    console.log('Appointments Status:', appointmentsRes.status);
    console.log('Appointments Response:', JSON.stringify(appointmentsRes.body, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  }

  process.exit(0);
}

testAppointmentsFlow();
