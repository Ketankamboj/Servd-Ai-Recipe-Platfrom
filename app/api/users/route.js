import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { User } from "@/lib/db/models";

// GET /api/users - Get all users
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 25;
    const sort = searchParams.get("sort") || "-createdAt";

    const users = await User.find()
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await User.countDocuments();

    return NextResponse.json({
      data: users,
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

// POST /api/users - Create user
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { clerkId, email, username, firstName, lastName, imageUrl, subscriptionTier } = body;

    // Check if user already exists
    let user = await User.findOne({ clerkId });

    if (user) {
      // Update existing user
      user = await User.findOneAndUpdate(
        { clerkId },
        { email, username, firstName, lastName, imageUrl, subscriptionTier },
        { returnDocument: 'after' }
      );
      return NextResponse.json({ data: user });
    }

    // Create new user
    user = await User.create({
      clerkId,
      email,
      username,
      firstName,
      lastName,
      imageUrl,
      subscriptionTier: subscriptionTier || "free",
    });

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: { message: error.message } },
      { status: 400 }
    );
  }
}
