import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    // Clear all data in reverse order of dependencies
    await prisma.presetDownload.deleteMany();
    await prisma.presetPackDownload.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.priceHistory.deleteMany();
    await prisma.packPresets.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.presetSubmission.deleteMany();
    await prisma.presetRequest.deleteMany();
    await prisma.tutorial.deleteMany();
    await prisma.presetPackUpload.deleteMany();
    await prisma.presetUpload.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
    
    console.log("✅ Database cleared successfully");
  } catch (error) {
    console.error("Error clearing database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
