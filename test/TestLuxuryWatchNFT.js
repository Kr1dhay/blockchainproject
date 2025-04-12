const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LuxuryWatchNFT", function () {
  let LuxuryWatchNFT, luxuryWatchNFT;
  let AuthorizedMinters, authorizedMinters;
  let contractOwner, minter, addr1, addr2, addr3;

  before(async function () {
    [contractOwner, minter, addr1, addr2, addr3] = await ethers.getSigners();

    AuthorizedMinters = await ethers.getContractFactory("AuthorizedMinters");
    authorizedMinters = await AuthorizedMinters.connect(contractOwner).deploy();
    await authorizedMinters.connect(contractOwner).addMinter(minter.address, "Rolex", "Orchard Road", 500);

    LuxuryWatchNFT = await ethers.getContractFactory("LuxuryWatchNFT");
    luxuryWatchNFT = await LuxuryWatchNFT.connect(contractOwner).deploy(await authorizedMinters.getAddress());


  });

    describe("Deployment", function () {
        it("Should set the correct contractOwner", async function () {
            expect(await luxuryWatchNFT.contractOwner()).to.equal(contractOwner.address);
        });

        it("Should set the correct authorized minters contract address", async function () {
            expect(await luxuryWatchNFT.authorizedMinters()).to.equal(await authorizedMinters.getAddress());
        });
    });

    describe("Minting", function () {
        it("should mint a token when called by an authorized minter", async function () {
            await expect(luxuryWatchNFT.connect(minter).mint(addr1.address, "RLX123456", "ipfs://test-uri/watch.json"))
                .to.emit(luxuryWatchNFT, "TokenMinted")
                .withArgs(minter.address, addr1.address, "RLX123456");

            expect(await luxuryWatchNFT.minterOfToken("RLX123456")).to.equal(minter.address);
            expect(await luxuryWatchNFT.ownerOfToken("RLX123456")).to.equal(addr1.address);
        });

        it("should fail to mint if caller is not an authorized minter", async function () {
            await expect(luxuryWatchNFT.connect(addr1).mint(addr1.address, "OMGA111111", "ipfs://test-uri/watch.json"))
                .to.be.revertedWith("Not an authorized minter.");
        });
    });

    describe("Test Approval", function () {

      it("should fail to approve if the caller is not the owner", async function () {
          await expect(luxuryWatchNFT.connect(addr2).approveListingToken("RLX123456"))
              .to.be.revertedWith("Caller is not the owner of this token.");
      });


      it("should fail to approve if the market address not set", async function () {
        await expect(luxuryWatchNFT.connect(addr1).approveListingToken("OMGA111111"))
            .to.be.revertedWith("Token does not exist.");
    });

      it ("should allow the owner to set the correct marketplace address", async function () {
          await expect(luxuryWatchNFT.connect(contractOwner).setResllContractAddress(addr3.address))
              .to.not.be.reverted;

          expect(await luxuryWatchNFT.resellContractAddress()).to.equal(addr3.address);
      });

      it("should approve an address to transfer the token", async function () {
          await expect(luxuryWatchNFT.connect(addr1).approveListingToken("RLX123456"))
              .to.not.be.reverted;

          const tokenID = await luxuryWatchNFT.getTokenFromSerialID("RLX123456");
          expect(await luxuryWatchNFT.getApproved(tokenID)).to.equal(addr3.address);
      });

  });


    describe("Burning", function () {

        it("should fail to burn if called by someone other than the original minter", async function () {
            await expect(luxuryWatchNFT.connect(addr2).burn("RLX123456"))
                .to.be.revertedWith("Caller is not the owner of this token.");
        });

        it("should fail to burn if the token does not exist", async function () {
          await expect(luxuryWatchNFT.connect(addr1).burn("OMGA111111"))
              .to.be.revertedWith("Token does not exist.");
        });

        it("should allow the owner to burn a token", async function () {
            await expect(luxuryWatchNFT.connect(addr1).burn("RLX123456"))
                .to.emit(luxuryWatchNFT, "TokenDestroyed")
                .withArgs("RLX123456");

            await expect(luxuryWatchNFT.ownerOfToken("RLX123456")).to.be.reverted;
        });

    });



});