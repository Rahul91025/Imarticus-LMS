require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/payment', require('./routes/payment'));

// Production Static Serving
const distPath = path.join(__dirname, '../frontend/dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
} else {
  console.warn('WARNING: Frontend dist directory not found at:', distPath);
  // On Vercel, if only backend is deployed, the root will show this status
  app.get('/', (req, res) => {
    res.json({ 
      status: 'API is Online', 
      message: 'LMS Backend is running. Frontend static files were not found in this deployment unit.',
      note: 'If you intended to deploy the frontend, check your Vercel Root Directory settings.'
    });
  });
}

// Catch-all route for SPA routing
app.get('{*path}', (req, res) => {
  const indexFile = path.join(distPath, 'index.html');
  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile);
  } else if (req.path !== '/') {
    // Return 404 for non-root routes if frontend is missing
    res.status(404).json({ error: 'Route not found or frontend not built.' });
  }
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
} else {
  connectDB();
}

module.exports = app;
