import User from '../models/userSchema.js'
import UserVerification from '../models/userVerification.js'
import asyncHandler from 'express-async-handler'
import generateToken from './generateToken.js'
import path from 'path'


import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { config } from 'dotenv'; // Assuming you're using dotenv for environment variables


// Load environment variables from a .env file
config();

// Create a transporter using Gmail SMTP
let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASSWORD
    }
});






// desc @Auth user / set Token
// route POST api/users/login
//@acess public


const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body
    const userExist = await User.findOne({ email })

    if (userExist && await (userExist.matchPassword(password))) {
        generateToken(res, userExist)
        res.status(201).json({
            ...userExist._doc
        })
    }
})

// verify trabspoter

transporter.verify((error, success) => {
    if (error) {
        console.log(error)
    } else {
        console.log('success, ready for message')
        console.log(success)
    }
})


// desc @register user / set Token
// route POST api/users/register
//@acess public


const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, dateofbirth } = req.body

    const userExist = await User.findOne({ email })

    if (userExist) {
        res.status(400)
        throw new Error('This User Already Exist')

    }

    const createdUser = await User.create({
        name,
        password,
        email,
        dateofbirth,
        verified: false
    })

    if (createdUser) {
        generateToken(res, createdUser)

    } else {
        res.status(401)
        throw new Error('Resoure not found')

    }
    sendVerifificationEmail(result, res)

})


/// handle verification

const sendVerifificationEmail = async ({ _id, email }, res) => {
    const currentUrl = "http://localhost:5000/"
    const uniqueString = uuidv4() + _id

    // mail options
    const mailOption = {
        from: 'Nodemailer <example@nodemailer.com>',
        to: 'Nodemailer <example@nodemailer.com>',
        subject: 'AMP4EMAIL message',
        text: 'For clients with plaintext support only',
        html: '<p>For clients that do not support AMP4EMAIL or amp content is not valid</p>',
        amp: `<!doctype html>
        <html ⚡4email>
          <head>
            <meta charset="utf-8">
            <style amp4email-boilerplate>body{visibility:hidden}</style>
            <script async src="https://cdn.ampproject.org/v0.js"></script>
            <script async custom-element="amp-anim" src="https://cdn.ampproject.org/v0/amp-anim-0.1.js"></script>
          </head>
          <body>
            <p>Image: <amp-img src="https://cldup.com/P0b1bUmEet.png" width="16" height="16"/></p>
            <a href=${currentUrl + 'user/verify/' + _id + '/' + uniqueString}>Click here to verify</a>
            <p>GIF (requires "amp-anim" script in header):<br/>
              <amp-anim src="https://cldup.com/D72zpdwI-i.gif" width="500" height="350"/></p>
          </body>
        </html>`
    };

    //  hash the unique string in the model


    const newVerification = await UserVerification.create({
        userId,
        uniqueString,
        createdAt: Date.now(),
        expiresAt: Date.now() + 216000


    })

    if (newVerification) {
        res.status(201).json({
            'status': 'pending',
            'message': 'Verification email sent'
        })
    } else {
        res.status(401)

        throw new Error('User verication  was unsuccefully')
    }


}


// verify email route

const verifyEmail = asyncHandler(async (req, res) => {
    let { userId, uniqueString } = req.params

    const verified = await UserVerification.findOne({ userId })

    if (verified) {
        console.log(verified)
        if (verified.length > 0) {

            const { expiresAt } = [0]
            if (expiresAt < Date.now()) {
                let verication = await 
            }

        } else {
            let message = 'Account record doesnt exist'
            res.redirect(`/verified/error=true&message=${message}`)
        }
    }
    else {
        let message = 'an error occured'
        res.redirect(`/verified/error=true&message=${message}`)
        throw new Error('not verified')
    }
})


const message = asyncHandler(async (req, res) => {
    res.sendFile(path.join(__dirname, "./../views/index.html"))
})


// desc @logout user / destroy token
// route POST api/users/logout
//@acess private


const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    })

    res.json({ msg: 'user logged out' })
})




// export all const

export {
    loginUser,
    registerUser,
    logoutUser
}

