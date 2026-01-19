// Clear existing patients and re-seed with correct hashes
require('dotenv').config();
const { MongoClient } = require('mongodb');

const connectionString = process.env.MONGODB_CONNECTION_STRING || "mongodb://localhost:27017";
const databaseName = process.env.MONGODB_DATABASE_NAME || "EastencherDB";

async function clearAndReseed() {
  const client = new MongoClient(connectionString);

  try {
    console.log("🔗 Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected to MongoDB\n");

    const db = client.db(databaseName);

    // Delete existing patients
    console.log("🗑️  Deleting existing patients...");
    const deleteResult = await db.collection('Patients').deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} patients\n`);

    // Delete existing doctor availability
    console.log("🗑️  Deleting existing doctor availability...");
    const availResult = await db.collection('DoctorAvailability').deleteMany({});
    console.log(`✅ Deleted ${availResult.deletedCount} availability records\n`);

    // Delete existing appointments
    console.log("🗑️  Deleting existing appointments...");
    const apptResult = await db.collection('Appointments').deleteMany({});
    console.log(`✅ Deleted ${apptResult.deletedCount} appointments\n`);

    console.log("📌 Now run: node seed-node.js");
    console.log("   This will create new data with correct password hashes.\n");

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log("🔌 Disconnected from MongoDB");
  }
}

clearAndReseed();
