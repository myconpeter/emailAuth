import express from "express";
import dotenv from 'dotenv'
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

dotenv.config()

// the routes
import userRoute from './routes/userRoute.js'


// middleware

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";



const PORT = process.env.PORT || 3000;

const app = express()


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use('/api/user', userRoute)
app.use(notFound)
app.use(errorHandler)


app.get('/', (req, res) => (res.send('hello ')))






// MONGOOSE AND THE PORT

let mongoURL = ''

if (process.env.NODE_ENV === 'local') {
    console.log('local server')
    mongoURL = process.env.LOCAL_MONGO_URI

} else if (process.env.NODE_ENV === 'production') {
    console.log('production server')
    mongoURL = process.env.LOCAL_MONGO_URI
} else {
    console.log('not set correctly')
}

mongoose.connect(mongoURL)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`app is connected to ${PORT} and database ${mongoURL}`)
        })
    })
    .catch(err => (console.log(err)))


