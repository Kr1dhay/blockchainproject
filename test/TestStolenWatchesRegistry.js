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