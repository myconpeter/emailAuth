import mongoose from "mongoose"
import bcrypt from "bcrypt"

const userVerificationSchema = mongoose.Schema({
    userId: String,
    uniqueString: String,
    createdAt: Date,

    expiresAt: Date,

}, {
    timestamps: true,
})

userVerificationSchema.pre('save', async function (next) {


    const salt = await bcrypt.genSalt(12)
    this.uniqueString = await bcrypt.hash(this.uniqueString, salt)
})

const UserVerification = mongoose.model('UserVerification', userVerificationSchema)

export default UserVerification