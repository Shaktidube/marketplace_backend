const { User } = require("../../models");
const jwt = require("jsonwebtoken");
const configObj = require("../../../config/config");
const { validationResult } = require("express-validator");
const services = require("../../utils/lib/nodemailer");

const Controller = {};

const signJWTForUser = function (user) {
  return jwt.sign(
    {
      sEmail: user.sEmail,
      sWalletAddress:user.sWalletAddress,
    },
    configObj.JWT_SECRET,
    {
      expiresIn: configObj.JWT_EXPIRES,
    }
  );
};

Controller.ConnectWallet = async(req,res) => {
  try {
    const { sWalletAddress } = req.body;

    console.log("Received sWalletAddress:", sWalletAddress, typeof sWalletAddress);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.reply(messages.unprocessable_entity(), {
        errors: errors.array(),
      });
    }

    const sToken = signJWTForUser({ sWalletAddress });

    const oExistingUser = await User.findOne({ sWalletAddress });
    if (oExistingUser) {
      oExistingUser.sToken = sToken;
      await oExistingUser.save();
      return res.reply(messages.successfully("Wallet connected"), {sWalletAddress: oExistingUser.sWalletAddress, sToken: oExistingUser.sToken , isVerified: oExistingUser.isEmailVerified , sEmail: oExistingUser.sEmail , sUsername : oExistingUser.sUsername , sUserProfileImage: oExistingUser.sUserProfileImage });
    }

    console.log("Generated token:", sToken, typeof sToken); 
    const newUser = new User({
      sWalletAddress,
      sToken,
      sUserProfileImage: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
    });

    await newUser.save();

    return res.reply(messages.successfully("Wallet connected") , { sWalletAddress: newUser.sWalletAddress , sToken: newUser.sToken , isVerified: newUser.isEmailVerified , sEmail: newUser.sEmail  ,  sUsername : newUser.sUsername || "" , sUserProfileImage: newUser.sUserProfileImage });
  } catch (error) {
    return res.reply(messages.server_error(`${error}`));
  }
}

Controller.verifyEmail = async (req, res) => {
  try {

    let { sWalletAddress , sEmail } = req.body;

    if (sWalletAddress && typeof sWalletAddress === 'object' && sWalletAddress.sEmail && sWalletAddress.sWalletAddress) {
      sEmail = sWalletAddress.sEmail;
      sWalletAddress = sWalletAddress.sWalletAddress;
    }

    console.log("Received sWalletAddress:", sWalletAddress, typeof sWalletAddress);
    console.log("Received sEmail:", sEmail, typeof sEmail);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.reply(messages.unprocessable_entity(), {
        errors: errors.array(),
      });
    }

    const oExistingUser = await User.findOne({ sWalletAddress }).select("-createdAt -updatedAt -__v");
    if (!oExistingUser) {
      return res.reply(messages.not_found("User"));
    }
    if (oExistingUser.isEmailVerified) {
      return res.reply(messages.already_exists("user"), oExistingUser);
    }

    const emailExists = await User.findOne({
      $or: [{ sEmail }]
    });

    if (emailExists) {
      return res.reply(messages.already_exists("Email"));
    }

    const nOtp = Math.floor(100000 + Math.random() * 900000);
    oExistingUser.nOtp = nOtp;
    oExistingUser.nOtpExpiryTime = Date.now() + 2 * 60 * 1000; // 2 minutes expiry

    const nOtpExpiresIn = new Date(oExistingUser.nOtpExpiryTime).toLocaleString();

    await oExistingUser.save();
    
    await services.send(
      "verifyEmail.ejs",
      { otp: nOtp , nOtpExpiresIn },
      {
        from: configObj.MAIL_FROM,
        to: sEmail,
        subject: "Verify Email",
      }
    );
    return res.reply(messages.successfully("OTP sent to your email"));
  } catch (error) {
    return res.reply(messages.server_error(`${error}`));
  }
};

Controller.resendOtp = async (req, res) => {
  try {
    let { sWalletAddress , sEmail } = req.body;
    
    if (sWalletAddress && typeof sWalletAddress === 'object'&& sWalletAddress.sEmail && sWalletAddress.sWalletAddress) {
      sEmail = sWalletAddress.sEmail;
      sWalletAddress = sWalletAddress.sWalletAddress;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.reply(messages.unprocessable_entity(), {
        errors: errors.array(),
      });
    }
    const oExistingUser = await User.findOne({ sWalletAddress });
    if (!oExistingUser) {
      return res.reply(messages.not_found("User"));
    }
    if (!sEmail) {
      return res.reply(messages.not_found("Email"));
    }
    const nOtp = Math.floor(100000 + Math.random() * 900000);
    oExistingUser.nOtp = nOtp;
    oExistingUser.nOtpExpiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

    await oExistingUser.save();

    const nOtpExpiresIn = new Date(oExistingUser.nOtpExpiryTime).toLocaleString();
    
    await services.send(
      "verifyEmail.ejs",
      { otp: nOtp , nOtpExpiresIn },
      {
        from: configObj.MAIL_FROM,
        to: sEmail,
        subject: "Verify Email",
      }
    );
    return res.reply(messages.successfully("OTP resent to your email"));
  } catch (error) {
    return res.reply(messages.server_error(`${error}`));
  }
};

Controller.verifyOtp = async (req, res) => {
  try {
    let { sWalletAddress, sEmail , nOtp } = req.body;

    console.log("sEmail " , sWalletAddress.sEmail, typeof sWalletAddress.sEmail);
    
    if (sWalletAddress && typeof sWalletAddress === 'object' && sWalletAddress.sEmail && sWalletAddress.nOtp && sWalletAddress.sWalletAddress ) {
      sEmail = sWalletAddress.sEmail;
      nOtp = Number(sWalletAddress.nOtp);
      sWalletAddress = sWalletAddress.sWalletAddress;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.reply(messages.unprocessable_entity(), {
        errors: errors.array(),
      });
    }

    const oExistingUser = await User.findOne({ sWalletAddress });

    if (!oExistingUser) {
      return res.reply(messages.not_found("User"));
    }

    const dCurrentTime = Date.now();
    
    if (oExistingUser.nOtp !== nOtp) {
      return res.reply(messages.invalid("OTP"));
    }

    if (dCurrentTime > oExistingUser.nOtpExpiryTime) {
      return res.reply(messages.invalid("OTP expired"));
    }

    oExistingUser.sEmail = sEmail;
    oExistingUser.isEmailVerified = true;
    oExistingUser.sUsername = ""
    oExistingUser.nOtp = null; 
    oExistingUser.nOtpExpiryTime = null;

    await oExistingUser.save();

    return res.reply(messages.successfully("Email verified successfully"), { sWalletAddress: oExistingUser.sWalletAddress, sToken: oExistingUser.sToken, isVerified: oExistingUser.isEmailVerified, sEmail: oExistingUser.sEmail  , sUsername : oExistingUser.sUsername || "" , sUserProfileImage: oExistingUser.sUserProfileImage });
  } catch (error) {
    return res.reply(messages.server_error(`${error}`));
  }
};

Controller.setUsername = async (req, res) => {
  try {
    const { sWalletAddress, sUsername } = req.body;

    const oExistingUser = await User.findOne({ sWalletAddress });

    if (!oExistingUser) {
      return res.reply(messages.not_found("User"));
    }
    const isUsernameExists = await User.findOne({ sUsername });
    if (isUsernameExists && isUsernameExists.sWalletAddress !== sWalletAddress) {
      return res.reply(messages.already_exists("Username"));
    }
    oExistingUser.sUsername = sUsername;

    await oExistingUser.save();

    return res.reply(messages.successfully("Username added"), { sWalletAddress: oExistingUser.sWalletAddress, sUsername: oExistingUser.sUsername, sEmail: oExistingUser.sEmail, isVerified: oExistingUser.isEmailVerified, sToken: oExistingUser.sToken  , sUserProfileImage: oExistingUser.sUserProfileImage });
  } catch (error) {
    return res.reply(messages.server_error(`${error}`));
  }
};


module.exports = { Controller };
