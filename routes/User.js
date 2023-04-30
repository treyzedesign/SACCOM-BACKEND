const {Router} = require('express')
const userRouter = Router()
const User = require('../model/User')
const bcryptJs = require('bcryptjs')
const uuid = require('uuid')
const {sendmail, forgotPasswordMail} = require('../utils/sendMail')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const generateToken = (id , email)=>{
  let token = jwt.sign({id:id, email:email}, process.env.LOGIN_TOKEN_SECRET)
  return token
}

// REGISTER A USER

userRouter.post("/register", async(req,res)=>{
    const {firstName, lastName, phone, email, password} = req.body  
    try {
        if(req.body == null || req.body == undefined){
            res.status(400).json({
                message: 'Bad request'
            })
        }
        const query = await User.findOne({email: email})
        if(query){
            res.status(400).json({
                message: "user already Exists"
            })
        }else{
            const hashedPassword = await bcryptJs.hash(password, 10)
            const obj = {
                id : uuid.v4(),
                firstName: firstName,
                lastName: lastName,
                email: email,
                phone: phone,
                password: hashedPassword
            }
               
            const mailer = sendmail(obj)
            if (mailer == true){
                await User.create(obj).then(()=>{
                    res.status(200).json({
                        message: "Account Created, Email has been sent to your mailbox",
                        data: obj
                    })
                })
            }else{
                res.status(504).json({
                    message: "Email cannot be sent",
                    data: obj
                })
            }
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
})

// LOGIN A USER

userRouter.post('/login', async(req,res)=>{
    const {email, password} = req.body
    try {
        if(req.body == null || req.body == undefined){
            res.status(400).json({
                message: 'Bad request'
            })
        }

        const feedback = await User.findOne({email:email})
        if (feedback) {
            const comparePassword = await bcryptJs.compare(password, feedback.password)
            const accessToken = generateToken(feedback.id, feedback.email)
            if(comparePassword){
                const isVerified = feedback.isVerify
                if(isVerified == false){
                    res.status(403).json({
                        message: 'User has not been verified'
                    })
                }else{
                    res.cookie('userToken', accessToken, {
                        maxAge: 1000 * 60 * 60 * 6,
                        secure: false,
                        sameSite: true
                      })
                    res.status(200).json({
                        message: "user Login successful",
                        data: accessToken
                    })
                }
            }else{
                res.status(404).json({
                    message: 'Invalid credentials'
                })
            }
        }else{
            res.status(404).json({
                message: 'Invalid credentials'
            })
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
})

// RESEND MAIL AGAIN

userRouter.post('/resendEmail', async(req,res)=>{
    const {email, firstName} = req.body
    try {
        if(req.body == null || req.body == undefined){
            res.status(400).json({
                message: 'Bad request'
            })
        }
        const obj = {
            firstName: firstName,
            email:email
        }
        const mailer = sendmail(obj)
        if (mailer == true){
                res.status(200).json({
                    message: "Email has been sent to your mailbox"
            })
           
        }else{
            res.status(504).json({
                message: "Email cannot be sent",
                data: obj
            })
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }

})
// Verify a user

userRouter.post('/verifyEmail', async(req,res)=>{
    const {email, Token} = req.body
    try {
        if(req.body == null || req.body == undefined){
            res.status(400).json({
                message: 'Bad request'
            })
        }
        const feedback = await User.findOne({email: email})
        if(feedback){
            jwt.verify(Token, process.env.ETOKEN_SECRET, async(err,decode)=>{
                if(err){
                    res.status(400).json({
                        massage: err.message
                    })
                }
                await User.updateOne({email},{
                    $set: {
                        isVerify: true
                    }
                }).then(()=>{
                    res.status(200).json({
                        message: "user has been Verified"
                    })
                })
            })
        }else{
            res.status(400).json({
                message: "Bad request"
            })
        }
    } catch (error) {
         res.status(500).json({
            message: error.message
        })
    }
})

// FORGOT PASSWORD
userRouter.post('/forgot-Password', async(req,res)=>{
    const {email} = req.body;
    console.log(email);
    try {
        if(req.body == null || req.body == undefined){
            res.status(400).json({
                message: 'Bad request'
            })
        }
        const feedback = await User.findOne({email: email})
        if(feedback){
           const obj = {
                id: feedback.id,
                email: email,
                firstName : feedback.firstName
           }
           let mailer = forgotPasswordMail(obj)
           if (mailer == true){
                res.status(200).json({
                    message: "Email has been sent to your mailbox,  check your mail to reset password",
                    data: obj
            })
            }else{
                res.status(504).json({
                    message: "Email cannot be sent",
                    data: obj
                })
            }   
        }else{
            res.status(404).json({
                msg: "User not found"
            })
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
})

// CHANGE PASSWORD

userRouter.patch('/change-password/:id', async(req, res)=>{
    const id = req.params.id
    const password = req.body.password
    try {
        if(req.body == null || req.params == null){
            res.status(400).json({
                message: 'Bad request'
            })
        }
        const hasher = await bcryptJs.hash(password, 10)
            // console.log(hasher);
            await User.findOne({id: id}).updateOne({
                $set : {
                    password : hasher
                }
            }).then(()=>{
                res.status(200).json({
                    message: "password has been changed successfully"
                })
            })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
})



module.exports = userRouter