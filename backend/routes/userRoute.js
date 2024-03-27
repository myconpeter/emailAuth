import express from "express";
import {
    loginUser,
    registerUser,
    checkMail,
    logoutUser,
    message

} from "../controllers/userController.js";


const router = express.Router()


router.post('/login', loginUser)


router.post('/register', registerUser)


router.post('/logout', logoutUser)


router.get('/verify/:userId/:uniqueString', checkMail)

router.get('/verify', message)

export default router