import prisma from '../lib/prisma';

async function addTestStripeAccount() {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: 'cm4jowwpd0002oo5zhzds2ov4'
      },
      data: {
        stripeAccountId: 'acct_test_user123'
      }
    });
    console.log('Updated user:', updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestStripeAccount(); 