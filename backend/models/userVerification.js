import mongoose from "mongoose";

const userVerificationSchema = mongoose.Schema({
    userId: String,
    uniqueString: String,

    expiresAt: Date,

}, {
    timestamps: true,
})

const UserVerification = mongoose.model('UserVerification', userVerificationSchema)

export default UserVerification