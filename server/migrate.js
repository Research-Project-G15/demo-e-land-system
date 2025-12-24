const fs = require('fs');
const path = require('path');
const db = require('./config/db');

const schemaQuery = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), { encoding: 'utf-8' });

async function runMigration() {
  console.log('Running Migration (Schema)...');
  try {
    await db.query(schemaQuery);
    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit();
  }
}

runMigration();
