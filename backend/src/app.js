require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/database');
const routes = require('./routes');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Request logging

// CORS configuration - supports multiple origins for dev and production
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowed => origin.startsWith(allowed) || allowed.includes('vercel.app') && origin.includes('vercel.app'))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// API Routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'AI Recipe Platform API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      recipes: '/api/recipes',
      pantryItems: '/api/pantry-items',
      savedRecipes: '/api/saved-recipes',
      health: '/api/health'
    }
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    error: {
      message: `Not Found - ${req.originalUrl}`
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 AI Recipe Platform API Server                         ║
║                                                            ║
║   Server running on: http://localhost:${PORT}                 ║
║   Environment: ${process.env.NODE_ENV || 'development'}                            ║
║                                                            ║
║   API Endpoints:                                           ║
║   • GET  /api/users          - List users                  ║
║   • GET  /api/recipes        - List recipes                ║
║   • GET  /api/pantry-items   - List pantry items           ║
║   • GET  /api/saved-recipes  - List saved recipes          ║
║   • GET  /api/health         - Health check                ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
