import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';

async function deployImages() {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  console.log('🔌 Connecting to database...');
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);

  try {
    // Step 1: Run migration to add images column
    console.log('\n📝 Step 1: Running migration to add images column...');
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../drizzle/migrations/add_images_field.sql'),
      'utf-8'
    );
    
    // Check if column already exists
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM places LIKE 'images'"
    );
    
    if ((columns as any[]).length === 0) {
      await connection.query(migrationSQL);
      console.log('✅ Migration completed: images column added');
    } else {
      console.log('ℹ️  Migration skipped: images column already exists');
    }

    // Step 2: Run seed script to populate images
    console.log('\n📸 Step 2: Seeding image data...');
    const seedSQL = fs.readFileSync(
      path.join(__dirname, '../scripts/seed-images.sql'),
      'utf-8'
    );
    
    // Split by semicolon and filter out comments and empty lines
    const statements = seedSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && s.length > 10);
    
    let updatedCount = 0;
    for (const statement of statements) {
      if (statement.toUpperCase().includes('UPDATE')) {
        const [result] = await connection.query(statement);
        const affectedRows = (result as any).affectedRows || 0;
        updatedCount += affectedRows;
        if (affectedRows > 0) {
          console.log(`  ✓ Updated ${affectedRows} place(s)`);
        }
      }
    }
    
    console.log(`✅ Seed completed: ${updatedCount} places updated with images`);

    // Step 3: Verify the data
    console.log('\n🔍 Step 3: Verifying image data...');
    const [places] = await connection.query(
      'SELECT id, name, images FROM places WHERE images IS NOT NULL LIMIT 10'
    );
    
    console.log(`✅ Verification: ${(places as any[]).length} places have images`);
    (places as any[]).forEach((place: any) => {
      const imageCount = place.images ? JSON.parse(place.images).length : 0;
      console.log(`  - ${place.name}: ${imageCount} images`);
    });

    console.log('\n🎉 Image deployment completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during deployment:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

deployImages()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
