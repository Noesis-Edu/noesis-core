import { prisma } from '../db/client.js';

async function main() {
  await prisma.event.deleteMany();
  await prisma.learnerState.deleteMany();
  await prisma.session.deleteMany();
  console.log('Database cleared for a fresh demo run.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
