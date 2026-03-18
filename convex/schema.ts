import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
    ...authTables,

    users: defineTable({
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        image: v.optional(v.string()),
        emailVerificationTime: v.optional(v.float64()),
        isAnonymous: v.optional(v.boolean()),
    }).index("by_email", ["email"]),

    waitlists: defineTable({
        userId: v.id("users"),
        name: v.string(),
        description: v.string(),
        slug: v.string(),
        color: v.string(),
        headline: v.string(),
        subtitle: v.string(),
        logoStorageId: v.optional(v.id("_storage")),
        subscriberCount: v.optional(v.float64()),
        statsDayKey: v.optional(v.string()),
        statsDayCount: v.optional(v.float64()),
        statsWeekKey: v.optional(v.string()),
        statsWeekCount: v.optional(v.float64()),
        createdAt: v.float64(),
    })
        .index("by_userId", ["userId"])
        .index("by_slug", ["slug"]),

    subscribers: defineTable({
        waitlistId: v.id("waitlists"),
        email: v.string(),
        createdAt: v.float64(),
    })
        .index("by_waitlistId", ["waitlistId"])
        .index("by_waitlistId_email", ["waitlistId", "email"])
        .index("by_waitlistId_createdAt", ["waitlistId", "createdAt"]),
});
