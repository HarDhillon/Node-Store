const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');

const { validateEmail, validatePasswordLength, validatePasswordMatch, validateUserExists } = require('../middleware/validation-middleware')


router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', [validateUserExists], authController.postLogin);

router.post('/signup', [validateEmail, validatePasswordLength, validatePasswordMatch], authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset)

router.post('/reset', authController.postReset)

router.get('/reset/:token', authController.getNewPassword)

router.post('/new-password', authController.postNewPassword)


module.exports = router;