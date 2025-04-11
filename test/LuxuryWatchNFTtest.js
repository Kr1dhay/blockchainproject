const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LuxuryWatchNFT", function () {
  let LuxuryWatchNFT, luxuryWatchNFT;
  let AuthorizedMinters, authorizedMinters;
  let owner, minter, addr1, addr2;
  
  const tokenId1 = 1;
  const tokenId2 = 2;
  const tokenId3 = 3;
  const tokenId4 = 4;
  const tokenId5 = 5;
  const tokenId6 = 6;
  const nonExistentToken = 42;

  before(async function () {
    [contractOwner, minter, addr1, addr2] = await ethers.getSigners();

    AuthorizedMinters = await ethers.getContractFactory("AuthorizedMinters");
    authorizedMinters = await AuthorizedMinters.connect(contractOwner).deploy();
    await authorizedMinters.connect(contractOwner).addMinter(minter.address, 500);

    LuxuryWatchNFT = await ethers.getContractFactory("LuxuryWatchNFT");
    luxuryWatchNFT = await LuxuryWatchNFT.deploy(authorizedMinters.address, contractOwner.address);
  });

    describe("Deployment", function () {
        it("Should set the right contractOwner", async function () {
            expect(await luxuryWatchNFT.getContractOwner()).to.equal(contractOwner.address);
        });

        it("Should set the authorized minters contract address", async function () {
            expect(await luxuryWatchNFT.authorizedMinters()).to.equal(authorizedMinters.address);
        });
    });




//   describe("Minting", function () {
//     it("should mint a token when called by an authorized minter", async function () {
//       await expect(
//         luxuryWatchNFT.connect(minter).mint(addr1.address, tokenId1)
//       )
//         .to.emit(luxuryWatchNFT, "TokenMinted")
//         .withArgs(minter.address, addr1.address, tokenId1);

//       // Check that minterOf returns the correct minter address
//       expect(await luxuryWatchNFT.minterOf(tokenId1)).to.equal(minter.address);

//       // Check that ownerOfToken returns the NFT holder's address
//       expect(await luxuryWatchNFT.ownerOfToken(tokenId1)).to.equal(addr1.address);
//     });

//     it("should fail to mint if caller is not an authorized minter", async function () {
//       await expect(
//         luxuryWatchNFT.connect(addr1).mint(addr1.address, tokenId2)
//       ).to.be.revertedWith("Not an authorized minter.");
//     });
//   });

//   describe("Burning", function () {
//     it("should allow the original minter to burn a token", async function () {
//       // Mint the token first using the authorized minter
//       await luxuryWatchNFT.connect(minter).mint(addr1.address, tokenId3);

//       // Burn the token using the same (original) minter
//       await expect(luxuryWatchNFT.connect(minter).burn(tokenId3))
//         .to.emit(luxuryWatchNFT, "TokenDestroyed")
//         .withArgs(tokenId3);

//       // After burning, attempting to query the token should revert
//       await expect(luxuryWatchNFT.ownerOfToken(tokenId3)).to.be.reverted;
//     });

//     it("should fail to burn if called by someone other than the original minter", async function () {
//       await luxuryWatchNFT.connect(minter).mint(addr1.address, tokenId4);

//       // Attempt to burn by a non-minter should revert due to the onlyMinter modifier
//       await expect(
//         luxuryWatchNFT.connect(addr1).burn(tokenId4)
//       ).to.be.revertedWith("Caller is not the minter of this token.");
//     });
//   });

//   describe("Transfer from Minter to Primary Seller", function () {
//     it("should transfer token from current owner to a primary seller when initiated by the original minter", async function () {
//       // Mint a token first using the authorized minter
//       await luxuryWatchNFT.connect(minter).mint(addr1.address, tokenId5);

//       // Verify the initial owner
//       expect(await luxuryWatchNFT.ownerOfToken(tokenId5)).to.equal(addr1.address);

//       // Use the special transfer function (only callable by the minter) to send token from addr1 to addr2
//       await luxuryWatchNFT
//         .connect(minter)
//         .transferFromMinterToPrimarySeller(addr1.address, addr2.address, tokenId5);

//       // Verify the token's new owner
//       expect(await luxuryWatchNFT.ownerOfToken(tokenId5)).to.equal(addr2.address);
//     });

//     it("should fail transfer if called by a non-minter", async function () {
//       await luxuryWatchNFT.connect(minter).mint(addr1.address, tokenId6);

//       // Attempt transfer by the current owner (not the original minter) should revert
//       await expect(
//         luxuryWatchNFT
//           .connect(addr1)
//           .transferFromMinterToPrimarySeller(addr1.address, addr2.address, tokenId6)
//       ).to.be.revertedWith("Caller is not the minter of this token.");
//     });
//   });

//   describe("Token Existence Checks", function () {
//     it("should return false for a token that was never minted", async function () {
//       expect(await luxuryWatchNFT.isExistingToken(nonExistentToken)).to.equal(false);
//     });

//     it("should revert when querying minterOf for a non-existing token", async function () {
//       await expect(luxuryWatchNFT.minterOf(nonExistentToken)).to.be.revertedWith("Token does not exist.");
//     });

//     it("should revert when querying ownerOfToken for a non-existing token", async function () {
//       await expect(luxuryWatchNFT.ownerOfToken(nonExistentToken)).to.be.revertedWith("Token does not exist.");
//     });
//   });
});
