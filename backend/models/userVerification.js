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


userVerificationSchema.methods.matchPassword = async function (hashedUniqueSrting) {
    // Compare the entered password with the stored hashed password
    const isMatch = await bcrypt.compare(hashedUniqueSrting, this.uniqueString);

    // If you want to return the hashed password, return it here
    return isMatch ? this.hashedUniqueSrting : null;
}

const UserVerification = mongoose.model('UserVerification', userVerificationSchema)

export default UserVerification