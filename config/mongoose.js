const mongoose = require("mongoose")
require("dotenv").config()

const connectToDataBase = ()=>{
    mongoose.connect(process.env.DB_URL)

    mongoose.connection.on("connected", ()=>{
        console.log("database connection is successful")
    })

    mongoose.connection.on("error", (err)=>{
        console.log("databas connection failed", err.message)
    })
}

module.exports = {connectToDataBase}