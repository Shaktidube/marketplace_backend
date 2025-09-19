const jwt = require("jsonwebtoken");
const configObj = require("../../config/config");
const { validationResult } = require("express-validator");
const fs = require("fs");

const verifyToken = (req, res, next) => {
  const removeFile = () => {
    console.log("removing file in auth middleware" , req.file?.path);
    try {
      if (req.file?.path) {
        fs.unlinkSync(req.file.path);
      } 
    } catch (error) {
      console.log("error while removing file in auth middleware" , error);
      if(error.code !== 'ENOENT'){
        throw error;
      }
    }
  };

  try {
    const errors = validationResult(req);
    // console.log(typeof errors);
    if (!errors.isEmpty()) {
      return res.reply(messages.unprocessable_entity(), {
        errors: errors.array(),
      });
    }

    let token;
    let authHeaders = req.headers.Authorization || req.headers.authorization;
    // console.log(authHeaders);

    if (!authHeaders) {
      return [removeFile(), res.reply(messages.unauthorized())];
    }

    if (authHeaders && authHeaders.startsWith("Bearer")) {
      token = authHeaders.split(" ")[1];

      if (!token) {
        return [removeFile(), res.reply(messages.unauthorized())];
      }

      const decode = jwt.verify(token, configObj.JWT_SECRET);
      req.user = decode;
      req.userid = decode._id;
      req.userEmail = decode.sEmail;
      // console.log("decode user is :", req.userEmail);
    }
    return next();
  } catch (error) {
    console.log("error in auth middleware", error);
    return removeFile();
  }
};

module.exports = verifyToken;
