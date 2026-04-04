import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { PantryItem, User } from "@/lib/db/models";

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

// GET /api/pantry-items - Get all pantry items
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 100;
    const sort = searchParams.get("sort") || "-createdAt";
    const populate = searchParams.get("populate");
    const owner = searchParams.get("owner");
    const clerkId = searchParams.get("clerkId");

    // Build filter
    const filter = {};

    // If clerkId is provided, find the user first
    if (clerkId) {
      const user = await User.findOne({ clerkId });
      if (user) {
        filter.owner = user._id;
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
    } else if (owner) {
      filter.owner = owner;
    }

    let query = PantryItem.find(filter)
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit);

    // Apply population
    const populateOptions = getPopulateOptions(populate);
    populateOptions.forEach((opt) => {
      query = query.populate(opt);
    });

    const items = await query;
    const total = await PantryItem.countDocuments(filter);

    return NextResponse.json({
      data: items,
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

// POST /api/pantry-items - Create pantry item
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const itemData = { ...body };

    // If owner is provided as clerkId, find the user
    if (
      itemData.owner &&
      typeof itemData.owner === "string" &&
      !itemData.owner.match(/^[0-9a-fA-F]{24}$/)
    ) {
      const user = await User.findOne({ clerkId: itemData.owner });
      if (user) {
        itemData.owner = user._id;
      } else {
        return NextResponse.json(
          { error: { message: "User not found" } },
          { status: 400 }
        );
      }
    }

    const item = await PantryItem.create(itemData);

    // Populate owner before returning
    await item.populate("owner", "firstName lastName email imageUrl clerkId");

    return NextResponse.json({ data: item }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: { message: error.message } },
      { status: 400 }
    );
  }
}
