import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/mongodb";
import { User, Recipe, PantryItem, SavedRecipe } from "@/lib/db/models";

// Helper function to delete orphaned user and their data
async function deleteOrphanedUser(dbUser) {
  console.log(`🗑️ Cleaning up orphaned user: ${dbUser.email}`);
  
  const deleteResults = await Promise.all([
    PantryItem.deleteMany({ owner: dbUser._id }),
    SavedRecipe.deleteMany({ user: dbUser._id }),
    Recipe.deleteMany({ author: dbUser._id }),
  ]);

  await User.findByIdAndDelete(dbUser._id);

  console.log(`✅ Orphaned user cleaned up:`, {
    email: dbUser.email,
    pantryItems: deleteResults[0].deletedCount,
    savedRecipes: deleteResults[1].deletedCount,
    recipes: deleteResults[2].deletedCount,
  });
}

// Helper function to check if a user exists in Clerk
async function userExistsInClerk(clerkId) {
  try {
    const clerk = await clerkClient();
    await clerk.users.getUser(clerkId);
    return true;
  } catch (error) {
    if (error.status === 404 || error.clerkError) {
      return false;
    }
    // For other errors, assume user exists to avoid accidental deletion
    return true;
  }
}

export const checkUser = async () => {
  let user;
  let subscriptionTier = "free";

  try {
    user = await currentUser();
  } catch (error) {
    // Handle Clerk API errors (e.g., user deleted, network issues)
    console.log("Clerk API error:", error.message);
    return null;
  }

  if (!user) {
    console.log("No User found");
    return null;
  }

  // Check if user has Pro plan
  try {
    const { has } = await auth();
    subscriptionTier = has({ plan: "pro" }) ? "pro" : "free";
  } catch (error) {
    console.log("Auth check error:", error.message);
    // Continue with default free tier
  }

  try {
    await connectDB();

    const userEmail = user.emailAddresses[0].emailAddress;

    // Check if user exists in our database by clerkId
    let existingUser = await User.findOne({ clerkId: user.id });

    if (existingUser) {
      // Update subscription tier if changed
      if (existingUser.subscriptionTier !== subscriptionTier) {
        existingUser = await User.findByIdAndUpdate(
          existingUser._id,
          { subscriptionTier },
          { returnDocument: 'after' }
        );
      }

      return {
        ...existingUser.toObject(),
        id: existingUser._id.toString(),
        _id: existingUser._id.toString(),
        subscriptionTier,
      };
    }

    // User not found by clerkId, check if user exists by email
    existingUser = await User.findOne({ email: userEmail });

    if (existingUser) {
      // Check if the existing user's clerkId is orphaned (deleted from Clerk)
      const existsInClerk = await userExistsInClerk(existingUser.clerkId);
      
      if (!existsInClerk) {
        // The old user was deleted from Clerk, clean up and create fresh
        await deleteOrphanedUser(existingUser);
        existingUser = null;
      } else {
        // Update the existing user with new clerkId and other details
        existingUser = await User.findByIdAndUpdate(
          existingUser._id,
          {
            clerkId: user.id,
            username: user.username || userEmail.split("@")[0],
            firstName: user.firstName || existingUser.firstName || "",
            lastName: user.lastName || existingUser.lastName || "",
            imageUrl: user.imageUrl || existingUser.imageUrl || "",
            subscriptionTier,
          },
          { returnDocument: 'after' }
        );

        console.log("✅ Updated existing user with new clerkId:", existingUser.email);

        return {
          ...existingUser.toObject(),
          id: existingUser._id.toString(),
          _id: existingUser._id.toString(),
          subscriptionTier,
        };
      }
    }

    // User not found at all (or was cleaned up), create new user
    const newUser = await User.create({
      clerkId: user.id,
      username: user.username || userEmail.split("@")[0],
      email: userEmail,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      imageUrl: user.imageUrl || "",
      subscriptionTier,
    });

    console.log("✅ Created new user:", newUser.email);

    return {
      ...newUser.toObject(),
      id: newUser._id.toString(),
      _id: newUser._id.toString(),
    };
  } catch (error) {
    console.error("❌ Error in checkUser:", error.message);
    return null;
  }
};
