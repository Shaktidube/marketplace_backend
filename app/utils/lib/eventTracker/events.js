const { handleTransferEvent, handleListedEvent, handleBuySuccessEvent, handleCancelListingSuccessEvent } = require("./eventsMethod");
const { getMintContract, getMarketContract } = require("./contractInsatnce");

  const contractEventListener = async (io) => {
    try {
      const mintContractInstance = await getMintContract();
      console.log("Setting up event listener for Transfer events...");
      mintContractInstance.on("Transfer", (from, to, tokenId, event) => {
        handleTransferEvent(from, to, tokenId, event , io);
      });

      const marketContractInstance = await getMarketContract();
      marketContractInstance.on("TokenBuySellSuccess",(tokenId,tokenAddress ,creator , seller , price , currentlyListed ) => {
        handleListedEvent(tokenId, tokenAddress, creator , seller , price , currentlyListed , io);
      });

      marketContractInstance.on("TokenBuySuccess",(tokenId,tokenAddress ,creator , buyer , price , currentlyListed ) => {
        handleBuySuccessEvent(tokenId, tokenAddress, creator , buyer , price , currentlyListed , io);
      });

      marketContractInstance.on("TokenCancelListingSuccess",(tokenId,tokenAddress , currentlyListed ) => {
        handleCancelListingSuccessEvent(tokenId, tokenAddress, currentlyListed , io);
      });
    } catch (error) {
      console.error("Error setting up event listener:", error);
    }
  };

  module.exports = { contractEventListener };