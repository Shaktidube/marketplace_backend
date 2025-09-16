# 🖼️ NFT Marketplace Backend

This repository contains the backend implementation for an **NFT Marketplace**.  
It provides APIs for managing NFTs, users, file uploads, listings, and transactions.  
The backend is built with **Node.js**, **Express.js**, and integrates with blockchain smart contracts for NFT minting and trading.

---

## 🚀 Features

- ✅ User Authentication & WalletConnnect Integration  
- ✅ NFT Minting & Metadata Management  
- ✅ Listing NFTs for Sale / Auction* (coming soon..)
- ✅ Buy & Sell NFTs with Escrow  
- ✅ Royalty Support for Creators  
- ✅ File Upload (with Multer)  
- ✅ MongoDB Integration  
- ✅ Event Handling from Smart Contracts  
- ✅ Error Handling & Validations  

---

## 🛠️ Tech Stack

- **Backend Framework**: [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/)  
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)  
- **Blockchain**: [Solidity](https://soliditylang.org/) + [Ethers.js](https://docs.ethers.org/)  
- **File Uploads**: [Multer](https://github.com/expressjs/multer)  
- **Validation**: [express-validator](https://express-validator.github.io/)  
- **Authentication**: JWT + Wallet Signature  
- **Event Handling**: WebSocket / Socket.io  

---

## 📂 Project Structure

```bash
backend/
|── abis/            # smart contract abis
│── app/
    │── middlewares/     # Custom middlewares
    │── models/          # MongoDB models
    │── routes/          # Express routes
    │── utils/           # services functions
│── golbals/             # Helper function
│── uploads/             # Uploaded NFT assets
│── index.js             # Entry point
│── package.json     
│── README.md
