import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { User, Recipe, PantryItem, SavedRecipe } from "@/lib/db/models";

// GET /api/users/clerk/[clerkId] - Get user by Clerk ID
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { clerkId } = await params;
    const user = await User.findOne({ clerkId });

    if (!user) {
      return NextResponse.json(
        { error: { message: "User not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    return NextResponse.json(
      { error: { message: error.message } },
      { status: 500 }
    );
  }
}

// DELETE /api/users/clerk/[clerkId] - Delete user by Clerk ID (for webhooks)
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { clerkId } = await params;
    const user = await User.findOne({ clerkId });

    if (!user) {
      return NextResponse.json(
        { error: { message: "User not found" } },
        { status: 404 }
      );
    }

    // Cascade delete all related data
    const deleteResults = await Promise.all([
      PantryItem.deleteMany({ owner: user._id }),
      SavedRecipe.deleteMany({ user: user._id }),
      Recipe.deleteMany({ author: user._id }),
    ]);

    console.log(`Deleted related data for user ${user._id}:`, {
      pantryItems: deleteResults[0].deletedCount,
      savedRecipes: deleteResults[1].deletedCount,
      recipes: deleteResults[2].deletedCount,
    });

    // Delete the user
    await User.findByIdAndDelete(user._id);

    console.log(`User ${user.clerkId} deleted successfully`);

    return NextResponse.json({
      data: {
        id: user._id,
        clerkId,
        message: "User and all related data deleted",
        deleted: {
          pantryItems: deleteResults[0].deletedCount,
          savedRecipes: deleteResults[1].deletedCount,
          recipes: deleteResults[2].deletedCount,
        },
      },
    });
  } catch (error) {
    console.error("Error deleting user by clerkId:", error);
    return NextResponse.json(
      { error: { message: error.message } },
      { status: 500 }
    );
  }
}
