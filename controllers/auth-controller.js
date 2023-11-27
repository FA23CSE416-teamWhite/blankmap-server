const auth = require('../auth')
const User = require('../models/user-model')
const bcrypt = require('bcryptjs')

getLoggedIn = async (req, res) => {
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
                maps: loggedInUser.maps,
                comments: loggedInUser.comments
            }
        })
    } catch (err) {
        console.log("err: " + err);
        res.json(false);
    }
}

getQuestion = async (req, res) => {
    try {
        console.log(req.params)
        const user = await User.findOne({ email: req.params.email });
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
        const expirationDate = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000));

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            expires: expirationDate
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
                maps: existingUser.maps,
                comments: existingUser.comments
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
                maps: savedUser.maps,
                comments: savedUser.comments
            }
        })

        console.log("token sent");

    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}
updateUser = async (req, res) => {
    const body = req.params
    console.log("updateUser: " + JSON.stringify(body));
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({
            success: false,
            errorMessage: 'You must provide a body to update',
        })
    }
    if(req.body.password){
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = await bcrypt.hash(req.body.password, salt);

        req.body.passwordHash = passwordHash
        delete req.body.password
    }
    console.log(JSON.stringify(req.body))
    User.updateOne(req.body.params,req.body)
    .then(() => {
        console.log("SUCCESS!!!");
        return res.status(200).json({
                success: true,
                id: User._id,
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
}

module.exports = {
    getLoggedIn,
    getQuestion,
    registerUser,
    loginUser,
    logoutUser,
    updateUser,
}