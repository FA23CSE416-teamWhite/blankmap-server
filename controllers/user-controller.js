const User = require('../models/user-model');
const auth = require('../auth')

getUserById = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log("Find User with id: " + JSON.stringify(req.params.id));

    await User.findById({ _id: req.params.id }, (err, user) => {
        if (err) {
            return res.status(400).json({ success: false, error: err });
        }
        console.log("Found user: " + JSON.stringify(user));
        return res.status(200).json({ success: true, user: user })
    }).catch(err => console.log(err))
}
getUsers = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    await User.find({}, (err, users) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        if (!users.length) {
            return res
                .status(404)
                .json({ success: false, error: `Users not found` })
        }
        return res.status(200).json({ success: true, data: users })
    }).catch(err => console.log(err))
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
    getUserById,
    getUsers,
    updateUser,
}