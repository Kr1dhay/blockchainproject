// const { expect } = require("chai");
// const { ethers } = require("hardhat");

// describe("StolenWatchesRegistry Contract", function () {
//   let luxuryWatchNFT;
//   let authorizedMinters;
//   let stolenWatchesRegistry;
//   let contractOwner;
//   let minter;
//   let watchOwner;
//   let nonOwner;
//   let tokenId = 1;

//   beforeEach(async function () {
//     // Get signers
//     [contractOwner, minter, watchOwner, nonOwner] = await ethers.getSigners();

//     // Deploy AuthorizedMinters contract first
//     const AuthorizedMinters = await ethers.getContractFactory("AuthorizedMinters");
//     authorizedMinters = await AuthorizedMinters.deploy(contractOwner.address);
//     await authorizedMinters.waitForDeployment();

//     // Add minter with 5% royalty
//     await authorizedMinters.addMinter(minter.address, 500);

//     // Deploy LuxuryWatchNFT with AuthorizedMinters address
//     const LuxuryWatchNFT = await ethers.getContractFactory("LuxuryWatchNFT");
//     const authorizedMintersAddress = await authorizedMinters.getAddress();
//     luxuryWatchNFT = await LuxuryWatchNFT.deploy(authorizedMintersAddress);
//     await luxuryWatchNFT.waitForDeployment();

//     // Deploy StolenWatchesRegistry with LuxuryWatchNFT address
//     const StolenWatchesRegistry = await ethers.getContractFactory("StolenWatchesRegistry");
//     const luxuryWatchNFTAddress = await luxuryWatchNFT.getAddress();
//     stolenWatchesRegistry = await StolenWatchesRegistry.deploy(luxuryWatchNFTAddress);
//     await stolenWatchesRegistry.waitForDeployment();

//     // Mint a token for watchOwner and verify
//     await luxuryWatchNFT.connect(minter).mint(watchOwner.address, tokenId);
    
//     // Add verification (Changed variable name from 'contractOwner' to 'tokenOwner')
//     const tokenOwner = await luxuryWatchNFT.ownerOf(tokenId);
//     expect(tokenOwner).to.equal(watchOwner.address);
// });

//   describe("Deployment", function () {
//     it("Should deploy successfully", async function () {
//       const address = await stolenWatchesRegistry.getAddress();
//       expect(address).to.be.properAddress;
//     });
//   });

//   describe("Flagging watches as stolen", function () {
//     it("Should allow token contractOwner to flag watch as stolen", async function () {
//       await expect(stolenWatchesRegistry.connect(watchOwner).flagAsStolen(tokenId))
//         .to.emit(stolenWatchesRegistry, "TokenFlaggedAsStolen")
//         .withArgs(tokenId, watchOwner.address);

//       expect(await stolenWatchesRegistry.isStolen(tokenId)).to.equal(true);
//     });

//     it("Should not allow non-contractOwner to flag watch as stolen", async function () {
//       await expect(
//         stolenWatchesRegistry.connect(nonOwner).flagAsStolen(tokenId)
//       ).to.be.revertedWith("Only the contractOwner of the token can call this function");
//     });

//     it("Should not allow flagging a non-existent token", async function () {
//       const nonExistentTokenId = 999;
      
//       await expect(
//         stolenWatchesRegistry.connect(watchOwner).flagAsStolen(nonExistentTokenId)
//       ).to.be.reverted; // Specific error message depends on how LuxuryWatchNFT handles non-existent tokens
//     });

//     it("Should not allow flagging an already stolen watch", async function () {
//       // First flag
//       await stolenWatchesRegistry.connect(watchOwner).flagAsStolen(tokenId);
      
//       // Try to flag again
//       await expect(
//         stolenWatchesRegistry.connect(watchOwner).flagAsStolen(tokenId)
//       ).to.be.revertedWith("Token is already flagged as stolen");
//     });
//   });

//   describe("Unflagging watches as not stolen", function () {
//     beforeEach(async function () {
//       // Flag token as stolen first
//       await stolenWatchesRegistry.connect(watchOwner).flagAsStolen(tokenId);
//     });

//     it("Should allow token contractOwner to unflag watch as stolen", async function () {
//       await expect(stolenWatchesRegistry.connect(watchOwner).unflagAsStolen(tokenId))
//         .to.not.be.reverted;
//       expect(await stolenWatchesRegistry.isStolen(tokenId)).to.equal(false);
//     });

//     it("Should not allow non-contractOwner to unflag watch as stolen", async function () {
//       await expect(
//         stolenWatchesRegistry.connect(nonOwner).unflagAsStolen(tokenId)
//       ).to.be.revertedWith("Only the contractOwner of the token can call this function");
//     });

//     it("Should not allow unflagging a non-existent token", async function () {
//       const nonExistentTokenId = 999;
      
//       await expect(
//         stolenWatchesRegistry.connect(watchOwner).unflagAsStolen(nonExistentTokenId)
//       ).to.be.reverted; // Specific error message depends on how LuxuryWatchNFT handles non-existent tokens
//     });

//     it("Should not allow unflagging a watch that's not marked as stolen", async function () {
//       // First unflag
//       await stolenWatchesRegistry.connect(watchOwner).unflagAsStolen(tokenId);
      
//       // Try to unflag again
//       await expect(
//         stolenWatchesRegistry.connect(watchOwner).unflagAsStolen(tokenId)
//       ).to.be.revertedWith("Token is already flagged as not stolen");
//     });
//   });

//   describe("Querying stolen status", function () {
//     it("Should return false for non-stolen watches", async function () {
//       expect(await stolenWatchesRegistry.isStolen(tokenId)).to.equal(false);
//     });

//     it("Should return true for stolen watches", async function () {
//       await stolenWatchesRegistry.connect(watchOwner).flagAsStolen(tokenId);
//       expect(await stolenWatchesRegistry.isStolen(tokenId)).to.equal(true);
//     });

//     it("Should return false for non-existent tokens", async function () {
//       const nonExistentTokenId = 999;
//       expect(await stolenWatchesRegistry.isStolen(nonExistentTokenId)).to.equal(false);
//     });
//   });

//   describe("Change of ownership", function () {
//     beforeEach(async function () {
//       // Flag token as stolen
//       await stolenWatchesRegistry.connect(watchOwner).flagAsStolen(tokenId);
//     });

//     it("Should allow new contractOwner to unflag a watch after transfer", async function () {
//       // Transfer the NFT to nonOwner
//       await luxuryWatchNFT.connect(watchOwner).transferFrom(watchOwner.address, nonOwner.address, tokenId);
      
//       // Now nonOwner should be able to unflag it
//       await stolenWatchesRegistry.connect(nonOwner).unflagAsStolen(tokenId);
      
//       expect(await stolenWatchesRegistry.isStolen(tokenId)).to.equal(false);
//     });

//     it("Should prevent previous contractOwner from unflagging after transfer", async function () {
//       // Transfer the NFT to nonOwner
//       await luxuryWatchNFT.connect(watchOwner).transferFrom(watchOwner.address, nonOwner.address, tokenId);
      
//       // Previous contractOwner should no longer be able to unflag
//       await expect(
//         stolenWatchesRegistry.connect(watchOwner).unflagAsStolen(tokenId)
//       ).to.be.revertedWith("Only the contractOwner of the token can call this function");
//     });
//   });

//   describe("Integration tests", function () {
//     it("Should work correctly with burning tokens", async function () {
//       // Flag token as stolen
//       await stolenWatchesRegistry.connect(watchOwner).flagAsStolen(tokenId);
      
//       // Burn the token
//       await luxuryWatchNFT.connect(minter).burn(tokenId);
      
//       // isStolen should still return the last known state
//       expect(await stolenWatchesRegistry.isStolen(tokenId)).to.equal(true);
      
//       // But operations on the token should fail
//       await expect(
//         stolenWatchesRegistry.connect(watchOwner).unflagAsStolen(tokenId)
//       ).to.be.reverted; // Specific error depends on how LuxuryWatchNFT handles burned tokens
//     });

//     it("Should work correctly with multiple tokens", async function () {
//       // Mint more tokens
//       const tokenId2 = 2;
//       const tokenId3 = 3;
      
//       await luxuryWatchNFT.connect(minter).mint(watchOwner.address, tokenId2);
//       await luxuryWatchNFT.connect(minter).mint(nonOwner.address, tokenId3);
      
//       // Flag some as stolen
//       await stolenWatchesRegistry.connect(watchOwner).flagAsStolen(tokenId);
//       await stolenWatchesRegistry.connect(watchOwner).flagAsStolen(tokenId2);
//       await stolenWatchesRegistry.connect(nonOwner).flagAsStolen(tokenId3);
      
//       // Verify states
//       expect(await stolenWatchesRegistry.isStolen(tokenId)).to.equal(true);
//       expect(await stolenWatchesRegistry.isStolen(tokenId2)).to.equal(true);
//       expect(await stolenWatchesRegistry.isStolen(tokenId3)).to.equal(true);
      
//       // Unflag some
//       await stolenWatchesRegistry.connect(watchOwner).unflagAsStolen(tokenId);
      
//       // Verify updated states
//       expect(await stolenWatchesRegistry.isStolen(tokenId)).to.equal(false);
//       expect(await stolenWatchesRegistry.isStolen(tokenId2)).to.equal(true);
//       expect(await stolenWatchesRegistry.isStolen(tokenId3)).to.equal(true);
//     });
//   });
// });