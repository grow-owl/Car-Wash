require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/services', require('./routes/services'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/crm', require('./routes/crm')); // Customer CRM & Auth Routes (/api/crm/auth/signup, /api/crm/auth/login)
app.use('/api/marketing', require('./routes/marketing'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/notifications', require('./routes/notifications'));

// Root Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Car Wash Application Backend REST API is running successfully',
    version: '1.0.0',
    endpoints: [
      '/api/services',
      '/api/bookings',
      '/api/crm/customers',
      '/api/marketing/coupons',
      '/api/staff',
      '/api/analytics/dashboard',
      '/api/notifications/log'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Car Wash Express Backend listening on http://localhost:${PORT}`);
});
