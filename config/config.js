require('dotenv').config();

const configObj = {
    PORT : process.env.PORT || 3000,
    TESTPORT : process.env.TESTPORT || 4000,
    DB_URL : process.env.DB_URL || 'mongodb://localhost:27017/DB_NAME',
    JWT_SECRET : process.env.JWT_SECRET || "SHAKTIdube1234560987",
    JWT_EXPIRES : process.env.JWT_EXPIRY || "1d",
    RPC_URL: process.env.RPC_URL || 'https://rpc-mumbai.maticvigil.com',

    MAIL_TRANSPORTER: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 465,
        auth: {
            user: process.env.SMTP_USERNAME || 'example@gmail.com',
            pass: process.env.SMTP_PASSWORD || 'example@123',
        },
        secure: true,
    },
    MAIL_FROM:process.env.MAIL_FROM || 'shaktidube04@gmail.com',
    WEB_URL:process.env.WEB_URL,
    FILE_SERVER_URL : process.env.FILE_SERVER_URL || 'http://localhost:3001',
    FILEBASE_ACCESS_KEY : process.env.FILEBASE_ACCESS_KEY || '',
    FILEBASE_SECRET_KEY : process.env.FILEBASE_SECRET_KEY || '',
    FILEBASE_REGION : process.env.FILEBASE_REGION || 'us-east-1',
    FILEBASE_BUCKET_NAME : process.env.FILEBASE_BUCKET_NAME || 'uniquenftcollection',
    API_Key : process.env.API_Key || '',
    API_Secret : process.env.API_Secret || '',
    PINATA_JWT : process.env.PINATA_JWT || '',
    GATEWAY_URL : process.env.GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs/',
    JSON_RPC_PROVIDER : process.env.JSON_RPC_PROVIDER || 'https://eth-sepolia.g.alchemy.com/v2/z5Ov46GoBzO8DAlvqvUJL4kYCrDZighr',
    PRIVATE_KEY : process.env.PRIVATE_KEY || '0xabc1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    MEDIA_CONTRACT_ADDRESS : process.env.MEDIA_CONTRACT_ADDRESS || '0x1444cb544527337747Fdb6Aa2F3E9e294864332f',
    MINT_CONTRACT_ADDRESS : process.env.MINT_CONTRACT_ADDRESS || '0x2FEF913071e24987443c484e8Aa11fD37fd0f3f9',
    MARKET_CONTRACT_ADDRESS : process.env.MARKET_CONTRACT_ADDRESS || '0xbcEA32169b9414b5d99dAa9EdFC1ADa18389303D',

};

module.exports = configObj;
