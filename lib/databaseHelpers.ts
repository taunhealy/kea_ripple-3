import prisma from "./prisma";

export async function searchCamerasInDb(query: string) {
  try {
    const cameras = await prisma.camera.findMany({
      where: {
        OR: [
          { brand: { contains: query, mode: "insensitive" } },
          { model: { contains: query, mode: "insensitive" } },
          { type: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 20,
    });
    return cameras;
  } catch (error) {
    console.error("Error searching cameras:", error);
    throw new Error("Failed to search cameras");
  }
}

export async function searchLensesInDb(query: string) {
  try {
    const lenses = await prisma.lens.findMany({
      where: {
        OR: [
          { brand: { contains: query, mode: "insensitive" } },
          { model: { contains: query, mode: "insensitive" } },
          { mountType: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 20,
    });
    return lenses;
  } catch (error) {
    console.error("Error searching lenses:", error);
    throw new Error("Failed to search lenses");
  }
}
