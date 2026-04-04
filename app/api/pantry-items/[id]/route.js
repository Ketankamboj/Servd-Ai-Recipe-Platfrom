import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { PantryItem } from "@/lib/db/models";

// Helper to build populate options
const getPopulateOptions = (populate) => {
  if (!populate) return [];

  const populateFields = populate.split(",");
  return populateFields.map((field) => {
    if (field === "owner") {
      return {
        path: "owner",
        select: "firstName lastName email imageUrl clerkId",
      };
    }
    return field;
  });
};

// GET /api/pantry-items/[id] - Get single pantry item
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get("populate");

    let query = PantryItem.findById(id);

    const populateOptions = getPopulateOptions(populate);
    populateOptions.forEach((opt) => {
      query = query.populate(opt);
    });

    const item = await query;

    if (!item) {
      return NextResponse.json(
        { error: { message: "Pantry item not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: item });
  } catch (error) {
    return NextResponse.json(
      { error: { message: error.message } },
      { status: 500 }
    );
  }
}

// PUT /api/pantry-items/[id] - Update pantry item
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    const item = await PantryItem.findByIdAndUpdate(id, body, {
      returnDocument: 'after',
      runValidators: true,
    }).populate("owner", "firstName lastName email imageUrl clerkId");

    if (!item) {
      return NextResponse.json(
        { error: { message: "Pantry item not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: item });
  } catch (error) {
    return NextResponse.json(
      { error: { message: error.message } },
      { status: 400 }
    );
  }
}

// DELETE /api/pantry-items/[id] - Delete pantry item
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const item = await PantryItem.findByIdAndDelete(id);

    if (!item) {
      return NextResponse.json(
        { error: { message: "Pantry item not found" } },
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
