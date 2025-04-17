const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Luxury Watch Ecosystem Integration", function () {
  let contractOwner, brand, seller, buyer, unauthorized;
  let authorizedMinters, luxuryWatchNFT, stolenRegistry, resellWatch;

  const watchData = {
    serialID: "RLX-2023-001",
    name: "Submariner Date",
    description: "Oyster, 41mm, Oystersteel",
    image: "ipfs://QmXYZ123/submariner.png",
    external_url: "https://rolex.com/submariner"
  };

  before(async function () {
    [contractOwner, brand, seller, buyer, unauthorized] = await ethers.getSigners();

    // 1. Deploy AuthorizedMinters
    const AuthorizedMinters = await ethers.getContractFactory("AuthorizedMinters");
    authorizedMinters = await AuthorizedMinters.deploy();
    
    // 2. Add brand as authorized minter
    await authorizedMinters.addMinter(brand.address, "Rolex", "Geneva", 500);

    // 3. Deploy LuxuryWatchNFT
    const LuxuryWatchNFT = await ethers.getContractFactory("LuxuryWatchNFT");
    luxuryWatchNFT = await LuxuryWatchNFT.deploy(authorizedMinters.target);

    // 4. Deploy StolenWatchesRegistry
    const StolenWatchesRegistry = await ethers.getContractFactory("StolenWatchesRegistry");
    stolenRegistry = await StolenWatchesRegistry.deploy(luxuryWatchNFT.target);

    // 5. Deploy ResellWatch
    const ResellWatch = await ethers.getContractFactory("ResellWatch");
    resellWatch = await ResellWatch.deploy(
      authorizedMinters.target,
      luxuryWatchNFT.target,
      stolenRegistry.target
    );

    // 6. Set ResellWatch address in NFT contract
    await luxuryWatchNFT.setResellContractAddress(resellWatch.target);

    // Mint a test watch
    await luxuryWatchNFT.connect(brand).mint(
      seller.address, 
      watchData.serialID, 
      JSON.stringify(watchData)
    );
  });

  it("should complete full lifecycle: mint → list → buy → flag stolen → unflag", async function () {
    // 1. Verify initial ownership
    expect(await luxuryWatchNFT.ownerOfToken(watchData.serialID)).to.equal(seller.address);

    // 2. Seller lists watch for sale
    await luxuryWatchNFT.connect(seller).approveListingToken(watchData.serialID);
    await resellWatch.connect(seller).listWatch(
      watchData.serialID, 
      ethers.parseEther("1.5"), 
      buyer.address
    );

    // Verify listing
    const tokenId = await luxuryWatchNFT.getTokenFromSerialID(watchData.serialID);
    let listing = await resellWatch.listings(tokenId);
    expect(listing.seller).to.equal(seller.address);

    // 3. Buyer purchases the watch
    const initialSellerBalance = await ethers.provider.getBalance(seller.address);
    await resellWatch.connect(buyer).buyWatch(
      watchData.serialID, 
      { value: listing.price + listing.royaltyAmount }
    );

    // Verify ownership transfer and payment
    expect(await luxuryWatchNFT.ownerOfToken(watchData.serialID)).to.equal(buyer.address);
    expect(await ethers.provider.getBalance(seller.address)).to.be.closeTo(
      initialSellerBalance + listing.price,
      ethers.parseEther("0.01") // Account for gas
    );

    // 4. Buyer flags watch as stolen
    await stolenRegistry.connect(buyer).flagAsStolen(watchData.serialID);
    expect(await stolenRegistry.isStolen(watchData.serialID)).to.be.true;

    // 5. Verify watch cannot be listed while stolen
    await luxuryWatchNFT.connect(buyer).approveListingToken(watchData.serialID);
    await expect(
      resellWatch.connect(buyer).listWatch(
        watchData.serialID,
        ethers.parseEther("1"),
        seller.address
      )
    ).to.be.revertedWith("Watch is registered as stolen");

    // 6. Buyer unflags the watch
    await stolenRegistry.connect(buyer).unflagAsStolen(watchData.serialID);
    expect(await stolenRegistry.isStolen(watchData.serialID)).to.be.false;

    // 7. Verify watch can now be relisted
    await resellWatch.connect(buyer).listWatch(
      watchData.serialID,
      ethers.parseEther("1.2"),
      seller.address
    );
    
    listing = await resellWatch.listings(tokenId);
    expect(listing.seller).to.equal(buyer.address);
  });

  it("should prevent selling stolen watches", async function () {
    // Mint a new watch
    const stolenWatchID = "RLX-STOLEN-001";
    await luxuryWatchNFT.connect(brand).mint(
      seller.address,
      stolenWatchID,
      JSON.stringify({...watchData, serialID: stolenWatchID})
    );

    // Mark as stolen
    await stolenRegistry.connect(seller).flagAsStolen(stolenWatchID);

    // Attempt to list stolen watch
    await luxuryWatchNFT.connect(seller).approveListingToken(stolenWatchID);
    await expect(
      resellWatch.connect(seller).listWatch(
        stolenWatchID,
        ethers.parseEther("1"),
        buyer.address
      )
    ).to.be.revertedWith("Watch is registered as stolen");
  });

  it("should enforce royalty payments", async function () {
    // Mint a new watch
    const royaltyWatchID = "RLX-ROYALTY-001";
    await luxuryWatchNFT.connect(brand).mint(
      seller.address,
      royaltyWatchID,
      JSON.stringify({...watchData, serialID: royaltyWatchID})
    );

    // List watch
    await luxuryWatchNFT.connect(seller).approveListingToken(royaltyWatchID);
    await resellWatch.connect(seller).listWatch(
      royaltyWatchID,
      ethers.parseEther("0.5"),
      buyer.address
    );

    const listing = await resellWatch.listings(
      await luxuryWatchNFT.getTokenFromSerialID(royaltyWatchID)
    );

    // Attempt purchase without enough for royalty
    await expect(
      resellWatch.connect(buyer).buyWatch(
        royaltyWatchID,
        { value: listing.price } // Missing royalty
      )
    ).to.be.revertedWith("Insufficient funds");
  });
});