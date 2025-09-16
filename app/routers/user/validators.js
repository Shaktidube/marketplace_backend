const { body, param, query } = require('express-validator');


const validators = {};



validators.validateNftPagination = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page number must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
];

validators.validateNftById = [
    query('id').exists().withMessage('NFT ID is required in the query').isString().withMessage('NFT ID must be a string').trim().notEmpty().withMessage('NFT ID cannot be empty'),
];

validators.uploadFile = [
    body('sFile').custom((value, { req }) => {
        if (!req.file) {
            throw new Error('File is required');
        }
        return true;
    }),
    body('sNFtName').exists().withMessage('NFT Name is required').isString().withMessage('NFT Name must be a string').trim().notEmpty().withMessage('NFT Name cannot be empty'),
    body('sNFtDescription').exists().withMessage('NFT Description is required').isString().withMessage('NFT Description must be a string').trim().notEmpty().withMessage('NFT Description cannot be empty'),
    body('nRoyalty').exists().withMessage('NFT Royalty is required').isFloat({ gt: -1 }).withMessage('NFT Royalty must be a number greater than or equal to 0'),
    body("sTokenAddress").exists().withMessage("Token Address is required").isString().withMessage("Token Address must be a string").trim().notEmpty().withMessage("Token Address cannot be empty"),
]

validators.updateNftById = [
    body('_id').exists().withMessage('NFT ID is required').isString().withMessage('NFT ID must be a string').trim().notEmpty().withMessage('NFT ID cannot be empty'),
]


module.exports = validators;
