import { clerkClient } from "@clerk/nextjs/server";

const client = await clerkClient();

/**
 * Sets the isAdmin status for a user in their private metadata
 */
export async function setUserAsAdmin(userId: string, isAdmin: boolean) {
  try {
    await client.users.updateUserMetadata(userId, {
      privateMetadata: {
        isAdmin,
      },
    });
    return true;
  } catch (error) {
    console.error("Error setting user admin status:", error);
    return false;
  }
}

/**
 * Checks if a user is an admin by reading their private metadata
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const user = await client.users.getUser(userId);
    return Boolean(user.privateMetadata.isAdmin);
  } catch (error) {
    console.error("Error checking user admin status:", error);
    return false;
  }
}
