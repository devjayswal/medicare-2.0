// Check database state
require('dotenv').config();
const { MongoClient } = require('mongodb');

const connectionString = process.env.MONGODB_CONNECTION_STRING || "mongodb://localhost:27017";
const databaseName = process.env.MONGODB_DATABASE_NAME || "EastencherDB";

async function checkDatabase() {
  const client = new MongoClient(connectionString);

  try {
    console.log("🔗 Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected to MongoDB\n");

    const db = client.db(databaseName);

    // Check doctors
    const doctorsCount = await db.collection('Doctors').countDocuments();
    console.log(`📋 Doctors: ${doctorsCount}`);
    if (doctorsCount > 0) {
      const doctors = await db.collection('Doctors').find({}).toArray();
      doctors.forEach(doc => {
        console.log(`   - ${doc.fullName} (${doc.specialty})`);
      });
    }
    console.log();

    // Check doctor availability
    const availabilityCount = await db.collection('DoctorAvailability').countDocuments();
    console.log(`📋 Doctor Availability: ${availabilityCount}`);
    console.log();

    // Check patients
    const patientsCount = await db.collection('Patients').countDocuments();
    console.log(`📋 Patients: ${patientsCount}`);
    if (patientsCount > 0) {
      const patients = await db.collection('Patients').find({}).project({ fullName: 1, mobile: 1, role: 1, email: 1 }).toArray();
      patients.forEach(p => {
        console.log(`   - ${p.fullName} (${p.role}) - ${p.mobile || p.email}`);
      });
    }
    console.log();

    // Check appointments
    const appointmentsCount = await db.collection('Appointments').countDocuments();
    console.log(`📋 Appointments: ${appointmentsCount}`);
    if (appointmentsCount > 0) {
      const appointments = await db.collection('Appointments').find({}).toArray();
      appointments.forEach(apt => {
        console.log(`   - ${apt.appointmentAt} - Status: ${apt.status}`);
      });
    }
    console.log();

    // Recommendations
    console.log("💡 Recommendations:");
    if (doctorsCount === 0) {
      console.log("   ⚠️  No doctors found! Run: node seed-node.js");
    }
    if (patientsCount === 0) {
      console.log("   ⚠️  No patients found! Run: node seed-node.js");
    } else {
      console.log("   ✅ Database has data. You can:");
      console.log("      1. Test booking with existing patient: 8888888888 / patient123");
      console.log("      2. Or clear and re-seed: node clear-patients.js && node seed-node.js");
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

checkDatabase();
