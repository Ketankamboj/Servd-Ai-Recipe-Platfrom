import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { Recipe, User } from "@/lib/db/models";

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

// GET /api/recipes - Get all recipes
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 25;
    const sort = searchParams.get("sort") || "-createdAt";
    const populate = searchParams.get("populate");
    const title = searchParams.get("title");
    const cuisine = searchParams.get("cuisine");
    const category = searchParams.get("category");
    const isPublic = searchParams.get("isPublic");
    const author = searchParams.get("author");

    // Build filter
    const filter = {};
    if (title) filter.title = { $regex: title, $options: "i" };
    if (cuisine) filter.cuisine = cuisine;
    if (category) filter.category = category;
    if (isPublic !== null && isPublic !== undefined)
      filter.isPublic = isPublic === "true";
    if (author) filter.author = author;

    let query = Recipe.find(filter)
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit);

    // Apply population
    const populateOptions = getPopulateOptions(populate);
    populateOptions.forEach((opt) => {
      query = query.populate(opt);
    });

    const recipes = await query;
    const total = await Recipe.countDocuments(filter);

    return NextResponse.json({
      data: recipes,
      meta: {
        pagination: {
          page,
          pageSize: limit,
          pageCount: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: { message: error.message } },
      { status: 500 }
    );
  }
}

// POST /api/recipes - Create recipe
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const recipeData = { ...body };

    // If author is provided as clerkId, find the user
    if (
      recipeData.author &&
      typeof recipeData.author === "string" &&
      !recipeData.author.match(/^[0-9a-fA-F]{24}$/)
    ) {
      const user = await User.findOne({ clerkId: recipeData.author });
      if (user) {
        recipeData.author = user._id;
      } else {
        recipeData.author = null;
      }
    }

    const recipe = await Recipe.create(recipeData);

    // Populate author before returning
    await recipe.populate(
      "author",
      "firstName lastName email imageUrl clerkId"
    );

    return NextResponse.json({ data: recipe }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: { message: error.message } },
      { status: 400 }
    );
  }
}
