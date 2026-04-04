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

// GET /api/recipes/by-title/[title] - Get recipe by title
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { title } = await params;
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get("populate");

    let query = Recipe.findOne({
      title: { $regex: `^${decodeURIComponent(title)}$`, $options: "i" },
    });

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
