require("dotenv").config({ path: "./.env" });
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app); // Create HTTP server
const initializeSocketIo = require('./socketapi'); // Import the socket API

// Database connection
require("./models/database").connectDatabase();

// Initialize logger
const logger = require("morgan");
app.use(logger("tiny"));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS configuration
const cors = require("cors");
app.use(cors({
    credentials: true,
    origin: [
        "https://chat-app-green-seven.vercel.app",
        "http://127.0.0.1:3000",
        "http://localhost:3000"
    ]
}));

// Session & parser
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Express file upload
const fileUpload = require("express-fileupload");
app.use(fileUpload());

// Routes
app.use("/api/", require("./routes/indexRoutes"));

// Initialize Socket.IO with the server
const io = initializeSocketIo(server, { cors: { origin: '*' } });

// Error Handler
const ErrorHandler = require("./utils/errorHandler");
const { generatedeErrors } = require("./middlewares/error");
app.all("*", (req, res, next) => {
    next(new ErrorHandler(`request url not found ${req.url}`, 404));
});
app.use(generatedeErrors);

// Start the server
server.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
