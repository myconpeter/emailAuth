import User from '../models/userSchema.js'
import UserVerification from '../models/userVerification.js'

import asyncHandler from 'express-async-handler'
import generateToken from './generateToken.js'
import path from 'path'
import bcrypt from "bcrypt"


import nodemailer from 'nodemailer';

import express from 'express'
const app = express()
const __dirname = path.resolve()
app.use(express.static(path.join(__dirname, 'backend/views')))

import { sendVerifificationEmail } from '../email/confirmEmail.js'
app.use(sendVerifificationEmail)


import dotenv from 'dotenv'

dotenv.config()













// desc @Auth user / set Token
// route POST api/users/login
//@acess public


const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body
    const userExist = await User.findOne({ email })

    if (userExist && await (userExist.matchPassword(password))) {

        if (userExist.verified === false) {
            res.status(401)
            throw new Error('This Account is not verified yet')


        } else {
            generateToken(res, userExist)
            res.status(201).json({
                ...userExist._doc
            })
        }

    } else {
        res.status(401)
        throw new Error('Invalid Email or Password')
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
                            res.sendFile(path.resolve(__dirname, 'backend', 'views', 'index.html'))





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
    verify,




}

