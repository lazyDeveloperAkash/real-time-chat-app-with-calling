import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data (optional, be careful in production!)
  // await prisma.message.deleteMany();
  // await prisma.conversationParticipant.deleteMany();
  // await prisma.conversation.deleteMany();
  // await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('Password123', 10);

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      name: 'Alice Smith',
      email: 'alice@example.com',
      contact: '1234567890',
      password: hashedPassword,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      name: 'Bob Jones',
      email: 'bob@example.com',
      contact: '0987654321',
      password: hashedPassword,
    },
  });

  console.log('✅ Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
