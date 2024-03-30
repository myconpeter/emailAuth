import User from '../models/userSchema.js'
import PasswordReset from '../models/resetPassword.js'
import asyncHandler from 'express-async-handler'
import path from 'path'
import bcrypt from "bcrypt"


import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

import dotenv from 'dotenv'

dotenv.config()

import express from 'express'
const app = express()
const __dirname = path.resolve()
app.use(express.static(path.join(__dirname, 'backend/views')))



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

//////////////////////////////////////////////////////////////////////////////////////RESET PASSWORD////////////////////////////////////////////////////////////////////////////////////// 
// desc @Reset password
// route POST to 
//@acess private

const sendResetPasswordEmail = async ({ _id, email }, res) => {
    const currentUrl = 'http://localhost:5000'; // Replace with your website URL
    const resetString = uuidv4() + _id
    const activateLink = `${currentUrl}/api/user/reset/${_id}/${resetString}`;


    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: 'YOU wanna reset ur password!',
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
                        <h2>RESET UR PASSWORD !</h2>
                        <p>Please RESET  your PASSWORD account.</p>
                        <a href="${activateLink}" class="button">RESET Password</a>
                    </div>
                </body>
            </html>
        `
    };


    const resetPassword = await PasswordReset.create({
        userId: _id,
        resetString,
        createdAt: Date.now(),
        expiresAt: Date.now() + (10 * 5 * 60 * 1000)

    })

    if (resetPassword) {
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

const resetPassword = asyncHandler(async (req, res) => {
    const { email } = req.body

    const user = await User.findOne({ email })

    if (user) {
        sendResetPasswordEmail(user, res)

    } else {
        res.status(401)
        throw new Error('email not found')
    }
})

app.use(express.static(path.join(__dirname, 'backend/views')))

const checkPasswordLink = asyncHandler(async (req, res) => {
    let { userId, resetString } = req.params



    const checkUserId = await PasswordReset.findOne({ userId })

    if (checkUserId) {
        // user verification exist
        if (checkUserId) {
            const expiresAt = checkUserId.expiresAt

            const hashedResetString = checkUserId.resetString



            if (expiresAt < Date.now()) {
                // this means that the account has expired
                const deleteDatabasePassword = await PasswordReset.deleteOne({ userId })

                if (deleteDatabasePassword) {
                    // succeful delete user verification
                    let message = 'Password Link has expired . Please reset  your password again.'
                    return res.redirect(`http://localhost:5000/api/user/verify?error=true&message=${message}`)



                } else {
                    //deleteUserVerification deletation error
                    let message = 'Delete  Database Password failed'
                    return res.redirect(`http://localhost:5000/api/user/verify?error=true&message=${message}`)
                }

            } else {
                // the result has not yet expired, so we validate the user string

                const isMatch = await bcrypt.compare(resetString, hashedResetString);

                // compare the recieved string and hashedstring

                if (isMatch) {
                    res.sendFile(path.resolve(__dirname, 'backend', 'views', 'form.html'))

                } else {
                    let message = 'This password reset link does not match'
                    return res.redirect(`http://localhost:5000/api/user/verify?error=true&message=${message}`)


                }
            }
        } else {
            // user verification doesnt exist
            let message = 'This password userId doesnt exist'
            return res.redirect(`http://localhost:5000/api/user/verify?error=true&message=${message}`)
        }
    } else {
        let message = 'this password does not even exist'
        return res.redirect(`http://localhost:5000/api/user/verify?error=true&message=${message}`)
    }
})






const reset = asyncHandler(async (req, res) => {


    res.sendFile(path.resolve(__dirname, 'backend', 'views', 'form.html'))
})

// desc @Reset password
// route POST to  api/user/changePassword
//@acess public


const changePassword = asyncHandler(async (req, res) => {
    const { password, confirmPassword, userId, resetString } = req.body



    const checkId = await PasswordReset.findOne({ userId })
    if (checkId) {
        if (checkId.expiresAt < Date.now) {
            // it has expired 
            const deleteReset = await PasswordReset.deleteOne({ userId })

            if (deleteReset) {
                // password reset hasd beeen removesd
            } else {
                res.status(401)
                throw new Error('Cant delete this password')
            }

        } {
            // it hasnt expired
            // now compare strings
            const confirm = bcrypt.compare(resetString, checkId.resetString)

            if (confirm) {
                // passwords match
                // compare both password

                if (password === confirmPassword) {
                    //  check user u want to update
                    const updatedUser = await User.findOne({ _id: userId })
                    if (updatedUser) {
                        updatedUser.password = password

                        const updatedPassword = await updatedUser.save();
                        if (updatedPassword) {
                            const deletePassword = PasswordReset.deleteOne({ userId })
                            if (deletePassword) {
                                res.status(200)
                                return res.json({ updatedPassword })
                            } else {
                                res.status(401)
                                throw new Error('Cannot delete email or password')
                            }
                        }

                    } else {
                        res.status(401)
                        throw new Error(`User not found`)
                    }
                } else {
                    res.status(401)
                    throw new Error("Passwords do not  match")

                }


            } else {
                res.status(401)
                throw new Error('This  is not the correct string')
            }

        }

    } else {
        res.status(401)
        throw new Error('invalid User id')
    }




    // check if this user exist
    // const user = await User.findOne({ userId })
    // if (user) {
    //     console.log(user + ' ' + "micheal")
    // }
    // else {
    //     res.status(401)
    //     throw new Error('this user doesnt exist')
    // }

    res.send('password')
})

export {
    reset,
    resetPassword,
    checkPasswordLink,
    changePassword
}