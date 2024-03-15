import mongoose from "mongoose"
import bcrypt from "bcrypt"

const userSchema = mongoose.Schema({
    name: {
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

    }
}, {
    timestamps: true
})

const User = mongoose.model('User', userSchema)
export default User