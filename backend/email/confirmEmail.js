import transporter from './transporter.js'
import UserVerification from '../models/userVerification.js'
import { v4 as uuidv4 } from 'uuid';


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

export {
    sendVerifificationEmail
}