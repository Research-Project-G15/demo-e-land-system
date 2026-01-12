const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all lands
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM lands');
    // Convert snake_case to camelCase for frontend compatibility if needed, 
    // or handle it in the frontend. For now, returning as is.
    // To match frontend types:
    const lands = result.rows.map(row => ({
      landNumber: row.land_number,
      district: row.district,
      division: row.division,
      area: row.area,
      areaUnit: row.area_unit,
      mapReference: row.map_reference
    }));
    res.json(lands);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get single land
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM lands WHERE land_number = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Land not found' });
    }

    const row = result.rows[0];
    const land = {
      landNumber: row.land_number,
      district: row.district,
      division: row.division,
      area: row.area,
      areaUnit: row.area_unit,
      mapReference: row.map_reference
    };

    res.json(land);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Register new land
router.post('/', async (req, res) => {
  try {
    const { landNumber, district, division, area, areaUnit, mapReference } = req.body;
    
    // Check if exists
    const check = await db.query('SELECT * FROM lands WHERE land_number = $1', [landNumber]);
    if (check.rows.length > 0) {
      return res.status(400).json({ msg: 'Land already exists' });
    }

    const newLand = await db.query(
      'INSERT INTO lands (land_number, district, division, area, area_unit, map_reference) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [landNumber, district, division, area, areaUnit, mapReference]
    );

    // Log action
    const user = req.body.username || 'Admin';
    await db.query(
      'INSERT INTO audit_logs ("user", action, details) VALUES ($1, $2, $3)',
      [user, 'CREATE', `Registered land: ${landNumber}`]
    );

    const row = newLand.rows[0];
    res.json({
      landNumber: row.land_number,
      district: row.district,
      division: row.division,
      area: row.area,
      areaUnit: row.area_unit,
      mapReference: row.map_reference
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
