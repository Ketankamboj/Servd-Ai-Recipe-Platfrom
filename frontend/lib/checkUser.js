import { auth, currentUser } from "@clerk/nextjs/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    console.log("No User found");
    return null;
  }

  // Check if user has Pro plan
  const { has } = await auth();
  const subscriptionTier = has({ plan: "pro" }) ? "pro" : "free";

  try {
    // Check if user exists in our database
    const existingUserResponse = await fetch(
      `${API_URL}/api/users/clerk/${user.id}`,
      {
        cache: "no-store",
      }
    );

    if (existingUserResponse.ok) {
      const existingUserData = await existingUserResponse.json();
      const existingUser = existingUserData.data;

      // Update subscription tier if changed
      if (existingUser.subscriptionTier !== subscriptionTier) {
        await fetch(`${API_URL}/api/users/${existingUser._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subscriptionTier }),
        });
      }

      return { 
        ...existingUser, 
        id: existingUser._id,
        subscriptionTier 
      };
    }

    // User not found, create new user
    const userData = {
      clerkId: user.id,
      username: user.username || user.emailAddresses[0].emailAddress.split("@")[0],
      email: user.emailAddresses[0].emailAddress,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      imageUrl: user.imageUrl || "",
      subscriptionTier,
    };

    const newUserResponse = await fetch(`${API_URL}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!newUserResponse.ok) {
      const errorText = await newUserResponse.text();
      console.error("❌ Error creating user:", errorText);
      return null;
    }

    const newUserData = await newUserResponse.json();
    const newUser = newUserData.data;
    
    return { 
      ...newUser, 
      id: newUser._id
    };
  } catch (error) {
    console.error("❌ Error in checkUser:", error.message);
    return null;
  }
};
