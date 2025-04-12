const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StolenWatchesRegistry Contract", function () {
  let contractOwner;
  let authorizedMinters;
  let luxuryWatchNFT;
  let stolenWatchesRegistry;
  let minter, addr1, addr2, addr3

  before(async function () {
    [contractOwner, minter, addr1, addr2, addr3] = await ethers.getSigners();

    AuthorizedMinters = await ethers.getContractFactory("AuthorizedMinters");
    authorizedMinters = await AuthorizedMinters.connect(contractOwner).deploy();
    await authorizedMinters.connect(contractOwner).addMinter(minter.address, "Rolex", "Orchard Road", 500);

    LuxuryWatchNFT = await ethers.getContractFactory("LuxuryWatchNFT");
    luxuryWatchNFT = await LuxuryWatchNFT.connect(contractOwner).deploy(await authorizedMinters.getAddress());

    luxuryWatchNFT.connect(minter).mint(addr1.address, "RLX123456", "ipfs://test-uri/watch.json");

    StolenWatchesRegistry = await ethers.getContractFactory("StolenWatchesRegistry");
    stolenWatchesRegistry = await StolenWatchesRegistry.connect(contractOwner).deploy(await luxuryWatchNFT.getAddress());
  });

    describe("Deployment", function () {
        it("Should set the correct contractOwner", async function () {
            expect(await stolenWatchesRegistry.contractOwner()).to.equal(contractOwner.address);
        });

        it("Should set the correct luxuryWatchNFT contract address", async function () {
            expect(await stolenWatchesRegistry.luxuryWatchNFT()).to.equal(await luxuryWatchNFT.getAddress());
        });
    });



  describe("Flagging watches as stolen", function () {

    it("Should not allow non-tokenOwner to flag watch as stolen", async function () {
      await expect(
        stolenWatchesRegistry.connect(minter).flagAsStolen("RLX123456")
      ).to.be.revertedWith("Only the owner of the token can call this function");
    });

    it("Should not allow flagging a non-existent token", async function () {      
      await expect(
        stolenWatchesRegistry.connect(addr1).flagAsStolen("OMGA123456")
      ).to.be.revertedWith("Token does not exist.");
    });

    it("Should allow token contractOwner to flag watch as stolen", async function () {
        await expect(stolenWatchesRegistry.connect(addr1).flagAsStolen("RLX123456"))
          .to.emit(stolenWatchesRegistry, "TokenFlaggedAsStolen")
          .withArgs("RLX123456", addr1.address);
  
        expect(await stolenWatchesRegistry.isStolen("RLX123456")).to.equal(true);
      });


    it("Should not allow flagging an already stolen watch", async function () {
        await expect(stolenWatchesRegistry.connect(addr1).flagAsStolen("RLX123456"))
            .to.be.revertedWith("Token is already flagged as stolen");

    });
});

  describe("Unflagging watches as not stolen", function () {

    it("Should not allow non-owner to unflag watch as stolen", async function () {
      await expect(
        stolenWatchesRegistry.connect(addr2).unflagAsStolen("RLX123456")
      ).to.be.revertedWith("Only the owner of the token can call this function");
    });

    it("Should not allow unflagging a non-existent token", async function () {      
      await expect(
        stolenWatchesRegistry.connect(addr1).unflagAsStolen("OMG123456")
      ).to.be.revertedWith("Token does not exist.");
    });


    it("Should allow token contractOwner to unflag watch as stolen", async function () {
        await expect(stolenWatchesRegistry.connect(addr1).unflagAsStolen("RLX123456"))
          .to.not.be.reverted;
        expect(await stolenWatchesRegistry.isStolen("RLX123456")).to.equal(false);
      });

    it("Should not allow unflagging a watch that's not marked as stolen", async function () {
      await expect(
        stolenWatchesRegistry.connect(addr1).unflagAsStolen("RLX123456")
      ).to.be.revertedWith("Token is already flagged as not stolen");
    });

  });

});

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