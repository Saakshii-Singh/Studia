const mongoose = require("mongoose");
require("dotenv").config();

async function clearDB() {
  try {
    if (!process.env.MONGO_URI) {
      console.error("Error: MONGO_URI is not defined in your server's .env file.");
      process.exit(1);
    }

    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Successfully connected!");

    console.log("Wiping all collections from the database...");
    await mongoose.connection.db.dropDatabase();
    
    console.log("✨ DATABASE CLEANED SUCCESSFULLY!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error dropping database:", error.message);
    process.exit(1);
  }
}

clearDB();
