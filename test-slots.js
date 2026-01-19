require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const http = require('http');

const connectionString = process.env.MONGODB_CONNECTION_STRING || "mongodb://localhost:27017";
const databaseName = process.env.MONGODB_DATABASE_NAME || "EastencherDB";

async function test() {
  const client = new MongoClient(connectionString);

  try {
    await client.connect();
    const db = client.db(databaseName);

    // Get first doctor
    const doctor = await db.collection('Doctors').findOne({});
    console.log('Doctor:', doctor);
    
    if (!doctor) {
      console.log('No doctors found');
      return;
    }

    const doctorId = doctor._id.toString();
    console.log('Doctor ID:', doctorId);

    // Get availability for this doctor
    const availabilities = await db.collection('DoctorAvailability')
      .find({ doctorId: new ObjectId(doctorId) })
      .toArray();
    
    console.log('Availabilities found:', availabilities.length);
    if (availabilities.length > 0) {
      console.log('First availability:', availabilities[0]);
    }

    // Test the API
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    const dayOfWeek = tomorrow.getDay();
    
    console.log('\n🧪 Testing API:');
    console.log('Date:', dateStr);
    console.log('Day of week:', dayOfWeek);

    const url = `http://localhost:5007/api/doctors/${doctorId}/slots?date=${dateStr}`;
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
