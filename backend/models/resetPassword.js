import mongoose from "mongoose";
import bcrypt from 'bcrypt'

const resetPasswordSchema = mongoose.Schema({
    userId: String,
    resetString: String,
    createdAt: Date,
    expiresAt: Date,

}, { timestamps: true })

resetPasswordSchema.pre('save', async function (next) {


    const salt = await bcrypt.genSalt(12)
    this.resetString = await bcrypt.hash(this.resetString, salt)
})

resetPasswordSchema.methods.matchPassword = async function (hashedResetString) {
    // Compare the entered password with the stored hashed password
    const isMatch = await bcrypt.compare(hashedResetString, this.resetString);

    // If you want to return the hashed password, return it here
    return isMatch ? this.hashedResetString : null;
}

const PasswordReset = mongoose.model('PasswordReset', resetPasswordSchema)

export default PasswordReset