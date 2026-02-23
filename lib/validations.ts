import { z } from "zod"

export const createFlatSchema = z.object({
  name: z.string().min(1, "Flat name is required").max(100),
  areas: z
    .array(
      z.object({
        slug: z.string().min(1),
        label: z.string().min(1),
      })
    )
    .min(1, "At least one area is required"),
})

const UPI_ID_REGEX = /^[a-zA-Z0-9._-]{3,30}@[a-zA-Z0-9.-]{2,30}$/

export const updateFlatSchema = createFlatSchema.partial().extend({
  upiId: z.string().regex(UPI_ID_REGEX, "Invalid UPI ID format (e.g., name@upi)").optional(),
  upiPayeeName: z.string().min(1).max(50).optional(),
})

export const createRoommateSchema = z.object({
  flatId: z.string().min(1, "Flat ID is required"),
  name: z.string().min(1, "Name is required").max(100),
  area: z.string().min(1, "Area is required"),
  phone: z.string().optional(),
})

export const updateRoommateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  area: z.string().min(1).optional(),
  phone: z.string().optional(),
})

export const submeterReadingSchema = z.object({
  previous: z.number().min(0),
  current: z.number().min(0),
})

export const createBillSchema = z.object({
  flatId: z.string().min(1),
  billingPeriod: z.object({
    from: z.string().min(1),
    to: z.string().min(1),
  }),
  totalBill: z.number().positive("Total bill must be positive"),
  totalUnits: z.number().positive("Total units must be positive"),
  submeterReadings: z.object({
    hall: submeterReadingSchema,
    room: submeterReadingSchema,
  }),
  roommates: z.array(
    z.object({
      roommateId: z.string().min(1),
      roommateName: z.string().min(1),
      area: z.string().min(1),
      daysStayed: z.number().min(0).max(31),
    })
  ),
  status: z.enum(["draft", "finalized"]).default("draft"),
})

export type CreateFlatInput = z.infer<typeof createFlatSchema>
export type CreateRoommateInput = z.infer<typeof createRoommateSchema>
export type CreateBillInput = z.infer<typeof createBillSchema>
