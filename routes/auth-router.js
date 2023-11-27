const express = require('express')
const router = express.Router()
const AuthController = require('../controllers/auth-controller')

router.post('/register', AuthController.registerUser)
router.post('/login', AuthController.loginUser)
router.post('/update', AuthController.updateUser)
router.post('/reset', AuthController.updateUser)
router.get('/logout', AuthController.logoutUser)
router.get('/loggedIn', AuthController.getLoggedIn)
router.get('/question/:email', AuthController.getQuestion)
router.get('/update', AuthController.updateUser)

module.exports = router