/**
 * Script to check database collections and indexes
 * 
 * Usage: node scripts/check-db.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

async function checkDatabase() {
  try {
    console.log(`Connecting to: ${MONGODB_URI}\n`);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB\n");

    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log("Collections in database:");
    
    for (const collection of collections) {
      const coll = db.collection(collection.name);
      const count = await coll.countDocuments();
      const indexes = await coll.indexes();
      
      console.log(`\n  ${collection.name}: ${count} documents`);
      console.log(`    Indexes:`);
      indexes.forEach(idx => {
        console.log(`      - ${idx.name}: ${JSON.stringify(idx.key)}${idx.unique ? ' (unique)' : ''}`);
      });
      
      // Show sample document if any exist
      if (count > 0) {
        const sample = await coll.findOne();
        console.log(`    Sample document keys: ${Object.keys(sample).join(', ')}`);
      }
    }

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

checkDatabase();
