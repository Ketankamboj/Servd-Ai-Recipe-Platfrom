import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { PantryItem, User } from "@/lib/db/models";

// POST /api/pantry-items/bulk - Create multiple pantry items
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { items, owner } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: { message: "Items array is required" } },
        { status: 400 }
      );
    }

    let ownerId = owner;

    // If owner is provided as clerkId, find the user
    if (
      owner &&
      typeof owner === "string" &&
      !owner.match(/^[0-9a-fA-F]{24}$/)
    ) {
      const user = await User.findOne({ clerkId: owner });
      if (user) {
        ownerId = user._id;
      } else {
        return NextResponse.json(
          { error: { message: "User not found" } },
          { status: 400 }
        );
      }
    }

    const itemsToCreate = items.map((item) => ({
      ...item,
      owner: ownerId,
    }));

    const createdItems = await PantryItem.insertMany(itemsToCreate);

    return NextResponse.json({ data: createdItems }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: { message: error.message } },
      { status: 400 }
    );
  }
}
