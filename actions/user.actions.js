"use server";

import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongodb";
import { User, Recipe, PantryItem, SavedRecipe } from "@/lib/db/models";

/**
 * Delete the current user's account from both Clerk and MongoDB
 * This ensures data is synced without needing webhooks
 */
export async function deleteUserAccount() {
  try {
    const user = await currentUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const clerkId = user.id;
    const userEmail = user.emailAddresses[0]?.emailAddress;

    console.log(`🗑️ Deleting account for user: ${userEmail} (${clerkId})`);

    // Step 1: Delete from MongoDB first
    await connectDB();
    
    const dbUser = await User.findOne({ clerkId });
    
    if (dbUser) {
      // Delete all related data
      const deleteResults = await Promise.all([
        PantryItem.deleteMany({ owner: dbUser._id }),
        SavedRecipe.deleteMany({ user: dbUser._id }),
        Recipe.deleteMany({ author: dbUser._id }),
      ]);

      // Delete the user
      await User.findByIdAndDelete(dbUser._id);

      console.log(`✅ MongoDB data deleted:`, {
        pantryItems: deleteResults[0].deletedCount,
        savedRecipes: deleteResults[1].deletedCount,
        recipes: deleteResults[2].deletedCount,
      });
    } else {
      console.log(`ℹ️ User not found in MongoDB, skipping database cleanup`);
    }

    // Step 2: Delete from Clerk
    const clerk = await clerkClient();
    await clerk.users.deleteUser(clerkId);
    
    console.log(`✅ User deleted from Clerk: ${clerkId}`);

    return {
      success: true,
      message: "Account deleted successfully",
    };
  } catch (error) {
    console.error("❌ Error deleting user account:", error);
    throw new Error(error.message || "Failed to delete account");
  }
}

/**
 * Get current user's data summary (for showing before deletion)
 */
export async function getUserDataSummary() {
  try {
    const user = await currentUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    await connectDB();
    
    const dbUser = await User.findOne({ clerkId: user.id });
    
    if (!dbUser) {
      return {
        success: true,
        data: {
          pantryItems: 0,
          savedRecipes: 0,
          recipes: 0,
        },
      };
    }

    const [pantryCount, savedRecipeCount, recipeCount] = await Promise.all([
      PantryItem.countDocuments({ owner: dbUser._id }),
      SavedRecipe.countDocuments({ user: dbUser._id }),
      Recipe.countDocuments({ author: dbUser._id }),
    ]);

    return {
      success: true,
      data: {
        pantryItems: pantryCount,
        savedRecipes: savedRecipeCount,
        recipes: recipeCount,
      },
    };
  } catch (error) {
    console.error("Error getting user data summary:", error);
    throw new Error(error.message || "Failed to get data summary");
  }
}
