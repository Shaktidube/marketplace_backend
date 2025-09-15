const mongoose = require("mongoose")
const configObj = require("./config");


const connectDB = async() =>{
    try {
        await mongoose.connect(configObj.DB_URL)
        console.log("DB connected")
    } catch (error) {
        console.log("db connection error", error);
    }
}

module.exports = connectDB;