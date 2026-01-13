const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get audit logs
router.get('/', async (req, res) => {
  try {
    // Fetch logs, ordered by timestamp descending
    // Filter out LOGIN and LOGOUT actions as per requirement
    const query = `
      SELECT * FROM audit_logs 
      WHERE action NOT IN ('LOGIN', 'LOGOUT', 'SEARCH') 
      ORDER BY timestamp DESC 
      LIMIT 50
    `;
    
    const result = await db.query(query);
    
    // Map to frontend expected format if needed, but the column names match mostly
    // id, timestamp, user ("user" in db, "user" in frontend?? let's check types), action, details
    
    const logs = result.rows.map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      user: row.user, // "user" column
      action: row.action,
      details: row.details
    }));

    res.json(logs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
