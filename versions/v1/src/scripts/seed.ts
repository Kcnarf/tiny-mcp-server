import { db, saveDb } from '../db.js';

async function seed() {
  console.log('Seeding database...');

  // Create locations table
  db.run(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      town TEXT NOT NULL
    )
  `);
  console.log('✓ Created locations table');

  // Insert sample locations
  const insertLocation = db.prepare(
    'INSERT INTO locations (town) VALUES (?)'
  );
  const locations = [
    ['Paris'],
    ['Lyon'],
    ['Marseille'],
    ['Bordeaux'],
    ['Lille'],
  ];

  for (const [town] of locations) {
    insertLocation.bind([town]);
    insertLocation.step();
  }
  insertLocation.free();
  console.log(`✓ Inserted ${locations.length} locations`);

  // Create reviews table
  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      review TEXT NOT NULL,
      date DATE NOT NULL,
      location INTEGER NOT NULL,
      score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
      FOREIGN KEY (location) REFERENCES locations(id)
    )
  `);
  console.log('✓ Created reviews table');

  // Insert sample reviews with NPS scores
  const insertReview = db.prepare(
    'INSERT INTO reviews (review, date, location, score) VALUES (?, ?, ?, ?)'
  );
  const reviews = [
    ['Excellent hotel stay! The reception staff was very friendly and attentive. Rooms were clean and well-maintained.', '2025-03-15', 1, 9],
    ['Great food at the dining room and comfortable rooms, will definitely come back.', '2025-04-02', 1, 10],
    ['Hotel is pricey but the room quality and dining experience are worth it.', '2025-03-28', 2, 7],
    ['Outstanding stay from check-in to checkout. Beautiful rooms and excellent restaurant service.', '2025-02-20', 2, 10],
    ['The lobby decor is beautiful and the staff made us feel welcome at reception.', '2025-04-10', 3, 8],
    ['Food was tasty but room service delivery was slow.', '2025-03-05', 3, 5],
    ['Perfect hotel for a special occasion! Excellent rooms and dining facilities.', '2025-04-08', 4, 9],
    ['Great location with amazing views from the rooms and excellent dishes at dinner.', '2025-02-14', 4, 8],
    ['Highly recommend, fantastic accommodation and restaurant service.', '2025-03-22', 5, 10],
    ['Very cozy rooms and lovely dining atmosphere, loved every moment of our stay.', '2025-04-05', 5, 10],
    ['Terrible hotel experience, reception staff was rude and rooms were not cleaned.', '2025-02-28', 1, 1],
    ['Overpriced rooms and cold, tasteless food in the dining room.', '2025-03-10', 1, 3],
    ['Disappointing stay, dirty rooms and poor service at reception.', '2025-03-20', 2, 2],
    ['Room service took forever and the food arrived cold and undercooked.', '2025-04-01', 3, 4],
    ['Not worth the money, mediocre rooms and meals at premium hotel prices.', '2025-03-12', 4, 5],
    ['Wonderful hotel experience, exceptional rooms and outstanding dishes in the restaurant.', '2025-02-25', 2, 10],
    ['The reception staff was attentive and the restaurant food was delicious.', '2025-03-25', 3, 7],
    ['Pleasant stay with comfortable rooms and good dining value for the hotel price.', '2025-04-03', 4, 8],
    ['Lovely hotel ambiance with excellent rooms and friendly staff made our stay special.', '2025-02-18', 5, 9],
    ['Good meal in the restaurant despite a few minor issues with room maintenance.', '2025-03-30', 5, 5],
  ];

  for (const [review, date, location, score] of reviews) {
    insertReview.bind([review, date, location, score]);
    insertReview.step();
  }
  insertReview.free();
  console.log(`✓ Inserted ${reviews.length} reviews with NPS scores`);

  // Save database to disk
  await saveDb();
  console.log('✓ Database saved to ./data/mcp.db');
  console.log('\n✅ Seed complete!');
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
