import { query } from "./_generated/server";
import { getUserId } from "./auth_utils";

export const getCurrent = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getUserId(ctx);
        if (!userId) return null;

        return await ctx.db.get(userId);
    },
});
