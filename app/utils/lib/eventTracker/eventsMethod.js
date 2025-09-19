const Nft = require("../../../models/lib/nftSchema");
const ethers = require("ethers");
const { getMintContract, getMarketContract } = require("./contractInsatnce");
const abi = require("../../../../abis/mintAbi.json");
const configObj = require("../../../../config/config");
const io = require("../socket");

const httpProvider = new ethers.JsonRpcProvider(configObj.JSON_RPC_PROVIDER);

const handleTransferEvent = async (from, to, tokenId, event, io) => {
  try {
    console.log(
      `Transfer: from : ${from} to:  ${to}, tokenId ${tokenId}, filter:`,
      event.filter
    );
    console.log("Event Obj", event.log.address);

    if (from !== ethers.ZeroAddress && to !== ethers.ZeroAddress) {
      const txResponse = await httpProvider.getTransaction(
        event.log.transactionHash
      );
      console.log("Transaction Response:", txResponse);

      const market = txResponse.to;
      console.log(market);

      if (market === configObj.MEDIA_CONTRACT_ADDRESS) {
        console.log("Nft Listed in Market");
        return;
      }

      const oUpdateNft = await Nft.findOneAndUpdate(
        { nTokenId: tokenId.toString(), sTokenAddress: event.log.address },
        { sCurrentOwner: to, isApprovedForSale: false }
      );

      const marketContractInstance = await getMarketContract();
      const isListed = await marketContractInstance.listings(
        from,
        oUpdateNft.sTokenAddress,
        tokenId
      );
      console.log("isListed", isListed);

      if (oUpdateNft) {
        console.log("NFT owner updated successfully after transfer");
        io.emit("TransferEventDetected", {
          from,
          to,
          tokenId: tokenId.toString(),
          sTokenAddress: oUpdateNft.sTokenAddress,
        });
        return;
      }
    } else if (to === ethers.ZeroAddress) {
      console.log("Burn event detected");
      //  delete nft from db
      await Nft.deleteOne({
        nTokenId: tokenId.toString(),
        sTokenAddress: event.log.address,
      });
      console.log("NFT deleted successfully after burn");
      io.emit("BurnEventDetected", {
        tokenId: tokenId.toString(),
        sTokenAddress: event.log.address,
      });
      return;
    }
    const contractInstance = await getMintContract();
    const sTokenUri = await contractInstance.tokenURI(tokenId);
    console.log("Token URI:", sTokenUri);

    const response = await fetch(sTokenUri);
    if (!response.ok) {
      console.error("Failed to fetch metadata:", response.statusText);
      return;
    }
    const metadata = await response.json();
    console.log("Metadata:", metadata);

    const {
      name: sNftName,
      description: sDescription,
      image: sImageUrl,
      Royalty: nRoyalty,
      TokenAddress: sTokenAddress,
    } = metadata;

    const sCurrentOwner = await contractInstance.ownerOf(tokenId);
    console.log("Owner:", sCurrentOwner);

    const baseData = {
      sTokenAddress,
      nTokenId: tokenId.toString(),
      sNftName,
      nNftPrice: 0,
      nRoyalty,
      sDescription,
      sImageUrl,
      sTokenUri,
      sCurrentOwner,
      isApprovedForSale: false,
      sFirstMInterAddress:
        from === ethers.ZeroAddress ? sCurrentOwner : undefined,
    };

    const isNftExist = await Nft.findOne({
      nTokenId: tokenId.toString(),
      sTokenAddress,
    });

    if (isNftExist) {
      // Update existing NFT
      await Nft.updateOne(
        { nTokenId: tokenId.toString(), sTokenAddress },
        {
          ...baseData,
          sFirstMInterAddress:
            isNftExist.sFirstMInterAddress || baseData.sFirstMInterAddress,
        }
      );
      console.log("NFT updated.");
    } else {
      // Insert new NFT
      await Nft.insertOne(baseData);
      console.log("NFT inserted.");
    }

    io.emit("NftTransferFromContract", {
      from,
      to,
      tokenId: tokenId.toString(),
      sTokenAddress,
    });
  } catch (error) {
    console.error("Error in Transfer event:", error);
  }
};

const handleListedEvent = async (
  tokenId,
  tokenAddress,
  creator,
  seller,
  price,
  currentlyListed,
  io
) => {
  console.log(
    `TokenListedSuccess event detected: tokenId ${tokenId}, creator ${creator}, seller ${seller}, price ${price}, currentlyListed ${currentlyListed}, tokenAddress ${tokenAddress}`
  );

  try {
    const isNftExist = await Nft.findOne({
      nTokenId: tokenId.toString(),
      sTokenAddress: tokenAddress,
    });

    console.log("nft price" , price);

    const priceInEth = ethers.formatEther(price);
    console.log("Price in ETH:", priceInEth);

    const priceInWei = ethers.parseEther(priceInEth.toString());
    console.log("Price in WEI:", priceInWei.toString());
    if (isNftExist) {
      await Nft.updateOne(
        { nTokenId: tokenId.toString(), sTokenAddress: tokenAddress },
        {
          nNftPrice: priceInEth,
          isApprovedForSale: currentlyListed,
        }
      );
      console.log("NFT listed status updated successfully");

      io.emit("ListedEventDetected", {
        tokenId: tokenId.toString(),
        tokenAddress,
        creator,
        seller,
        price: priceInEth,
        currentlyListed,
      });
    } else {
      // update nft with details
      const contractAddress = tokenAddress;
      const httpProvider = new ethers.JsonRpcProvider(
        "https://eth-sepolia.g.alchemy.com/v2/z5Ov46GoBzO8DAlvqvUJL4kYCrDZighr"
      );
      const contract = new ethers.Contract(contractAddress, abi, httpProvider);

      console.log("Fetching token details from contract:", contract);
      const sTokenUri = await contract.tokenURI(tokenId);
      console.log("Token URI:", sTokenUri);

      const response = await fetch(sTokenUri);
      if (!response.ok) {
        console.error("Failed to fetch token metadata:", response.statusText);
        return;
      }

      const metadata = await response.json();
      console.log("Token Metadata:", metadata);

      const sNftName = metadata.name;
      const sDescription = metadata.description;
      const sImageUrl = metadata.image;
      const nRoyalty = metadata.Royalty;
      const nNftPrice = priceInEth;

      const sCurrentOwner = await contract.ownerOf(tokenId);
      console.log("Current Owner:", sCurrentOwner);

      const getCreator = await contract.royaltyInfo(tokenId, priceInWei);
      console.log("First Minter Address:", getCreator);
      await Nft.insertOne({
        sTokenAddress: tokenAddress,
        nTokenId: tokenId.toString(),
        sNftName,
        nNftPrice,
        nRoyalty,
        sFirstMInterAddress: getCreator[0],
        sDescription,
        sImageUrl,
        sTokenUri,
        sCurrentOwner,
        isApprovedForSale: currentlyListed,
      });
      io.emit("ListedEventDetected", {
        tokenId: tokenId.toString(),
        tokenAddress,
        creator,
        seller,
        price: priceInEth,
        currentlyListed,
      });
      console.log("New NFT inserted successfully with listing details");
    }
  } catch (error) {
    console.error("Error in Listed event:", error);
  }
};

const handleBuySuccessEvent = async (
  tokenId,
  tokenAddress,
  owner,
  buyer,
  price,
  currentlyListed,
  io
) => {
  console.log(
    `TokenBoughtSuccess event detected: tokenId ${tokenId}, owner ${owner}, buyer ${buyer}, price ${price}, tokenAddress ${tokenAddress}`
  );

  const isNftExist = await Nft.findOne({
    nTokenId: tokenId.toString(),
    sTokenAddress: tokenAddress,
  });

  // const priceInEth = parseFloat(ethers.utils.formatEther(price));
  // console.log("Price in ETH:", priceInEth);

  const priceInEth = ethers.formatEther(0);
  console.log("Price in ETH:", priceInEth);

  if (isNftExist) {
    await Nft.updateOne(
      { nTokenId: tokenId.toString(), sTokenAddress: tokenAddress },
      {
        nNftPrice: priceInEth,
        sCurrentOwner: buyer,
        isApprovedForSale: false,
      }
    );
    console.log("NFT owner updated successfully after purchase");
    io.emit("BuySuccessEventDetected", {
      tokenId: tokenId.toString(),
      tokenAddress,
      owner,
      buyer,
      price: priceInEth,
      currentlyListed,
    });
  } else {
    console.log("NFT not found in database for purchase update");
  }
};

const handleCancelListingSuccessEvent = async (
  tokenId,
  tokenAddress,
  currentlyListed,
  io
) => {
  console.log(
    `TokenCancelListingSuccess event detected: tokenId ${tokenId}, tokenAddress ${tokenAddress}, currentlyListed ${currentlyListed}`
  );

  try {
    const isNftExist = await Nft.findOne({
      nTokenId: tokenId.toString(),
      sTokenAddress: tokenAddress,
    });

    if (isNftExist) {
      await Nft.updateOne(
        { nTokenId: tokenId.toString(), sTokenAddress: tokenAddress },
        {
          isApprovedForSale: currentlyListed,
        }
      );
      console.log("NFT listing status updated successfully after cancellation");

      io.emit("CancelListingEventDetected", {
        tokenId: tokenId.toString(),
        tokenAddress,
        currentlyListed,
      });
    } else {
      console.log("NFT not found in database for cancel listing update");
    }
  } catch (error) {
    console.error("Error in CancelListing event:", error);
  }
};

const handleStartAuction = async (
  tokenId,
  startTime,
  endTime,
  tokenAddress,
  seller,
  basePrice,
  settlementTime
) => {
  console.log(
    `AuctionStarted event detected: tokenId ${tokenId}, startTime ${startTime}, endTime ${endTime}, tokenAddress ${tokenAddress}, seller ${seller}, basePrice ${basePrice}, settlementTime ${settlementTime}`
  );

  try {
    const isNftExist = await Nft.findOne({
      nTokenId: tokenId.toString(),
      sTokenAddress: tokenAddress,
    });

    console.log("nft base price" , basePrice);

    const priceInEth = ethers.formatEther(basePrice);
    console.log("Price in ETH:", priceInEth);

    if (isNftExist) {
      await Nft.updateOne(
        { nTokenId: tokenId.toString(), sTokenAddress: tokenAddress },
        {
          isApprovedForAuction: true,
          oAuctionDetails : {
            nBasePrice: priceInEth,
            dStartTime: startTime.toString(),
            dEndTime: endTime.toString(),
            nHighestBid: "",
            sHighestBidder: "",
            sSettlementTime: settlementTime.toString(),
            bAuctionEnded: false,
          }
        }
      );  
      console.log("NFT auction status updated successfully after starting auction");

      io.emit("AuctionStartedEventDetected", {
        tokenId: tokenId.toString(),
        tokenAddress,
        startTime: startTime.toString(),
        endTime: endTime.toString(),
        seller,
        basePrice: basePrice.toString()
      });
    }
  } catch (error) {
    console.log("Error in AuctionStarted event:", error);
  }
};

const handleNewBidPlaced = async (tokenAddress, tokenId, bidder, NEWbid) => {
  console.log(
    `NewBidPlaced event detected: tokenAddress ${tokenAddress}, tokenId ${tokenId}, bidder ${bidder}, NEWbid ${NEWbid}`
  );

  try {

    console.log("nft base price" , NEWbid);

    const newBidInEth = ethers.formatEther(NEWbid);
    console.log("newBidInEth:", newBidInEth);

    const isNftExist = await Nft.findOne({
      nTokenId: tokenId.toString(),
      sTokenAddress: tokenAddress,
    });



    if (isNftExist) {
      await Nft.updateOne(
        { nTokenId: tokenId.toString(), sTokenAddress: tokenAddress },
        {
          oAuctionDetails : {
            ...isNftExist.oAuctionDetails,
            nHighestBid: newBidInEth,
            sHighestBidder: bidder,
          }
        }
      );
      console.log("NFT highest bid updated successfully after new bid placed");
    }

    io.emit("NewBidPlacedEventDetected", {
      tokenAddress,
      tokenId: tokenId.toString(),
      bidder,
      NEWbid: NEWbid.toString()
    });
  } catch (error) {
    console.log("Error in newPlaceBid event:", error);
  }
};

const handleClaimNft = async (tokenAddress, tokenId, winner, highestBid) => {
  console.log(
    `ClaimNft event detected: tokenAddress ${tokenAddress}, tokenId ${tokenId}, winner ${winner}, highestBid ${highestBid}`
  );
  try {
    const isNftExist = await Nft.findOne({
      nTokenId: tokenId.toString(),
      sTokenAddress: tokenAddress,
    });

    if (isNftExist) {
      await Nft.updateOne(
        { nTokenId: tokenId.toString(), sTokenAddress: tokenAddress },
        {
          sCurrentOwner: winner,
          isApprovedForAuction: false,
          oAuctionDetails : {
            nBasePrice: "0",
            dStartTime: null,
            dEndTime: null,
            nHighestBid: "0",
            sHighestBidder: "",
            sSettlementTime: null,
            bAuctionEnded: false,
          }
        }
      );
      console.log("NFT auction status updated successfully after claiming NFT");

      io.emit("ClaimNftEventDetected", {
        tokenId: tokenId.toString(),
        tokenAddress,
        winner,
        highestBid: highestBid.toString(),
      });
    }
  } catch (error) {
    console.log("Error in ClaimNft event:", error);
  }
};
const handleReclaimNFt = async (tokenId , tokenAddress, tokenOwner) => {
  console.log(
    `ReclaimNft event detected: tokenAddress ${tokenAddress}, tokenId ${tokenId}, tokenOwner ${tokenOwner}`
  );
  try {
    const isNftExist = await Nft.findOne({
      nTokenId: tokenId.toString(),
      sTokenAddress: tokenAddress,
    });

    console.log(isNftExist);

    if (isNftExist) {
      await Nft.updateOne(
        { nTokenId: tokenId.toString(), sTokenAddress: tokenAddress },
        {
          sCurrentOwner: tokenOwner,
          isApprovedForAuction: false,
          oAuctionDetails : {
            nBasePrice: "0",
            dStartTime: null,
            dEndTime: null,
            nHighestBid: "0",
            sHighestBidder: "",
            sSettlementTime: null,
            bAuctionEnded: false,
          }
        }
      );
      console.log("NFT auction status updated successfully after re-claiming NFT");

      io.emit("ReClaimNftEventDetected", {
        tokenId: tokenId.toString(),
        tokenAddress,
        tokenOwner,
      });
    }
  } catch (error) {
    console.log("Error in ReClaimNft event:", error);
  }
};

module.exports = {
  handleTransferEvent,
  handleListedEvent,
  handleBuySuccessEvent,
  handleCancelListingSuccessEvent,
  handleStartAuction,
  handleNewBidPlaced,
  handleClaimNft,
  handleReclaimNFt
};
