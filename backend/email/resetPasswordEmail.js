
import { v4 as uuidv4 } from 'uuid';
import PasswordReset from '../models/resetPassword.js'
import transporter from './transporter.js'

/////////////////////////////////////////////////////////////////////////////////////////////////

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

export {
    sendResetPasswordEmail
}
