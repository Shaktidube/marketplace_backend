const { body, param, query } = require('express-validator');


const validators = {};



validators.validateNftPagination = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page number must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
];

validators.validateNftById = [
    query('id').exists().withMessage('NFT ID is required in the query').isString().withMessage('NFT ID must be a string').trim().notEmpty().withMessage('NFT ID cannot be empty'),
];



module.exports = validators;
