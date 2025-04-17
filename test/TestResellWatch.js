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

    await luxuryWatchNFT.connect(minter).mint(addr1.address, "RLX123456", "ipfs://test-uri/watch.json");
    await luxuryWatchNFT.connect(minter).mint(addr1.address, "RLX-STOLEN", "ipfs://stolen-watch");

    StolenWatchesRegistry = await ethers.getContractFactory("StolenWatchesRegistry");
    stolenWatchesRegistry = await StolenWatchesRegistry.connect(contractOwner).deploy(await luxuryWatchNFT.getAddress());

    ResellWatch = await ethers.getContractFactory("ResellWatch");
    resellWatch = await ResellWatch.connect(contractOwner).deploy(await authorizedMinters.getAddress(), await luxuryWatchNFT.getAddress(), await stolenWatchesRegistry.getAddress());

    await luxuryWatchNFT.connect(contractOwner).setResellContractAddress(resellWatch.target);

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

  describe("Listing Watches", function () {
    beforeEach(async function () {
      await luxuryWatchNFT.connect(addr1).approveListingToken("RLX123456");
    });

    it("Should allow owner to list a watch", async function () {
      await expect(resellWatch.connect(addr1).listWatch("RLX123456", ethers.parseEther("1"), addr2.address))
        .to.emit(resellWatch, "WatchListed");

      const tokenId = await luxuryWatchNFT.getTokenFromSerialID("RLX123456");
      const listing = await resellWatch.listings(tokenId);
      expect(listing.seller).to.equal(addr1.address);
    });

    it("Should prevent listing stolen watches", async function () {
      await stolenWatchesRegistry.connect(addr1).flagAsStolen("RLX-STOLEN");
      await luxuryWatchNFT.connect(addr1).approveListingToken("RLX-STOLEN");
      await expect(
        resellWatch.connect(addr1).listWatch("RLX-STOLEN", ethers.parseEther("1"), addr2.address)
      ).to.be.revertedWith("Watch is registered as stolen");
    });
  });

  describe("Buying Watches", function () {


    it("Should allow user to check price of a watch", async function () {
      await luxuryWatchNFT.connect(minter).mint(addr1.address, "RLX-PRICECHECK", "ipfs://price-check");
      await luxuryWatchNFT.connect(addr1).approveListingToken("RLX-PRICECHECK");
      await resellWatch.connect(addr1).listWatch("RLX-PRICECHECK", ethers.parseEther("1"), addr2.address);

      const price = await resellWatch.connect(addr2).getListingPriceandComission("RLX-PRICECHECK");
      expect(price).to.equal(ethers.parseEther("1.05"));
    });

    it("Should not allow user to check price of a non-existing watch", async function () {
      await resellWatch.connect(addr1).cancelListing("RLX-PRICECHECK");
      await expect(
        resellWatch.connect(addr2).getListingPriceandComission("RLX-PRICECHECK")
      ).to.be.revertedWith("Watch not listed");
    });

    it("Should complete a successful purchase", async function () {

      await luxuryWatchNFT.connect(minter).mint(addr1.address, "RLX-TESTBUY", "ipfs://test-buy");
      await luxuryWatchNFT.connect(addr1).approveListingToken("RLX-TESTBUY");
      await resellWatch.connect(addr1).listWatch("RLX-TESTBUY", ethers.parseEther("1"), addr2.address);

      const initialSellerBalance = await ethers.provider.getBalance(addr1.address);
      const initialMinterBalance = await ethers.provider.getBalance(minter.address);

      const listing = await resellWatch.listings(await luxuryWatchNFT.getTokenFromSerialID("RLX-TESTBUY"));
      const totalPayment = listing.price + listing.royaltyAmount;

      await expect(
        resellWatch.connect(addr2).buyWatch("RLX-TESTBUY", { value: totalPayment })
      ).to.emit(resellWatch, "WatchTransferred");

      expect(await luxuryWatchNFT.ownerOfToken("RLX-TESTBUY")).to.equal(addr2.address);

      const finalSellerBalance = await ethers.provider.getBalance(addr1.address);
      const finalMinterBalance = await ethers.provider.getBalance(minter.address);

      expect(finalSellerBalance - initialSellerBalance).to.equal(listing.price);
      expect(finalMinterBalance - initialMinterBalance).to.equal(listing.royaltyAmount);
    });

    it("Should enforce minimum royalty payment", async function () {
      // List new watch with price below threshold (0.01 ETH)
      await luxuryWatchNFT.connect(minter).mint(addr1.address, "RLX-LOWPRICE", "ipfs://low-price");
      await luxuryWatchNFT.connect(addr1).approveListingToken("RLX-LOWPRICE");
      await resellWatch.connect(addr1).listWatch("RLX-LOWPRICE", ethers.parseEther("0.005"), addr2.address);
      const listing = await resellWatch.listings(await luxuryWatchNFT.getTokenFromSerialID("RLX-LOWPRICE"));

      // Should require payment covering both price and royalty
      await expect(
        resellWatch.connect(addr2).buyWatch("RLX-LOWPRICE", {
          value: listing.price + listing.royaltyAmount
        })
      ).to.not.be.reverted;
    });

    it("Should prevent purchases with insufficient funds", async function () {
      await luxuryWatchNFT.connect(minter).mint(addr1.address, "RLX-TESTINVALIDBUY", "ipfs://test-invalidbuy");
      await luxuryWatchNFT.connect(addr1).approveListingToken("RLX-TESTINVALIDBUY");
      await resellWatch.connect(addr1).listWatch("RLX-TESTINVALIDBUY", ethers.parseEther("1"), addr2.address);
      const listing = await resellWatch.listings(await luxuryWatchNFT.getTokenFromSerialID("RLX-TESTINVALIDBUY"));

      // Try to pay just the price without royalty
      await expect(
        resellWatch.connect(addr2).buyWatch("RLX-TESTINVALIDBUY", {
          value: listing.price
        })
      ).to.be.revertedWith("Insufficient funds");
    });
  });
});