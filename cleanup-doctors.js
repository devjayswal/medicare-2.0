// Clean up duplicate doctors and availability
require('dotenv').config();
const { MongoClient } = require('mongodb');

const connectionString = process.env.MONGODB_CONNECTION_STRING || "mongodb://localhost:27017";
const databaseName = process.env.MONGODB_DATABASE_NAME || "EastencherDB";

async function cleanupDuplicates() {
  const client = new MongoClient(connectionString);

  try {
    console.log("🔗 Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected to MongoDB\n");

    const db = client.db(databaseName);

    // Delete all doctors and availability
    console.log("🗑️  Removing all doctors...");
    const doctorsResult = await db.collection('Doctors').deleteMany({});
    console.log(`✅ Deleted ${doctorsResult.deletedCount} doctors\n`);

    console.log("🗑️  Removing all doctor availability...");
    const availResult = await db.collection('DoctorAvailability').deleteMany({});
    console.log(`✅ Deleted ${availResult.deletedCount} availability records\n`);

    console.log("📌 Now run: node seed-node.js");
    console.log("   This will create doctors and availability with no duplicates.\n");

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log("🔌 Disconnected from MongoDB");
  }
}

cleanupDuplicates();
