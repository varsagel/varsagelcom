const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteAdminUser() {
  try {
    await prisma.user.delete({
      where: { email: 'admin@varsagel.com' }
    });
    console.log('Admin user deleted successfully');
  } catch (error) {
    console.error('Error deleting admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAdminUser();