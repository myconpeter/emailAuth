import express from "express";
import {
    loginUser,
    registerUser,
    checkMail,
    logoutUser,
    verify,
    resetPassword,
    checkPasswordLink,
    reset

} from "../controllers/userController.js";


const router = express.Router()


router.post('/login', loginUser)


router.post('/register', registerUser)


router.post('/logout', logoutUser)


router.get('/verify/:userId/:uniqueString', checkMail)
router.get('/reset/:userId/:uniqueString', checkPasswordLink)

router.get('/verify', verify)
router.get('/reset', reset)
router.post('/resetPassword', resetPassword)

export default router