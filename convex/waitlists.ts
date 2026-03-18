import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserId } from "./auth_utils";

export const list = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getUserId(ctx);
        if (!userId) return [];
        const waitlists = await ctx.db
            .query("waitlists")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .collect();

        // Get subscriber counts and logo URLs
        const results = await Promise.all(
            waitlists.map(async (w) => {
                const logoUrl = w.logoStorageId
                    ? await ctx.storage.getUrl(w.logoStorageId)
                    : null;
                return {
                    ...w,
                    subscriberCount: w.subscriberCount ?? 0,
                    logoUrl,
                };
            })
        );
        return results;
    },
});

export const get = query({
    args: { id: v.id("waitlists") },
    handler: async (ctx, args) => {
        const userId = await getUserId(ctx);
        if (!userId) return null;
        const waitlist = await ctx.db.get(args.id);
        if (!waitlist || waitlist.userId !== userId) return null;
        const logoUrl = waitlist.logoStorageId
            ? await ctx.storage.getUrl(waitlist.logoStorageId)
            : null;
        return { ...waitlist, logoUrl, subscriberCount: waitlist.subscriberCount ?? 0 };
    },
});

export const getBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        const waitlist = await ctx.db
            .query("waitlists")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .unique();
        if (!waitlist) return null;
        const logoUrl = waitlist.logoStorageId
            ? await ctx.storage.getUrl(waitlist.logoStorageId)
            : null;
        return { ...waitlist, logoUrl, subscriberCount: waitlist.subscriberCount ?? 0 };
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        description: v.string(),
        slug: v.string(),
        color: v.string(),
        headline: v.string(),
        subtitle: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Check slug uniqueness
        const existing = await ctx.db
            .query("waitlists")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .unique();
        if (existing) throw new Error("Slug already in use");

        return await ctx.db.insert("waitlists", {
            userId,
            ...args,
            subscriberCount: 0,
            createdAt: Date.now(),
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("waitlists"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        slug: v.optional(v.string()),
        color: v.optional(v.string()),
        headline: v.optional(v.string()),
        subtitle: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");
        const waitlist = await ctx.db.get(args.id);
        if (!waitlist || waitlist.userId !== userId) throw new Error("Not found");

        // If slug is being changed, verify uniqueness
        if (args.slug && args.slug !== waitlist.slug) {
            const existing = await ctx.db
                .query("waitlists")
                .withIndex("by_slug", (q) => q.eq("slug", args.slug))
                .unique();
            if (existing) throw new Error("Slug already in use");
        }

        const { id, ...updates } = args;
        // Remove undefined values
        const cleanUpdates: Record<string, any> = {};
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) cleanUpdates[key] = value;
        }
        await ctx.db.patch(args.id, cleanUpdates);
    },
});

export const remove = mutation({
    args: { id: v.id("waitlists") },
    handler: async (ctx, args) => {
        const userId = await getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");
        const waitlist = await ctx.db.get(args.id);
        if (!waitlist || waitlist.userId !== userId) throw new Error("Not found");

        // Delete logo from storage
        if (waitlist.logoStorageId) {
            await ctx.storage.delete(waitlist.logoStorageId);
        }

        // Delete all subscribers
        const subscribers = await ctx.db
            .query("subscribers")
            .withIndex("by_waitlistId", (q) => q.eq("waitlistId", args.id))
            .collect();
        for (const sub of subscribers) {
            await ctx.db.delete(sub._id);
        }

        await ctx.db.delete(args.id);
    },
});

export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");
        return await ctx.storage.generateUploadUrl();
    },
});

export const uploadLogo = mutation({
    args: {
        id: v.id("waitlists"),
        storageId: v.id("_storage"),
    },
    handler: async (ctx, args) => {
        const userId = await getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");
        const waitlist = await ctx.db.get(args.id);
        if (!waitlist || waitlist.userId !== userId) throw new Error("Not found");

        // Delete old logo if exists
        if (waitlist.logoStorageId) {
            await ctx.storage.delete(waitlist.logoStorageId);
        }

        await ctx.db.patch(args.id, { logoStorageId: args.storageId });
    },
});

export const removeLogo = mutation({
    args: { id: v.id("waitlists") },
    handler: async (ctx, args) => {
        const userId = await getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");
        const waitlist = await ctx.db.get(args.id);
        if (!waitlist || waitlist.userId !== userId) throw new Error("Not found");

        if (waitlist.logoStorageId) {
            await ctx.storage.delete(waitlist.logoStorageId);
        }
        await ctx.db.patch(args.id, { logoStorageId: undefined });
    },
});
