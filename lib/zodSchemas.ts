import { z } from "zod";

export const productSchema = z.object({
  name: z.string(),
  description: z.string(),
  status: z.enum(["draft", "published", "archived"]),
  price: z.number().min(1),
  images: z.array(z.string()).min(1, "At least one image is required"),
  category: z.enum(["men", "women", "kids"]),
  isFeatured: z.boolean().optional(),
});

export const bannerSchema = z.object({
  title: z.string(),
  imageString: z.string(),
});

export const photographerProfileSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  location: z.string(),
  priceRange: z.string(),
  portfolioImages: z.array(z.string()),
  googleCalendarLink: z.string().url().optional(),
  packages: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      price: z.number(),
    })
  ),
  experience: z.number().int().min(0, "Experience must be a positive number"),
  portfolioUrl: z.string().url("Invalid portfolio URL").optional(),
  socialMedia: z
    .object({
      instagram: z.string().optional(),
      twitter: z.string().optional(),
      facebook: z.string().optional(),
    })
    .optional(),
});

export const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  profileImage: z.string().url().optional(),
});
