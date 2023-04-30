const jwt = require('jsonwebtoken')
require('dotenv').config()
const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    service : "gmail",
    port: 587,
    secure: false,
    host: "smtp.gmail.com",
    tls: {
        rejectUnauthorized: false,
        minVersion: "TLSv1.2"
    },
    auth: {
        user: process.env.USER,
        pass: process.env.PASS
    }
})
const sendmail = (obj)=>{
    const emailToken = jwt.sign({email:obj.email, firstName:obj.firstName}, process.env.ETOKEN_SECRET, {
        expiresIn: '1h'
    })
    const url = process.env.BASE_URL
    let sender = transporter.sendMail({
        from : process.env.USER,
        to: obj.email,
        subject : "hello" + " " + "(" + obj.firstName + ")" + " " + "Please Verify your email",
        html: `<p>Please verify your email address to complete the signup process into your account</p>
                <p>Click the link<b>(expires in 15 minutes)</b> : <a href=${url + "user/verify/" + obj.email + "/" + emailToken}> press Here</a> to proceed</p>`
    })
    if(sender){
        return true
    }else{
        return false
    }
}

const forgotPasswordMail = (obj)=>{
    const url = process.env.BASE_URL
    let sender =  transporter.sendMail({
        from : process.env.USER,
        to: obj.email,
        subject : "hello" + " " + "(" + obj.firstName + ")" + " " + "(Change Of Password)",
        html: `<p>Please click the link the below to change your password</p>
                <p>Click the link : <a href=${url + "change_password/" + obj.id }> press Here</a> to proceed</p>`
    })
    if(sender){
        return true
    }else{
        return false
    }
}
module.exports = { sendmail, forgotPasswordMail }