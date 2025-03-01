/**
 * Socket.IO service for real-time communication
 */
class SocketService {
    constructor(io) {
      this.io = io;
      this.connectedUsers = new Map();
    }
  
    /**
     * Initialize Socket.IO handlers
     */
    initialize() {
      this.io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);
        
        // Join a room based on user role
        socket.on('join', ({ userId, role }) => {
          if (role === 'admin') {
            socket.join('admin');
            console.log(`Admin joined admin room: ${socket.id}`);
          } else if (userId) {
            socket.join(`user_${userId}`);
            this.connectedUsers.set(userId, socket.id);
            console.log(`User ${userId} joined personal room: ${socket.id}`);
          }
        });
        
        // Handle order updates
        socket.on('orderUpdate', (data) => {
          if (data.userId) {
            this.io.to(`user_${data.userId}`).emit('orderUpdate', data);
          }
          this.io.to('admin').emit('orderUpdate', data);
          console.log(`Order update sent: ${JSON.stringify(data)}`);
        });
        
        // Handle disconnections
        socket.on('disconnect', () => {
          console.log(`Client disconnected: ${socket.id}`);
          
          // Remove user from connected users map
          for (const [userId, socketId] of this.connectedUsers.entries()) {
            if (socketId === socket.id) {
              this.connectedUsers.delete(userId);
              console.log(`User ${userId} removed from connected users`);
              break;
            }
          }
        });
      });
      
      console.log('Socket.IO service initialized');
    }
  
    /**
     * Send a notification to a specific user
     * @param {string} userId - User ID
     * @param {string} event - Event name
     * @param {object} data - Event data
     */
    sendToUser(userId, event, data) {
      this.io.to(`user_${userId}`).emit(event, data);
    }
  
    /**
     * Send a notification to all admin users
     * @param {string} event - Event name
     * @param {object} data - Event data
     */
    sendToAdmin(event, data) {
      this.io.to('admin').emit(event, data);
    }
  
    /**
     * Send a notification to all connected clients
     * @param {string} event - Event name
     * @param {object} data - Event data
     */
    broadcast(event, data) {
      this.io.emit(event, data);
    }
  }
  
  module.exports = SocketService;