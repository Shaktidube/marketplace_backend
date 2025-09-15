const ethers = require("ethers");
const mediaAbi = require("../../../../abis/mediaAbi.json");
const mintAbi = require("../../../../abis/mintAbi.json");
const configObj = require("../../../../config/config");

const httpProvider = new ethers.JsonRpcProvider(configObj.JSON_RPC_PROVIDER);

const getMediaContract = async () => {
  const mediaContractAddress = configObj.MEDIA_CONTRACT_ADDRESS;
  return new ethers.Contract(mediaContractAddress, mediaAbi, httpProvider);
};
const getMarketContract = async () => {
  const marketContractAddress = configObj.MARKET_CONTRACT_ADDRESS;
  return new ethers.Contract(marketContractAddress, mediaAbi, httpProvider);
};

const getMintContract = async () => {
  const mintContractAddress = configObj.MINT_CONTRACT_ADDRESS;
  return new ethers.Contract(mintContractAddress, mintAbi, httpProvider);
}

module.exports = { getMediaContract, getMintContract , getMarketContract };