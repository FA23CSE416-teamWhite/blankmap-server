const express = require('express')
const router = express.Router()
const AuthController = require('../controllers/auth-controller')

router.post('/registers', AuthController.registerUser)
router.put('/logins', AuthController.loginUser)
router.get('/logout', AuthController.logoutUser)
router.get('/loggedIn', AuthController.getLoggedIn)

module.exports = router