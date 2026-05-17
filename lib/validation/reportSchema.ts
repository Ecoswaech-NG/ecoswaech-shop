import { z } from 'zod';

export const reportSchema = z.object({
    make: z.string().min(2, "Make is required"),
    model: z.string().min(1, "Model is required"),
    year: z
        .string()
        .refine((val) => !isNaN(Number(val)), "Year must be a number"),

    batteryCapacity: z
        .string()
        .refine((val) => !isNaN(Number(val)), "Battery Capacity must be a number"),

    voltage: z
        .string()
        .refine((val) => !isNaN(Number(val)), "Voltage must be a number"),

    mileage: z
        .string()
        .refine((val) => !isNaN(Number(val)), "Mileage must be a number"),
    
    notes: z.string().optional(),
});