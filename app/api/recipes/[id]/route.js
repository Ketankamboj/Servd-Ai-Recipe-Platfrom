import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { Recipe } from "@/lib/db/models";

// Helper to build populate options
const getPopulateOptions = (populate) => {
  if (!populate) return [];

  const populateFields = populate.split(",");
  return populateFields.map((field) => {
    if (field === "author") {
      return {
        path: "author",
        select: "firstName lastName email imageUrl clerkId",
      };
    }
    return field;
  });
};

// GET /api/recipes/[id] - Get single recipe
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get("populate");

    let query = Recipe.findById(id);

    const populateOptions = getPopulateOptions(populate);
    populateOptions.forEach((opt) => {
      query = query.populate(opt);
    });

    const recipe = await query;

    if (!recipe) {
      return NextResponse.json(
        { error: { message: "Recipe not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: recipe });
  } catch (error) {
    return NextResponse.json(
      { error: { message: error.message } },
      { status: 500 }
    );
  }
}

// PUT /api/recipes/[id] - Update recipe
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    const recipe = await Recipe.findByIdAndUpdate(id, body, {
      returnDocument: 'after',
      runValidators: true,
    }).populate("author", "firstName lastName email imageUrl clerkId");

    if (!recipe) {
      return NextResponse.json(
        { error: { message: "Recipe not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: recipe });
  } catch (error) {
    return NextResponse.json(
      { error: { message: error.message } },
      { status: 400 }
    );
  }
}

// DELETE /api/recipes/[id] - Delete recipe
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const recipe = await Recipe.findByIdAndDelete(id);

    if (!recipe) {
      return NextResponse.json(
        { error: { message: "Recipe not found" } },
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
