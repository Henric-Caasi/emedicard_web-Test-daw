import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  documentRequirements: defineTable({
    description: v.string(),
    fieldName: v.string(),
    icon: v.string(),
    name: v.string(),
    required: v.boolean(),
  }).index("by_field_name", ["fieldName"]),
  formDocuments: defineTable({
    documentRequirementId: v.id("documentRequirements"),
    fileId: v.id("_storage"),
    fileName: v.string(),
    formId: v.id("forms"),
    remarks: v.optional(v.string()),
    reviewAt: v.optional(v.float64()),
    reviewBy: v.optional(v.id("users")),
    status: v.string(),
    uploadedAt: v.float64(),
  })
    .index("by_form", ["formId"])
    .index("by_form_type", [
      "formId",
      "documentRequirementId",
    ]),
  forms: defineTable({
    applicationType: v.union(
      v.literal("New"),
      v.literal("Renew")
    ),
    approvedAt: v.optional(v.float64()),
    civilStatus: v.string(),
    jobCategory: v.id("jobCategory"),
    organization: v.string(),
    position: v.string(),
    remarks: v.optional(v.string()),
    status: v.string(),
    updatedAt: v.optional(v.float64()),
    userId: v.id("users"),
  }).index("by_user", ["userId"]),
  healthCards: defineTable({
    cardUrl: v.string(),
    expiresAt: v.float64(),
    formId: v.id("forms"),
    issuedAt: v.float64(),
    verificationToken: v.string(),
  })
    .index("by_form", ["formId"])
    .index("by_verificationToken", ["verificationToken"]),
  jobCategory: defineTable({
    colorCode: v.string(),
    name: v.string(),
    requireOrientation: v.optional(
      v.union(v.boolean(), v.string())
    ),
  }),
  jobCategoryRequirements: defineTable({
    documentRequirementId: v.id("documentRequirements"),
    jobCategoryId: v.id("jobCategory"),
    required: v.boolean(),
  })
    .index("by_category", ["jobCategoryId"])
    .index("by_requirement", ["documentRequirementId"]),
  notifications: defineTable({
    actionUrl: v.optional(v.string()),
    formsId: v.optional(v.id("forms")),
    message: v.string(),
    read: v.boolean(),
    title: v.optional(v.string()),
    type: v.string(),
    userId: v.id("users"),
  }).index("by_user", ["userId"]),
  orientations: defineTable({
    checkInTime: v.optional(v.float64()),
    checkOutTime: v.optional(v.float64()),
    formId: v.id("forms"),
    qrCodeUrl: v.string(),
    scheduleAt: v.float64(),
    status: v.union(
      v.literal("Scheduled"),
      v.literal("Completed"),
      v.literal("Missed")
    ),
    //inspectorId: v.optional(v.id("users")), // The inspector who will manage the session
    //venue: v.optional(v.string()),         // The location of the orientation

  }).index("by_form", ["formId"]),
  payments: defineTable({
    amount: v.float64(),
    formId: v.id("forms"),
    method: v.union(
      v.literal("Gcash"),
      v.literal("Maya"),
      v.literal("BaranggayHall"),
      v.literal("CityHall")
    ),
    netAmount: v.float64(),
    receiptId: v.optional(v.id("_storage")),
    referenceNumber: v.string(),
    serviceFee: v.float64(),
    status: v.union(
      v.literal("Pending"),
      v.literal("Complete"),
      v.literal("Failed"),
      v.literal("Refunded"),
      v.literal("Cancelled")
    ),
    updatedAt: v.optional(v.float64()),
  }).index("by_form", ["formId"]),
  users: defineTable({
    birthDate: v.optional(v.string()),
    clerkId: v.string(),
    email: v.string(),
    fullname: v.string(),
    gender: v.optional(v.string()),
    image: v.string(),
    phoneNumber: v.optional(v.string()),
    role: v.optional(
      v.union(
        v.literal("applicant"),
        v.literal("inspector"),
        v.literal("admin")
      )
    ),
    managedCategories: v.optional(v.array(v.id("jobCategory"))),
    updatedAt: v.optional(v.float64()),
    username: v.string(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_role", ["role"]),
  verificationLogs: defineTable({
    healthCardId: v.id("healthCards"),
    ipAddress: v.optional(v.string()),
    scannedAt: v.float64(),
    status: v.union(
      v.literal("Success"),
      v.literal("Failed")
    ),
    userAgent: v.optional(v.string()),
  }).index("by_healthcard", ["healthCardId"]),
});