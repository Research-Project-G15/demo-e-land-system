const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');

// Routes
const landRoutes = require('./routes/lands');
const ownerRoutes = require('./routes/owners');
const deedRoutes = require('./routes/deeds');
const authRoutes = require('./routes/auth');
const auditRoutes = require('./routes/audit');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get('/', (req, res) => {
  res.json({ message: 'Land Ledger Guard API is running' });
});

// API Routes
app.use('/api/lands', landRoutes);
app.use('/api/owners', ownerRoutes);
app.use('/api/deeds', deedRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/audit', auditRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
