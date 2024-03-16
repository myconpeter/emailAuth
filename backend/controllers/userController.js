import User from '../models/userSchema.js'
import UserVerification from '../models/userVerification.js'
import asyncHandler from 'express-async-handler'
import generateToken from './generateToken.js'


import nodemailer from 'nodemailer';
import { config } from 'dotenv'; // Assuming you're using dotenv for environment variables

// Load environment variables from a .env file
config();

// Create a transporter using Gmail SMTP
let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASSWORD
    }
});

// Verify transporter setup
transporter.verify((error, success) => {
    if (error) {
        console.error('Transporter verification error:', error);
    } else {
        console.log('Transporter ready to send emails');
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
        dateofbirth
    })

    if (createdUser) {
        generateToken(res, createdUser)
        res.json({
            id: createdUser._id,
            name: createdUser.name,
            email: createdUser.email,
            dateofbirth: createdUser.dateofbirth,
            password: createdUser.password
        }).status(201)
    } else {
        res.status(401)
        throw new Error('Resoure not found')

    }


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

