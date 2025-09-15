const { body } = require('express-validator');

const validators = {};

validators.connectWallet = [
    body('sWalletAddress').not().isEmpty().withMessage('Wallet Address is required'),
];

validators.verifyEmail = [
    body('sWalletAddress').not().isEmpty().withMessage('Wallet Address is required'),
    body('sEmail').not().isEmpty().isEmail().withMessage('email is required'),
];

validators.resendOtp = [
    body('sWalletAddress').not().isEmpty().withMessage('Wallet Address is required'),
    body('sEmail').not().isEmpty().isEmail().withMessage('email is required'),
];


validators.setUsername = [
    body('sWalletAddress').not().isEmpty().withMessage('Wallet Address is required'),
    body('sUsername').not().isEmpty().withMessage('Username is required'),
];



module.exports = validators;