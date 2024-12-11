import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const vstList = [
  "Serum",
  "Vital",
  "Tyrell N6",
  "Tal Noisemaker",
  "DiscoDSP OB-Xd",
  "Surge XT",
  "Helm",
  "Dexed",
  "Pigments",
  "Kilohearts Phase Plant",
  "FM8",
  "Zebra Legacy/Zebralette",
  "Spire",
  "Massive X",
  "Nexus",
  "Diva",
  "Analog Lab",
  "U-he Repro",
  "D16 Lush 2",
  "Tal Uno L",
  "NI Monark",
  "Roland Cloud Legendary",
  "Korg Collection",
  "Cherry Audio GX-80",
  "Sylenth1",
  "VCV Rack Pro 2",
  "Cherry Audio Voltage Modular",
  "Native Instruments Reaktor 6",
  "Applied Acoustics Chromaphone 3"
];

async function seedVsts() {
  try {
    console.log("Starting to seed VSTs...");

    for (const vstName of vstList) {
      await prisma.vST.upsert({
        where: { name: vstName },
        update: {},
        create: {
          name: vstName,
          type: "SYNTH", // Ensure this matches your `VstType` enum
        },
      });
      console.log(`Seeded: ${vstName}`);
    }

    console.log("✅ VSTs seeded successfully");
  } catch (error) {
    console.error("Error seeding VSTs:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedVsts()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
