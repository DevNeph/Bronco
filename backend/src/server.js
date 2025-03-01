require('dotenv').config();
const http = require('http');
const app = require('./app');
const socketIO = require('socket.io');
const { sequelize } = require('./models');
const SocketService = require('./services/socketService');

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIO(server, {
  cors: {
    origin: process.env.CORS_ORIGIN.split(','),
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize Socket service
const socketService = new SocketService(io);
socketService.initialize();

// Make io and socketService available to the app
app.set('io', io);
app.set('socketService', socketService);

// Set port
const PORT = process.env.PORT || 4000;

// Database connection and server startup
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync database models (in production, use migrations instead)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('Database models synchronized');
    }
    
    // Start server
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or start server:', error);
    process.exit(1);
  }
}

startServer();