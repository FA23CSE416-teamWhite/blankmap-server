const express = require('express')
const router = express.Router()
const AuthController = require('../controllers/auth-controller')

router.post('/register')
router.post('/login', AuthController.loginUser)
router.get('/logout', AuthController.logoutUser)
router.get('/loggedIn', AuthController.getLoggedIn)

module.exports = router