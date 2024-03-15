import User from '../models/userSchema.js'



// desc @Auth user / set Token
// route POST api/users/login
//@acess public


const loginUser = async (req, res) => {


    res.json('').status(200)
}


// desc @register user / set Token
// route POST api/users/register
//@acess public


const registerUser = async (req, res) => {
    const { name, email, password, dateofbirth } = req.body

    const userExist = await User.findOne({ email })

    if (userExist) {
        res.status(400)
        throw new Error('This User Already Exist')

    }

    const createdUser = await User.create({
        name,
        password,
        email,
        dateofbirth
    })

    if (createdUser) {
        res.json({
            id: createdUser._id,
            name: createdUser.name,
            email: createdUser.email,
            dateofbirth: createdUser.dateofbirth
        }).status(201)
    } else {
        res.status(401)
        throw new Error('Resoure not found')

    }


}


// export all const

export {
    loginUser,
    registerUser
}

