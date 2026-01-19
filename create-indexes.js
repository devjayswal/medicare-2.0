// MongoDB Performance Optimization Script
// Creates indexes for faster queries
// Run with: node create-indexes.js

require('dotenv').config();
const { MongoClient } = require('mongodb');

const connectionString = process.env.MONGODB_CONNECTION_STRING || "mongodb://localhost:27017";
const databaseName = process.env.MONGODB_DATABASE_NAME || "EastencherDB";

async function createIndexes() {
  const client = new MongoClient(connectionString);

  try {
    console.log("🔗 Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected to MongoDB\n");

    const db = client.db(databaseName);

    console.log("📝 Creating indexes for Patients collection...");
    await db.collection('Patients').createIndexes([
      { key: { email: 1 }, unique: true, sparse: true },
      { key: { mobile: 1 }, unique: true },
      { key: { patientCode: 1 }, unique: true },
      { key: { role: 1 } }
    ]);
    console.log("✅ Patients indexes created\n");

    console.log("📝 Creating indexes for Doctors collection...");
    await db.collection('Doctors').createIndexes([
      { key: { specialty: 1 } },
      { key: { fullName: 1 } }
    ]);
    console.log("✅ Doctors indexes created\n");

    console.log("📝 Creating indexes for Appointments collection...");
    await db.collection('Appointments').createIndexes([
      { key: { patientId: 1 } },
      { key: { doctorId: 1 } },
      { key: { appointmentDate: 1 } },
      { key: { status: 1 } },
      { key: { doctorId: 1, appointmentDate: 1, timeSlot: 1 } }
    ]);
    console.log("✅ Appointments indexes created\n");

    console.log("📝 Creating indexes for DoctorAvailability collection...");
    await db.collection('DoctorAvailability').createIndexes([
      { key: { doctorId: 1 } },
      { key: { dayOfWeek: 1 } },
      { key: { doctorId: 1, dayOfWeek: 1 } }
    ]);
    console.log("✅ DoctorAvailability indexes created\n");

    console.log("🎉 All indexes created successfully!\n");
    console.log("📊 Performance improvements:");
    console.log("   - Faster patient lookups by email/mobile");
    console.log("   - Faster appointment queries by date/doctor");
    console.log("   - Optimized doctor availability checks");
    console.log("   - Reduced query response times\n");

  } catch (error) {
    console.error("❌ Error creating indexes:", error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log("🔌 Disconnected from MongoDB");
  }
}

createIndexes();
