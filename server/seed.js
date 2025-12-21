const fs = require('fs');
const path = require('path');
const db = require('./config/db');

const seedQuery = fs.readFileSync(path.join(__dirname, '../database/seed.sql'), { encoding: 'utf-8' });

async function runSeed() {
  console.log('Running Seed...');
  try {
    await db.query(seedQuery);
    console.log('Seed completed successfully!');
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    // We need to close the pool to exit the script
    // But db.js exports a pool instance, not the class. 
    // We can just exit the process.
    process.exit();
  }
}

runSeed();