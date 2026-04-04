/**
 * Script to manually delete a user and all related data from MongoDB
 * 
 * Usage:
 *   node scripts/delete-user.js <email>
 * 
 * Example:
 *   node scripts/delete-user.js ketankamboj1980@gmail.com
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI is not set in .env.local");
  process.exit(1);
}

// Define schemas (minimal versions for deletion)
const userSchema = new mongoose.Schema({
  clerkId: String,
  email: String,
});

const pantryItemSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const savedRecipeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const recipeSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
const PantryItem = mongoose.models.PantryItem || mongoose.model("PantryItem", pantryItemSchema);
const SavedRecipe = mongoose.models.SavedRecipe || mongoose.model("SavedRecipe", savedRecipeSchema);
const Recipe = mongoose.models.Recipe || mongoose.model("Recipe", recipeSchema);

async function deleteUser(email) {
  try {
    console.log(`\nConnecting to MongoDB...`);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB\n");

    // Find the user
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`User with email "${email}" not found in database.`);
      console.log("\nExisting users:");
      const allUsers = await User.find({}, { email: 1, clerkId: 1 });
      allUsers.forEach((u) => console.log(`  - ${u.email} (${u.clerkId})`));
      return;
    }

    console.log(`Found user: ${user.email} (ID: ${user._id}, ClerkID: ${user.clerkId})`);
    console.log("\nDeleting related data...");

    // Delete related data
    const pantryResult = await PantryItem.deleteMany({ owner: user._id });
    console.log(`  - Deleted ${pantryResult.deletedCount} pantry items`);

    const savedRecipeResult = await SavedRecipe.deleteMany({ user: user._id });
    console.log(`  - Deleted ${savedRecipeResult.deletedCount} saved recipes`);

    const recipeResult = await Recipe.deleteMany({ author: user._id });
    console.log(`  - Deleted ${recipeResult.deletedCount} recipes`);

    // Delete the user
    await User.findByIdAndDelete(user._id);
    console.log(`  - Deleted user account`);

    console.log(`\nUser "${email}" and all related data deleted successfully!`);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log("Usage: node scripts/delete-user.js <email>");
  console.log("Example: node scripts/delete-user.js ketankamboj1980@gmail.com");
  process.exit(1);
}

deleteUser(email);
