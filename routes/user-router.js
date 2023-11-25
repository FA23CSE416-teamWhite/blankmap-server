const express = require('express')
const router = express.Router()
const UserController = require('../controllers/user-controller')
const auth = require('../auth')

router.put('/user/:id', auth.verify, UserController.updateUser)
router.get('/user/:id', auth.verify, UserController.getUserById)
router.get('/users', auth.verify, UserController.getUsers)

module.exports = router