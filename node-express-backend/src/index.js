const express = require('express');
const cors = require('cors');
const http = require("http");
const { Server } = require("socket.io");
const config = require('./config/config');

// Initialize Express
const app = express();
app.use(cors());
app.use(express.json());

// Initialize HTTP server and Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Set this to the frontend URL in production
    methods: ["GET"]
  }
});

// Pass the Socket.IO instance to routes or controllers
app.set('io', io);

// Define your routes here
const exampleRoutes = require('./routes/exampleRoutes');
const greenboneRoutes = require('./routes/greenboneRoutes');
app.use('/api/example', exampleRoutes);
app.use('/api/greenbone', greenboneRoutes);

// Start the server
// app.listen(config.port, () => {
server.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
