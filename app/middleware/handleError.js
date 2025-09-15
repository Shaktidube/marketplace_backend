const { validationResult } = require("express-validator");

const HandleError = (req,res,next) => {
    const errors = validationResult(req);
    // console.log(typeof errors);
    if (!errors.isEmpty()) {
      return res.reply(messages.unprocessable_entity(), {
        errors: errors.array(),
      });
    }
    next()
}

module.exports = HandleError;

