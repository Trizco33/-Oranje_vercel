/**
 * One-time migration endpoint to add images field and seed data
 * Call this endpoint once after deployment: GET /api/migrate-images?key=ADMIN_KEY
 */

import express, { Router } from 'express';
import { getDb } from './db';
import { sql } from 'drizzle-orm';
import { places } from '../drizzle/schema';

const router = express.Router();

router.get('/migrate-images', async (req, res) => {
  const { key } = req.query;
  
  // Security: require admin key
  if (key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const results = {
      migration: { status: 'pending', message: '' },
      seed: { status: 'pending', updated: 0, details: [] }
    };

    // Step 1: Add images column if it doesn't exist
    try {
      await db.execute(sql`
        ALTER TABLE places ADD COLUMN images JSON DEFAULT NULL AFTER coverImage
      `);
      results.migration = { status: 'success', message: 'images column added' };
    } catch (error: any) {
      if (error.message?.includes('Duplicate column')) {
        results.migration = { status: 'skipped', message: 'images column already exists' };
      } else {
        throw error;
      }
    }

    // Step 2: Seed image data
    const imageUpdates = [
      {
        name: 'Martin Holandesa',
        coverImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/06/79/39/00/confeitaria-martin-holandesa.jpg?w=800&h=500&s=1',
        images: [
          'https://i.ytimg.com/vi/7B2RW7GS258/maxresdefault.jpg',
          'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/06/79/39/00/confeitaria-martin-holandesa.jpg?w=800&h=500&s=1',
          'https://media-cdn.tripadvisor.com/media/photo-s/06/79/39/00/confeitaria-martin-holandesa.jpg'
        ]
      },
      {
        name: 'Casa Bela',
        coverImage: 'https://casabelarestaurante.com.br/wp-content/uploads/2025/02/BRU_9396-scaled-4.jpg',
        images: [
          'https://s3-media0.fl.yelpcdn.com/bphoto/7b3sGluJl9ppMeiGuzq_mg/348s.jpg',
          'https://casabelarestaurante.com.br/wp-content/uploads/2025/02/BRU_9396-scaled-4.jpg',
          'https://s3-media0.fl.yelpcdn.com/bphoto/ZTHVHfD9oxK6iCRTOEW2Zg/348s.jpg'
        ]
      },
      {
        name: 'Old Dutch',
        coverImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/e6/d0/72/fachada.jpg?w=900&h=500&s=1',
        images: [
          'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEib2-s6ugtUYLuSAtjEDJFAn2qAVjJ5zyiyrXON1XsJ_IZXvnydIJE_ay8x3IDV-m1bwqUQf0RwR7edFKLQmystrflwfYdYBZh9bJOiZBisYzGVFJVbz3LNlowS00KfOPHWB_Re7GkDetTv/s1600/1300-77_dutch+gables.jpg',
          'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/e6/d0/72/fachada.jpg?w=900&h=500&s=1'
        ]
      },
      {
        name: 'Fratelli',
        coverImage: 'https://fratelliwinebar.com.br/wp-content/uploads/2025/12/fratelli-3-scaled-1.webp',
        images: [
          'https://s3-media0.fl.yelpcdn.com/bphoto/fbMGnveFeT-eoLxB8J_g8A/258s.jpg',
          'https://fratelliwinebar.com.br/wp-content/uploads/2025/12/fratelli-3-scaled-1.webp'
        ]
      },
      {
        name: 'Lago do Holandês',
        coverImage: 'https://i.ytimg.com/vi/djyEhV-X8IE/sddefault.jpg',
        images: [
          'https://i.ytimg.com/vi/djyEhV-X8IE/hq720.jpg',
          'https://i.ytimg.com/vi/djyEhV-X8IE/sddefault.jpg'
        ]
      }
    ];

    for (const update of imageUpdates) {
      try {
        const result = await db
          .update(places)
          .set({
            coverImage: update.coverImage,
            images: JSON.stringify(update.images)
          })
          .where(sql`name LIKE ${`%${update.name}%`} AND status = 'active'`);
        
        results.seed.updated++;
        results.seed.details.push({
          name: update.name,
          status: 'updated',
          imageCount: update.images.length
        });
      } catch (error: any) {
        results.seed.details.push({
          name: update.name,
          status: 'error',
          error: error.message
        });
      }
    }

    results.seed.status = 'success';

    return res.json({
      success: true,
      message: 'Image migration and seed completed',
      results
    });

  } catch (error: any) {
    console.error('Migration error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
