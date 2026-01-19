require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const http = require('http');
const https = require('https');

const connectionString = process.env.MONGODB_CONNECTION_STRING || "mongodb://localhost:27017";
const databaseName = process.env.MONGODB_DATABASE_NAME || "EastencherDB";

async function test() {
  const client = new MongoClient(connectionString);

  try {
    await client.connect();
    const db = client.db(databaseName);

    // Get first patient
    const patient = await db.collection('Patients').findOne({});
    console.log('Patient:', patient);
    
    if (!patient) {
      console.log('No patients found');
      return;
    }

    const patientId = patient._id.toString();
    console.log('Patient ID:', patientId);

    // Get appointments for this patient
    const appointments = await db.collection('Appointments')
      .find({ patientId: new ObjectId(patientId) })
      .toArray();
    
    console.log('Appointments found:', appointments.length);
    appointments.forEach(a => {
      console.log('  -', a.doctorId.toString(), a.appointmentAt, a.status);
    });

    // Test the API
    console.log('\n🧪 Testing API:');
    const url = `http://localhost:5007/api/patients/${patientId}/appointments`;
    console.log('URL:', url);

    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
        process.exit(0);
      });
    }).on('error', (e) => {
      console.error('Error:', e.message);
      process.exit(1);
    });

  } catch(e) {
    console.error('Error:', e);
    process.exit(1);
  }
}

test();
