import { z } from "zod";

export const addressSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name too long"),

  number: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile number"),

  email: z
    .string()
    .trim()
    .email("Enter valid email"),

  building: z
    .string()
    .trim()
    .min(2, "Building required"),

  area: z
    .string()
    .trim()
    .min(2, "Area required"),

  address: z
    .string()
    .trim()
    .min(5, "Address too short"),

  city: z
    .string()
    .trim()
    .min(2, "City required")
    .regex(/^[a-zA-Z\s]+$/, "City must contain only letters"),

  pincode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, "Enter valid 6-digit pincode"),

  gst: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) =>
        !val ||
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val),
      {
        message: "Invalid GST number",
      }
    ),
});

// 🔥 optional: type export (very useful)
export type AddressFormType = z.infer<typeof addressSchema>;