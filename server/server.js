const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const songRoutes = require('./routes/songRoutes');
const playlistRoutes = require('./routes/playlistRoutes');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 8080;

// Global error safety handlers to prevent unhandled crashes
process.on('uncaughtException', (err) => {
  console.error('CRITICAL: Uncaught Exception in process:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Endpoints for Railway & Docker containers
const healthCheckHandler = (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'Aura Stream API is fully functional',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
};

app.get('/health', healthCheckHandler);
app.get('/api/health', healthCheckHandler);
app.get('/favicon.ico', (req, res) => res.status(204).end());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/playlists', playlistRoutes);

// Serve static assets in production if client build exists
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
} else {
  // If client dist doesn't exist, handle root route as health status
  app.get('/', healthCheckHandler);
}

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found - ${req.originalUrl}` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.message || err);
  if (!res.headersSent) {
    res.status(err.status || 500).json({
      message: err.message || 'An unexpected error occurred on the server',
      error: process.env.NODE_ENV === 'development' ? err.stack : {}
    });
  }
});

const initDatabase = require('./config/initDb');

// Start Server
const server = app.listen(PORT, async () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  await initDatabase();
});

// Graceful Shutdown handling for Railway / Docker SIGTERM & SIGINT
const shutdown = (signal) => {
  console.log(`Received ${signal}. Shutting down server gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
  
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
