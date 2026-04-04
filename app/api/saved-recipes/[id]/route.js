import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { SavedRecipe } from "@/lib/db/models";

// Helper to build populate options
const getPopulateOptions = (populate) => {
  if (!populate) return [];

  const populateFields = populate.split(",");
  return populateFields.map((field) => {
    if (field === "user") {
      return {
        path: "user",
        select: "firstName lastName email imageUrl clerkId",
      };
    }
    if (field === "recipe") {
      return { path: "recipe" };
    }
    return field;
  });
};

// GET /api/saved-recipes/[id] - Get single saved recipe
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get("populate");

    let query = SavedRecipe.findById(id);

    const populateOptions = getPopulateOptions(populate);
    populateOptions.forEach((opt) => {
      query = query.populate(opt);
    });

    const savedRecipe = await query;

    if (!savedRecipe) {
      return NextResponse.json(
        { error: { message: "Saved recipe not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: savedRecipe });
  } catch (error) {
    return NextResponse.json(
      { error: { message: error.message } },
      { status: 500 }
    );
  }
}

// DELETE /api/saved-recipes/[id] - Delete saved recipe
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const savedRecipe = await SavedRecipe.findByIdAndDelete(id);

    if (!savedRecipe) {
      return NextResponse.json(
        { error: { message: "Saved recipe not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { id } });
  } catch (error) {
    return NextResponse.json(
      { error: { message: error.message } },
      { status: 500 }
    );
  }
}
