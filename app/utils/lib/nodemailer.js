const nodemailer = require("nodemailer")
const fs = require('fs');
const ejs = require('ejs');
const path = require('path');
const configObj = require("../../../config/config");

const USER = configObj.MAILTRAP_USER;
const PASS = configObj.MAILTRAP_PASS;

var transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: USER,
    pass: PASS
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

services.sendMail = function(mailOptions){
    transporter.sendMail(mailOptions)
}

module.exports = services