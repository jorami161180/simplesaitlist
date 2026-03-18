import { query, mutation, action } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { getUserId } from "./auth_utils";
import { api } from "./_generated/api";

async function assertWaitlistOwner(ctx: any, waitlistId: any) {
    const userId = await getUserId(ctx);
    if (!userId) return null;
    const waitlist = await ctx.db.get(waitlistId);
    if (!waitlist || waitlist.userId !== userId) return null;
    return waitlist;
}

async function countSince(ctx: any, waitlistId: any, startTime: number) {
    const subscribers = await ctx.db
        .query("subscribers")
        .withIndex("by_waitlistId_createdAt", (q: any) =>
            q.eq("waitlistId", waitlistId).gte("createdAt", startTime)
        )
        .collect();
    return subscribers.length;
}

function getDayKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getWeekKey(date: Date) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(date.getFullYear(), date.getMonth(), diff);
    return getDayKey(startOfWeek);
}

export const listByWaitlist = query({
    args: {
        waitlistId: v.id("waitlists"),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        const waitlist = await assertWaitlistOwner(ctx, args.waitlistId);
        if (!waitlist) return { page: [], isDone: true, continueCursor: null };

        return await ctx.db
            .query("subscribers")
            .withIndex("by_waitlistId", (q) => q.eq("waitlistId", args.waitlistId))
            .order("desc")
            .paginate(args.paginationOpts);
    },
});

export const exportPage = query({
    args: {
        waitlistId: v.id("waitlists"),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        const waitlist = await assertWaitlistOwner(ctx, args.waitlistId);
        if (!waitlist) return { page: [], isDone: true, continueCursor: null };

        return await ctx.db
            .query("subscribers")
            .withIndex("by_waitlistId", (q) => q.eq("waitlistId", args.waitlistId))
            .order("desc")
            .paginate(args.paginationOpts);
    },
});

export const subscribe = mutation({
    args: {
        waitlistId: v.id("waitlists"),
        email: v.string(),
        hp: v.optional(v.string()),
        elapsedMs: v.optional(v.float64()),
    },
    handler: async (ctx, args) => {
        // Public mutation — no auth required
        const waitlist = await ctx.db.get(args.waitlistId);
        if (!waitlist) throw new Error("Waitlist not found");

        const honeypot = (args.hp || "").trim();
        if (honeypot) throw new Error("Invalid submission");

        if (typeof args.elapsedMs === "number" && args.elapsedMs < 800) {
            throw new Error("Invalid submission");
        }

        const email = args.email.toLowerCase().trim();
        if (email.length < 5 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error("Invalid email");
        }

        const rateLimit = Number(process.env.SUBSCRIBE_RATE_LIMIT_PER_MIN || 60);
        if (Number.isFinite(rateLimit) && rateLimit > 0) {
            const since = Date.now() - 60_000;
            const recent = await ctx.db
                .query("subscribers")
                .withIndex("by_waitlistId_createdAt", (q) =>
                    q.eq("waitlistId", args.waitlistId).gte("createdAt", since)
                )
                .collect();
            if (recent.length >= rateLimit) {
                throw new Error("Too many requests");
            }
        }

        // Check for duplicate
        const existing = await ctx.db
            .query("subscribers")
            .withIndex("by_waitlistId_email", (q) =>
                q.eq("waitlistId", args.waitlistId).eq("email", email)
            )
            .unique();
        if (existing) throw new Error("Email already registered");

        await ctx.db.insert("subscribers", {
            waitlistId: args.waitlistId,
            email,
            createdAt: Date.now(),
        });

        const now = new Date();
        const dayKey = getDayKey(now);
        const weekKey = getWeekKey(now);

        const nextDayCount = waitlist.statsDayKey === dayKey
            ? (waitlist.statsDayCount ?? 0) + 1
            : 1;
        const nextWeekCount = waitlist.statsWeekKey === weekKey
            ? (waitlist.statsWeekCount ?? 0) + 1
            : 1;

        await ctx.db.patch(args.waitlistId, {
            subscriberCount: (waitlist.subscriberCount ?? 0) + 1,
            statsDayKey: dayKey,
            statsDayCount: nextDayCount,
            statsWeekKey: weekKey,
            statsWeekCount: nextWeekCount,
        });

        return { success: true };
    },
});

export const count = query({
    args: { waitlistId: v.id("waitlists") },
    handler: async (ctx, args) => {
        const waitlist = await assertWaitlistOwner(ctx, args.waitlistId);
        if (!waitlist) return 0;
        if (typeof waitlist.subscriberCount === "number") return waitlist.subscriberCount;

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
        const waitlist = await assertWaitlistOwner(ctx, args.waitlistId);
        if (!waitlist) return 0;
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        return await countSince(ctx, args.waitlistId, startOfDay);
    },
});

export const countThisWeek = query({
    args: { waitlistId: v.id("waitlists") },
    handler: async (ctx, args) => {
        const waitlist = await assertWaitlistOwner(ctx, args.waitlistId);
        if (!waitlist) return 0;
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diff).getTime();

        return await countSince(ctx, args.waitlistId, startOfWeek);
    },
});

export const stats = query({
    args: { waitlistId: v.id("waitlists") },
    handler: async (ctx, args) => {
        const waitlist = await assertWaitlistOwner(ctx, args.waitlistId);
        if (!waitlist) return { total: 0, today: 0, thisWeek: 0 };

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const dayKey = getDayKey(now);
        const weekKey = getWeekKey(now);

        const total = typeof waitlist.subscriberCount === "number"
            ? waitlist.subscriberCount
            : (await ctx.db
                .query("subscribers")
                .withIndex("by_waitlistId", (q: any) => q.eq("waitlistId", args.waitlistId))
                .collect()).length;

        const today = waitlist.statsDayKey === dayKey
            ? (waitlist.statsDayCount ?? 0)
            : await countSince(ctx, args.waitlistId, startOfDay);

        let thisWeek = 0;
        if (waitlist.statsWeekKey === weekKey) {
            thisWeek = waitlist.statsWeekCount ?? 0;
        } else {
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1);
            const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diff).getTime();
            thisWeek = await countSince(ctx, args.waitlistId, startOfWeek);
        }

        return { total, today, thisWeek };
    },
});

export const exportCsv = action({
    args: {
        waitlistId: v.id("waitlists"),
        maxRows: v.optional(v.float64()),
    },
    handler: async (ctx, args) => {
        const waitlist = await ctx.runQuery(api.waitlists.get, { id: args.waitlistId });
        if (!waitlist) throw new Error("Not authorized");

        const limit = Math.min(Math.max(args.maxRows ?? 10000, 1), 50000);
        let cursor: string | null = null;
        let remaining = limit;
        const rows: string[] = ["Email,Fecha de inscripción"]; 

        while (remaining > 0) {
            const page = await ctx.runQuery(api.subscribers.exportPage, {
                waitlistId: args.waitlistId,
                paginationOpts: { numItems: Math.min(remaining, 500), cursor },
            });

            for (const s of page.page) {
                const date = new Date(s.createdAt).toISOString();
                rows.push(`${s.email},${date}`);
            }

            remaining -= page.page.length;
            if (page.isDone || page.page.length === 0) break;
            cursor = page.continueCursor;
        }

        return { csv: rows.join("\n"), total: rows.length - 1 };
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
