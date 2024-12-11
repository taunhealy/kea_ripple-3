import { PrismaClient } from "@prisma/client";
import { SystemGenres } from "../constants/constants";

const prisma = new PrismaClient();

async function seedGenres() {
  try {
    console.log("Starting to seed genres...");

    // Create system genres
    for (const [key, value] of Object.entries(SystemGenres)) {
      await prisma.genre.upsert({
        where: { name: value },
        update: {},
        create: {
          name: value,
          type: "SYSTEM",
          isSystem: true,
        },
      });
    }

    console.log("✅ Genres seeded successfully");
  } catch (error) {
    console.error("Error seeding genres:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedGenres()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
