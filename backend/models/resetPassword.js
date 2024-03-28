import mongoose from "mongoose";

const resetPasswordSchema = mongoose.Schema({
    userId: String,
    resetString: String,
    createdAt: Date,
    expiresAt: Date,

}, { timestamps: true })

resetPasswordSchema.pre('save', async function (next) {


    const salt = await bcrypt.genSalt(12)
    this.uniqueString = await bcrypt.hash(this.uniqueString, salt)
})

const PasswordReset = mongoose.model('PasswordReset', resetPasswordSchema)

export default PasswordReset