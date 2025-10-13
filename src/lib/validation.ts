import { z } from "zod";

// Auth validation schemas
export const signUpSchema = z.object({
  fullName: z.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  phone: z.string()
    .trim()
    .max(20, "Phone must be less than 20 characters")
    .optional(),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password must be less than 128 characters"),
});

export const signInSchema = z.object({
  email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  password: z.string()
    .min(1, "Password is required")
    .max(128, "Password must be less than 128 characters"),
});

// Booking validation schema
export const bookingSchema = z.object({
  reason: z.string()
    .trim()
    .max(500, "Reason must be less than 500 characters")
    .optional(),
  time: z.string()
    .trim()
    .min(1, "Time is required"),
  date: z.date().refine((date) => date !== undefined, {
    message: "Date is required",
  }),
});

// Symptom checker validation schema
export const symptomSchema = z.object({
  symptoms: z.string()
    .trim()
    .min(10, "Please provide at least 10 characters describing your symptoms")
    .max(2000, "Symptoms description must be less than 2000 characters"),
});

// Treatment update validation schema
export const treatmentUpdateSchema = z.object({
  dentistNotes: z.string()
    .trim()
    .max(2000, "Notes must be less than 2000 characters")
    .optional(),
});

// Appointment notes validation schema
export const appointmentNotesSchema = z.object({
  notes: z.string()
    .trim()
    .max(1000, "Notes must be less than 1000 characters")
    .optional(),
});
