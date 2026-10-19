import { seedDatabase } from '../src/lib/seed';

try {
  seedDatabase();
  console.log('✅ Seed completed successfully.');
} catch (error) {
  console.error('❌ Error during seeding:', error);
  process.exit(1);
}
