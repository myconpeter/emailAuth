import User from '../models/userSchema.js'
import UserVerification from '../models/userVerification.js'
import asyncHandler from 'express-async-handler'
import generateToken from './generateToken.js'
import path from 'path'
import bcrypt from "bcrypt"


import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

import dotenv from 'dotenv'

dotenv.config()





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

// verify transpoter

transporter.verify((error, success) => {
    if (error) {
        console.log(error)
    } else {
        console.log('success, ready for message')
        console.log(success)
    }
})







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



// desc @register user / set Token
// route POST api/users/register
//@acess public


const registerUser = asyncHandler(async (req, res) => {

    const { firstname, email, password, dateofbirth } = req.body

    const userExist = await User.findOne({ email })

    if (userExist) {
        res.status(401)
        throw new Error('Email already exist')
    }

    // create a user

    const newUser = await User.create({
        firstname,
        email,
        password,
        dateofbirth

    })

    if (newUser) {

        sendVerifificationEmail(newUser, res)

        // generateToken(res, newUser._id)
        // res.status(201).json({
        //     message: 'new User created all that is needed is to verifiy',
        //     ...newUser



        // })

    } else {
        res.status(401)
        throw new Error('Unsuccessful')
    }

})


/// handle verification
const sendVerifificationEmail = async ({ _id, email }, res) => {
    const currentUrl = 'http://localhost:5000'; // Replace with your website URL
    const uniqueString = uuidv4() + _id
    const activateLink = `${currentUrl}/api/user/verify/${_id}/${uniqueString}`;


    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: 'Welcome to Our Platform!',
        html: `
            <html>
                <head>
                    <style>
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            font-family: Arial, sans-serif;
                            border: 1px solid #ccc;
                            border-radius: 10px;
                        }
                        .logo {
                            display: block;
                            margin: 0 auto;
                            width: 200px;
                        }
                        .button {
                            display: inline-block;
                            padding: 10px 20px;
                            background-color: #007bff;
                            color: #fff;
                            text-decoration: none;
                            border-radius: 5px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <img src="https://th.bing.com/th?id=ORMS.74c6b9abdf846c014d655f55151c47bb&pid=Wdp&w=300&h=156&qlt=90&c=1&rs=1&dpr=1&p=0" alt="Company Logo" class="logo">
                        <h2>Welcome to Our Platform!</h2>
                        <p>Please confirm your email to activate your account.</p>
                        <a href="${activateLink}" class="button">Activate Account</a>
                    </div>
                </body>
            </html>
        `
    };


    const newUserVerification = await UserVerification.create({
        userId: _id,
        uniqueString,
        createdAt: Date.now(),
        expiresAt: Date.now() + 21600000

    })

    if (newUserVerification) {
        const sendMail = transporter.sendMail(mailOptions)

        // here is where u add th 

        if (sendMail) {
            res.status(200).json({
                message: 'pending',
                details: 'check ur mail'
            })
        } else {
            res.status(400)
            throw new Error('Failed to send mail')
        }

    } else {
        res.status(201)
        throw new Error('Cannot save user verification')

    }
}

import express from 'express'
const app = express()
const __dirname = path.resolve()
app.use(express.static(path.join(__dirname, 'backend/views')))

const checkMail = asyncHandler(async (req, res) => {
    let { userId, uniqueString } = req.params


    const checkUserId = await UserVerification.findOne({ userId })

    if (checkUserId) {
        // user verification exist
        if (checkUserId) {
            const expiresAt = checkUserId.expiresAt

            const hashedUniqueString = checkUserId.uniqueString



            if (expiresAt < Date.now()) {
                // this means that the account has expired
                const deleteUserVerification = await UserVerification.deleteOne({ userId })

                if (deleteUserVerification) {
                    // succeful delete user verification
                    const deleteUser = await User.deleteOne({ userId })

                    if (deleteUser) {
                        let message = 'Link has expired . Please register again'
                        return res.redirect(`http://localhost:5000/api/user/verify?error=true&message=${message}`)

                    } else {
                        let message = 'Delete user failed'
                        return res.redirect(`http://localhost:5000/api/user/verify?error=true&message=${message}`)
                    }

                } else {
                    //deleteUserVerification deletation error
                    let message = 'Delete  user verification failed'
                    return res.redirect(`http://localhost:5000/api/user/verify?error=true&message=${message}`)
                }

            } else {
                // the result has not yet expired, so we validate the user string

                const isMatch = await bcrypt.compare(uniqueString, hashedUniqueString);
                // compare the recieved string and and string

                if (isMatch) {
                    // update the user schema to verified = true

                    const updateUser = await User.updateOne({ _id: userId }, { verified: true })

                    if (updateUser) {
                        // delete the user verification
                        const deleteUserVerification = await UserVerification.deleteOne({ userId })

                        if (deleteUserVerification) {
                            // redirect the user to sign

                            res.send('Thanks for verifing your user verification')

                        } else {
                            let message = 'An error occured while deleting user verification'
                            return res.redirect(`http://localhost:5000/api/user/verify?error=true&message=${message}`)
                        }


                    } else {
                        let message = 'An Error occured while updating user details'
                        return res.redirect(`http://localhost:5000/api/user/verify?error=true&message=${message}`)
                    }




                } else {
                    // else send err
                    let message = 'This link is invalid, please check your inbox'
                    return res.redirect(`http://localhost:5000/api/user/verify?error=true&message=${message}`)

                }


            }






        } else {
            // user verification doesnt exist
            let message = 'Account record does not exist or has  used'
            return res.redirect(`http://localhost:5000/api/user/verify?error=true&message=${message}`)

        }

    } else {
        let message = 'this link has expired'
        return res.redirect(`http://localhost:5000/api/user/verify?error=true&message=${message}`)
    }

})



const verify = asyncHandler(async (req, res) => {
    res.sendFile(path.resolve(__dirname, 'backend', 'views', 'index.html'))
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
    logoutUser,
    checkMail,
    verify



}

