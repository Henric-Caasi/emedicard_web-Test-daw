// convex/forms.ts

import { query } from "./_generated/server";
import { v } from "convex/values";
import { AdminRole } from "./users/roles";

export const get = query({
  args: { id: v.id("forms") },
  handler: async (ctx, { id }) => {
    const form = await ctx.db.get(id);
    if (!form) {
      return null;
    }
    const user = await ctx.db.get(form.userId);
    const jobCategory = await ctx.db.get(form.jobCategory);
    return {
      ...form,
      userName: user?.fullname ?? "Unknown User",
      jobCategoryName: jobCategory?.name ?? "Unknown Category",
    };
  },
});

export const list = query({
  args: {
    status: v.optional(v.string()),
    jobCategory: v.optional(v.id("jobCategory")),
    managedCategories: v.optional(v.union(v.literal("all"), v.array(v.id("jobCategory")))),
  },
  handler: async (ctx, args) => {
    // If managedCategories is not provided, fall back to checking admin role
    let adminCheck;
    if (!args.managedCategories) {
      adminCheck = await AdminRole(ctx);
      if (!adminCheck.isAdmin) {
        return [];
      }
    } else {
      // If managedCategories is provided, use it directly
      adminCheck = {
        isAdmin: true,
        managedCategories: args.managedCategories
      };
    }

    let formsQuery = ctx.db.query("forms");

    // Apply UI filters
    if (args.status) {
      formsQuery = formsQuery.filter(q => q.eq(q.field("status"), args.status));
    }
    if (args.jobCategory) {
      formsQuery = formsQuery.filter(q => q.eq(q.field("jobCategory"), args.jobCategory));
    }

    // Apply Permission filters
    if (adminCheck.managedCategories !== "all") {
      const managedCategoryIds = adminCheck.managedCategories as any[];
      if (managedCategoryIds.length > 0) {
        formsQuery = formsQuery.filter(q =>
          q.or(...managedCategoryIds.map((id: any) => q.eq(q.field("jobCategory"), id)))
        );
      } else {
        return []; // Admin manages zero categories
      }
    }

    const forms = await formsQuery.collect();

    // Join with user and job category data
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
