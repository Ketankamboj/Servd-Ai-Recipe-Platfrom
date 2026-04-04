import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { User, Recipe, PantryItem, SavedRecipe } from "@/lib/db/models";

// GET /api/users/[id] - Get single user
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const user = await User.findById(id);

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

// PUT /api/users/[id] - Update user
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    const user = await User.findByIdAndUpdate(id, body, {
      returnDocument: 'after',
      runValidators: true,
    });

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
      { status: 400 }
    );
  }
}

// DELETE /api/users/[id] - Delete user and cascade delete related data
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const user = await User.findById(id);

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

    // Delete the user
    await User.findByIdAndDelete(id);

    console.log(`User ${user._id} and all related data deleted`);

    return NextResponse.json({
      data: {
        id,
        message: "User and all related data deleted",
        deleted: {
          pantryItems: deleteResults[0].deletedCount,
          savedRecipes: deleteResults[1].deletedCount,
          recipes: deleteResults[2].deletedCount,
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
