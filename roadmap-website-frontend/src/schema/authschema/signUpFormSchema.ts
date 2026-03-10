import { z } from "zod";
export const SignUpSchema = z.object({
  username: z.string().min(4, "User must be atleast 4 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(5, "password must be atleast 5 characters"),
  profileUrl: z.string().url().optional(),
});
