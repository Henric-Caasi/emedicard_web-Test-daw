import { query } from "./_generated/server";
import { v } from "convex/values";

export const getByForm = query({
  args: { formId: v.id("forms") },
  handler: async (ctx, { formId }) => {
    const documents = await ctx.db
      .query("formDocuments")
      .withIndex("by_form", (q) => q.eq("formId", formId))
      .collect();

    return Promise.all(
      documents.map(async (doc) => {
        const requirement = await ctx.db.get(doc.documentRequirementId);
        return {
          ...doc,
          documentName: requirement?.name ?? "Unknown Document",
        };
      })
    );
  },
});
