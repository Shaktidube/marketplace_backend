const { body } = require('express-validator');

const validators = {};

validators.connectWallet = [
    body('sWalletAddress').not().isEmpty().withMessage('Wallet Address is required'),
];

validators.verifyEmail = [
    body('sWalletAddress').not().isEmpty().withMessage('Wallet Address is required'),
    body('sEmail').not().isEmpty().isEmail().withMessage('email is required'),
];

validators.verifyOtp = [
    body('sWalletAddress').not().isEmpty().withMessage('Wallet Address is required'),
    body('sEmail').not().isEmpty().isEmail().withMessage('email is required'),
    body('nOtp').not().isEmpty().isInt().withMessage('OTP is required and must be a number'),
];

validators.resendOtp = [
    body('sWalletAddress').not().isEmpty().withMessage('Wallet Address is required'),
    body('sEmail').not().isEmpty().isEmail().withMessage('email is required'),
];

validators.setUsername = [
    body('sWalletAddress').not().isEmpty().withMessage('Wallet Address is required'),
    body('sUsername').not().isEmpty().withMessage('Username is required').isLength({ min: 1 }).withMessage('Username must be at least 1 characters long'),
];



module.exports = validators;