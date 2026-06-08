import { z } from "zod";

// Authentication
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password confirmation must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Contact
export const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").or(z.literal("")),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  companyId: z.string().optional(),
  status: z.enum(["lead", "prospect", "customer", "churned"]),
  source: z.string().min(1, "Source is required"),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional().default(""),
});

// Company
export const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  website: z.string().url("Invalid URL").or(z.literal("")),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").or(z.literal("")),
  size: z.enum(["startup", "small", "medium", "enterprise"]),
  revenue: z.number().nonnegative().optional().or(z.nan()),
  address: z.object({
    street: z.string().optional().default(""),
    city: z.string().optional().default(""),
    state: z.string().optional().default(""),
    country: z.string().optional().default(""),
    zip: z.string().optional().default(""),
  }),
  notes: z.string().optional().default(""),
});

// Deal
export const dealSchema = z.object({
  title: z.string().min(1, "Deal title is required"),
  value: z.number().nonnegative("Value must be a positive number"),
  currency: z.string().min(1, "Currency is required").default("USD"),
  stage: z.enum(["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"]),
  probability: z.number().min(0).max(100, "Probability must be between 0 and 100"),
  contactId: z.string().optional(),
  companyId: z.string().optional(),
  expectedCloseDate: z.any(), // will be converted/validated in form submission
  notes: z.string().optional().default(""),
  tags: z.array(z.string()).default([]),
});

// Activity/Task
export const activitySchema = z.object({
  type: z.enum(["call", "email", "meeting", "note", "task"]),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().default(""),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
  companyId: z.string().optional(),
  dueDate: z.any().optional(), // for tasks
  isCompleted: z.boolean().default(false),
});
