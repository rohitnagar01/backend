// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const path = require('path');
// const { errorHandler } = require('./utils/errorHandler');
// const connectDB = require('./config/database');
// require('dotenv').config();

// // Initialize Express app
// const app = express();

// // Connect to MongoDB
// connectDB();

// // Middlewares
// app.use(cors());
// app.use(helmet());
// app.use(morgan('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// // Serve static files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // API Routes
// app.use('/api/admin/auth', require('./routes/admin/authRoutes'));
// app.use('/api/admin/locations', require('./routes/admin/locationRoutes'));
// app.use('/api/admin/student-types', require('./routes/admin/studentTypeRoutes'));
// app.use('/api/user/auth', require('./routes/user/authRoutes'));
// app.use('/api/user/profile', require('./routes/user/profileRoutes'));

// // Health check endpoint
// app.get('/api/health', (req, res) => {
//   res.status(200).json({ status: 'OK', timestamp: new Date() });
// });

// // Error handling middleware
// app.use(errorHandler);

// // Handle 404
// app.use((req, res, next) => {
//   res.status(404).json({ success: false, message: 'Endpoint not found' });
// });

// // Server setup
// const PORT = process.env.PORT || 5000;
// const server = app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// // Handle unhandled promise rejections
// process.on('unhandledRejection', (err) => {
//   console.error('Unhandled Rejection:', err);
//   // Close server & exit process
//   server.close(() => process.exit(1));
// });

// module.exports = app;

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { errorHandler } = require('./utils/errorHandler');
require('dotenv').config();

// Initialize Express app
const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/admin/auth', require('./routes/admin/authRoutes'));
app.use('/api/admin/locations', require('./routes/admin/locationRoutes'));
app.use('/api/admin/student-types', require('./routes/admin/studentTypeRoutes'));
app.use('/api/user/auth', require('./routes/user/authRoutes'));
app.use('/api/user/profile', require('./routes/user/profileRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Error handling
app.use(errorHandler);

// Handle 404
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

module.exports = app;
