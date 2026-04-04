import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { SavedRecipe, User } from "@/lib/db/models";

// GET /api/saved-recipes/check - Check if recipe is saved by user
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get("clerkId");
    const recipeId = searchParams.get("recipeId");

    if (!clerkId || !recipeId) {
      return NextResponse.json(
        { error: { message: "clerkId and recipeId are required" } },
        { status: 400 }
      );
    }

    const userDoc = await User.findOne({ clerkId });
    if (!userDoc) {
      return NextResponse.json({ data: null, saved: false });
    }

    const savedRecipe = await SavedRecipe.findOne({
      user: userDoc._id,
      recipe: recipeId,
    });

    return NextResponse.json({
      data: savedRecipe,
      saved: !!savedRecipe,
    });
  } catch (error) {
    return NextResponse.json(
      { error: { message: error.message } },
      { status: 500 }
    );
  }
}
