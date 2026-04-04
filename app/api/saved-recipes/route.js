import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { SavedRecipe, User } from "@/lib/db/models";

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

// GET /api/saved-recipes - Get all saved recipes
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 100;
    const sort = searchParams.get("sort") || "-savedAt";
    const populate = searchParams.get("populate");
    const user = searchParams.get("user");
    const clerkId = searchParams.get("clerkId");
    const recipe = searchParams.get("recipe");

    // Build filter
    const filter = {};

    // If clerkId is provided, find the user first
    if (clerkId) {
      const userDoc = await User.findOne({ clerkId });
      if (userDoc) {
        filter.user = userDoc._id;
      } else {
        // No user found, return empty array
        return NextResponse.json({
          data: [],
          meta: {
            pagination: {
              page: 1,
              pageSize: limit,
              pageCount: 0,
              total: 0,
            },
          },
        });
      }
    } else if (user) {
      filter.user = user;
    }

    if (recipe) filter.recipe = recipe;

    let query = SavedRecipe.find(filter)
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit);

    // Apply population
    const populateOptions = getPopulateOptions(populate);
    populateOptions.forEach((opt) => {
      query = query.populate(opt);
    });

    const savedRecipes = await query;
    const total = await SavedRecipe.countDocuments(filter);

    return NextResponse.json({
      data: savedRecipes,
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

// POST /api/saved-recipes - Create saved recipe
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const savedRecipeData = { ...body };

    // If user is provided as clerkId, find the user
    if (
      savedRecipeData.user &&
      typeof savedRecipeData.user === "string" &&
      !savedRecipeData.user.match(/^[0-9a-fA-F]{24}$/)
    ) {
      const userDoc = await User.findOne({ clerkId: savedRecipeData.user });
      if (userDoc) {
        savedRecipeData.user = userDoc._id;
      } else {
        return NextResponse.json(
          { error: { message: "User not found" } },
          { status: 400 }
        );
      }
    }

    // Check if already saved
    const existing = await SavedRecipe.findOne({
      user: savedRecipeData.user,
      recipe: savedRecipeData.recipe,
    });

    if (existing) {
      return NextResponse.json({
        data: existing,
        message: "Recipe already saved",
      });
    }

    const savedRecipe = await SavedRecipe.create(savedRecipeData);

    // Populate before returning
    await savedRecipe.populate([
      { path: "user", select: "firstName lastName email imageUrl clerkId" },
      { path: "recipe" },
    ]);

    return NextResponse.json({ data: savedRecipe }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: { message: error.message } },
      { status: 400 }
    );
  }
}
