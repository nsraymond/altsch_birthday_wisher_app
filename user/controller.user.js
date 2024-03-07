const userModel = require("../model/user")
const {sendEmail} = require("../util/nodemailer")
const {DateTime} = require("luxon")
const {v4:uuidv4} = require("uuid")
const userVerificationModel = require("../model/userVerification")
const bcrypt = require("bcrypt")


const createUser = async (req,res)=>{
try{
    const userInfo = {
        userName:req.body.userName,
        email:req.body.email,
        dateOfBirth:req.body.dateOfBirth
    }

    const existinguser = await userModel.findOne({email:userInfo.email})
    if(existinguser){
       const message = "User already exist"
        return res.redirect(`/error/${message}`)
        
    }

    const newUser = await userModel.create({
        userName:userInfo.userName,
        email:userInfo.email,
        dateOfBirth:userInfo.dateOfBirth,
        verified:false
})

    sendVerificationEmail(newUser, res, req)
}catch(err){
    return res.redirect(`/error/${err.message}`)
}
   
}

const sendVerificationEmail = async ({_id, userName, email}, res, req)=>{
try{
    const currUrl = "http://localhost:5000"
    const uniqueString = uuidv4() + _id
    const option = {
        email:email,
        subject:"Email verification",
        html:`<div style = "background-color:lightgrey; padding:16px"; border-radius:20px>
        <p>Hi, ${userName}</P>
        <p>Thank you for resgistering with us.</p>
        <p>We need to confirm it is you before being authorized for birthday reminder</P>
            <p>Click <a href=${
              currUrl + "/users/verify/" + _id + "/" + uniqueString
            }>here</a> to get authorized</P>
            <p>This link <b>will expire in the next 6hrs</b></p>
            <p>Click this link: <a href=${
              currUrl + "/users/verify/" + _id + "/" + uniqueString
            } >${
              currUrl + "/users/verify/" + _id + "/" + uniqueString
            }<a/></p>
            </div>`,
    }

    await userVerificationModel.create({
        userId:_id,
        uniqueString:uniqueString,
        createdAt:Date.now(),
        expiresAt:Date.now() + 21600000
    })

    sendEmail(option)

    req.flash("messageKey", "Sign up successful.")
    res.redirect("/users/signup")

}catch(err){
    return res.redirect(`/error/${err.message}`)
}
}

const verifyEmailLink = async (req,res)=>{
    try{
        const {id, uniqueString} = req.params
        const user = await userModel.findOne({_id:id})
        if(!user){
            const message = "You are not found"
            return res.redirect(`/error/${message}`)
        }

        const userToVerify = await userVerificationModel.findOne({userId:id})

        const validUniqueString = await bcrypt.compare(uniqueString, userToVerify.uniqueString)

        if(!validUniqueString){
            const message = "Opps!. It seems you have altered the verification link.Check and try again"
            return res.redirect(`/error/${message}`)
        }

      
      if(userToVerify.expiresAt < Date.now()){
        await userVerificationModel.deleteOne({userId:id})
        await userModel.deleteOne({_id:id})
        const message = "It seems your verification link has expired"
        return res.redirect(`/error/${message}`)
    
      }else{
        await userVerificationModel.deleteOne({userId:id})
        user.verified = true
        user.save()
        const message = "Successful Verification."
        res.redirect(`/verified/${message}`)
      }

    }catch(err){
        return res.redirect(`/error/${err.message}`)
    }
   
}

module.exports = {
    createUser,
    verifyEmailLink
}