import express from "express";
import {
    loginUser,
    registerUser,
    checkMail,
    logoutUser,
    verify,

} from "../controllers/userController.js";

import {
    resetPassword,
    checkPasswordLink,
    reset,
    changePassword

} from '../controllers/resetPassword.js'


const router = express.Router()


router.post('/login', loginUser)


router.post('/register', registerUser)


router.post('/logout', logoutUser)


router.get('/verify/:userId/:uniqueString', checkMail)
router.get('/reset/:userId/:resetString', checkPasswordLink)

router.get('/verify', verify)
router.get('/reset', reset)
router.post('/resetPassword', resetPassword)
router.post('/changePassword', changePassword)

export default router