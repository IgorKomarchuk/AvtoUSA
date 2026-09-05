import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Вкажіть ім’я").max(80),
  phone: z.string().trim().min(7, "Перевірте номер телефону").max(30),
  messenger: z.string().trim().max(40).optional().or(z.literal("")),
  interest: z.string().trim().max(160).optional().or(z.literal("")),
  vehicleId: z.string().trim().max(80).optional().or(z.literal("")),
  vin: z.string().trim().max(32).optional().or(z.literal("")),
  lotNumber: z.string().trim().max(40).optional().or(z.literal("")),
  vehicleTitle: z.string().trim().max(160).optional().or(z.literal("")),
  vehicleUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  price: z.string().trim().max(40).optional().or(z.literal("")),
  source: z.string().trim().max(80).optional().or(z.literal("")),
  sourceChannel: z.string().trim().max(40).optional().or(z.literal("")),
  utmSource: z.string().trim().max(100).optional().or(z.literal("")),
  utmMedium: z.string().trim().max(100).optional().or(z.literal("")),
  utmCampaign: z.string().trim().max(160).optional().or(z.literal("")),
  utmContent: z.string().trim().max(160).optional().or(z.literal("")),
  website: z.string().max(0).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(200),
});
