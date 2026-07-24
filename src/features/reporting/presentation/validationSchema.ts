import { z } from 'zod';

export const citizenReportFormSchema = z.object({
  description: z
    .string()
    .min(10, 'Issue description must be at least 10 characters long.')
    .max(2000, 'Issue description cannot exceed 2000 characters.'),
  citizenCategory: z
    .enum(['pothole', 'broken_streetlight', 'water_leak', 'illegal_dumping', 'other'])
    .optional(),
  locationText: z
    .string()
    .min(3, 'Location description must be at least 3 characters long.')
    .max(500, 'Location description cannot exceed 500 characters.'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  contactName: z.string().max(100).optional(),
  contactEmail: z.string().email('Invalid email address format.').optional().or(z.literal('')),
  contactPhone: z.string().max(20).optional(),
  consentToContact: z.boolean().default(false),
});

export type CitizenReportFormInput = z.infer<typeof citizenReportFormSchema>;
