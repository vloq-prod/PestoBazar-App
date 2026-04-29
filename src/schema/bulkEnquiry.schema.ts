import { z } from "zod";

export const bulkEnquirySchema = z.object({
  name: z.string().min(2, "Name is required"),
  mobile: z.string().regex(/^[0-9]{10}$/, "Enter valid 10-digit number"),
  email: z.string().email("Invalid email").or(z.literal("")),
  product: z.string().min(3, "Product details are required"),
});
