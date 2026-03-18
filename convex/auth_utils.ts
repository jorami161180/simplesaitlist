import { QueryCtx, MutationCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

/**
 * Get the authenticated user ID, or a fallback "Guest" ID for local development.
 * This allows the app to function even if Convex Auth keys are misconfigured locally.
 */
export async function getUserId(ctx: QueryCtx | MutationCtx): Promise<Id<"users"> | null> {
    const userId = await getAuthUserId(ctx);
    if (userId) return userId;

    const allowGuest = process.env.CONVEX_ALLOW_GUEST === "true";
    if (!allowGuest) return null;

    // Guest Mode fallback for local development
    const guestEmail = "invitado@local.dev";
    const existingGuest = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", guestEmail))
        .unique();

    if (existingGuest) return existingGuest._id;

    // If it doesn't exist and we are in a mutation, create it
    if ("insert" in ctx.db) {
        return await (ctx.db as any).insert("users", {
            name: "Usuario Invitado",
            email: guestEmail,
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=guest",
            isAnonymous: true,
        });
    }

    return null;
}
