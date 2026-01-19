// MongoDB Seed Script for Eastencher (Node.js version)
// Run with: node seed-node.js

require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const connectionString = process.env.MONGODB_CONNECTION_STRING || "mongodb://localhost:27017";
const databaseName = process.env.MONGODB_DATABASE_NAME || "EastencherDB";

async function seedDatabase() {
  const client = new MongoClient(connectionString);

  try {
    console.log("🔗 Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected to MongoDB\n");

    const db = client.db(databaseName);

    // Create Doctors
    const doctor1Id = new ObjectId();
    const doctor2Id = new ObjectId();

    console.log("📝 Creating doctors...");
    await db.collection('Doctors').insertMany([
      {
        _id: doctor1Id,
        fullName: "Dr. Amit Sharma",
        specialty: "Cardiology"
      },
      {
        _id: doctor2Id,
        fullName: "Dr. Neha Verma",
        specialty: "Dermatology"
      }
    ]);
    console.log("✅ Doctors created successfully\n");

    // Create Doctor Availability
    console.log("📝 Creating doctor availability...");
    
    // Define time slots: Morning (9-12), Noon (12-15), Evening (15-18), Night (18-21)
    const timeSlots = [
      { name: "Morning", startTime: "09:00", endTime: "12:00" },
      { name: "Noon", startTime: "12:00", endTime: "15:00" },
      { name: "Evening", startTime: "15:00", endTime: "18:00" },
      { name: "Night", startTime: "18:00", endTime: "21:00" }
    ];

    const availabilityRecords = [];

    // Create availability for both doctors on all days (0-6 = Sunday to Saturday)
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      for (const slot of timeSlots) {
        // Doctor 1
        availabilityRecords.push({
          doctorId: doctor1Id,
          dayOfWeek: dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime
        });
        
        // Doctor 2
        availabilityRecords.push({
          doctorId: doctor2Id,
          dayOfWeek: dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime
        });
      }
    }

    await db.collection('DoctorAvailability').insertMany(availabilityRecords);
    console.log(`✅ Doctor availability created successfully (${availabilityRecords.length} slots)\n`);

    // Create Admin Account
    // Password: Admin@12345 (BCrypt hashed)
    console.log("📝 Creating admin account...");
    await db.collection('Patients').insertOne({
      patientCode: "ADMIN001",
      fullName: "Admin User",
      mobile: "9999999999",
      email: "admin@eastencher.com",
      gender: "Other",
      dateOfBirth: new Date("1990-01-01"),
      address: "Hospital Main Office",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      // BCrypt hash for "Admin@12345"
      password: "$2b$10$ZSn1.6IJ61pbXwyPg7jbK.7m/AzMM3UAEwctuk6Wd2KvpE5FRKyee",
      role: "ADMIN",
      createdDate: new Date(),
      modifiedDate: new Date()
    });
    console.log("✅ Admin account created successfully");
    console.log("   Email: admin@eastencher.com");
    console.log("   Password: Admin@12345\n");

    // Create Test Patient Account
    // Password: patient123 (BCrypt hashed)
    console.log("📝 Creating test patient account...");
    await db.collection('Patients').insertOne({
      patientCode: "PAT001",
      fullName: "Test Patient",
      mobile: "8888888888",
      email: "patient@test.com",
      gender: "Male",
      dateOfBirth: new Date("1995-06-15"),
      address: "123 Test Street, Andheri",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400058",
      // BCrypt hash for "patient123"
      password: "$2b$10$15QOcSgGWI.brtF2r/4d0u1cGhiB0PZOGYVG3XLU.i21AywmcQ2MS",
      role: "PATIENT",
      createdDate: new Date(),
      modifiedDate: new Date()
    });
    console.log("✅ Test patient account created successfully");
    console.log("   Mobile: 8888888888");
    console.log("   Password: patient123\n");

    console.log("🎉 Database seeded successfully!\n");
    console.log("📋 Summary:");
    console.log("   - 2 Doctors added");
    console.log("   - 2 Doctor availability schedules added");
    console.log("   - 1 Admin account created");
    console.log("   - 1 Test patient account created\n");
    console.log("📌 Next Steps:");
    console.log("   1. Backend is running on http://localhost:5007");
    console.log("   2. Frontend is running on http://localhost:4200");
    console.log("   3. Login as admin: admin@eastencher.com / Admin@12345");
    console.log("   4. Login as patient: 8888888888 / patient123");

  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

seedDatabase();
