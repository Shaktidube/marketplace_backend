const mongoose = require("mongoose")


const nftSchema = mongoose.Schema({

    sTokenAddress:{
        type: String,
        require: [true, "Token Address is required"],
        trim: true,
    },
    nTokenId : {
        type: Number,
        require: [true, "Token ID is required"],
        // unique: true,
        sparse:true
    },
    sNftName:{
        type: String,
        require: [true, "NFT Name is required"],
        trim: true,
    },
    nNftPrice:{
        type: String,
        require: [true, "NFT Price is required"],
        trim: true,
    },
    nRoyalty:{
        type: Number,
        require: [true, "Royalty is required"],
        trim: true,
    },
    sFirstMInterAddress:{
        type: String,
        require: [true, "First Minter Address is required"],
        trim: true,
    },
    sDescription:{
        type: String,
        require: [true, "NFT Description is required"],
        trim: true,
    },
    sImageUrl:{
        type: String,
        require: [true, "Image URL is required"],
        trim: true,
    },
    sTokenUri:{
        type: String,
        require: [true, "Token URI is required"],
        trim: true,
    }, 
    sCurrentOwner:{ 
        type: String,
        require: [true, "Current Owner is required"],
        trim: true,
    },
    isApprovedForSale:{
        type: Boolean,
        default: false,
    },
},{timestamps:true})

const Nft = mongoose.model("nfts",nftSchema)
module.exports = Nft;
