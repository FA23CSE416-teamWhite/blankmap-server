const auth = require('../auth')
const User = require('../models/user-model')
const bcrypt = require('bcryptjs')

getLoggedIn = async (req, res) => {
    console.log("HI")
    try {
        let userId = auth.verifyUser(req);
        if (!userId) {
            return res.status(200).json({
                loggedIn: false,
                user: null,
                errorMessage: "?"
            })
        }

        const loggedInUser = await User.findOne({ _id: userId });
        console.log("loggedInUser: " + loggedInUser);

        return res.status(200).json({
            loggedIn: true,
            user: {
                firstName: loggedInUser.firstName,
                lastName: loggedInUser.lastName,
                email: loggedInUser.email,
                userName: loggedInUser.userName,
                dateJoined: loggedInUser.dateJoined,
                phone: loggedInUser.phone,
                bio: loggedInUser.bio,
                mapLength: loggedInUser.maps.length
            }
        })
    } catch (err) {
        console.log("err: " + err);
        res.json(false);
    }
}

getQuestion = async (req, res) => {
    try {
        console.log(req)
        const user = await User.findOne({ email: req.email });
        if(!user){
            return res
                .status(401)
                .json({
                    success: false,
                    errorMessage: "No user found."
                })
        }

        return res.status(200).json({
            question: user.recoveryQuestion,
            answer: user.recoveryAnswer
        })
    } catch (err) {
        console.log("err: " + err);
        res.json(false);
    }
}

loginUser = async (req, res) => {
    console.log("loginUser");
    try {
        const { userName, password } = req.body;
        console.log(userName)
        console.log(password)
        if (!userName || !password) {
            return res
                .status(400)
                .json({ errorMessage: "Please enter all required fields." });
        }

        const existingUser = await User.findOne({ userName: userName });
        console.log("existingUser: " + existingUser);
        if (!existingUser) {
            return res
                .status(401)
                .json({
                    errorMessage: "Wrong username or password provided."
                })
        }

        console.log("provided password: " + password);
        const passwordCorrect = await bcrypt.compare(password, existingUser.passwordHash);
        if (!passwordCorrect) {
            console.log("Incorrect password");
            return res
                .status(401)
                .json({
                    errorMessage: "Wrong username or password provided."
                })
        }

        // LOGIN THE USER
        const token = auth.signToken(existingUser._id);
        console.log(token);

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: false
        }).status(200).json({
            success: true,
            user: {
                firstName: existingUser.firstName,
                lastName: existingUser.lastName,  
                email: existingUser.email,
                userName: existingUser.userName,
                dateJoined: existingUser.dateJoined,
                phone: existingUser.phone,
                bio: existingUser.bio,
                mapLength: existingUser.maps.length
            }
        })

    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}

logoutUser = async (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        secure: true,
        sameSite: "none"
    }).send();
}

registerUser = async (req, res) => {
    console.log("REGISTERING USER IN BACKEND");
    try {
        const { firstName, lastName, email, userName, password, passwordVerify,recoveryQuestion,recoveryAnswer } = req.body;
        console.log("create user: " + firstName + " " + lastName + " " + email + " " + userName + " " + password + " " + passwordVerify+" " + recoveryQuestion+ " " + recoveryAnswer);
        if (!firstName || !lastName || !email || !userName || !password || !passwordVerify||!recoveryQuestion ||!recoveryAnswer) {
            return res
                .status(400)
                .json({ errorMessage: "Please enter all required fields." });
        }
        console.log("all fields provided");
        if (password.length < 8) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter a password of at least 8 characters."
                });
        }
        console.log("password long enough");
        if (password !== passwordVerify) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter the same password twice."
                })
        }
        console.log("password and password verify match");
        const existingUser = await User.findOne({ email: email });
        console.log("existingUser: " + existingUser);
        if (existingUser) {
            return res
                .status(400)
                .json({
                    success: false,
                    errorMessage: "An account with this email address already exists."
                })
        }

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = await bcrypt.hash(password, salt);
        console.log("passwordHash: " + passwordHash);

        const newUser = new User({firstName, lastName, email, userName, passwordHash,recoveryQuestion,recoveryAnswer});
        const savedUser = await newUser.save();
        console.log("new user saved: " + savedUser._id);

        // LOGIN THE USER
        const token = auth.signToken(savedUser._id);
        console.log("token:" + token);

        await res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        }).status(200).json({
            success: true,
            user: {
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,  
                email: savedUser.email,
                userName: savedUser.userName,
                dateJoined: savedUser.dateJoined,
                phone: savedUser.phone,
                bio: savedUser.bio,
                mapLength: savedUser.maps.length             
            }
        })

        console.log("token sent");

    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}
updateUser = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    const body = req.body
    console.log("updateUser: " + JSON.stringify(body));
    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a body to update',
        })
    }
    User.findOne({ _id: req.params.id }, (err, user) => {
        console.log("user found: " + JSON.stringify(user));
        if (err) {
            return res.status(404).json({
                err,
                message: 'User not found!',
            })
        }
        // add other user properties if needed to be updated
        user.firstName = body.user.firstName
        user.lastName = body.user.lastName
        user.email = body.user.email
        user.userName = body.user.userName
        user.maps = body.user.maps
        user.phone = body.user.phone
        user.bio = body.user.bio
        user
            .save()
            .then(() => {
                console.log("SUCCESS!!!");
                return res.status(200).json({
                        success: true,
                        id: user._id,
                        message: 'User updated!',
                })
            })
            .catch(error => {
                console.log("FAILURE: " + JSON.stringify(error));
                return res.status(404).json({
                    error,
                    message: 'User not updated!',
                })
            })
    })
}
module.exports = {
    getLoggedIn,
    getQuestion,
    registerUser,
    loginUser,
    logoutUser,
    updateUser,
}