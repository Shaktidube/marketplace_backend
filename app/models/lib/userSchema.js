const mongoose = require("mongoose")


const userSchema = mongoose.Schema({
    sWalletAddress:{
        type:String,
        require:[true,"Wallet Address is required"],
        unique:true,
        trim:true,
    },
    sEmail:{
        type:String,
        trim:true,
    },
    sUserProfileImage:{
        type:String,
        default:"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",  
        trim:true,
    },
    nOtp:{
        type:Number,
    },
    nOtpExpiryTime: {
        type: Number,
        default: null,
    },
    isEmailVerified:{
        type:Boolean,
        default:false,
    },
    sToken:{
        type:String,
        default:null,
    },
    sUsername: {
        type: String,
        trim: true,
    }
},{timestamps:true})

const User = mongoose.model("users",userSchema)
module.exports = User;
