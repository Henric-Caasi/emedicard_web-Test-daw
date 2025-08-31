// convex/admin/finalizeApplication.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { AdminRole } from "../users/roles";

export const finalize = mutation({
  args: {
    applicationId: v.id("applications"),
    newStatus: v.union(v.literal("Approved"), v.literal("Rejected")),
    remarks: v.optional(v.string()), // For overall application rejection remarks
  },
  handler: async (ctx, args) => {
    await AdminRole(ctx); // Security check

    // For security, we re-validate on the backend.
    // Get all uploaded documents for this application.
    const uploadedDocs = await ctx.db
      .query("documentUploads")
      .withIndex("by_application", q => q.eq("applicationId", args.applicationId))
      .collect();

    // Check if any documents are still pending review.
    if (uploadedDocs.some(doc => doc.reviewStatus === "Pending")) {
      throw new Error("Please review and assign a status (Approve or Reject) to all documents before proceeding.");
    }

    // If rejecting, ensure at least one document is rejected.
    if (args.newStatus === "Rejected" && !uploadedDocs.some(doc => doc.reviewStatus === "Rejected")) {
      throw new Error("To reject the application, at least one document must be marked as 'Rejected'.");
    }

    // All checks passed, update the application status.
    await ctx.db.patch(args.applicationId, {
      applicationStatus: args.newStatus,
      adminRemarks: args.remarks,
      updatedAt: Date.now(),
      approvedAt: args.newStatus === "Approved" ? Date.now() : undefined,
    });

    return { success: true };
  },
});