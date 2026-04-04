import { Webhook } from "svix";
import { headers } from "next/headers";
import connectDB from "@/lib/db/mongodb";
import { User, Recipe, PantryItem, SavedRecipe } from "@/lib/db/models";

export async function POST(req) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return new Response("Error: Webhook secret not configured", {
      status: 500,
    });
  }

  const wh = new Webhook(webhookSecret);

  let evt;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error: Verification failed", {
      status: 400,
    });
  }

  // Handle the webhook event
  const eventType = evt.type;
  const { id: clerkId } = evt.data;

  console.log(`Webhook received: ${eventType} for user ${clerkId}`);

  try {
    await connectDB();

    switch (eventType) {
      case "user.created":
        // User is created via checkUser(), no action needed here
        console.log("User created event received (handled by checkUser)");
        break;

      case "user.updated":
        // Update user data in our database
        const { email_addresses, first_name, last_name, image_url } = evt.data;

        const existingUser = await User.findOne({ clerkId });
        if (existingUser) {
          await User.findByIdAndUpdate(
            existingUser._id,
            {
              email: email_addresses?.[0]?.email_address,
              firstName: first_name || "",
              lastName: last_name || "",
              imageUrl: image_url || "",
            },
            { returnDocument: 'after' }
          );
          console.log("User updated in database");
        }
        break;

      case "user.deleted":
        // Delete user and all related data from our database
        console.log(`Deleting user ${clerkId} and all related data...`);

        const user = await User.findOne({ clerkId });

        if (user) {
          // Cascade delete all related data
          const deleteResults = await Promise.all([
            PantryItem.deleteMany({ owner: user._id }),
            SavedRecipe.deleteMany({ user: user._id }),
            Recipe.deleteMany({ author: user._id }),
          ]);

          // Delete the user
          await User.findByIdAndDelete(user._id);

          console.log(`User ${clerkId} deleted successfully with:`, {
            pantryItems: deleteResults[0].deletedCount,
            savedRecipes: deleteResults[1].deletedCount,
            recipes: deleteResults[2].deletedCount,
          });
        } else {
          console.log(`User ${clerkId} not found in database`);
        }
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return new Response("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Error processing webhook", { status: 500 });
  }
}
