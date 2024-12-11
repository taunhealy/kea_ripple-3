import { Photographer as PrismaPhotographer } from "@prisma/client";

export interface Package {
  title: string;
  price: number;
  editedPhotos: number;
  shootingHours: number;
  turnaroundDays: number;
}

export type Photographer = PrismaPhotographer & {
  packages: Package[];
};
