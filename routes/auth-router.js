const express = require('express')
const router = express.Router()
const AuthController = require('../controllers/auth-controller')

router.put()
router.post()
router.get()
router.delete('/loggedIn', AuthController.getLoggedIn)

module.exports = router