const express = require("express");
const controllers = require("./controllers");
const verifyToken = require("../../middleware/auth");
const authorizeRoles = require("../../middleware/roleMiddleware");
const validators = require("./validators");
const upload = require("../../utils/lib/multer");


const userRouters = express.Router();

userRouters.get('/get-profile',verifyToken,controllers.getProfile);
userRouters.post('/upload-nft-file', upload.single("sFile"), verifyToken , validators.uploadFile, controllers.uploadFile);
userRouters.patch("/update-profile-image",upload.single("sFile"),   verifyToken , controllers.updateUserProfileImage);
userRouters.get("/get-your-nfts", verifyToken, validators.validateNftPagination,controllers.getYourNfts);
userRouters.get("/get-all-nfts"   ,validators.validateNftPagination, controllers.getAllNfts);
userRouters.get("/buy-sell"   , validators.validateNftPagination, controllers.liveSelllNfts);
userRouters.get("/nft-detail" , verifyToken , validators.validateNftById, controllers.getNftById);
userRouters.patch("/update-nft", verifyToken, validators.updateNftById, controllers.updateNftById);


module.exports = userRouters;