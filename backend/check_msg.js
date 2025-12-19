
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLatestMessage() {
  try {
    const msg = await prisma.message.findFirst({
      orderBy: { createdAt: 'desc' },
      where: { type: 'image' }
    });
    console.log('Latest Image Message:', JSON.stringify(msg, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkLatestMessage();
