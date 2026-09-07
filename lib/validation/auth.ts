import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email({ error: "Enter a valid email address." })),
  password: z.string().min(1, "Password is required."),
});

export type LoginInput = z.output<typeof loginSchema>;
