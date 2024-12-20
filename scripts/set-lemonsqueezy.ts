import prisma from '../lib/prisma';

async function setLemonSqueezyStore() {
  try {
    const user = await prisma.user.update({
      where: {
        id: 'cm4jowwpa0000oo5ztw7g66yo' // your user ID
      },
      data: {
        lemonSqueezyStoreId: '142097',
        stripeAccountId: null // remove Stripe connection
      }
    });
    console.log('Updated user:', user);
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setLemonSqueezyStore(); 