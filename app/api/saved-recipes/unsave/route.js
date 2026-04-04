import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { SavedRecipe, User } from "@/lib/db/models";

// POST /api/saved-recipes/unsave - Unsave recipe by user and recipe
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { clerkId, recipeId } = body;

    if (!clerkId || !recipeId) {
      return NextResponse.json(
        { error: { message: "clerkId and recipeId are required" } },
        { status: 400 }
      );
    }

    const userDoc = await User.findOne({ clerkId });
    if (!userDoc) {
      return NextResponse.json(
        { error: { message: "User not found" } },
        { status: 400 }
      );
    }

    const savedRecipe = await SavedRecipe.findOneAndDelete({
      user: userDoc._id,
      recipe: recipeId,
    });

    if (!savedRecipe) {
      return NextResponse.json(
        { error: { message: "Saved recipe not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { id: savedRecipe._id } });
  } catch (error) {
    return NextResponse.json(
      { error: { message: error.message } },
      { status: 500 }
    );
  }
}
