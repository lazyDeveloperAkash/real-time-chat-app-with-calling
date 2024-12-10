require("dotenv").config({ path: "./.env" });
const express = require('express');
const app = express();

//db connection
require("./models/database").connectDatabase();

//initialize logger)
const logger = require("morgan");
app.use(logger("tiny"));


//body-perser (to active req.body)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// cors
const cors = require("cors");
app.use(cors({
    credentials: true,
    origin: [
        "https://chat-app-green-seven.vercel.app",
        "http://127.0.0.1:3000",
        "http://localhost:3000"
    ]
}));

//session & paeser
const cookieParser = require("cookie-parser");
app.use(cookieParser());

//express file Upload
const fileUpload = require("express-fileupload");
app.use(fileUpload());

// Routes
app.use("/api/", require("./routes/indexRoutes"));

//for socket io 
const { Server } = require('socket.io')
const io = new Server(4000, {cors: true });

//error Handler
const ErrorHandler = require("./utils/errorHandler");
const { generatedeErrors } = require("./middlewares/error");
app.all("*", (req, res, next) => {
    next(new ErrorHandler(`request url not found ${req.url}`, 404));
});
app.use(generatedeErrors);

app.listen(process.env.PORT, console.log(`server running on port ${process.env.PORT}`));