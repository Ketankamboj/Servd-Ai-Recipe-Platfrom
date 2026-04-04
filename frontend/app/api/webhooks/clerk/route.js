import { Webhook } from "svix";
import { headers } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
    switch (eventType) {
      case "user.created":
        // User is created via checkUser(), no action needed here
        console.log("User created event received (handled by checkUser)");
        break;

      case "user.updated":
        // Update user data in our database
        const { email_addresses, first_name, last_name, image_url } = evt.data;
        
        await fetch(`${API_URL}/api/users/clerk/${clerkId}`, {
          method: "GET",
        }).then(async (res) => {
          if (res.ok) {
            const userData = await res.json();
            if (userData.data) {
              await fetch(`${API_URL}/api/users/${userData.data._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: email_addresses?.[0]?.email_address,
                  firstName: first_name || "",
                  lastName: last_name || "",
                  imageUrl: image_url || "",
                }),
              });
            }
          }
        });
        console.log("User updated in database");
        break;

      case "user.deleted":
        // Delete user and all related data from our database
        console.log(`Deleting user ${clerkId} and all related data...`);
        
        // Call our backend to delete user and cascade delete related data
        const deleteResponse = await fetch(`${API_URL}/api/users/clerk/${clerkId}`, {
          method: "DELETE",
        });
        
        if (deleteResponse.ok) {
          console.log(`User ${clerkId} and related data deleted successfully`);
        } else {
          console.error(`Failed to delete user ${clerkId}`);
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
