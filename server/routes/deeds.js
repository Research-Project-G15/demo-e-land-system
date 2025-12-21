const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Helper to map DB row to Deed object
const mapDeed = (row) => ({
  deedNumber: row.deed_number,
  landNumber: row.land_number,
  ownerNic: row.owner_nic,
  registrationDate: row.registration_date,
  deedType: row.deed_type,
  status: row.status,
  previousDeedNumber: row.previous_deed_number,
  previousOwnerNic: row.previous_owner_nic,
  previousRegistrationDate: row.previous_registration_date,
  notes: row.notes
});

// Get next deed ID
router.get('/next-id', async (req, res) => {
  try {
    const { previousDeedId } = req.query;

    if (previousDeedId) {
      // Logic for transfer: PreviousID-Sequence (e.g., D001-01)
      // Find all deeds that start with the previousDeedId followed by a hyphen
      const result = await db.query(
        "SELECT deed_number FROM deeds WHERE deed_number LIKE $1 ORDER BY length(deed_number) DESC, deed_number DESC LIMIT 1",
        [`${previousDeedId}-%`]
      );

      let nextId = `${previousDeedId}-01`;

      if (result.rows.length > 0) {
        const lastId = result.rows[0].deed_number;
        // Extract the sequence part after the last hyphen
        const parts = lastId.split('-');
        const lastSequence = parseInt(parts[parts.length - 1]);
        
        if (!isNaN(lastSequence)) {
           const nextSequence = lastSequence + 1;
           nextId = `${previousDeedId}-${nextSequence.toString().padStart(2, '0')}`;
        }
      }
      return res.json({ nextId });
    }

    // Logic for new registration: D001, D002...
    // Find the latest deed number that starts with 'D' followed by numbers (and NO hyphens to avoid confusing with transfer IDs)
    const result = await db.query("SELECT deed_number FROM deeds WHERE deed_number ~ '^D[0-9]+$' ORDER BY length(deed_number) DESC, deed_number DESC LIMIT 1");
    
    let nextId = 'D001';
    
    if (result.rows.length > 0) {
      const lastId = result.rows[0].deed_number;
      const numberPart = parseInt(lastId.substring(1));
      const nextNumber = numberPart + 1;
      nextId = `D${nextNumber.toString().padStart(3, '0')}`;
    }
    
    res.json({ nextId });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get all deeds
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM deeds');
    res.json(result.rows.map(mapDeed));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get single deed
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM deeds WHERE deed_number = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Deed not found' });
    }

    res.json(mapDeed(result.rows[0]));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get ownership history for a land
router.get('/history/:landNumber', async (req, res) => {
  try {
    const { landNumber } = req.params;
    const result = await db.query(
      'SELECT * FROM deeds WHERE land_number = $1 ORDER BY registration_date DESC',
      [landNumber]
    );
    res.json(result.rows.map(mapDeed));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Register new deed
router.post('/', async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const { deedNumber, landNumber, ownerNic, registrationDate, deedType, status, notes } = req.body;

    // Check existence
    const check = await client.query('SELECT * FROM deeds WHERE deed_number = $1', [deedNumber]);
    if (check.rows.length > 0) {
      return res.status(400).json({ msg: 'Deed already exists' });
    }

    // Validate Land and Owner
    const landCheck = await client.query('SELECT * FROM lands WHERE land_number = $1', [landNumber]);
    if (landCheck.rows.length === 0) return res.status(400).json({ msg: 'Land does not exist' });

    const ownerCheck = await client.query('SELECT * FROM owners WHERE nic = $1', [ownerNic]);
    if (ownerCheck.rows.length === 0) return res.status(400).json({ msg: 'Owner does not exist' });

    const newDeed = await client.query(
      `INSERT INTO deeds (deed_number, land_number, owner_nic, registration_date, deed_type, status, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [deedNumber, landNumber, ownerNic, registrationDate, deedType, status || 'ACTIVE', notes]
    );

    await client.query(
      'INSERT INTO audit_logs ("user", action, details) VALUES ($1, $2, $3)',
      ['Admin', 'CREATE', `Registered deed: ${deedNumber} for land ${landNumber}`]
    );

    await client.query('COMMIT');
    res.json(mapDeed(newDeed.rows[0]));
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server Error');
  } finally {
    client.release();
  }
});

// Transfer Ownership
router.post('/transfer', async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const { oldDeedNumber, newDeedDetails } = req.body;
    // newDeedDetails contains: deedNumber, landNumber, ownerNic, registrationDate, deedType, notes

    // 1. Get Old Deed
    const oldDeedResult = await client.query('SELECT * FROM deeds WHERE deed_number = $1', [oldDeedNumber]);
    if (oldDeedResult.rows.length === 0) {
      throw new Error('Old deed not found');
    }
    const oldDeed = oldDeedResult.rows[0];

    if (oldDeed.status !== 'ACTIVE') {
      throw new Error('Old deed is not active');
    }

    // 2. Update Old Deed Status
    await client.query('UPDATE deeds SET status = $1 WHERE deed_number = $2', ['TRANSFERRED', oldDeedNumber]);

    // 3. Create New Deed
    const { deedNumber, landNumber, ownerNic, registrationDate, deedType, notes } = newDeedDetails;

    // Validate New Owner
    const ownerCheck = await client.query('SELECT * FROM owners WHERE nic = $1', [ownerNic]);
    if (ownerCheck.rows.length === 0) throw new Error('New owner does not exist');

    const newDeed = await client.query(
      `INSERT INTO deeds 
      (deed_number, land_number, owner_nic, registration_date, deed_type, status, previous_deed_number, previous_owner_nic, previous_registration_date, notes) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        deedNumber, 
        landNumber, 
        ownerNic, 
        registrationDate, 
        deedType, 
        'ACTIVE', 
        oldDeedNumber, 
        oldDeed.owner_nic, 
        oldDeed.registration_date,
        notes
      ]
    );

    await client.query(
      'INSERT INTO audit_logs ("user", action, details) VALUES ($1, $2, $3)',
      ['Admin', 'TRANSFER', `Transferred ownership from deed ${oldDeedNumber} to ${deedNumber}`]
    );

    await client.query('COMMIT');
    res.json(mapDeed(newDeed.rows[0]));

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(400).json({ msg: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
