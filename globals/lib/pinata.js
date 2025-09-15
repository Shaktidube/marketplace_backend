const { PinataSDK} = require("pinata");
const configObj = require("../../config/config");

const pinata = new PinataSDK({
  pinataJwt: configObj.PINATA_JWT,
  pinataGateway: configObj.GATEWAY_URL
})

module.exports = pinata;