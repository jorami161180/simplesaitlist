import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserId } from "./auth_utils";

export const listByWaitlist = query({
    args: { waitlistId: v.id("waitlists") },
    handler: async (ctx, args) => {
        const userId = await getUserId(ctx);
        if (!userId) return [];

        // Verify ownership
        const waitlist = await ctx.db.get(args.waitlistId);
        if (!waitlist || waitlist.userId !== userId) return [];

        const subscribers = await ctx.db
            .query("subscribers")
            .withIndex("by_waitlistId", (q) => q.eq("waitlistId", args.waitlistId))
            .order("desc")
            .collect();

        return subscribers;
    },
});

export const subscribe = mutation({
    args: {
        waitlistId: v.id("waitlists"),
        email: v.string(),
    },
    handler: async (ctx, args) => {
        // Public mutation — no auth required
        const waitlist = await ctx.db.get(args.waitlistId);
        if (!waitlist) throw new Error("Waitlist not found");

        // Check for duplicate
        const existing = await ctx.db
            .query("subscribers")
            .withIndex("by_waitlistId_email", (q) =>
                q.eq("waitlistId", args.waitlistId).eq("email", args.email.toLowerCase().trim())
            )
            .unique();
        if (existing) throw new Error("Email already registered");

        await ctx.db.insert("subscribers", {
            waitlistId: args.waitlistId,
            email: args.email.toLowerCase().trim(),
            createdAt: Date.now(),
        });

        return { success: true };
    },
});

export const count = query({
    args: { waitlistId: v.id("waitlists") },
    handler: async (ctx, args) => {
        const subscribers = await ctx.db
            .query("subscribers")
            .withIndex("by_waitlistId", (q) => q.eq("waitlistId", args.waitlistId))
            .collect();
        return subscribers.length;
    },
});

export const countToday = query({
    args: { waitlistId: v.id("waitlists") },
    handler: async (ctx, args) => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        const subscribers = await ctx.db
            .query("subscribers")
            .withIndex("by_waitlistId", (q) => q.eq("waitlistId", args.waitlistId))
            .collect();

        return subscribers.filter((s) => s.createdAt >= startOfDay).length;
    },
});

export const countThisWeek = query({
    args: { waitlistId: v.id("waitlists") },
    handler: async (ctx, args) => {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diff).getTime();

        const subscribers = await ctx.db
            .query("subscribers")
            .withIndex("by_waitlistId", (q) => q.eq("waitlistId", args.waitlistId))
            .collect();

        return subscribers.filter((s) => s.createdAt >= startOfWeek).length;
    },
});

export const exportData = query({
    args: { waitlistId: v.id("waitlists") },
    handler: async (ctx, args) => {
        const userId = await getUserId(ctx);
        if (!userId) return [];

        const waitlist = await ctx.db.get(args.waitlistId);
        if (!waitlist || waitlist.userId !== userId) return [];

        const subscribers = await ctx.db
            .query("subscribers")
            .withIndex("by_waitlistId", (q) => q.eq("waitlistId", args.waitlistId))
            .order("desc")
            .collect();

        return subscribers.map((s) => ({
            email: s.email,
            createdAt: s.createdAt,
        }));
    },
});
