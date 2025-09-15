const nodemailer = require("nodemailer")
const fs = require('fs');
const ejs = require('ejs');
const path = require('path');

// let transporter = nodemailer.createTransport({
//     service: 'smtp.gmail.com',
//     secure : true,
//     port: 465,
//     auth: {
//       user : "shaktidubework@gmail.com",
//       pass : "wasd ycyl kphr mbbg"
//     }
//   });
//  let transporter = nodemailer.createTransport({
//        service: 'smtp.gmail.com',
//        auth: {
//          type: 'OAuth2',
//          user: "shaktidubework@gmail.com",
//          pass: "wasd ycyl kphr mbbg",
//          clientId: process.env.OAUTH_CLIENTID,
//          clientSecret: process.env.OAUTH_CLIENT_SECRET,
//          refreshToken: process.env.OAUTH_REFRESH_TOKEN
//        }
//       });

var transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "fdd8e0dde402f7",
    pass: "dc0c0f00091157"
  }
});
const services = {}

services.send = function ( templateName ,data, mailOption) {
    const emailTemplatePath = path.join(__dirname, 'dir');
    const template = fs.readFileSync(emailTemplatePath + '/' + templateName, {
        encoding: 'utf-8',
    });

    const emailBody = ejs.render(template, data);

    mailOption.html = emailBody;

    return transporter.sendMail(mailOption) ;
}

//   let mailOptions = {
//     from: 'shaktidubework@gmail.com',
//     to:'shaktidubework@gmail.com',
//     subject: 'Nodemailer Project',
//     text: 'Hi from your nodemailer project'
//   };


services.sendMail = function(mailOptions){
    transporter.sendMail(mailOptions)
}

module.exports = services