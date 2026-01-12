const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Search owners
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }
    
    const result = await db.query(
      'SELECT * FROM owners WHERE nic ILIKE $1 OR full_name ILIKE $1 LIMIT 10', 
      [`%${q}%`]
    );
    
    const owners = result.rows.map(row => ({
      nic: row.nic,
      fullName: row.full_name,
      address: row.address,
      contactNumber: row.contact_number
    }));
    
    res.json(owners);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get all owners
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM owners');
    const owners = result.rows.map(row => ({
      nic: row.nic,
      fullName: row.full_name,
      address: row.address,
      contactNumber: row.contact_number
    }));
    res.json(owners);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get single owner
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM owners WHERE nic = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Owner not found' });
    }

    const row = result.rows[0];
    res.json({
      nic: row.nic,
      fullName: row.full_name,
      address: row.address,
      contactNumber: row.contact_number
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Register new owner
router.post('/', async (req, res) => {
  try {
    const { nic, fullName, address, contactNumber } = req.body;
    
    const check = await db.query('SELECT * FROM owners WHERE nic = $1', [nic]);
    if (check.rows.length > 0) {
      return res.status(400).json({ msg: 'Owner already exists' });
    }

    const newOwner = await db.query(
      'INSERT INTO owners (nic, full_name, address, contact_number) VALUES ($1, $2, $3, $4) RETURNING *',
      [nic, fullName, address, contactNumber]
    );

    const user = req.body.username || 'Admin';
    await db.query(
      'INSERT INTO audit_logs ("user", action, details) VALUES ($1, $2, $3)',
      [user, 'CREATE', `Registered owner: ${fullName} (${nic})`]
    );

    const row = newOwner.rows[0];
    res.json({
      nic: row.nic,
      fullName: row.full_name,
      address: row.address,
      contactNumber: row.contact_number
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
