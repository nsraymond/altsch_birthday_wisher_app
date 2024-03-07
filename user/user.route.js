const express = require("express")
const middleware = require("./middleware.user")
const controller = require("./controller.user")

const userRouter = express.Router()

userRouter.get("/signup",(req, res)=>{
    const message = req.flash("messageKey")
    res.render("signup", {message})
})
userRouter.post("/signup", middleware.validateUserInput, controller.createUser)
userRouter.get("/verify/:id/:uniqueString", controller.verifyEmailLink)

module.exports = userRouter