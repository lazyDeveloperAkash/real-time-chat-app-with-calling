const mongoose = require("mongoose");

exports.connectDatabase = async ()=>{
    try {
        // await mongoose.connect(process.env.MONGODB_URL);
        await mongoose.connect("mongodb://localhost:27017/chatAppClone");
        console.log("database connected")
    } catch (error) {
        console.log(error.message);
    }
}