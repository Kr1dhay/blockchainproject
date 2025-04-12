const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ResellWatch Contract", function () {
  let contractOwner;
  let authorizedMinters;
  let luxuryWatchNFT;
  let stolenWatchesRegistry;
  let resellWatch;
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

    ResellWatch = await ethers.getContractFactory("ResellWatch");
    resellWatch = await ResellWatch.connect(contractOwner).deploy(await authorizedMinters.getAddress(), await luxuryWatchNFT.getAddress(), await stolenWatchesRegistry.getAddress());
  });

    describe("Deployment", function () {
        it("Should set the correct contractOwner", async function () {
        expect(await resellWatch.contractOwner()).to.equal(contractOwner.address);
        });
        it("Should set the correct authorizedMinters contract address", async function () {
            expect(await resellWatch.authorizedMinters()).to.equal(await authorizedMinters.getAddress());
        });
    
        it("Should set the correct luxuryWatchNFT contract address", async function () {
        expect(await resellWatch.luxuryWatchNFT()).to.equal(await luxuryWatchNFT.getAddress());
        });
    
        it("Should set the correct stolenWatchesRegistry contract address", async function () {
        expect(await resellWatch.stolenWatchesRegistry()).to.equal(await stolenWatchesRegistry.getAddress());
        });

    });





});