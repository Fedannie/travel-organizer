const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    const trips = await prisma.trip.findMany();
    console.log('Database connection successful!');
    console.log('Found trips:', trips.length);
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Database connection failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testDatabase();