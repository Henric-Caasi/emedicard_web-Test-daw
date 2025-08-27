import { query } from "./_generated/server";
import { v } from "convex/values";

export const getByDate = query({
  args: { date: v.float64() },
  handler: async (ctx, { date }) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const orientations = await ctx.db
      .query("orientations")
      .filter((q) =>
        q.and(
          q.gte(q.field("scheduleAt"), startOfDay.getTime()),
          q.lte(q.field("scheduleAt"), endOfDay.getTime())
        )
      )
      .collect();

    return Promise.all(
      orientations.map(async (orientation) => {
        const form = await ctx.db.get(orientation.formId);
        const user = form ? await ctx.db.get(form.userId) : null;
        return {
          ...orientation,
          userName: user?.fullname ?? "Unknown User",
        };
      })
    );
  },
});
