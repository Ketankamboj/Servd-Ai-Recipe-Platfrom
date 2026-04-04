import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongodb";
import { User, Recipe, PantryItem, SavedRecipe } from "@/lib/db/models";

// POST /api/admin/cleanup-users - Find and remove orphaned users (exist in DB but not in Clerk)
export async function POST(request) {
  try {
    // Optional: Add admin authentication here
    // const { userId } = await auth();
    // if (!isAdmin(userId)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    // Get all users from our database
    const dbUsers = await User.find({}, { clerkId: 1, email: 1, _id: 1 });
    
    const orphanedUsers = [];
    const clerk = await clerkClient();

    // Check each user against Clerk
    for (const dbUser of dbUsers) {
      try {
        await clerk.users.getUser(dbUser.clerkId);
        // User exists in Clerk, skip
      } catch (error) {
        if (error.status === 404 || error.clerkError) {
          // User doesn't exist in Clerk - it's orphaned
          orphanedUsers.push(dbUser);
        }
      }
    }

    // Delete orphaned users and their related data
    const deletedUsers = [];
    for (const orphan of orphanedUsers) {
      const deleteResults = await Promise.all([
        PantryItem.deleteMany({ owner: orphan._id }),
        SavedRecipe.deleteMany({ user: orphan._id }),
        Recipe.deleteMany({ author: orphan._id }),
      ]);

      await User.findByIdAndDelete(orphan._id);

      deletedUsers.push({
        clerkId: orphan.clerkId,
        email: orphan.email,
        deletedData: {
          pantryItems: deleteResults[0].deletedCount,
          savedRecipes: deleteResults[1].deletedCount,
          recipes: deleteResults[2].deletedCount,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedUsers.length} orphaned user(s)`,
      deletedUsers,
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { error: { message: error.message } },
      { status: 500 }
    );
  }
}

// GET /api/admin/cleanup-users - Preview orphaned users without deleting
export async function GET(request) {
  try {
    await connectDB();

    const dbUsers = await User.find({}, { clerkId: 1, email: 1, username: 1, _id: 1 });
    
    const orphanedUsers = [];
    const clerk = await clerkClient();

    for (const dbUser of dbUsers) {
      try {
        await clerk.users.getUser(dbUser.clerkId);
      } catch (error) {
        if (error.status === 404 || error.clerkError) {
          orphanedUsers.push({
            _id: dbUser._id,
            clerkId: dbUser.clerkId,
            email: dbUser.email,
            username: dbUser.username,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      orphanedCount: orphanedUsers.length,
      orphanedUsers,
      message: orphanedUsers.length > 0 
        ? `Found ${orphanedUsers.length} orphaned user(s). Use POST to delete them.`
        : "No orphaned users found.",
    });
  } catch (error) {
    console.error("Preview error:", error);
    return NextResponse.json(
      { error: { message: error.message } },
      { status: 500 }
    );
  }
}
