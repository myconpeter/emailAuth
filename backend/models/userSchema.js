import mongoose from "mongoose"
import bcrypt from "bcrypt"

const userSchema = mongoose.Schema({
    firstname: {
        type: String,
        require: true,

    },

    email: {
        type: String,
        require: true,
        unique: true

    },

    password: {
        type: String,
        require: true,

    },

    dateofbirth: {
        type: String,
        require: true,

    },

    verified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next
    }

    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.matchPassword = async function (enteredPassword) {
    // Compare the entered password with the stored hashed password
    const isMatch = await bcrypt.compare(enteredPassword, this.password);

    // If you want to return the hashed password, return it here
    return isMatch ? this.password : null;
}

const User = mongoose.model('User', userSchema)
export default User