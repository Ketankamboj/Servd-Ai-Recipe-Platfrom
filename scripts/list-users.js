/**
 * Script to list all users in the database
 * 
 * Usage: node scripts/list-users.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.User || mongoose.model("User", userSchema);

async function listUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB\n");

    const users = await User.find({});
    
    if (users.length === 0) {
      console.log("No users found in the database.");
    } else {
      console.log(`Found ${users.length} user(s):\n`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email || 'No email'}`);
        console.log(`   ClerkID: ${user.clerkId || 'None'}`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Created: ${user.createdAt || 'Unknown'}`);
        console.log("");
      });
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

listUsers();
