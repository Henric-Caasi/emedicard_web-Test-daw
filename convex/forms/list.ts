// convex/forms/list.ts

import { query } from "../_generated/server";
import { v } from "convex/values";
import { AdminRole } from "../users/roles"; 
import { Id } from "../_generated/dataModel";

export const list = query({
  args: {
    // These are the filters from your UI dropdowns
    status: v.optional(v.string()),
    jobCategory: v.optional(v.id("jobCategory")),
  },
  handler: async (ctx, args) => {
    // 1. Get the admin's permissions first.
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) {
      return [];
    }

    // 2. Start building the query.
    let formsQuery = ctx.db.query("forms");

    // 3. Apply the UI filters from the dropdowns.
    if (args.status) {
      formsQuery = formsQuery.filter(q => q.eq(q.field("status"), args.status));
    }
    if (args.jobCategory) {
      formsQuery = formsQuery.filter(q => q.eq(q.field("jobCategory"), args.jobCategory));
    }

    // 4. Apply the SECURITY filter based on the admin's permissions.
    if (adminCheck.managedCategories !== "all") {
      const managedCategoryIds = adminCheck.managedCategories as Id<"jobCategory">[];
      if (!managedCategoryIds || managedCategoryIds.length === 0) {
        return []; // Admin manages zero categories, so they see nothing.
      }
      // This is the key: filter the query to only include forms whose
      // jobCategory is in the admin's list of managed categories.
      formsQuery = formsQuery.filter(q => 
        q.or(...managedCategoryIds.map(id => q.eq(q.field("jobCategory"), id)))
      );
    }

    // 5. Execute the final, fully filtered query.
    const forms = await formsQuery.collect();

    // 6. Join the data to get user and category names.
    const formsWithDetails = await Promise.all(
      forms.map(async (form) => {
        const user = await ctx.db.get(form.userId);
        const jobCategory = await ctx.db.get(form.jobCategory);
        return {
          ...form,
          userName: user?.fullname ?? "Unknown User",
          jobCategoryName: jobCategory?.name ?? "Unknown Category",
        };
      })
    );

    return formsWithDetails;
  },
});
