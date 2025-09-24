
// const configObj = require("../../../config/config");
const pinata = require("../../../globals/lib/pinata");
// const s3 = require("../../../globals/lib/s3Client");
const {  User } = require("../../models");
const fs = require("fs");
const {Blob} = require("buffer");
const Nft = require("../../models/lib/nftSchema");
const { validationResult } = require("express-validator");
// const { GetObjectCommand , S3Client} = require("@aws-sdk/client-s3")

const controllers = {};

controllers.getProfile = async (req, res) => {
  try {
    const sToken = req.headers.authorization?.split(" ")[1];

    const oUser = await User.findOne(
      { sToken },
      { _id: 0  , nOtp: 0}
    );
    if (!oUser) {
      return res.reply(messages.not_found("User not found"));
    }
    return res.reply(messages.successfully("User profile retrieved"), {sWalletAddress: oUser.sWalletAddress, sEmail: oUser.sEmail, sToken: oUser.sToken, sUsername: oUser.sUsername || "", isVerified: oUser.isEmailVerified , sUserProfileImage: oUser.sUserProfileImage});
  } catch (error) {
    return res.reply(messages.server_error(`${error}`));
  }
};

controllers.uploadFile = async (req, res) => {
      try {  
        const { sNftName, sDescription , nRoyalty , sTokenAddress } = req.body;
    
        console.log("nRoyalty is :" , nRoyalty);
    
        const photo_path = req.file ? req.file.path : null;
        if (!req.file) {
          return res.reply(messages.unprocessable_entity("Please upload a file"));
        }
        
        const responseData = {
          file: req.file?.originalname,
          url: `${photo_path}`,
        };
    
        // upload on filebase
        // if(responseData.url){
        //   const path = responseData.url
        //   const commandGetObject = new GetObjectCommand({
        //     Bucket: configObj.FILEBASE_BUCKET_NAME,
        //     Key: path,
        //   });
        //   const response = await s3.send(commandGetObject);
        //   responseData.url = `ipfs://${response.Metadata?.cid}`;
        // }
        
        // upload image on pinata 
        const blob = new Blob([fs.readFileSync(photo_path)]);
        const file = new File([blob], responseData.file, { type: req.file.mimetype })
        const upload = await pinata.upload.public.file(file);
        console.log("File uploaded to Pinata:", upload);
        responseData.url = `https://gateway.pinata.cloud/ipfs/${upload.cid}`;
    
        const sImageUrlExists = await Nft.findOne({ sImageUrl: responseData.url });
        if (sImageUrlExists) {
          return res.reply(messages.already_exists("Image"));
        }
    
        // upload metadata on pinata
        const metadata = {
          name: sNftName,
          description: sDescription,
          image: responseData.url,
          Royalty : nRoyalty,
          TokenAddress: sTokenAddress
        };
        
        const metadataBlob = new Blob([JSON.stringify(metadata)], { type: "application/json" });
        const metadataFile = new File([metadataBlob], `${sNftName}.json`, { type: "application/json" });
        const metadataUpload = await pinata.upload.public.file(metadataFile);
        console.log("Metadata uploaded to Pinata:", metadataUpload);
    
        return res.reply(messages.successfully("File uploaded successfully"), { sTokenAddress: metadata.TokenAddress, sNftName : metadata.name , sDescription: metadata.description, sImageUrl: responseData.url, sMetadataUrl: `https://gateway.pinata.cloud/ipfs/${metadataUpload.cid}` });
      } catch (error) {
        return res.reply(messages.server_error(`${error}`), error);
      } finally {
      if (req.file?.path) {
        fs.unlinkSync(req.file.path);
        console.log("Temporary file deleted:", req.file.path);
      }
    }

};

controllers.updateUserProfileImage = async (req, res) => {
  try {
    const sToken = req.headers.authorization?.split(" ")[1];

    const photo_path = req.file ? req.file.path : null;
    if (!req.file) {
      return res.reply(messages.unprocessable_entity("Please upload a file"));
    }

    const oUser = await User.findOne({ sToken });
    if (!oUser) {
      return res.reply(messages.not_found("User not found"));
    }

    const blob = new Blob([fs.readFileSync(photo_path)]);
    const file = new File([blob], req.file.originalname, { type: req.file.mimetype });
    const upload = await pinata.upload.public.file(file);
    console.log("File uploaded to Pinata:", upload);

    oUser.sUserProfileImage = `https://gateway.pinata.cloud/ipfs/${upload.cid}`;
    await oUser.save();

    return res.reply(messages.successfully("Profile image updated successfully"), { sUserProfileImage: oUser.sUserProfileImage  , sUsername: oUser.sUsername || "" , sEmail: oUser.sEmail, sWalletAddress: oUser.sWalletAddress, isVerified: oUser.isEmailVerified });
  } catch (error) {
    return res.reply(messages.server_error(`${error}`), error);
  } finally {
    if (req.file?.path) {
      fs.unlinkSync(req.file.path);
      console.log("Temporary file deleted:", req.file.path);
    }
  }
};

controllers.getYourNfts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;


    const sToken = req.headers.authorization?.split(" ")[1];
    if (!sToken) {
      return res.reply(messages.unauthorized("Token is required"));
    }
    const oUser = await User.findOne({ sToken });
    if (!oUser) {
      return res.reply(messages.not_found("User"));
    }

    const nfts = await Nft.find({ sCurrentOwner: oUser.sWalletAddress })
    .sort({ updatedAt: -1 }) 
      .skip(skip)
      .limit(limit).select(" -sDescription -sTokenUri -__v");

    if( nfts.length === 0){
      return res.reply(messages.no_prefix("nfts not found") , {
        nfts: nfts,
        page: page,
        totalPages: Math.ceil(await Nft.countDocuments({ sCurrentOwner: oUser.sWalletAddress }) / limit),
        totalNfts: await Nft.countDocuments({ sCurrentOwner: oUser.sWalletAddress }),
      });
    }

    return res.reply(messages.successfully("NFTs retrieved"), {
      nfts: nfts,
      page: page,
      totalPages: Math.ceil(await Nft.countDocuments({ sCurrentOwner: oUser.sWalletAddress }) / limit),
      totalNfts: await Nft.countDocuments({ sCurrentOwner: oUser.sWalletAddress }),
    });
  } catch (error) {
    return res.reply(messages.server_error(`${error}`), error);
  }
};  

controllers.getAllNfts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const sortOrder = parseInt(req.query.sortOrder) || 1; 
    const sortField = req.query.sortField || 'sNftName';
    const skip = (page - 1) * limit;

    // const searchQuery = search
    //   ? {
    //       $or: [
    //         { sNftName: { $regex: search, $options: 'i' } },
    //         { nNftDescription: { $regex: search, $options: 'i' } },
    //       ],
    //     }
    //   : {};

    // const pipeline = [
    //   {
    //     $match: searchQuery
    //   },
    //   {
    //     $addFields: {
    //       effectivePrice: {
    //         $cond: {
    //           if: { $gt: ["$oAuctionDetails.nHighestBid", "0"] }, 
    //           then: { $toDouble: "$oAuctionDetails.nHighestBid" },
    //           else: {
    //             $cond: {
    //               if: { $gt: ["$nNftPrice", "0"] }, 
    //               then: { $toDouble: "$nNftPrice" },
    //               else: { $toDouble: "$oAuctionDetails.nBasePrice" }, 
    //             },
    //           },
    //         },
    //       },
    //     },
    //   },
    //   // Sort based on sortField
    //   {
    //     $sort: {
    //       [sortField === 'price' ? 'effectivePrice' : sortField]: sortOrder,
    //     },
    //   },
    //   // Skip and limit for pagination
    //   { $skip: skip },
    //   { $limit: limit },
    //   // Project to exclude unwanted fields
    //   {
    //     $project: {
    //       sFromAddress: 0,
    //       sEventName: 0,
    //       sDescription: 0,
    //       sTokenUri: 0,
    //       createdAt: 0,
    //       updatedAt: 0,
    //       __v: 0,
    //       effectivePrice: 0,
    //     },
    //   },
    // ];

    const nfts = await Nft.find({}).sort({ updatedAt: -1 }).skip(skip).limit(limit);

    const totalNfts = await Nft.countDocuments();

    const totalPages = Math.ceil(totalNfts / limit);

    if (nfts.length === 0) {
      return res.reply(messages.not_found("NFTs"), {
        nfts,
        page,
        totalPages,
        totalNfts,
      });
    }

    return res.reply(messages.successfully("NFTs retrieved"), {
      nfts,
      page,
      totalPages,
      totalNfts,
    });
  } catch (error) {
    return res.reply(messages.server_error(`${error}`), error);
  }
};

controllers.getNftById = async (req, res) => {
  try {
    const nftId = req.query.id;
    if (!nftId) {
      return res.reply(messages.bad_request("NFT ID is required"));
    }

    const nft = await Nft.findById(nftId).select("-sFromAddress -sEventName -createdAt -updatedAt -__v");
    if (!nft) {
      return res.reply(messages.not_found("NFT not found"));
    }

    return res.reply(messages.successfully("NFT retrieved"), { nft });
  } catch (error) {
    return res.reply(messages.server_error(`${error}`), error);
  }
};

controllers.updateNftById = async (req, res) => {
  try {
    const { _id } = req.body;
    console.log("Updating NFT with ID:", _id);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.reply(messages.unprocessable_entity("Validation errors"), { errors: errors.array() });
    }

    if (!_id) {
      return res.reply(messages.bad_request("NFT ID is required"));
    }

    const oNft = await Nft.findById({_id});
    if (!oNft) {
      return res.reply(messages.not_found("NFT not found"));
    }

    oNft.isApprovedForSale = false;
    await oNft.save();

    return res.reply(messages.successfully("NFT updated successfully"), { oNft });
  } catch (error) {
    return res.reply(messages.server_error(`${error}`), error);
  }
}

controllers.liveSelllNfts = async(req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalNfts = await Nft.countDocuments({ isApprovedForSale: true });

    const nfts = await Nft.find({ isApprovedForSale: true })
    .sort({ updatedAt: -1 })  
      .skip(skip)
      .limit(limit).select("-sDescription -sTokenUri -createdAt -updatedAt -__v");

    const totalPages = Math.ceil(totalNfts / limit);

    if( nfts.length === 0){
      return res.reply(messages.not_found("NFTS") , {
        nfts: nfts,
        page: page,
        totalPages: totalPages,
        totalNfts: totalNfts,
      });
    }

    return res.reply(messages.successfully("NFTs retrieved"), {
      nfts: nfts,
      page: page,
      totalPages: totalPages,
      totalNfts: totalNfts,
    });
  } catch (error) {
    return res.reply(messages.server_error(`${error}`), error);
  }
}

module.exports = controllers; 
