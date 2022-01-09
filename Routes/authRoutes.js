import express from 'express'
import * as authController from '../Controllers/authController.js'

const router = express.Router()

router.post('/register', authController.register)
router.post('/login', authController.login)

export default router