const express = require('express');
const { Controller } = require('./controllers');
const validators = require('./validators');
const Routers = express.Router();

Routers.post('/connect-wallet', validators.connectWallet , Controller.ConnectWallet);
Routers.put('/verify-email',  validators.verifyEmail ,Controller.verifyEmail);
Routers.put("/verify-otp" , Controller.verifyOtp);
Routers.patch("/resend-otp", Controller.resendOtp);
Routers.patch("/set-username" , validators.setUsername, Controller.setUsername);

module.exports = Routers;
