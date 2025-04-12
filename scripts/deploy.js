const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy AuthorizedMinters
  const AuthorizedMinters = await ethers.getContractFactory("AuthorizedMinters");
  const authorizedMinters = await AuthorizedMinters.deploy();
  console.log("AuthorizedMinters deployed to:", await authorizedMinters.getAddress());

  // Deploy LuxuryWatchNFT
  const LuxuryWatchNFT = await ethers.getContractFactory("LuxuryWatchNFT");
  const luxuryWatchNFT = await LuxuryWatchNFT.deploy(await authorizedMinters.getAddress());
  console.log("LuxuryWatchNFT deployed to:", await luxuryWatchNFT.getAddress());

  // Deploy StolenWatchesRegistry
  const StolenWatchesRegistry = await ethers.getContractFactory("StolenWatchesRegistry");
  const stolenWatchesRegistry = await StolenWatchesRegistry.deploy(await luxuryWatchNFT.getAddress());
  console.log("StolenWatchesRegistry deployed to:", await stolenWatchesRegistry.getAddress());

  // Deploy ResellWatch
  const ResellWatch = await ethers.getContractFactory("ResellWatch");
  const resellWatch = await ResellWatch.deploy(
    await authorizedMinters.getAddress(),
    await luxuryWatchNFT.getAddress(),
    await stolenWatchesRegistry.getAddress()
  );
  console.log("ResellWatch deployed to:", await resellWatch.getAddress());

  // ResellWatch address in NFT contract
  await luxuryWatchNFT.setResllContractAddress(await resellWatch.getAddress());
  console.log("Setup complete - ready to use!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });