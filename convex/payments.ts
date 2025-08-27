import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { AdminRole } from "./users/roles";

export const getByForm = query({
  args: { formId: v.id("forms") },
  handler: async (ctx, { formId }) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_form", (q) => q.eq("formId", formId))
      .first();
  },
});

export const updateStatus = mutation({
  args: {
    paymentId: v.id("payments"),
    status: v.union(v.literal("Complete"), v.literal("Failed")),
  },
  handler: async (ctx, { paymentId, status }) => {
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) {
      throw new Error("You do not have permission to update payment status.");
    }

    await ctx.db.patch(paymentId, { status });
    return { success: true };
  },
});
