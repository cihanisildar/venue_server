import { z } from 'zod';

export const userSchemas = {
  createUser: z.object({
    email: z.string().email(),
    username: z.string().min(3).max(30),
    password: z.string().min(8),
    name: z.string().min(2),
    age: z.number().optional(),
    phoneNumber: z.string().optional()
  }),

  updatePreferences: z.object({
    budget: z.number().optional(),
    petsAllowed: z.boolean().optional(),
    quiet: z.boolean().optional(),
    outdoor: z.boolean().optional(),
    wifi: z.boolean().optional(),
    parking: z.boolean().optional(),
    accessibility: z.boolean().optional(),
    studyPlace: z.boolean().optional(),
    noiseLevel: z.enum(['SILENT', 'QUIET', 'MODERATE', 'LIVELY']).optional(),
    preferredTime: z.enum(['EARLY_MORNING', 'MORNING', 'AFTERNOON', 'EVENING', 'NIGHT', 'ANY']).optional(),
    groupSize: z.number().min(1).optional()
  })
};