import User from '../models/userSchema.js'
import PasswordReset from '../models/resetPassword.js'
import asyncHandler from 'express-async-handler'
import path from 'path'
import bcrypt from "bcrypt"

import { sendResetPasswordEmail } from '../email/resetPasswordEmail.js'







import dotenv from 'dotenv'

dotenv.config()

import express from 'express'
const app = express()
const __dirname = path.resolve()
app.use(express.static(path.join(__dirname, 'backend/views')))

app.use(sendResetPasswordEmail)

import nodemailer from 'nodemailer';

// Create a transporter using Gmail SMTP







//////////////////////////////////////////////////////////////////////////////////////RESET PASSWORD////////////////////////////////////////////////////////////////////////////////////// 
// desc @Reset password
// route POST to 
//@acess private





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
                    let message = 'This password reset link does not match 00'
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
            const confirm = await bcrypt.compare(resetString, checkId.resetString)



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